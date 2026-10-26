import { expect, test } from './fixtures';

test.describe('player', () => {
  test('waits for a click, then plays from the transport bar', async ({ site }) => {
    const bar = site.getByRole('banner').first();
    await expect(bar.getByText('Cued')).toBeVisible();
    await bar.getByRole('button', { name: 'Play' }).click();
    await expect(bar.getByText('Now playing')).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Pause' })).toBeVisible();
  });

  test('console power switches on and off', async ({ site, isMobile }) => {
    test.skip(isMobile, 'Phones show the tablet and interface instead of the Dock');
    const power = site.getByRole('button', { name: 'Console power' });
    await expect(power).toHaveAttribute('aria-pressed', 'false');
    await power.click();
    await expect(power).toHaveAttribute('aria-pressed', 'true');
    await power.click();
    await expect(power).toHaveAttribute('aria-pressed', 'false');
  });

  test('the jog wheel picks tracks from the keyboard', async ({ site, isMobile }) => {
    test.skip(isMobile, 'Phones show the tablet and interface instead of the Dock');
    const jog = site.getByRole('slider', { name: /Jog wheel/ });
    await jog.focus();
    await site.keyboard.press('ArrowRight');
    await expect(jog).toHaveAttribute('aria-valuetext', 'Track 2 of 6, Song 2');
    await site.keyboard.press('End');
    await expect(jog).toHaveAttribute('aria-valuenow', '6');
  });

  test('the monitor knob sets the volume on phones', async ({ site, isMobile }) => {
    test.skip(!isMobile, 'Only phones show the interface');
    const knob = site.getByRole('slider', { name: 'Monitor volume' });
    await knob.focus();
    await site.keyboard.press('Home');
    await expect(knob).toHaveAttribute('aria-valuenow', '0');
    await site.keyboard.press('ArrowUp');
    await expect(knob).toHaveAttribute('aria-valuenow', '5');
  });

  test('picking a record loads it into the liner notes', async ({ site }) => {
    const catalog = site.locator('#catalog');
    const second = catalog.getByRole('button', { name: /When the Stones Weep/ });
    await second.click();
    await expect(second).toHaveAttribute('aria-pressed', 'true');
    await expect(catalog.getByRole('heading', { level: 3 })).toHaveText('When the Stones Weep');
  });
});

test.describe('story timeline', () => {
  test('Later and the arrow keys walk the clips in order', async ({ site }) => {
    const story = site.locator('#story');
    const clips = story.getByRole('group', { name: /Timeline clips/ }).getByRole('button');
    await expect(clips.first()).toHaveAttribute('aria-pressed', 'true');
    await story.getByRole('button', { name: 'Later' }).click();
    await expect(clips.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(story.getByRole('heading', { level: 3 })).toHaveText('Playing out');

    await clips.nth(1).focus();
    await site.keyboard.press('ArrowRight');
    await expect(clips.nth(2)).toBeFocused();
    await expect(clips.nth(2)).toHaveAttribute('aria-pressed', 'true');
    await site.keyboard.press('Home');
    await expect(clips.first()).toBeFocused();
  });
});

test.describe('racks', () => {
  test('each rack has its own power switch', async ({ site }) => {
    const power = site.getByRole('switch', { name: 'Amps and effects rack power' });
    await expect(power).toHaveAttribute('aria-checked', 'true');
    await power.click();
    await expect(power).toHaveAttribute('aria-checked', 'false');
  });
});

test.describe('talkback', () => {
  test('shows what is wrong before sending', async ({ site }) => {
    let posted = false;
    await site.route('/api/contact', (r) => {
      posted = true;
      return r.fulfill({ status: 201, json: { ok: true } });
    });
    const form = site.locator('#contact');
    await form.getByRole('button', { name: 'Send it' }).click();
    await expect(form.getByText('Tell me who you are')).toBeVisible();
    await expect(form.getByRole('textbox', { name: 'Name' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(posted).toBe(false);
  });

  test('sends a valid message', async ({ site }) => {
    await site.route('/api/contact', (r) => r.fulfill({ status: 201, json: { ok: true } }));
    const form = site.locator('#contact');
    await form.getByRole('textbox', { name: 'Name' }).fill('Sam');
    await form.getByRole('textbox', { name: 'Email' }).fill('sam@example.com');
    await form
      .getByRole('textbox', { name: 'Message' })
      .fill('Loved the drum sound on that record.');
    await form.getByRole('button', { name: 'Send it' }).click();
    await expect(form.getByText('Message received')).toBeVisible();
  });

  test('says so when the inbox is not connected', async ({ site }) => {
    await site.route('/api/contact', (r) =>
      r.fulfill({ status: 503, json: { error: 'The inbox is not connected yet.' } }),
    );
    const form = site.locator('#contact');
    await form.getByRole('textbox', { name: 'Name' }).fill('Sam');
    await form.getByRole('textbox', { name: 'Email' }).fill('sam@example.com');
    await form
      .getByRole('textbox', { name: 'Message' })
      .fill('Loved the drum sound on that record.');
    await form.getByRole('button', { name: 'Send it' }).click();
    await expect(form.getByText('The inbox is not connected yet.')).toBeVisible();
  });
});
