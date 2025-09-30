import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page).toHaveTitle(/Connexion/);
    await expect(page.locator('h1')).toContainText('Connexion');
    
    // Check for form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display registration page', async ({ page }) => {
    await page.goto('/auth/register');
    
    await expect(page).toHaveTitle(/Inscription/);
    await expect(page.locator('h1')).toContainText('Inscription');
    
    // Check for form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=requis, text=obligatoire')).toBeVisible();
  });
});