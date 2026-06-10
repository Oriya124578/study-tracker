# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1-feature\05-google-calendar.spec.ts >> Google Calendar Integration >> should initiate the Google Calendar OAuth connection flow correctly
- Location: e2e\tests\tier1-feature\05-google-calendar.spec.ts:4:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Connect Google Calendar' })

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
  3  | test.describe('Google Calendar Integration', () => {
  4  |   test('should initiate the Google Calendar OAuth connection flow correctly', async ({ page }) => {
  5  |     await page.goto('/settings/integrations');
> 6  |     await page.getByRole('button', { name: 'Connect Google Calendar' }).click();
     |                                                                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  7  |     // Assuming it redirects or opens a popup
  8  |     await expect(page).toHaveURL(/accounts\.google\.com|settings\/integrations/);
  9  |   });
  10 | 
  11 |   test('should successfully fetch and display read-only events from a connected calendar', async ({ page }) => {
  12 |     await page.goto('/');
  13 |     // Check if Google Calendar event is visible
  14 |     const event = page.getByRole('listitem').filter({ hasText: 'Google Event' });
  15 |     await expect(event).toBeVisible();
  16 |     await expect(event.getByRole('button', { name: 'Edit' })).toBeDisabled(); // Read-only
  17 |   });
  18 | 
  19 |   test('should securely handle the OAuth callback and update the connection state', async ({ page }) => {
  20 |     // Mocking an OAuth callback return to the app
  21 |     await page.goto('/settings/integrations?success=true');
  22 |     await expect(page.getByText('Calendar Connected')).toBeVisible();
  23 |     await expect(page.getByRole('button', { name: 'Disconnect Google Calendar' })).toBeVisible();
  24 |   });
  25 | 
  26 |   test('should handle the disconnected state properly and remove events from the UI', async ({ page }) => {
  27 |     await page.goto('/settings/integrations');
  28 |     const disconnectBtn = page.getByRole('button', { name: 'Disconnect Google Calendar' });
  29 |     if (await disconnectBtn.isVisible()) {
  30 |       await disconnectBtn.click();
  31 |       await expect(page.getByText('Calendar Disconnected')).toBeVisible();
  32 |     }
  33 |     
  34 |     await page.goto('/');
  35 |     await expect(page.getByText('Google Event')).not.toBeVisible();
  36 |   });
  37 | 
  38 |   test('should gracefully display an error state when calendar event sync fails', async ({ page }) => {
  39 |     await page.goto('/settings/integrations');
  40 |     // Simulate sync failure
  41 |     await page.getByRole('button', { name: 'Sync Now' }).click();
  42 |     await expect(page.getByText('Failed to sync events')).toBeVisible();
  43 |   });
  44 | });
  45 | 
```