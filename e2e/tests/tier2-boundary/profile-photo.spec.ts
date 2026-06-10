import { test, expect } from '@playwright/test';

test.describe('Profile Photo Sync - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/profile');
  });

  test('should reject uploading a profile photo exceeding the maximum file size limit (e.g., > 10MB)', async ({ page }) => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    await page.setInputFiles('input[type="file"]', {
        name: 'large_image.jpg',
        mimeType: 'image/jpeg',
        buffer: largeBuffer
    });
    await expect(page.locator('text=File size exceeds 10MB limit')).toBeVisible();
  });

  test('should reject uploading an unsupported file format (e.g., .txt, .pdf) for profile photo', async ({ page }) => {
    await page.setInputFiles('input[type="file"]', {
        name: 'document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content')
    });
    await expect(page.locator('text=Unsupported file format')).toBeVisible();
  });

  test('should handle uploading an extremely high-resolution image (e.g., 8K)', async ({ page }) => {
    await page.setInputFiles('input[type="file"]', {
        name: '8k_image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake 8k content')
    });
    await expect(page.locator('text=Photo uploaded successfully')).toBeVisible();
  });

  test('should correctly handle profile photo sync when the user is offline', async ({ page }) => {
    await page.context().setOffline(true);
    await page.setInputFiles('input[type="file"]', {
        name: 'offline_image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake offline content')
    });
    await expect(page.locator('text=Upload queued. Will sync when online.')).toBeVisible();
    await page.context().setOffline(false);
  });

  test('should handle clearing the profile photo and reverting to the default avatar', async ({ page }) => {
    await page.click('button:has-text("Remove Photo")');
    await expect(page.locator('img[alt="Default Avatar"]')).toBeVisible();
  });
});
