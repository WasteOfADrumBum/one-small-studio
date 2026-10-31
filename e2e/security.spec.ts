import { expect, test } from './fixtures';

test.describe('content security policy', () => {
  test('the page sends the security headers', async ({ page }) => {
    const res = await page.goto('/');
    const headers = res!.headers();
    expect(headers['content-security-policy']).toContain(
      "script-src 'self' https://w.soundcloud.com",
    );
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
  });

  test('the site runs with no policy violations', async ({ page, site }) => {
    const violations: string[] = [];
    page.on('console', (msg) => {
      if (/Content Security Policy/i.test(msg.text())) violations.push(msg.text());
    });
    await site.evaluate(() => {
      document.addEventListener('securitypolicyviolation', (e) =>
        console.error(`Content Security Policy: ${e.violatedDirective} ${e.blockedURI}`),
      );
    });
    // Walk the page so lazy sections, the player and the talkback form all mount.
    await site.getByRole('banner').first().getByRole('button', { name: 'Play' }).click();
    await site.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await site.waitForTimeout(500);
    expect(violations).toEqual([]);
  });

  test('an injected inline script does not run', async ({ site }) => {
    const ran = await site.evaluate(() => {
      const w = window as unknown as { injected?: boolean };
      const div = document.createElement('div');
      div.innerHTML = '<img src="x" onerror="window.injected = true">';
      document.body.append(div);
      const script = document.createElement('script');
      script.textContent = 'window.injected = true';
      document.body.append(script);
      return new Promise<boolean>((resolve) => setTimeout(() => resolve(!!w.injected), 300));
    });
    expect(ran).toBe(false);
  });
});
