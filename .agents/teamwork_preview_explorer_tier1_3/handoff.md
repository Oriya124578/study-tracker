# Playwright Setup and Tier 1 Test Plan

## Observation
1. The project `Calorie Life` is a React + Vite application (`package.json` confirms `vite` and `react`).
2. Playwright is currently not installed, as absent in `package.json` dependencies/devDependencies.
3. `TEST_INFRA.md` requires Playwright for E2E testing with the test runner command `npm run test:e2e`.
4. `SCOPE.md` details Tier 1 as "Feature Coverage" requiring 5+ happy-path tests for each of the 8 specified features (total 40 tests) in the `e2e/tests/tier1-feature/` directory.
5. The `SettingsView` React component and `BottomNav` reflect the navigation layout and various configuration sections that correspond to the settings and navigation features.

## Logic Chain
1. To introduce Playwright testing without coupling to implementation details (Opaque-box testing), we need to set up `@playwright/test`.
2. A `playwright.config.ts` (or `.js`) is required to serve the frontend via `npm run dev` and run tests against `http://localhost:5173`.
3. We need 8 distinct test spec files corresponding to the 8 core features.
4. To meet the Tier 1 requirement, each spec file must contain exactly 5 test titles representing happy-path scenarios.
5. All validations in these tests must be specified to rely exclusively on DOM/UI interactions (e.g., verifying element visibility, text changes, UI lists) rather than inspecting internal state or Firebase directly.

## Caveats
- Auth state and data mocking might be required since it relies on Firebase Auth and Firestore. Setup scripts for Playwright will need to mock `onAuthStateChanged` or use a dedicated test user. The test cases below assume the user is authenticated and data is ready.
- Settings are structured into "Cards" on a single view rather than discrete URL routes, so "8 Settings Routes" tests will navigate to Settings and verify sections/cards.

## Conclusion
### Playwright Infrastructure Setup Plan
1. **Install Dependencies:** Run `npm install -D @playwright/test` and `npx playwright install --with-deps`.
2. **NPM Script:** Add `"test:e2e": "playwright test"` to `package.json`.
3. **Playwright Config:** Create `playwright.config.ts` at the root:
   - `testDir: './e2e/tests'`
   - `webServer: { command: 'npm run dev', port: 5173, reuseExistingServer: true }`
   - `use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' }`
4. **Directory Structure:** Create `e2e/tests/tier1-feature/`.

### Tier 1 File Structure and Test Case Titles

**1. `e2e/tests/tier1-feature/f1-category-management.spec.ts`**
1. Create a new custom category with a name and color, and verify it appears in the categories list.
2. Edit an existing custom category's name and verify the updated text is visible.
3. Edit an existing custom category's color and verify the UI style reflects the change.
4. Delete a custom category and verify it is completely removed from the UI.
5. Create multiple custom categories and verify they are all listed in the UI.

**2. `e2e/tests/tier1-feature/f2-task-categories.spec.ts`**
1. Assign a category while creating a new task and verify the category badge appears on the task.
2. Edit an existing uncategorized task to assign a category and verify the badge appears.
3. Edit an existing categorized task to change its category and verify the new badge replaces the old one.
4. Remove the category from an existing task and verify the badge disappears.
5. Filter tasks by a specific category and verify only tasks with that category badge are visible.

**3. `e2e/tests/tier1-feature/f3-navigation-settings.spec.ts`**
1. Navigate using the Bottom Nav to the Home, Studies, Focus, and Command Center views and verify headers.
2. Navigate to Settings and verify the Profile section is visible and can receive input.
3. Verify the Course Manager section in Settings is visible and the "New Course" modal opens.
4. Verify the AI & Command Center settings section is visible and inputs can be toggled.
5. Verify the Preferences section is visible and Theme/Language options are clickable.

**4. `e2e/tests/tier1-feature/f4-profile-photo.spec.ts`**
1. Upload a valid profile photo and verify the avatar image in the header updates.
2. Replace an existing profile photo with a new image and verify the image src updates.
3. Remove the profile photo and verify the fallback initial/icon is displayed.
4. Navigate between Home and Settings views and verify the profile photo persists.
5. Update the user's Display Name and verify the fallback avatar initial updates accordingly.

**5. `e2e/tests/tier1-feature/f5-google-calendar.spec.ts`**
1. Initiate Google Calendar connection and verify the status changes to "Connected" in Settings.
2. View the calendar and verify that imported Google events are visible.
3. Disconnect Google Calendar and verify imported events are removed from the view.
4. Toggle Google Calendar visibility off and verify events disappear without disconnecting.
5. Click on an imported Google Calendar event and verify the modal displays read-only information.

**6. `e2e/tests/tier1-feature/f6-calendar-views.spec.ts`**
1. Navigate to Calendar and verify the "Day" view renders events in a single-column timeline.
2. Switch to the "3 Days" view and verify events span across three visible day columns.
3. Switch to the "Week" view and verify events are plotted across a full 7-day grid.
4. Switch to the "Month" view and verify event indicators appear on the correct calendar grid dates.
5. Switch to the "Schedule" view and verify events are rendered in a sequential list format.

**7. `e2e/tests/tier1-feature/f7-recurring-tasks.spec.ts`**
1. Create a weekly recurring task and verify it appears on multiple consecutive weeks in the calendar UI.
2. Edit a single instance of a recurring task and verify only that date's task shows the update.
3. Edit all future instances of a recurring task and verify subsequent dates show the update.
4. Delete a single instance of a recurring task and verify it disappears while others remain.
5. Delete all instances of a recurring task and verify they are all removed from the UI.

**8. `e2e/tests/tier1-feature/f8-ai-suggestions.spec.ts`**
1. Open the pending AI suggestions list and verify suggestions are visible.
2. Accept an AI suggestion and verify a corresponding task/event card is added to the UI.
3. Reject an AI suggestion and verify it is removed from the suggestions list without creating a task.
4. Verify that an accepted AI task reflects the correct suggested category or time visually.
5. Accept and reject all pending suggestions and verify the empty state message is displayed.

## Verification Method
- Execute the setup commands manually or via agent implementer to confirm `npm run test:e2e` is available.
- Create empty spec files matching the names above and run `npm run test:e2e` to confirm Playwright detects 0 passes/failures without errors.
- Confirm tests map correctly to the functional requirements specified in `PROJECT.md` and `TEST_INFRA.md`.
