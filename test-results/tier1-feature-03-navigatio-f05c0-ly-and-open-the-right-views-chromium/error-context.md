# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1-feature\03-navigation-settings.spec.ts >> Navigation & Settings Routes >> should handle calori deep links routing correctly and open the right views
- Location: e2e\tests\tier1-feature\03-navigation-settings.spec.ts:31:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: 'Add Category' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Add Category' })

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
  3  | test.describe('Navigation & Settings Routes', () => {
  4  |   test('should navigate successfully to all 8 distinct settings routes', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await page.getByRole('button', { name: 'Settings' }).click();
  7  |     
  8  |     const routes = ['Account', 'General', 'Categories', 'Integrations', 'AI Engine', 'Notifications', 'About', 'Help'];
  9  |     
  10 |     for (const route of routes) {
  11 |       await page.getByRole('link', { name: route }).click();
  12 |       await expect(page.getByRole('heading', { name: route, level: 1 })).toBeVisible();
  13 |     }
  14 |   });
  15 | 
  16 |   test('should display the correct UI components and header wordmark for each settings route', async ({ page }) => {
  17 |     await page.goto('/settings/general');
  18 |     await expect(page.getByText('Calorie Life')).toBeVisible();
  19 |     await expect(page.getByRole('button', { name: 'Theme' })).toBeVisible();
  20 |   });
  21 | 
  22 |   test('should maintain application state correctly when navigating between settings routes', async ({ page }) => {
  23 |     await page.goto('/settings/general');
  24 |     await page.getByRole('switch', { name: 'Dark Mode' }).click(); // assuming dark mode switch
  25 |     await page.goto('/settings/account');
  26 |     await page.goBack();
  27 |     // Verify switch is still checked
  28 |     await expect(page.getByRole('switch', { name: 'Dark Mode' })).toBeChecked();
  29 |   });
  30 | 
  31 |   test('should handle calori deep links routing correctly and open the right views', async ({ page }) => {
  32 |     // Navigate using a specific deep link or route directly
  33 |     await page.goto('/settings/categories?action=new');
> 34 |     await expect(page.getByRole('dialog', { name: 'Add Category' })).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  35 |   });
  36 | 
  37 |   test('should successfully navigate back to the main app dashboard from settings', async ({ page }) => {
  38 |     await page.goto('/settings/account');
  39 |     await page.getByRole('button', { name: 'Back to Dashboard' }).click();
  40 |     await expect(page).toHaveURL('/');
  41 |   });
  42 | });
  43 | 
```