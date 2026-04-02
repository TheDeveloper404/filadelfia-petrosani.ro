import { test, expect } from '@playwright/test';

// ============================================================
// Live Page
// ============================================================
test.describe('LivePage', () => {
  test('renders heading and schedule', async ({ page }) => {
    await page.goto('/live');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
  });

  test('shows live player or offline message', async ({ page }) => {
    await page.goto('/live');
    await page.getByRole('heading', { level: 1 }).waitFor();
    const hasLive = await page.locator('iframe[title="Transmisie live"]').count();
    const hasOffline = await page.getByText(/nu se transmite live/i).count();
    const hasLastVideo = await page.locator('iframe[title="Ultimul program"]').count();
    const hasArchive = await page.locator('iframe[title="Predica"]').count();
    expect(hasLive + hasOffline + hasLastVideo + hasArchive).toBeGreaterThan(0);
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
    await expect(page.getByRole('button', { name: /mergi la ziua de azi/i })).toBeVisible();
  });

  test('shows reading plan entries', async ({ page }) => {
    await page.goto('/plan-citire');
    await expect(page.getByText(/geneza|matei|marcu|luca|fapte|psalmul/i).first()).toBeVisible();
  });

  test('Astăzi button scrolls to today row', async ({ page }) => {
    await page.goto('/plan-citire');
    await page.getByRole('button', { name: /mergi la ziua de azi/i }).click();
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
    // Wait for page chunk to render (heading appears)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
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


  test('delete event shows confirmation modal', async ({ page }) => {
    // Seed one event in localStorage so there's something to delete
    await page.goto('/admin');
    await page.evaluate(() => {
      localStorage.setItem('filadelfia_events', JSON.stringify([
        { id: 'test-del', title: 'Eveniment de sters', date: '2026-12-25', endDate: null, time: null, location: null, description: 'desc', registrationUrl: null, tags: [] }
      ]));
      sessionStorage.setItem('filadelfia_admin_unlocked', '1');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.locator('[aria-label="Șterge eveniment"]').first().click();
    await expect(page.getByText(/confirmare ștergere/i)).toBeVisible();
    // Cancel — event stays
    await page.getByRole('button', { name: /anulează/i }).last().click();
    await expect(page.getByText(/confirmare ștergere/i)).not.toBeVisible();
  });

  test('can add a new event', async ({ page }) => {
    // Clear cached events to avoid strict-mode violations from repeated runs
    await page.goto('/admin');
    await page.evaluate(() => localStorage.removeItem('filadelfia_events'));
    await page.evaluate(() => sessionStorage.setItem('filadelfia_admin_unlocked', '1'));
    await page.reload();
    // Click the Events "Adaugă" button (first one)
    await page.getByRole('button', { name: /adaugă/i }).first().click();
    await page.getByPlaceholder(/conferință de tineret/i).fill('Test eveniment');
    // Date is now 3 selects: day / month / year
    const dateSelects = page.locator('text=Data de început').locator('..').locator('select');
    await dateSelects.nth(0).selectOption('15');
    await dateSelects.nth(1).selectOption('12');
    await dateSelects.nth(2).selectOption('2026');
    await page.getByPlaceholder(/descrie evenimentul/i).fill('Descriere test');
    await page.getByRole('button', { name: /salvează evenimentul/i }).click();
    await expect(page.getByText('Test eveniment').first()).toBeVisible();
  });
});
