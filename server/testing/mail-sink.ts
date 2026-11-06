/**
 * A stand-in for Resend's HTTP API, for the browser tests only. It replaces `fetch` for
 * https://api.resend.com/ in the test server's process, so the real contact route and the real
 * mail adapter run end to end while no email can leave the machine.
 *
 * A test steers the provider with a marker in the message text:
 *   [sink:reject]  Resend answers 422 (for example an unverified sender)
 *   [sink:drop]    the connection fails (network error)
 *   [sink:slow]    Resend answers after 1.5 s
 * Anything else is accepted with 200. Every accepted email is kept in memory so a test can count
 * deliveries for its own tag. Message text is never written to the log.
 */

export type SinkMail = { to: string[]; from: string; subject: string; text: string; at: number };

const RESEND = 'https://api.resend.com/';
const mails: SinkMail[] = [];
let installed = false;

export function installMailSink(): void {
  if (installed) return;
  installed = true;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith(RESEND)) return realFetch(input, init);

    const mail = JSON.parse(String(init?.body ?? '{}')) as Omit<SinkMail, 'at'>;
    const text = mail.text ?? '';
    if (text.includes('[sink:drop]')) throw new TypeError('fetch failed (mail sink: dropped)');
    if (text.includes('[sink:reject]')) {
      return new Response('{"name":"validation_error","message":"sink rejected"}', {
        status: 422,
      });
    }
    if (text.includes('[sink:slow]')) await new Promise((r) => setTimeout(r, 1500));
    mails.push({ ...mail, at: Date.now() });
    console.log(`[mail-sink] accepted ${mails.length}: ${mail.subject}`);
    return new Response(JSON.stringify({ id: `sink-${mails.length}` }), { status: 200 });
  };
}

/** Emails whose text contains `tag`. */
export const sinkMails = (tag: string) => mails.filter((m) => m.text.includes(tag));
