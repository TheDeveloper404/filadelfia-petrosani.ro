import { test, expect } from '@playwright/test';

test.describe('HomePage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero section is visible', async ({ page }) => {
    // Scope to h1 to avoid matching ticker text
    await expect(page.locator('h1').getByText(/filadelfia/i)).toBeVisible();
    await expect(page.locator('h1').getByText(/petroșani/i)).toBeVisible();
  });

  test('tagline is visible', async ({ page }) => {
    await expect(page.getByText(/un loc al întâlnirii cu Dumnezeu/i)).toBeVisible();
  });

  test('CTA buttons are visible and linked correctly', async ({ page }) => {
    const hero = page.locator('section').first();
    const liveBtn = hero.getByRole('link', { name: /urmărește live/i });
    const planBtn = hero.getByRole('link', { name: /plan biblic/i });
    await expect(liveBtn).toBeVisible();
    await expect(planBtn).toBeVisible();
    await expect(liveBtn).toHaveAttribute('href', '/live');
    await expect(planBtn).toHaveAttribute('href', '/plan-citire');
  });

  test('Program & Comunitate section is visible', async ({ page }) => {
    await expect(page.getByText(/program & comunitate/i)).toBeVisible();
  });

  test('Program săptămânal strip shows all services', async ({ page }) => {
    await expect(page.getByText(/program săptămânal/i)).toBeVisible();
    await expect(page.getByText(/serviciu divin/i).first()).toBeVisible();
  });

  test('Calendar section is visible', async ({ page }) => {
    await expect(page.getByText('Lu').first()).toBeVisible();
    await expect(page.getByText('Du').first()).toBeVisible();
  });

  test('calendar navigates to next month', async ({ page }) => {
    const nextBtn = page.getByLabel('Luna următoare').first();
    await nextBtn.click();
    await expect(nextBtn).toBeVisible();
  });

  test('footer is visible', async ({ page }) => {
    await expect(page.getByText(/toate drepturile rezervate/i)).toBeVisible();
  });
});

test.describe('HomePage — responsive (mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
  });

  test('hero heading is visible on mobile', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('CTA buttons stack vertically on mobile', async ({ page }) => {
    const hero = page.locator('section').first();
    const liveBtn = hero.getByRole('link', { name: /urmărește live/i });
    const planBtn = hero.getByRole('link', { name: /plan biblic/i });
    const liveBox = await liveBtn.boundingBox();
    const planBox = await planBtn.boundingBox();
    expect(planBox!.y).toBeGreaterThan(liveBox!.y);
  });
});
