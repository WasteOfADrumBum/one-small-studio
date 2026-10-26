import { describe, expect, it } from 'vitest';
import { contactReasons, contactSchema } from './contact';

const valid = {
  name: 'Sam',
  email: 'sam@example.com',
  reason: 'hello',
  message: 'Ten chars plus.',
};

describe('contactSchema', () => {
  it('accepts a complete message and trims it', () => {
    const parsed = contactSchema.parse({ ...valid, name: '  Sam  ' });
    expect(parsed.name).toBe('Sam');
  });

  it.each([
    ['name', { name: '   ' }],
    ['email', { email: 'not-an-email' }],
    ['reason', { reason: 'booking' }],
    ['message', { message: 'too short' }],
    ['message', { message: 'x'.repeat(2001) }],
  ])('rejects a bad %s', (field, change) => {
    const result = contactSchema.safeParse({ ...valid, ...change });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path[0]).toBe(field);
  });

  it('offers exactly the reasons the API accepts', () => {
    for (const { value } of contactReasons) {
      expect(contactSchema.safeParse({ ...valid, reason: value }).success).toBe(true);
    }
  });
});
