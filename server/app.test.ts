import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const { app } = await import('./app.js');
const { resetRateLimit } = await import('./routes/contact.js');

const ORIGIN = 'http://studio.test';
const valid = {
  name: 'Sam',
  email: 'sam@example.com',
  reason: 'hello',
  message: 'Loved the drum sound on the record.',
};

/** A same-origin POST, as the site's own contact form sends it. */
const post = (body: object) =>
  request(app).post('/api/contact').set('Host', 'studio.test').set('Origin', ORIGIN).send(body);

describe('API', () => {
  beforeEach(() => {
    resetRateLimit();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response('{"id":"1"}', { status: 200 }));
  });
  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO;
    delete process.env.CONTACT_FROM;
  });

  /** Mail settings as they would be in Vercel. */
  const connect = () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.CONTACT_TO = 'inbox@example.com';
  };

  it('answers the health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, service: 'one-small-studio' });
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('answers unknown API paths with a JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  describe('same-origin check', () => {
    it('refuses a POST with no Origin', async () => {
      const res = await request(app).post('/api/contact').set('Host', 'studio.test').send(valid);
      expect(res.status).toBe(403);
    });

    it('refuses a POST from another site', async () => {
      const res = await request(app)
        .post('/api/contact')
        .set('Host', 'studio.test')
        .set('Origin', 'https://evil.test')
        .send(valid);
      expect(res.status).toBe(403);
    });

    it('refuses an Origin that is not a URL instead of crashing', async () => {
      const res = await request(app)
        .post('/api/contact')
        .set('Host', 'studio.test')
        .set('Origin', 'null')
        .send(valid);
      expect(res.status).toBe(403);
    });

    it('trusts the forwarded host Vercel sets', async () => {
      const res = await request(app)
        .post('/api/contact')
        .set('Host', 'internal.vercel')
        .set('X-Forwarded-Host', 'studio.test')
        .set('Origin', ORIGIN)
        .send({ ...valid, website: 'bot' });
      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/contact', () => {
    it('rejects an invalid message with the field issues', async () => {
      const res = await post({ ...valid, email: 'nope', message: 'hi' });
      expect(res.status).toBe(400);
      const fields = res.body.issues.map((i: { path: string[] }) => i.path[0]);
      expect(fields).toEqual(expect.arrayContaining(['email', 'message']));
    });

    it('pretends to accept honeypot submissions without sending them', async () => {
      connect();
      const res = await post({ ...valid, website: 'https://spam.test' });
      expect(res.status).toBe(201);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('says the line is not connected when mail is not set up', async () => {
      process.env.RESEND_API_KEY = 're_test';
      const res = await post(valid);
      expect(res.status).toBe(503);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('emails a valid message to the inbox, replying to the sender', async () => {
      connect();
      const res = await post({ ...valid, name: 'Sam\nSmith' });
      expect(res.status).toBe(201);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.resend.com/emails');
      expect(init.headers.Authorization).toBe('Bearer re_test');
      const mail = JSON.parse(init.body);
      expect(mail).toMatchObject({
        from: 'One Small Studio <onboarding@resend.dev>',
        to: ['inbox@example.com'],
        reply_to: 'sam@example.com',
        subject: 'Talkback: Just saying hi from Sam Smith',
      });
      expect(mail.text).toContain(valid.message);
    });

    it('uses the configured sender when there is one', async () => {
      connect();
      process.env.CONTACT_FROM = 'Studio <talkback@studio.test>';
      await post(valid);
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).from).toBe(
        'Studio <talkback@studio.test>',
      );
    });

    it('rate-limits a sender to three messages an hour', async () => {
      connect();
      for (let i = 0; i < 3; i++) expect((await post(valid)).status).toBe(201);
      const res = await post(valid);
      expect(res.status).toBe(429);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('hides mail failures behind a generic 500', async () => {
      connect();
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fetchMock.mockResolvedValue(new Response('secret account detail', { status: 403 }));
      const res = await post(valid);
      expect(res.status).toBe(500);
      expect(JSON.stringify(res.body)).not.toContain('secret');
      expect(spy).toHaveBeenCalled();
    });
  });
});
