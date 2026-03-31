import { test, expect } from '@playwright/test';

// ============================================================
// Live Page
// ============================================================
test.describe('LivePage', () => {
  test('renders heading and schedule', async ({ page }) => {
    await page.goto('/live');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/programul serviciilor/i).first()).toBeVisible();
  });

  test('shows live player or offline message', async ({ page }) => {
    await page.goto('/live');
    const iframe = page.frameLocator('iframe[title="Transmisie live"]');
    const offlineMsg = page.getByText(/momentan nu este transmisie live/i);
    // One of the two must be present
    const hasIframe = await page.locator('iframe[title="Transmisie live"]').count();
    const hasOffline = await offlineMsg.count();
    expect(hasIframe + hasOffline).toBeGreaterThan(0);
  });
});

// ============================================================
// Contact Page
// ============================================================
test.describe('ContactPage', () => {
  test('renders heading', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows address', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByText(/petroșani/i).first()).toBeVisible();
  });

  test('shows pastor names', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByText(/gheorghe coicheci/i)).toBeVisible();
    await expect(page.getByText(/daniel nemes/i)).toBeVisible();
  });

  test('shows embedded map', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('iframe[title]').first()).toBeVisible();
  });
});

// ============================================================
// Reading Plan Page
// ============================================================
test.describe('ReadingPlanPage', () => {
  test('renders heading', async ({ page }) => {
    await page.goto('/plan-citire');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows Astăzi button', async ({ page }) => {
    await page.goto('/plan-citire');
    await expect(page.getByRole('button', { name: /astăzi/i })).toBeVisible();
  });

  test('shows reading plan entries', async ({ page }) => {
    await page.goto('/plan-citire');
    await expect(page.getByText(/geneza|matei|marcu|luca|fapte|psalmul/i).first()).toBeVisible();
  });

  test('Astăzi button scrolls to today row', async ({ page }) => {
    await page.goto('/plan-citire');
    await page.getByRole('button', { name: /astăzi/i }).click();
    const todayRow = page.locator('#today-row');
    await expect(todayRow).toBeVisible();
  });
});

// ============================================================
// Știri Page
// ============================================================
test.describe('StiriPage', () => {
  test('renders heading', async ({ page }) => {
    await page.goto('/stiri');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows loading spinner then content', async ({ page }) => {
    await page.goto('/stiri');
    // Wait for spinner to disappear and content to load
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 10000 });
    // Should show either articles or error message
    const articles = page.locator('a[href*="crestintotal.ro"]');
    const error = page.getByText(/nu pot fi încărcate/i);
    const articlesCount = await articles.count();
    const errorCount = await error.count();
    expect(articlesCount + errorCount).toBeGreaterThan(0);
  });

  test('article links open externally', async ({ page }) => {
    await page.goto('/stiri');
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 10000 });
    const articleLinks = page.locator('a[href*="crestintotal.ro"]');
    if (await articleLinks.count() > 0) {
      await expect(articleLinks.first()).toHaveAttribute('target', '_blank');
      await expect(articleLinks.first()).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});

// ============================================================
// Admin Page
// ============================================================

// Helper: unlock the admin panel by injecting the session flag and reloading
async function unlockAdmin(page: import('@playwright/test').Page) {
  await page.goto('/admin');
  // Inject the session flag that PinScreen checks
  await page.evaluate(() => sessionStorage.setItem('filadelfia_admin_unlocked', '1'));
  await page.reload();
}

test.describe('AdminPage', () => {
  test('shows PIN screen before login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText(/introdu codul de acces/i)).toBeVisible();
  });

  test('renders admin panel after unlock', async ({ page }) => {
    await unlockAdmin(page);
    await expect(page.getByText(/administrator/i)).toBeVisible();
  });

  test('ticker toggle and save work', async ({ page }) => {
    await unlockAdmin(page);
    const saveBtn = page.getByRole('button', { name: /salvează/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
    await expect(page.getByRole('button', { name: /salvat/i })).toBeVisible();
  });

  test('reset button is visible', async ({ page }) => {
    await unlockAdmin(page);
    await expect(page.getByRole('button', { name: /resetează/i })).toBeVisible();
  });

  test('can add a new event', async ({ page }) => {
    await unlockAdmin(page);
    await page.getByRole('button', { name: /adaugă/i }).click();
    await page.getByPlaceholder(/conferință de tineret/i).fill('Test eveniment');
    await page.locator('input[type="date"]').first().fill('2026-12-15');
    await page.getByPlaceholder(/descrie evenimentul/i).fill('Descriere test');
    await page.getByRole('button', { name: /salvează evenimentul/i }).click();
    await expect(page.getByText('Test eveniment')).toBeVisible();
  });
});
