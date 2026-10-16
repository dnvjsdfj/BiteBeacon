import { expect, Page, test } from '@playwright/test';
import { createHash } from 'node:crypto';

// Explicit design expectations: do not derive these from the implementation under test.
const LIGHT = 'rgb(250, 250, 252)', DARK = 'rgb(21, 21, 30)';
const canvas = (page: Page) => page.getByTestId('page-scroll').evaluate(el => {
  for (let node: Element | null = el; node; node = node.parentElement) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg !== 'rgba(0, 0, 0, 0)') return bg;
  }
  return '';
});

// Auto (the default) follows the device appearance; Settings can pin Light or Dark.
for (const [scheme, background] of [['light', LIGHT], ['dark', DARK]] as const) {
  test(`${scheme} appearance follows the device setting`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.emulateMedia({ colorScheme: scheme });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Explore employer demo' }).click();
    await page.getByRole('button', { name: 'Try Peanut Crunch Granola' }).click();
    await expect(page.getByTestId('product-result')).toBeVisible();
    expect(await canvas(page)).toBe(background);
    expect(errors).toEqual([]);
  });
}

test('Settings can pin Dark or Light over the device setting, and it is remembered', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore employer demo' }).click();
  await page.getByRole('button', { name: 'Settings' }).click();
  const card = page.getByTestId('appearance-settings');
  await expect(card.getByRole('radio', { name: 'Appearance: Auto' })).toBeChecked();
  await card.getByRole('radio', { name: 'Appearance: Dark' }).click();
  await expect.poll(() => canvas(page)).toBe(DARK);
  await page.reload();
  await page.getByRole('button', { name: 'Explore employer demo' }).click();
  await expect.poll(() => canvas(page)).toBe(DARK);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByTestId('appearance-settings').getByRole('radio', { name: 'Appearance: Light' }).click();
  await expect.poll(() => canvas(page)).toBe(LIGHT);
  await page.getByTestId('appearance-settings').getByRole('radio', { name: 'Appearance: Auto' }).click();
  await expect.poll(() => canvas(page)).toBe(DARK);
  expect(errors).toEqual([]);
});

// Desktop Home displays the supplied transparent logo without blending or tinting.
for (const scheme of ['light', 'dark'] as const) {
  test(`${scheme} Home preserves the original logo and its proportions`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.emulateMedia({ colorScheme: scheme });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Explore employer demo' }).click();
    const logo = page.getByTestId('home-brand-logo');
    await expect(logo).toBeVisible();
    const image = logo.getByRole('img', { name: 'BiteBeacon original logo' });
    await expect.poll(() => image.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(1312);
    expect(await image.evaluate(el => (el as HTMLImageElement).naturalHeight)).toBe(1199);
    const response = await page.request.get(await image.getAttribute('src') as string);
    expect(response.ok()).toBe(true);
    expect(createHash('sha256').update(await response.body()).digest('hex')).toBe('c23ee0b03496fc8509fbb696ff46dfa9777006524fff8daea075c59c2dec96cb');
    // React Native Web paints resizeMode=contain on the image's background layer.
    expect(await logo.evaluate(el => ({
      fit: getComputedStyle(el.firstElementChild!).backgroundSize,
      opacity: getComputedStyle(el).opacity,
      filter: getComputedStyle(el).filter,
      transform: getComputedStyle(el.parentElement!).transform,
      backing: getComputedStyle(el).backgroundColor,
      blend: getComputedStyle(el.parentElement!.parentElement!).mixBlendMode,
      frame: getComputedStyle(el.parentElement!).backgroundColor,
    }))).toEqual({ fit: 'contain', opacity: '1', filter: 'none', transform: 'none', backing: 'rgba(0, 0, 0, 0)', blend: 'normal', frame: 'rgba(0, 0, 0, 0)' });
    await expect(page.getByTestId('home-hero')).toHaveCSS('background-image', /radial-gradient.*linear-gradient/);
    // Keep the established compact mobile layout; the artwork area was already desktop-only.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(logo).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

for (const scheme of ['light', 'dark'] as const) {
  test(`${scheme} primary actions use translucent icy gradients and Pantry keeps red destructive cues`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Explore employer demo' }).click();
    const heroAction = page.getByRole('button', { name: 'Scan a barcode', exact: true });
    await expect(heroAction).toHaveCSS('background-image', /linear-gradient.*rgba/);
    await expect(heroAction).toHaveCSS('opacity', '1');
    await page.getByRole('button', { name: 'Scan a Product', exact: true }).click();
    const lookup = page.getByRole('button', { name: 'Look up product', exact: true });
    await expect(lookup).toHaveCSS('background-image', /linear-gradient.*rgba/);
    await expect(lookup.getByText('Look up product', { exact: true })).toHaveCSS('color', 'rgb(35, 69, 93)');
    await page.getByRole('button', { name: 'Allergies', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Save allergy profile' })).toHaveCSS('background-image', /linear-gradient.*rgba/);
    await expect(page.getByRole('radio', { name: 'Alex', exact: true })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Alex', exact: true }).getByText('Alex')).toHaveCSS('color', 'rgb(35, 69, 93)');
    await page.getByRole('button', { name: 'Pantry', exact: true }).click();
    const discard = page.getByRole('button', { name: 'Mark Simply Oat Crackers as thrown out' });
    await expect(discard).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(discard).toHaveCSS('background-image', /linear-gradient.*rgba/);
    await expect(discard.getByText('Threw out')).toHaveCSS('color', scheme === 'light' ? 'rgb(162, 50, 44)' : 'rgb(255, 146, 138)');
    await expect(page.getByTestId('pantry-item-Simply Oat Crackers')).toContainText('Expired 2 days ago');
    // Card outlines are inset so the stronger edges do not change spacing or dimensions.
    await expect(page.getByTestId(/^pantry-card-/).first()).toHaveCSS('box-shadow', /inset/);
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    const avatars = page.getByTestId(/^profile-avatar-/);
    await expect(avatars).toHaveCount(8);
    const fills: string[] = [];
    for (const avatar of await avatars.all()) {
      await expect(avatar).toHaveCSS('background-image', /linear-gradient/);
      await expect(avatar).toHaveCSS('width', '38px');
      await expect(avatar).toHaveCSS('height', '38px');
      await expect(avatar.locator('div').first()).toHaveCSS('color', 'rgb(52, 70, 83)');
      fills.push(await avatar.evaluate(el => getComputedStyle(el).backgroundImage));
    }
    expect(new Set(fills).size).toBe(8);
  });
}
