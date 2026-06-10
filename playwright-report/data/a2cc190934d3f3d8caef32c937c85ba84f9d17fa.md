# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1-feature\05-google-calendar.spec.ts >> Google Calendar Integration >> should successfully fetch and display read-only events from a connected calendar
- Location: e2e\tests\tier1-feature\05-google-calendar.spec.ts:11:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('listitem').filter({ hasText: 'Google Event' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('listitem').filter({ hasText: 'Google Event' })

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
  3  | test.describe('Google Calendar Integration', () => {
  4  |   test('should initiate the Google Calendar OAuth connection flow correctly', async ({ page }) => {
  5  |     await page.goto('/settings/integrations');
  6  |     await page.getByRole('button', { name: 'Connect Google Calendar' }).click();
  7  |     // Assuming it redirects or opens a popup
  8  |     await expect(page).toHaveURL(/accounts\.google\.com|settings\/integrations/);
  9  |   });
  10 | 
  11 |   test('should successfully fetch and display read-only events from a connected calendar', async ({ page }) => {
  12 |     await page.goto('/');
  13 |     // Check if Google Calendar event is visible
  14 |     const event = page.getByRole('listitem').filter({ hasText: 'Google Event' });
> 15 |     await expect(event).toBeVisible();
     |                         ^ Error: expect(locator).toBeVisible() failed
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