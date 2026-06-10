import { test, expect } from '@playwright/test';

test.describe('Home CTA empty state', () => {
  test('should display Home CTA when schedule is not generated and there are no blocks', async ({ page }) => {
    // Mock the state
    await page.addInitScript(() => {
      window.localStorage.setItem('calorie-life-storage', JSON.stringify({
        state: {
          data: {
            schedule: null, // no generatedAt
            events: [],
            courses: [],
            calori: { meals: [], workouts: [], dayHistory: {} },
            personalTasks: []
          },
          draftSchedule: null,
          profile: { displayName: 'Tester' }
        },
        version: 1
      }));
    });

    await page.goto('/');
    
    // According to the missing Home CTA, the current UI shows "ריק · לחץ + להוסיף"
    // The test expects that a specific Home CTA should be present if `!data.schedule?.generatedAt`.
    // Wait, let's see what is currently there.
    const emptyStateText = await page.locator('text=ריק · לחץ + להוסיף').isVisible();
    console.log("Empty state visible:", emptyStateText);

    // We will assert that the empty state is NOT just the generic text, 
    // but rather specifically prompts for AI planning (which is missing, so this will fail if we expect the CTA).
    // Let's assert that a primary CTA button exists.
    const ctaButton = page.getByRole('button', { name: /תכנון AI|AI/i });
    // This assertion should fail since it's missing in the code.
    await expect(ctaButton).toBeVisible({ timeout: 2000 });
  });
});
