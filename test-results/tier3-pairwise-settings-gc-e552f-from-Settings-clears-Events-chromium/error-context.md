# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier3-pairwise\settings-gcal.spec.ts >> Disconnect Google Calendar from Settings clears Events
- Location: e2e\tests\tier3-pairwise\settings-gcal.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Settings' })

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
  3  | test('Disconnect Google Calendar from Settings clears Events', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // Connect GCal and verify events populate
> 7  |   await page.getByRole('button', { name: 'Settings' }).click();
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  8  |   await page.getByRole('link', { name: 'Integrations' }).click();
  9  |   await page.getByRole('button', { name: 'Connect Google Calendar' }).click();
  10 |   
  11 |   await page.getByRole('link', { name: 'Dashboard' }).click();
  12 |   await expect(page.getByText('Team Standup (GCal)')).toBeVisible();
  13 | 
  14 |   // Navigate to settings, disconnect GCal
  15 |   await page.getByRole('button', { name: 'Settings' }).click();
  16 |   await page.getByRole('link', { name: 'Integrations' }).click();
  17 |   await page.getByRole('button', { name: 'Disconnect Google Calendar' }).click();
  18 |   await page.getByRole('button', { name: 'Confirm Disconnect' }).click();
  19 | 
  20 |   // Verify events immediately disappear from dashboard without page reload
  21 |   await page.getByRole('link', { name: 'Dashboard' }).click();
  22 |   await expect(page.getByText('Team Standup (GCal)')).toBeHidden();
  23 | });
  24 | 
```