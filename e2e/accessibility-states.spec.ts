import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test as raw } from '@playwright/test';
import { asClient, expect, stubSoundCloud, test, uniqueClient } from './fixtures';

/**
 * Automated accessibility checks on the states a visitor actually meets. axe finds a subset of
 * WCAG failures; passing it is not conformance. Screen reader, zoom and real-device checks are
 * manual and recorded in docs/ci/requirements-evidence.md.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

async function violations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`);
}

test.describe('axe on interactive states', () => {
  test('while a record plays', async ({ site }) => {
    await site.getByRole('banner').first().getByRole('button', { name: 'Play' }).click();
    await expect(site.getByRole('banner').first().getByText('Now playing')).toBeVisible();
    expect(await violations(site)).toEqual([]);
  });

  test('with the talkback form showing its errors', async ({ site }) => {
    await site.locator('#contact').getByRole('button', { name: 'Send it' }).click();
    await expect(site.getByText('Tell me who you are')).toBeVisible();
    expect(await violations(site)).toEqual([]);
  });

  test('with a failed send on screen', async ({ site }) => {
    const { address, tag } = uniqueClient();
    await asClient(site, address);
    const form = site.locator('#contact');
    await form.getByRole('textbox', { name: 'Name' }).fill('Sam');
    await form.getByRole('textbox', { name: 'Email' }).fill('sam@example.com');
    await form.getByRole('textbox', { name: 'Message' }).fill(`[sink:reject] Hello there ${tag}`);
    await form.getByRole('button', { name: 'Send it' }).click();
    await expect(form.getByRole('alert')).toBeVisible();
    expect(await violations(site)).toEqual([]);
  });

  test('with both racks powered off', async ({ site }) => {
    for (const name of ['Amps and effects rack power', 'Recording and drums rack power']) {
      const power = site.getByRole('switch', { name });
      await power.click();
      await expect(power).toHaveAttribute('aria-checked', 'false');
    }
    expect(await violations(site)).toEqual([]);
  });
});

raw('axe while the player is still loading', async ({ page }) => {
  await stubSoundCloud(page, { readyAfter: -1 });
  await page.goto('/');
  await expect(
    page
      .getByRole('banner')
      .first()
      .getByText(/^Loading /),
  ).toBeVisible();
  expect(await violations(page)).toEqual([]);
});

test.describe('keyboard and focus', () => {
  test.skip(({ isMobile }) => isMobile, 'Keyboard focus is checked on desktop');

  test('every stop in the first stretch of the tab order shows a focus indicator', async ({
    site,
  }) => {
    const seen: string[] = [];
    for (let i = 0; i < 12; i++) {
      await site.keyboard.press('Tab');
      const info = await site.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        const ring =
          (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) ||
          (s.boxShadow !== 'none' && s.boxShadow !== '');
        return { name: el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 30), ring };
      });
      if (!info) continue;
      expect(info.ring, `no visible focus on "${info.name}"`).toBe(true);
      seen.push(String(info.name));
    }
    expect(seen.length).toBeGreaterThan(5);
  });

  test('a failed check moves focus to the first field to fix, which names its error', async ({
    site,
  }) => {
    const form = site.locator('#contact');
    await form.getByRole('textbox', { name: 'Name' }).fill('Sam');
    await form.getByRole('button', { name: 'Send it' }).click();
    const email = form.getByRole('textbox', { name: 'Email' });
    await expect(email).toBeFocused();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription(/That email does not look right/);
  });
});

/**
 * The page clips sideways overflow (body { overflow-x: clip }), so a scrollbar check alone would
 * pass even if content were cut off. This also checks that no text or control, outside the
 * decorative hardware drawings, reaches past the viewport.
 */
async function sidewaysLoss(page: Page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const scroll = document.documentElement.scrollWidth - width;
    const cut = [
      ...document.querySelectorAll<HTMLElement>(
        'a, button, input, textarea, [role="switch"], [role="slider"], h1, h2, h3, p, label, li',
      ),
    ]
      .filter((el) => !el.closest('[aria-hidden="true"]') && el.offsetParent !== null)
      .filter((el) => {
        // Elements inside a horizontal scroller (the timeline, the record shelf) may sit off-screen.
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if ((o === 'auto' || o === 'scroll') && p !== document.body) return false;
        }
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.left < -1 || r.right > width + 1);
      })
      .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 40)}"`);
    return { scroll, cut: cut.slice(0, 10) };
  });
}

raw.describe('reflow and text size', () => {
  for (const width of [320, 390]) {
    raw(`nothing is cut off or scrolls sideways at ${width} CSS pixels`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await stubSoundCloud(page);
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      expect(await sidewaysLoss(page)).toEqual({ scroll: 0, cut: [] });
    });
  }

  raw('text at 200% still fits the page width', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await stubSoundCloud(page);
    await page.goto('/');
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await page.waitForTimeout(300);
    expect(await sidewaysLoss(page)).toEqual({ scroll: 0, cut: [] });
  });
});
