# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1-feature\04-profile-photo.spec.ts >> Profile Photo Sync >> should display the user's synced profile photo in the main navigation header
- Location: e2e\tests\tier1-feature\04-profile-photo.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('img', { name: 'User Profile' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('img', { name: 'User Profile' })
    - waiting for" http://localhost:5173/" navigation to finish...
    - navigated to "http://localhost:5173/"

```

```yaml
- text: calori life
- paragraph: התחבר כדי להמשיך לנהל את היום שלך
- text: אימייל
- textbox "כתובת אימייל"
- text: סיסמה
- textbox "סיסמה (מינימום 6 תווים)"
- button "התחבר"
- text: או
- button "התחבר עם Google"
- button "אין לך חשבון? הרשם עכשיו"
- button "שכחת סיסמה? שחזר כאן"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Profile Photo Sync', () => {
  4  |   test('should display the user\'s synced profile photo in the main navigation header', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     const avatar = page.getByRole('img', { name: 'User Profile' });
> 7  |     await expect(avatar).toBeVisible();
     |                          ^ Error: expect(locator).toBeVisible() failed
  8  |     await expect(avatar).toHaveAttribute('src', /http/);
  9  |   });
  10 | 
  11 |   test('should allow updating the profile photo and reflect the change instantly in the UI', async ({ page }) => {
  12 |     await page.goto('/settings/account');
  13 |     // Simulate uploading a file
  14 |     const fileInput = page.locator('input[type="file"]');
  15 |     // await fileInput.setInputFiles('path/to/photo.jpg'); // commented out as it requires a file
  16 |     
  17 |     // Simulate save
  18 |     await page.getByRole('button', { name: 'Upload Photo' }).click();
  19 |     await expect(page.getByText('Photo updated successfully')).toBeVisible();
  20 |   });
  21 | 
  22 |   test('should listen to users/{uid}/profile/photoURL and sync changes across the app', async ({ page }) => {
  23 |     await page.goto('/');
  24 |     // This is more of an integration test, but we can verify the UI reflects data changes
  25 |     // In opaque-box, we'd trigger a change and expect UI to update.
  26 |     const avatar = page.getByRole('img', { name: 'User Profile' });
  27 |     await expect(avatar).toBeVisible();
  28 |   });
  29 | 
  30 |   test('should show a default avatar if the user has no photo URL configured', async ({ page }) => {
  31 |     // Assuming a user without photo
  32 |     await page.goto('/');
  33 |     const avatar = page.getByRole('img', { name: 'Default Profile' });
  34 |     await expect(avatar).toBeVisible();
  35 |   });
  36 | 
  37 |   test('should reflect the updated photo across both settings and header simultaneously', async ({ page }) => {
  38 |     await page.goto('/settings/account');
  39 |     // Assuming photo was updated
  40 |     const settingsAvatar = page.locator('.settings-avatar');
  41 |     const headerAvatar = page.locator('.header-avatar');
  42 |     
  43 |     await expect(settingsAvatar).toBeVisible();
  44 |     await expect(headerAvatar).toBeVisible();
  45 |     // They should eventually have the same src
  46 |   });
  47 | });
  48 | 
```