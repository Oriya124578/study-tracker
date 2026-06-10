# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier2-boundary\ai-suggestions.spec.ts >> AI Suggestions (Accept/Reject) - Boundary & Corner Cases >> should handle extremely long AI suggestions that exceed normal UI constraints
- Location: e2e\tests\tier2-boundary\ai-suggestions.spec.ts:16:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Get Suggestions")')
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
  3  | test.describe('AI Suggestions (Accept/Reject) - Boundary & Corner Cases', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/ai-suggestions');
  6  |   });
  7  | 
  8  |   test('should gracefully handle AI suggestion API timeout or failure to respond', async ({ page }) => {
  9  |     await page.route('**/api/ai/suggestions', route => {
  10 |         route.abort('timedout');
  11 |     });
  12 |     await page.click('button:has-text("Get Suggestions")');
  13 |     await expect(page.locator('text=Failed to fetch suggestions, please try again')).toBeVisible();
  14 |   });
  15 | 
  16 |   test('should handle extremely long AI suggestions that exceed normal UI constraints', async ({ page }) => {
  17 |     await page.route('**/api/ai/suggestions', route => {
  18 |         route.fulfill({ json: { suggestions: [{ id: 1, text: 'A'.repeat(5000) }] } });
  19 |     });
> 20 |     await page.click('button:has-text("Get Suggestions")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  21 |     await expect(page.locator('.ai-suggestion-card')).toBeVisible();
  22 |   });
  23 | 
  24 |   test('should prevent duplicate task creation when rapidly clicking "Accept" multiple times', async ({ page }) => {
  25 |     const acceptButton = page.locator('button:has-text("Accept"):visible').first();
  26 |     if (await acceptButton.isVisible()) {
  27 |       await Promise.all([
  28 |           acceptButton.click(),
  29 |           acceptButton.click(),
  30 |           acceptButton.click()
  31 |       ]);
  32 |       await expect(page.locator('text=Suggestion accepted')).toHaveCount(1);
  33 |     }
  34 |   });
  35 | 
  36 |   test('should handle rejecting all AI suggestions until the queue is empty', async ({ page }) => {
  37 |     const rejectButtons = page.locator('button:has-text("Reject")');
  38 |     const count = await rejectButtons.count();
  39 |     for (let i = 0; i < count; i++) {
  40 |         await rejectButtons.nth(0).click();
  41 |     }
  42 |     await expect(page.locator('text=No more suggestions')).toBeVisible();
  43 |   });
  44 | 
  45 |   test('should correctly parse and sanitize malicious input or raw HTML returned in AI suggestions', async ({ page }) => {
  46 |     await page.route('**/api/ai/suggestions', route => {
  47 |         route.fulfill({ json: { suggestions: [{ id: 2, text: '<script>alert("xss")</script><b>Bold</b>' }] } });
  48 |     });
  49 |     await page.click('button:has-text("Get Suggestions")');
  50 |     const suggestionCard = page.locator('.ai-suggestion-card');
  51 |     if (await suggestionCard.isVisible()) {
  52 |       const suggestionText = await suggestionCard.innerText();
  53 |       expect(suggestionText).not.toContain('<script>');
  54 |       await expect(page.locator('b:has-text("Bold")')).toBeVisible();
  55 |     }
  56 |   });
  57 | });
  58 | 
```