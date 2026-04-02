import { test, expect } from '@playwright/test';

// Desktop nav only (mobile nav is behind hamburger)
const nav = (page: import('@playwright/test').Page) =>
  page.locator('[data-testid="desktop-nav"]');

test.describe('Navigation', () => {
  // These tests rely on the desktop nav (links hidden on mobile viewport)
  test.use({ viewport: { width: 1280, height: 720 } });

  test('homepage loads and shows church name', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('nav links are visible', async ({ page }) => {
    await page.goto('/');
    await expect(nav(page).getByRole('link', { name: /acasă/i })).toBeVisible();
    await expect(nav(page).getByRole('link', { name: /^live$/i })).toBeVisible();
    await expect(nav(page).getByRole('link', { name: /plan biblic/i })).toBeVisible();
    await expect(nav(page).getByRole('link', { name: /contact/i })).toBeVisible();
  });

  test('navigates to Live page', async ({ page }) => {
    await page.goto('/');
    await nav(page).getByRole('link', { name: /^live$/i }).click();
    await expect(page).toHaveURL('/live');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('navigates to Contact page', async ({ page }) => {
    await page.goto('/');
    await nav(page).getByRole('link', { name: /contact/i }).click();
    await expect(page).toHaveURL('/contact');
  });

  test('navigates to Plan Biblic page', async ({ page }) => {
    await page.goto('/');
    await nav(page).getByRole('link', { name: /plan biblic/i }).click();
    await expect(page).toHaveURL('/plan-citire');
  });

  test('navigates to Stiri page', async ({ page }) => {
    await page.goto('/');
    await nav(page).getByRole('link', { name: /știri/i }).click();
    await expect(page).toHaveURL('/stiri');
  });

  test('Arhivă popup appears and closes', async ({ page }) => {
    await page.goto('/live');
    await page.getByRole('button', { name: /vezi toate predicile/i }).click();
    await expect(page.getByText(/vei fi direcționat/i)).toBeVisible();
    await page.getByRole('button', { name: /anulează/i }).click();
    await expect(page.getByText(/vei fi direcționat/i)).not.toBeVisible();
  });

  test('Arhivă popup opens YouTube on confirm', async ({ page, context }) => {
    await page.goto('/live');
    await page.getByRole('button', { name: /vezi toate predicile/i }).click();
    await expect(page.getByText(/vei fi direcționat/i)).toBeVisible();
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /deschide youtube/i }).click(),
    ]);
    expect(newPage.url()).toContain('youtube.com');
  });

  test('unknown route redirects to homepage', async ({ page }) => {
    await page.goto('/pagina-inexistenta');
    await expect(page).toHaveURL('/');
  });

  test('scroll-to-top behaviour is configured in Layout', async ({ page }) => {
    await page.goto('/');
    const content = await page.evaluate(() => document.documentElement.innerHTML);
    expect(content).toContain('Filadelfia');
    await nav(page).getByRole('link', { name: /plan biblic/i }).click();
    await page.waitForURL('/plan-citire');
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
  });
});

test.describe('Navigation — mobile hamburger', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hamburger opens and closes mobile menu', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.getByRole('button', { name: /deschide meniu/i });
    await hamburger.click();
    await expect(page.getByRole('button', { name: /închide meniu/i })).toBeVisible();
    await page.getByRole('button', { name: /închide meniu/i }).click();
    await expect(page.getByRole('button', { name: /deschide meniu/i })).toBeVisible();
  });

  test('mobile menu navigates to Live', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /deschide meniu/i }).click();
    await page.locator('header').getByRole('link', { name: /^live$/i }).last().click();
    await expect(page).toHaveURL('/live');
  });

  test('mobile menu navigates to Contact', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /deschide meniu/i }).click();
    await page.locator('header').getByRole('link', { name: /contact/i }).last().click();
    await expect(page).toHaveURL('/contact');
  });
});
