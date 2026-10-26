import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const countDocuments = vi.fn();
const create = vi.fn();
vi.mock('./db.js', () => ({
  hasDatabase: () => Boolean(process.env.MONGODB_URI),
  connectDb: vi.fn(async () => undefined),
}));
vi.mock('./models/message.js', () => ({
  MessageModel: {
    countDocuments: (...a: unknown[]) => countDocuments(...a),
    create: (...a: unknown[]) => create(...a),
  },
}));

const { app } = await import('./app.js');

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
    countDocuments.mockResolvedValue(0);
    create.mockResolvedValue({});
  });
  afterEach(() => {
    delete process.env.MONGODB_URI;
  });

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

    it('pretends to accept honeypot submissions without storing them', async () => {
      process.env.MONGODB_URI = 'mongodb://example';
      const res = await post({ ...valid, website: 'https://spam.test' });
      expect(res.status).toBe(201);
      expect(create).not.toHaveBeenCalled();
    });

    it('says the inbox is not connected when MONGODB_URI is unset', async () => {
      const res = await post(valid);
      expect(res.status).toBe(503);
      expect(create).not.toHaveBeenCalled();
    });

    it('stores a valid message with a hashed IP, never the IP itself', async () => {
      process.env.MONGODB_URI = 'mongodb://example';
      const res = await post(valid);
      expect(res.status).toBe(201);
      expect(create).toHaveBeenCalledTimes(1);
      const saved = create.mock.calls[0][0];
      expect(saved).toMatchObject({
        name: 'Sam',
        email: 'sam@example.com',
        reason: 'hello',
        body: valid.message,
      });
      expect(saved.ipHash).toMatch(/^[0-9a-f]{64}$/);
      expect(JSON.stringify(saved)).not.toMatch(/127\.0\.0\.1|::1|::ffff/);
    });

    it('rate-limits a sender to three messages an hour', async () => {
      process.env.MONGODB_URI = 'mongodb://example';
      countDocuments.mockResolvedValue(3);
      const res = await post(valid);
      expect(res.status).toBe(429);
      expect(create).not.toHaveBeenCalled();
    });

    it('hides database failures behind a generic 500', async () => {
      process.env.MONGODB_URI = 'mongodb://example';
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      create.mockRejectedValue(new Error('secret connection detail'));
      const res = await post(valid);
      expect(res.status).toBe(500);
      expect(JSON.stringify(res.body)).not.toContain('secret');
      expect(spy).toHaveBeenCalled();
    });
  });
});
