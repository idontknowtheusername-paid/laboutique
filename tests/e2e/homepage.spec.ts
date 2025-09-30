import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/JomiaStore/);
    
    // Check for main elements
    await expect(page.locator('h1')).toContainText('JomiaStore');
  });

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/');
    
    // Check header elements
    await expect(page.locator('header')).toBeVisible();
    
    // Check for logo
    await expect(page.locator('img[alt*="JomiaStore"]')).toBeVisible();
    
    // Check for search bar
    await expect(page.locator('input[placeholder*="Rechercher"]')).toBeVisible();
  });

  test('should display product sections', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Check for product sections
    await expect(page.locator('text=Produits populaires')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile menu is accessible
    await expect(page.locator('button[aria-label*="menu"], button:has-text("Menu")')).toBeVisible();
  });
});