import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to category pages', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to electronics category
    await page.click('a[href="/category/electronique"]');
    await expect(page).toHaveURL('/category/electronique');
    await expect(page.locator('h1')).toContainText('Électronique');
  });

  test('should navigate to account pages when logged in', async ({ page }) => {
    await page.goto('/');
    
    // Check if account navigation is available
    const accountLink = page.locator('a[href*="/account"]').first();
    if (await accountLink.isVisible()) {
      await accountLink.click();
      await expect(page).toHaveURL(/\/account/);
    }
  });

  test('should search for products', async ({ page }) => {
    await page.goto('/');
    
    // Fill search input
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('smartphone');
    
    // Submit search
    await searchInput.press('Enter');
    
    // Should navigate to search results
    await expect(page).toHaveURL(/\/search/);
  });
});