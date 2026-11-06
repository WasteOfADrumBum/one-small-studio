import type { Page } from '@playwright/test';
import { asClient, expect, test, uniqueClient } from './fixtures';

/**
 * The talkback form end to end: browser, real HTTP, the real Express route and mail adapter, and
 * a controlled Resend sink (server/testing/mail-sink.ts) in place of the provider. No request in
 * this file is intercepted except to add the client address Vercel's edge would add. Messages
 * carry a unique tag, so each test counts only its own deliveries.
 */

type Sent = { to: string[]; from: string; subject: string };

async function delivered(page: Page, tag: string): Promise<Sent[]> {
  const res = await page.request.get(`/__test/mail?tag=${encodeURIComponent(tag)}`);
  expect(res.ok()).toBe(true);
  return res.json();
}

async function fill(page: Page, message: string) {
  const form = page.locator('#contact');
  await form.getByRole('textbox', { name: 'Name' }).fill('Sam Synthetic');
  await form.getByRole('textbox', { name: 'Email' }).fill('sam@example.com');
  await form.getByRole('textbox', { name: 'Message' }).fill(message);
  return form;
}

test.describe('talkback over the real API', () => {
  test('a valid message reaches the mail provider once and the form says so @critical', async ({
    site,
  }) => {
    const { address, tag } = uniqueClient();
    await asClient(site, address);
    const form = await fill(site, `Loved the drum sound on that record. ${tag}`);
    await form.getByRole('button', { name: 'Send it' }).click();
    await expect(form.getByText('Message received')).toBeVisible();

    const mails = await delivered(site, tag);
    expect(mails).toHaveLength(1);
    expect(mails[0]).toMatchObject({
      to: ['inbox@sink.invalid'],
      subject: 'Talkback: Networking from Sam Synthetic',
    });
  });

  test('an invalid message never leaves the browser @critical', async ({ site }) => {
    let posted = 0;
    site.on('request', (r) => r.url().endsWith('/api/contact') && posted++);
    const form = site.locator('#contact');
    await form.getByRole('textbox', { name: 'Email' }).fill('not-an-email');
    await form.getByRole('button', { name: 'Send it' }).click();
    await expect(form.getByText('Tell me who you are')).toBeVisible();
    await expect(form.getByText('That email does not look right')).toBeVisible();
    expect(posted).toBe(0);
  });

  test('a provider rejection keeps the message, and a retry goes through @critical', async ({
    site,
  }) => {
    const { address, tag } = uniqueClient();
    await asClient(site, address);
    const text = `[sink:reject] Loved the drum sound on that record. ${tag}`;
    const form = await fill(site, text);
    await form.getByRole('button', { name: 'Send it' }).click();
    await expect(form.getByRole('alert')).toContainText("didn't go through on my end");
    await expect(form.getByRole('textbox', { name: 'Message' })).toHaveValue(text);
    await expect(site.getByText('Talkback · Not sent')).toBeVisible();
    expect(await delivered(site, tag)).toHaveLength(0);

    // The visitor fixes nothing but tries again once the provider is back.
    await form
      .getByRole('textbox', { name: 'Message' })
      .fill(`Loved the drum sound on that record. ${tag}`);
    await form.getByRole('button', { name: 'Send it' }).click();
    await expect(form.getByText('Message received')).toBeVisible();
    expect(await delivered(site, tag)).toHaveLength(1);
  });

  test('a provider network failure is reported the same way', async ({ site }) => {
    const { address, tag } = uniqueClient();
    await asClient(site, address);
    const form = await fill(site, `[sink:drop] Loved the drum sound on that record. ${tag}`);
    await form.getByRole('button', { name: 'Send it' }).click();
    await expect(form.getByRole('alert')).toContainText('Please try again in a bit');
    expect(await delivered(site, tag)).toHaveLength(0);
  });

  test('clicking Send twice while sending sends one message', async ({ site }) => {
    const { address, tag } = uniqueClient();
    await asClient(site, address);
    const form = await fill(site, `[sink:slow] Loved the drum sound on that record. ${tag}`);
    const send = form.getByRole('button', { name: 'Send it' });
    await send.click();
    // While the slow provider answers, the button is disabled, so a second click does nothing.
    await expect(send).toBeDisabled();
    await send.click({ force: true }).catch(() => {});
    await expect(form.getByText('Message received')).toBeVisible();
    expect(await delivered(site, tag)).toHaveLength(1);
  });

  test('the fourth message in an hour is refused with the reason', async ({ site }) => {
    const { address, tag } = uniqueClient();
    await asClient(site, address);
    for (let i = 0; i < 3; i++) {
      const res = await site.evaluate(
        async ([t, i]) =>
          (
            await fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'Sam',
                email: 'sam@example.com',
                reason: 'hello',
                message: `Message number ${i} ${t}`,
              }),
            })
          ).status,
        [tag, i] as const,
      );
      expect(res).toBe(201);
    }
    const form = await fill(site, `One more message. ${tag}`);
    await form.getByRole('button', { name: 'Send it' }).click();
    await expect(form.getByRole('alert')).toContainText('Try again in an hour');
    expect(await delivered(site, tag)).toHaveLength(3);
  });
});

test.describe('talkback API over HTTP', () => {
  const valid = { name: 'Sam', email: 'sam@example.com', reason: 'hello', message: 'Hello there!' };

  test('refuses a cross-site POST', async ({ request, baseURL }) => {
    const res = await request.post('/api/contact', {
      headers: { Origin: 'https://evil.example' },
      data: valid,
    });
    expect(res.status()).toBe(403);
    expect(baseURL).toBeTruthy();
  });

  test('answers malformed, oversized and non-JSON bodies with client errors', async ({
    request,
    baseURL,
  }) => {
    const origin = { Origin: baseURL! };
    const malformed = await request.post('/api/contact', {
      headers: { ...origin, 'Content-Type': 'application/json' },
      data: '{"name": ',
    });
    expect(malformed.status()).toBe(400);
    const huge = await request.post('/api/contact', {
      headers: origin,
      data: { ...valid, message: 'x'.repeat(20_000) },
    });
    expect(huge.status()).toBe(413);
    const text = await request.post('/api/contact', {
      headers: { ...origin, 'Content-Type': 'text/plain' },
      data: JSON.stringify(valid),
    });
    expect(text.status()).toBe(400);
    expect((await request.get('/api/contact')).status()).toBe(404);
  });

  test('never caches API answers', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.headers()['cache-control']).toBe('no-store');
    expect(await res.json()).toMatchObject({ ok: true, contact: 'configured' });
  });
});
