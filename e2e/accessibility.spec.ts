import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('has no WCAG 2.1 AA violations axe can detect', async ({ site }) => {
  const results = await new AxeBuilder({ page: site })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`),
  ).toEqual([]);
});

test('names the page heading with spaces', async ({ site }) => {
  await expect(site.getByRole('heading', { level: 1 })).toHaveAccessibleName('One Small Studio');
});

test('offers a skip link as the first stop', async ({ site, isMobile }) => {
  test.skip(isMobile, 'Tab order is a keyboard concern');
  await site.keyboard.press('Tab');
  const skip = site.getByRole('link', { name: 'Skip to the story' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
});

test('lets visitors pause the looping animations', async ({ site }) => {
  const toggle = site.getByRole('button', { name: 'Pause page animations' });
  await toggle.click();
  await expect(site.locator('html')).toHaveAttribute('data-motion', 'paused');
  await expect(site.getByRole('button', { name: 'Play page animations' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await site.reload();
  await expect(site.locator('html')).toHaveAttribute('data-motion', 'paused');
});
