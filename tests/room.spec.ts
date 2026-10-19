import { test, expect, type Page } from '@playwright/test';
test.setTimeout(120000);
async function roomReady(page: Page) {
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status', 'ready', { timeout: 60000 });
  if (await page.locator('.room-stage').getAttribute('data-scene') === 'dorm') await expect(page.locator('.room-canvas')).toHaveAttribute('data-quality', /^(low|high)$/, { timeout: 60000 });
}

test('the room fills the page with only an unobtrusive simple-view link', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await roomReady(page);
  await expect(page.getByRole('button')).toHaveCount(0);
  await expect(page.getByRole('link', {name:'Skip the room'})).toBeVisible();
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
  await roomReady(page);
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

test('the dorm fits a phone viewport and rotates with touch', async ({ page }, testInfo) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await roomReady(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), animations: 'disabled' });
  const before = await page.locator('canvas').screenshot();
  const touch = await page.context().newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:150,y:420}]});
  for(let x=160;x<=230;x+=10) await touch.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x,y:420}]});
  await touch.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
  expect(await page.locator('canvas').screenshot()).not.toEqual(before);
  await touch.detach();
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
  await roomReady(page);
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
  await roomReady(page);
  expect(warnings.some(w => w.includes('Missing room image:') && w.includes('osu-poster.jpg'))).toBe(true);
  const neutral = await page.locator('canvas').screenshot();
  await page.unroute('**/textures/posters/**');
  // A real local image response exercises texture decoding, geometry sizing and rendering.
  await page.route('**/textures/posters/**', route => route.fulfill({ contentType: 'image/png', path: 'public/room-preview.png' }));
  await page.reload();
  await roomReady(page);
  expect(await page.locator('canvas').screenshot()).not.toEqual(neutral);
  expect(errors).toEqual([]);
});

test('simple view is linked and contains usable portfolio text without WebGL', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', {name:'Skip the room'}).click();
  await expect(page).toHaveURL(/#\/simple$/);
  await expect(page.getByRole('heading', {name:'Aarav Kolgaonkar', exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'Spandrift',exact:true})).toHaveAttribute('href','https://github.com/arv20/spandrift');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', {name:'Aarav Kolgaonkar',exact:true})).toBeVisible();
});

test('portfolio text and contact links work with JavaScript disabled', async ({ browser }) => {
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();await page.goto('/#/simple');
  await expect(page.getByRole('heading', {name:'Aarav Kolgaonkar',exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'GitHub',exact:true})).toHaveAttribute('href','https://github.com/arv20');
  await context.close();
});

test('forced low quality stays interactive and reduced motion remains still', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?quality=low');
  const scene=page.locator('.room-canvas');
  await expect(scene).toHaveAttribute('data-quality','low',{timeout:60000});
  await expect(page.locator('.room-stage')).toHaveAttribute('data-status','ready',{timeout:60000});
  const canvas=page.locator('canvas');const before=await canvas.screenshot();
  await page.waitForTimeout(1200);expect(await canvas.screenshot()).toEqual(before);
  await canvas.press('ArrowRight');expect(await canvas.screenshot()).not.toEqual(before);
});


test('slow initial rendered frames automatically select the low tier', async ({ page }) => {
  await page.addInitScript(() => {
    const nativeFrame = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => nativeFrame(() => setTimeout(() => callback(performance.now()), 45));
  });
  await page.goto('/');
  await roomReady(page);
  await expect(page.locator('.room-canvas')).toHaveAttribute('data-quality', 'low');
  await expect(page.locator('.room-canvas')).toHaveAttribute('data-pixel-ratio', '1');
});
