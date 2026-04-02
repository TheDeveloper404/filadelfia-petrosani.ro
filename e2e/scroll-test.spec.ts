import { test } from '@playwright/test';

test('observe scroll on mobile homepage', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'test-results/scroll-0-before.png', fullPage: false });

  await page.evaluate(() => window.scrollBy({ top: 80, behavior: 'smooth' }));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/scroll-1-80px.png', fullPage: false });

  await page.evaluate(() => window.scrollBy({ top: 150, behavior: 'smooth' }));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/scroll-2-230px.png', fullPage: false });
});
