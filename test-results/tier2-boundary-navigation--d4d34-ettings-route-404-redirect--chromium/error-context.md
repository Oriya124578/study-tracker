# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier2-boundary\navigation-settings.spec.ts >> Navigation & 8 Settings Routes - Boundary & Corner Cases >> should handle deep-linking directly to a non-existent settings route (404/redirect)
- Location: e2e\tests\tier2-boundary\navigation-settings.spec.ts:23:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Page not found').or(locator('text=Settings'))
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Page not found').or(locator('text=Settings'))

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
  3  | test.describe('Navigation & 8 Settings Routes - Boundary & Corner Cases', () => {
  4  |   test('should handle rapid switching between all 8 settings routes continuously', async ({ page }) => {
  5  |     await page.goto('/settings');
  6  |     const routes = ['Profile', 'Account', 'Preferences', 'Notifications', 'Privacy', 'Security', 'Integrations', 'Billing'];
  7  |     for (let i = 0; i < 3; i++) {
  8  |         for (const route of routes) {
  9  |             await page.click(`text=${route}`);
  10 |         }
  11 |     }
  12 |     await expect(page.locator('text=Billing')).toBeVisible();
  13 |   });
  14 | 
  15 |   test('should maintain settings form state when navigating away and immediately back', async ({ page }) => {
  16 |     await page.goto('/settings/profile');
  17 |     await page.fill('input[name="bio"]', 'Temporary bio text');
  18 |     await page.click('text=Notifications');
  19 |     await page.click('text=Profile');
  20 |     await expect(page.locator('input[name="bio"]')).toHaveValue('Temporary bio text');
  21 |   });
  22 | 
  23 |   test('should handle deep-linking directly to a non-existent settings route (404/redirect)', async ({ page }) => {
  24 |     await page.goto('/settings/non-existent-route');
> 25 |     await expect(page.locator('text=Page not found').or(page.locator('text=Settings'))).toBeVisible();
     |                                                                                         ^ Error: expect(locator).toBeVisible() failed
  26 |   });
  27 | 
  28 |   test('should gracefully handle network interruption while saving settings', async ({ page }) => {
  29 |     await page.goto('/settings/preferences');
  30 |     await page.context().setOffline(true);
  31 |     await page.click('button:has-text("Save")');
  32 |     await expect(page.locator('text=Network error, please try again')).toBeVisible();
  33 |     await page.context().setOffline(false);
  34 |   });
  35 | 
  36 |   test('should correctly render very long text inputs in settings fields without breaking layout', async ({ page }) => {
  37 |     await page.goto('/settings/profile');
  38 |     const longText = 'a'.repeat(5000);
  39 |     await page.fill('textarea[name="description"]', longText);
  40 |     await page.click('button:has-text("Save")');
  41 |     const bbox = await page.locator('textarea[name="description"]').boundingBox();
  42 |     expect(bbox?.width).toBeLessThan(2000);
  43 |   });
  44 | });
  45 | 
```