import { contactReasons, type ContactInput } from '../src/lib/contact.js';

const RESEND_URL = 'https://api.resend.com/emails';

/**
 * Where talkback messages go. All three come from Vercel's environment variables, so the inbox
 * address never sits in this public repo. Without a verified domain, Resend only delivers to the
 * address its account was opened with, from its shared onboarding sender.
 */
function settings() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!apiKey || !to) return null;
  return {
    apiKey,
    to,
    from: process.env.CONTACT_FROM || 'One Small Studio <onboarding@resend.dev>',
  };
}

export const hasMail = () => settings() !== null;

/** Emails a talkback message to Josh, with Reply-To set so answering it goes to the sender. */
export async function sendContactEmail(message: Omit<ContactInput, 'website'>): Promise<void> {
  const config = settings();
  if (!config) throw new Error('Mail is not configured');
  const reason = contactReasons.find((r) => r.value === message.reason)?.label ?? message.reason;
  // One line, so a name can't spill into the subject's surroundings.
  const name = message.name.replace(/\s+/g, ' ');

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      reply_to: message.email,
      subject: `Talkback: ${reason} from ${name}`,
      text: `${message.message}\n\n-- \n${name} <${message.email}>\nSent from the One Small Studio talkback form.`,
    }),
  });
  if (!res.ok) throw new Error(`Resend answered ${res.status}: ${await res.text()}`);
}
