import { z } from 'zod';

/** Shared by the contact form and the API, so both sides agree on what a valid message is. */
export const contactReasons = [
  { value: 'networking', label: 'Networking' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'hello', label: 'Just saying hi' },
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Tell me who you are').max(80),
  email: z.email('That email does not look right').max(200),
  reason: z.enum(['networking', 'collaboration', 'hello']),
  message: z.string().trim().min(10, 'A little more than that, please').max(2000),
  /** Honeypot: hidden from people, filled in by bots. */
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
