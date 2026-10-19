import { test, expect } from '@playwright/test';

// Catches broken object navigation, stranded focus, and inaccessible dialogs.
test('visitors can explore the room and return to the same navigation control', async ({ page }, testInfo) => {
  await page.goto('/');
  const work = page.getByRole('button', { name: 'Work', exact: true });
  await work.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'On the desk' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('work-panel.png'), animations: 'disabled' });
  await expect(dialog.getByRole('link', { name: /GitHub/ }).first()).toHaveAttribute('href', 'https://github.com/arv20');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(work).toBeFocused();
  await page.getByRole('button', { name: 'About', exact: true }).click();
  await expect(dialog).toContainText('Ohio State');
  await dialog.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Shelf', exact: true }).click();
  await expect(dialog).toContainText('Hades II');
});

// Catches renderer startup failures and a lighting control disconnected from state.
test('the 3D room loads and the lighting can be changed', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'ready', { timeout: 20000 });
  await expect(page.locator('canvas')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('desktop.png'), animations: 'disabled' });
  await page.locator('canvas').screenshot({ path: testInfo.outputPath('room.png'), omitBackground: true, animations: 'disabled', style: 'html,body,.portfolio { background: transparent !important; }' });
  const daylight = await page.locator('canvas').screenshot({ animations: 'disabled' });
  const lighting = page.getByRole('button', { name: 'Dim the lights' });
  await lighting.click();
  await expect(page.getByRole('button', { name: 'Turn up the lights' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-lighting', 'night');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: testInfo.outputPath('night.png'), animations: 'disabled' });
  expect(await page.locator('canvas').screenshot()).not.toEqual(daylight);
  await page.getByRole('button', { name: 'Reset view' }).click();
  expect(errors).toEqual([]);
});

test('mobile navigation fits and every section stays reachable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'ready', { timeout: 20000 });
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), animations: 'disabled' });
  await page.getByRole('button', { name: 'About', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Close' })).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('a device without WebGL can still read the portfolio', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type.startsWith('webgl')) return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'fallback', { timeout: 15000 });
  await page.getByRole('button', { name: 'Work', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Spandrift');
  await page.screenshot({ path: testInfo.outputPath('fallback-panel.png'), animations: 'disabled' });
});

// Catches accidental selection after a drag and a reset that leaves camera momentum.
test('objects respond to clicks and a dragged view can be reset', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'ready', { timeout: 20000 });
  const anchor = page.getByRole('button', { name: 'Explore the desk' });
  const initial = await anchor.boundingBox();
  if (!initial) throw new Error('Desk target unavailable');
  await page.mouse.click(initial.x - 12, initial.y + 5);
  await expect(page.getByRole('dialog')).toContainText('On the desk');
  await page.keyboard.press('Escape');
  await page.mouse.move(660, 480);
  await page.mouse.down();
  await page.mouse.move(820, 460, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect.poll(async () => Math.abs((await anchor.boundingBox())!.x - initial.x)).toBeGreaterThan(8);
  await page.getByRole('button', { name: 'Reset view' }).click();
  await expect.poll(async () => Math.abs((await anchor.boundingBox())!.x - initial.x)).toBeLessThan(1);
});
