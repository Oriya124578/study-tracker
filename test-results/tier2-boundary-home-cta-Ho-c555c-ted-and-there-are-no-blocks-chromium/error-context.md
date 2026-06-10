# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier2-boundary\home-cta.spec.ts >> Home CTA empty state >> should display Home CTA when schedule is not generated and there are no blocks
- Location: e2e\tests\tier2-boundary\home-cta.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /תכנון AI|AI/i })
Expected: visible
Timeout: 2000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 2000ms
  - waiting for getByRole('button', { name: /תכנון AI|AI/i })
    - waiting for" http://localhost:5173/" navigation to finish...

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
  3  | test.describe('Home CTA empty state', () => {
  4  |   test('should display Home CTA when schedule is not generated and there are no blocks', async ({ page }) => {
  5  |     // Mock the state
  6  |     await page.addInitScript(() => {
  7  |       window.localStorage.setItem('calorie-life-storage', JSON.stringify({
  8  |         state: {
  9  |           data: {
  10 |             schedule: null, // no generatedAt
  11 |             events: [],
  12 |             courses: [],
  13 |             calori: { meals: [], workouts: [], dayHistory: {} },
  14 |             personalTasks: []
  15 |           },
  16 |           draftSchedule: null,
  17 |           profile: { displayName: 'Tester' }
  18 |         },
  19 |         version: 1
  20 |       }));
  21 |     });
  22 | 
  23 |     await page.goto('/');
  24 |     
  25 |     // According to the missing Home CTA, the current UI shows "ריק · לחץ + להוסיף"
  26 |     // The test expects that a specific Home CTA should be present if `!data.schedule?.generatedAt`.
  27 |     // Wait, let's see what is currently there.
  28 |     const emptyStateText = await page.locator('text=ריק · לחץ + להוסיף').isVisible();
  29 |     console.log("Empty state visible:", emptyStateText);
  30 | 
  31 |     // We will assert that the empty state is NOT just the generic text, 
  32 |     // but rather specifically prompts for AI planning (which is missing, so this will fail if we expect the CTA).
  33 |     // Let's assert that a primary CTA button exists.
  34 |     const ctaButton = page.getByRole('button', { name: /תכנון AI|AI/i });
  35 |     // This assertion should fail since it's missing in the code.
> 36 |     await expect(ctaButton).toBeVisible({ timeout: 2000 });
     |                             ^ Error: expect(locator).toBeVisible() failed
  37 |   });
  38 | });
  39 | 
```