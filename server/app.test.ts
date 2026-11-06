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

  it('reports the running commit and whether the talkback line is wired, never its settings', async () => {
    expect((await request(app).get('/api/health')).body).toMatchObject({
      commit: null,
      contact: 'not-configured',
    });
    connect();
    process.env.VERCEL_GIT_COMMIT_SHA = 'a'.repeat(40);
    try {
      const res = await request(app).get('/api/health');
      expect(res.body).toMatchObject({ commit: 'a'.repeat(40), contact: 'configured' });
      expect(JSON.stringify(res.body)).not.toMatch(/re_test|inbox@example/);
    } finally {
      delete process.env.VERCEL_GIT_COMMIT_SHA;
    }
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

    it('hides mail failures behind a friendly 502, logging the cause', async () => {
      connect();
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fetchMock.mockResolvedValue(new Response('secret account detail', { status: 403 }));
      const res = await post(valid);
      expect(res.status).toBe(502);
      expect(res.body.error).toMatch(/try again/i);
      expect(JSON.stringify(res.body)).not.toContain('secret');
      expect(spy).toHaveBeenCalledWith('Talkback email failed:', expect.any(Error));
    });

    it('answers a stalled or unreachable Resend with the same 502', async () => {
      connect();
      vi.spyOn(console, 'error').mockImplementation(() => {});
      fetchMock.mockRejectedValue(new DOMException('The operation timed out.', 'TimeoutError'));
      const res = await post(valid);
      expect(res.status).toBe(502);
      expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    });

    it('answers malformed JSON with a 400, not a logged crash', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const res = await request(app)
        .post('/api/contact')
        .set('Host', 'studio.test')
        .set('Origin', ORIGIN)
        .set('Content-Type', 'application/json')
        .send('{"name": ');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'That request could not be read.' });
      expect(spy).not.toHaveBeenCalled();
    });

    it('refuses a body far larger than any real message', async () => {
      const res = await post({ ...valid, message: 'x'.repeat(20_000) });
      expect(res.status).toBe(413);
    });

    it('says the email was accepted, not delivered, and answers bots the same way', async () => {
      connect();
      const real = await post(valid);
      const bot = await post({ ...valid, website: 'https://spam.test' });
      expect(real.body).toEqual({ ok: true, delivery: 'accepted' });
      expect(bot.status).toBe(real.status);
      expect(bot.body).toEqual(real.body);
    });

    it.each([
      ['an empty object', {}],
      ['a message that is too long', { ...valid, message: 'x'.repeat(2001) }],
      ['an unknown reason', { ...valid, reason: 'booking' }],
      ['a name that is only spaces', { ...valid, name: '   ' }],
      ['fields of the wrong type', { ...valid, name: 42 }],
      ['an array', [valid]],
    ])('rejects %s before any email is sent', async (_label, body) => {
      connect();
      const res = await post(body);
      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
      ['text/plain', JSON.stringify(valid)],
      ['application/x-www-form-urlencoded', 'name=Sam&email=sam%40example.com'],
    ])('only reads JSON: a %s body is a 400 and sends nothing', async (type, body) => {
      connect();
      const res = await request(app)
        .post('/api/contact')
        .set('Host', 'studio.test')
        .set('Origin', ORIGIN)
        .set('Content-Type', type)
        .send(body);
      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('only accepts POST', async () => {
      expect((await request(app).get('/api/contact')).status).toBe(404);
      const put = await request(app)
        .put('/api/contact')
        .set('Host', 'studio.test')
        .set('Origin', ORIGIN)
        .send(valid);
      expect(put.status).toBe(404);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does not let a client dodge the rate limit by writing its own X-Forwarded-For', async () => {
      connect();
      // Vercel puts the real client address last; anything before it came from the client.
      const spoofed = (n: number) =>
        request(app)
          .post('/api/contact')
          .set('Host', 'studio.test')
          .set('Origin', ORIGIN)
          .set('X-Forwarded-For', `10.0.0.${n}, 203.0.113.7`)
          .send(valid);
      for (let i = 0; i < 3; i++) expect((await spoofed(i)).status).toBe(201);
      expect((await spoofed(99)).status).toBe(429);
    });

    it('counts different clients separately', async () => {
      connect();
      const from = (ip: string) =>
        request(app)
          .post('/api/contact')
          .set('Host', 'studio.test')
          .set('Origin', ORIGIN)
          .set('X-Forwarded-For', ip)
          .send(valid);
      for (let i = 0; i < 3; i++) await from('203.0.113.1');
      expect((await from('203.0.113.1')).status).toBe(429);
      expect((await from('203.0.113.2')).status).toBe(201);
    });

    it('never puts the visitor message or the provider answer in the log', async () => {
      connect();
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fetchMock.mockRejectedValue(new TypeError('fetch failed'));
      await post({ ...valid, message: 'a private message only Josh should read' });
      const logged = JSON.stringify(spy.mock.calls.map((c) => String(c[1] ?? c[0])));
      expect(logged).not.toContain('private message');
    });
  });
});
