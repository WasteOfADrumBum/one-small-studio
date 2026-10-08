import { createHash } from 'node:crypto';
import { Router } from 'express';
import { contactSchema } from '../../src/lib/contact.js';
import { connectDb, hasDatabase } from '../db.js';
import { MessageModel } from '../models/message.js';

const MAX_PER_HOUR = 3;

export const contact = Router();

contact.post('/', async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid', issues: parsed.error.issues });
  }
  const { name, email, reason, message, website } = parsed.data;
  // Bots fill the hidden field; answer as if it worked so they don't adapt.
  if (website) return res.status(201).json({ ok: true });

  if (!hasDatabase()) {
    return res.status(503).json({ error: 'The inbox is not connected yet.' });
  }

  await connectDb();
  const ipHash = createHash('sha256')
    .update(req.ip ?? 'unknown')
    .digest('hex');
  const recent = await MessageModel.countDocuments({
    ipHash,
    createdAt: { $gt: new Date(Date.now() - 3_600_000) },
  });
  if (recent >= MAX_PER_HOUR) {
    return res.status(429).json({ error: 'That is a lot of messages. Try again in an hour.' });
  }

  await MessageModel.create({ name, email, reason, body: message, ipHash });
  res.status(201).json({ ok: true });
});
