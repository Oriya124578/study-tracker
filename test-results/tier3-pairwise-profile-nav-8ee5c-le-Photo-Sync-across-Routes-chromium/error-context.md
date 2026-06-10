# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier3-pairwise\profile-navigation.spec.ts >> Persistent Profile Photo Sync across Routes
- Location: e2e\tests\tier3-pairwise\profile-navigation.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Profile' })
    - waiting for" http://localhost:5173/" navigation to finish...
    - navigated to "http://localhost:5173/"

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - text: calori
    - generic [ref=e7]: life
  - paragraph [ref=e8]: התחבר כדי להמשיך לנהל את היום שלך
  - generic [ref=e9]:
    - generic [ref=e10]:
      - text: אימייל
      - textbox "כתובת אימייל" [ref=e11]
    - generic [ref=e12]:
      - text: סיסמה
      - textbox "סיסמה (מינימום 6 תווים)" [ref=e13]
    - button "התחבר" [ref=e14]
  - generic [ref=e19]: או
  - button "התחבר עם Google" [ref=e20]:
    - img [ref=e21]
    - text: התחבר עם Google
  - generic [ref=e26]:
    - button "אין לך חשבון? הרשם עכשיו" [ref=e27] [cursor=pointer]
    - button "שכחת סיסמה? שחזר כאן" [ref=e28] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Persistent Profile Photo Sync across Routes', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // Sync profile photo
> 7  |   await page.getByRole('button', { name: 'Profile' }).click();
     |                                                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  8  |   await page.getByRole('button', { name: 'Sync Avatar' }).click();
  9  |   
  10 |   const avatar = page.locator('.user-avatar');
  11 |   await expect(avatar).toHaveAttribute('src', /avatar-synced/);
  12 | 
  13 |   // Navigate rapidly through settings routes
  14 |   await page.getByRole('button', { name: 'Settings' }).click();
  15 |   
  16 |   const routes = ['Account', 'Preferences', 'Integrations', 'Notifications', 'Privacy', 'Security', 'Billing', 'Advanced'];
  17 |   
  18 |   for (const route of routes) {
  19 |     await page.getByRole('link', { name: route }).click();
  20 |     await expect(page.getByRole('heading', { name: route })).toBeVisible();
  21 |     await expect(avatar).toHaveAttribute('src', /avatar-synced/);
  22 |   }
  23 | 
  24 |   // Main application views
  25 |   await page.getByRole('link', { name: 'Dashboard' }).click();
  26 |   await expect(avatar).toHaveAttribute('src', /avatar-synced/);
  27 |   
  28 |   await page.getByRole('link', { name: 'Calendar' }).click();
  29 |   await expect(avatar).toHaveAttribute('src', /avatar-synced/);
  30 | });
  31 | 
```