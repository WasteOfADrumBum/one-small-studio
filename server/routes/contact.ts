import { createHash } from 'node:crypto';
import { Router } from 'express';
import { contactSchema } from '../../src/lib/contact.js';
import { hasMail, sendContactEmail } from '../mail.js';

const MAX_PER_HOUR = 3;
const HOUR = 3_600_000;

/**
 * Recent sends per sender, keyed by a hash of their IP, never the IP itself. It lives in the
 * function's memory, so it is best effort: a cold start forgets it. That is enough to stop one
 * person flooding the inbox from a hobby site.
 */
const recent = new Map<string, number[]>();

function underLimit(key: string, now = Date.now()): boolean {
  const sends = (recent.get(key) ?? []).filter((t) => now - t < HOUR);
  if (sends.length >= MAX_PER_HOUR) {
    recent.set(key, sends);
    return false;
  }
  recent.set(key, [...sends, now]);
  return true;
}

/** Forgets every sender; for tests. */
export const resetRateLimit = () => recent.clear();

export const contact = Router();

contact.post('/', async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid', issues: parsed.error.issues });
  }
  const { name, email, reason, message, website } = parsed.data;
  // Bots fill the hidden field; answer as if it worked so they don't adapt.
  if (website) return res.status(201).json({ ok: true });

  if (!hasMail()) {
    return res.status(503).json({ error: 'The talkback line is not connected yet.' });
  }

  const sender = createHash('sha256')
    .update(req.ip ?? 'unknown')
    .digest('hex');
  if (!underLimit(sender)) {
    return res.status(429).json({ error: 'That is a lot of messages. Try again in an hour.' });
  }

  await sendContactEmail({ name, email, reason, message });
  res.status(201).json({ ok: true });
});
