import { test, expect } from '@playwright/test';

const PAGES = [
  { name: 'homepage',     path: '/' },
  { name: 'live',         path: '/live' },
  { name: 'contact',      path: '/contact' },
  { name: 'plan-citire',  path: '/plan-citire' },
  { name: 'admin',        path: '/admin' },
];

test.describe('Visual snapshots — Desktop', () => {
  for (const { name, path } of PAGES) {
    test(`${name} matches snapshot`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`${name}-desktop.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});

test.describe('Visual snapshots — Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const { name, path } of PAGES) {
    test(`${name} matches snapshot on mobile`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`${name}-mobile.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});
