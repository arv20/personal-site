import { test, expect } from '@playwright/test';

test('the room fills the page without cards, links, or overlay controls', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'ready', { timeout: 20000 });
  await expect(page.getByRole('button')).toHaveCount(0);
  await expect(page.getByRole('link')).toHaveCount(0);
  await expect(page.getByRole('navigation')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box?.height).toBe(page.viewportSize()!.height);
  expect(box?.width).toBe(page.viewportSize()!.width);
  await page.screenshot({ path: testInfo.outputPath('desktop.png'), animations: 'disabled' });
  await canvas.screenshot({ path: testInfo.outputPath('room.png'), omitBackground: true, animations: 'disabled', style: 'html,body,.portfolio { background: transparent !important; }' });
  expect(errors).toEqual([]);
});

test('the room can be rotated with a pointer or keyboard without opening a card', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'ready', { timeout: 20000 });
  const canvas = page.locator('canvas');
  const capture = () => canvas.screenshot({ style: 'canvas { outline: none !important; }' });
  const initial = await capture();
  await page.mouse.move(660, 480);
  await page.mouse.down();
  await page.mouse.move(820, 460, { steps: 12 });
  await page.mouse.up();
  expect(await capture()).not.toEqual(initial);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await canvas.press('Home');
  await expect.poll(async () => (await capture()).equals(initial)).toBe(true);
  await canvas.press('ArrowLeft');
  expect(await capture()).not.toEqual(initial);
});

test('the dorm fits a phone viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'ready', { timeout: 20000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), animations: 'disabled' });
});

test('a device without WebGL sees a still of the room', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type.startsWith('webgl')) return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'fallback', { timeout: 15000 });
  const still = page.getByRole('img', { name: /college dorm/ });
  await expect(still).toBeVisible();
  expect(await still.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
});

test('legacy URL preserves the previous room separately from the rebuild', async ({ page }) => {
  await page.goto('/?legacy=1');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-scene', 'legacy');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'ready', { timeout: 30000 });
  await page.goto('/');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-scene', 'dorm');
});

test('missing local poster files fall back safely and supplied artwork renders', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  const warnings: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if(message.type() === 'warning') warnings.push(message.text()); });
  await page.route('**/textures/posters/**', route => route.fulfill({ status: 404, body: '' }));
  await page.goto('/');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'ready', { timeout: 30000 });
  expect(warnings.some(w => w.includes('Missing room image:') && w.includes('osu-poster.jpg'))).toBe(true);
  const neutral = await page.locator('canvas').screenshot();
  await page.unroute('**/textures/posters/**');
  // A real local image response exercises texture decoding, geometry sizing and rendering.
  await page.route('**/textures/posters/**', route => route.fulfill({ contentType: 'image/png', path: 'public/room-preview.png' }));
  await page.reload();
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'ready', { timeout: 30000 });
  expect(await page.locator('canvas').screenshot()).not.toEqual(neutral);
  expect(errors).toEqual([]);
});
