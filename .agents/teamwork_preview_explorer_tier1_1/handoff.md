# Handoff Report: E2E Testing Plan & Tier 1 Cases

## 1. Observation
- `TEST_INFRA.md` specifies an opaque-box, requirement-driven test philosophy using Playwright, with 8 core features to test across 4 tiers.
- `.agents/e2e_testing_orch/SCOPE.md` outlines "Tier 1: Feature Coverage" which requires 5+ happy-path tests for each of the 8 features (40+ tests).
- `PROJECT.md` details that the app is built with Vite, React, and Firebase (Firestore + Cloud Functions).
- The 8 core features are: Category Management, Assign Categories to Tasks, Navigation & 8 Settings Routes, Profile Photo Sync, Google Calendar Integration, Calendar 5-Views UI, Recurring Tasks, and AI Suggestions.

## 2. Logic Chain
- **Playwright Setup**: Since the app uses Vite + React, we should initialize `@playwright/test` and configure `playwright.config.ts` to spin up the local development server (likely `npm run dev` on `http://localhost:5173`) before running tests.
- **Test File Organization**: Following `TEST_INFRA.md`, tests will reside in `e2e/tests/tier1-feature/`. We will create 8 distinct `.spec.ts` files, one for each feature.
- **Test Design**: Based on `PROJECT.md`, I formulated 5 distinct happy-path test cases for each feature, focusing on the described UI components (e.g., Segmented controls for calendar views, Category chips, AI Suggestion accept/reject flows).

## 3. Caveats
- **Authentication**: E2E tests for a Firebase application typically require the Firebase Local Emulator Suite. We have not detailed the auth mocking or emulator data seeding strategy.
- **External Dependencies**: Google Calendar Integration testing will require mocking the Cloud Function endpoints to avoid real OAuth flows in the CI environment.
- **AI Dependencies**: The AI Manager runs via CRON. Tests for AI suggestions should mock `cl_aiSuggestions` Firestore records rather than executing the actual AI pipeline.

## 4. Conclusion
The Playwright setup should be executed via standard `npm init playwright@latest`. Below is the required directory layout and the detailed suite of 40 Tier 1 test cases ready for implementation.

### Proposed Playwright Setup
1. **Installation**: Run `npm init playwright@latest` or `npm i -D @playwright/test`.
2. **Configuration**: Edit `playwright.config.ts` to include:
   ```typescript
   webServer: {
     command: 'npm run dev',
     url: 'http://localhost:5173',
     reuseExistingServer: !process.env.CI,
   },
   use: { baseURL: 'http://localhost:5173' }
   ```
3. **Scripts**: Add `"test:e2e": "playwright test"` to `package.json`.

### Tier 1: Feature Coverage (Directory Layout & Test Titles)

**1. `e2e/tests/tier1-feature/01-category-management.spec.ts`**
- `should create a new category with a specific name, color, and icon`
- `should read and display existing categories in the category management UI`
- `should update an existing category's name, color, and icon`
- `should delete a category and remove it from the list`
- `should load default categories via client init or Cloud Function if none exist`

**2. `e2e/tests/tier1-feature/02-assign-categories.spec.ts`**
- `should allow assigning an existing category to a new task via a select modal or chips`
- `should update a task to add or remove category assignments`
- `should display the correct category chips on a categorized task in the list`
- `should persist category assignments after a page reload`
- `should handle tasks with multiple categories assigned correctly`

**3. `e2e/tests/tier1-feature/03-navigation-settings.spec.ts`**
- `should navigate successfully to all 8 distinct settings routes`
- `should display the correct UI components and header wordmark for each settings route`
- `should maintain application state correctly when navigating between settings routes`
- `should handle calori deep links routing correctly and open the right views`
- `should successfully navigate back to the main app dashboard from settings`

**4. `e2e/tests/tier1-feature/04-profile-photo.spec.ts`**
- `should display the user's synced profile photo in the main navigation header`
- `should allow updating the profile photo and reflect the change instantly in the UI`
- `should listen to users/{uid}/profile/photoURL and sync changes across the app`
- `should show a default avatar if the user has no photo URL configured`
- `should reflect the updated photo across both settings and header simultaneously`

**5. `e2e/tests/tier1-feature/05-google-calendar.spec.ts`**
- `should initiate the Google Calendar OAuth connection flow correctly`
- `should successfully fetch and display read-only events from a connected calendar`
- `should securely handle the OAuth callback and update the connection state`
- `should handle the disconnected state properly and remove events from the UI`
- `should gracefully display an error state when calendar event sync fails`

**6. `e2e/tests/tier1-feature/06-calendar-views.spec.ts`**
- `should correctly render the Day view and align events properly by time`
- `should correctly render the 3 Days view and handle spanning events appropriately`
- `should correctly render the Week view with accurate column alignment`
- `should correctly render the Month view with aggregated multiple events per day`
- `should correctly render the Schedule view as a chronological list and toggle via segmented control`

**7. `e2e/tests/tier1-feature/07-recurring-tasks.spec.ts`**
- `should create a recurring task with a specific interval and type`
- `should correctly generate and display future instances of a recurring task in the calendar`
- `should allow editing a single specific instance of a recurring task without affecting others`
- `should allow editing all future instances of a recurring task from a given point`
- `should delete all subsequent instances when a recurring task series is terminated`

**8. `e2e/tests/tier1-feature/08-ai-suggestions.spec.ts`**
- `should fetch and display pending AI suggestions generated by the AI Manager`
- `should accept an AI suggestion and apply the proposed changes (e.g., task creation)`
- `should reject an AI suggestion, remove it from the list, and update status to rejected`
- `should correctly render the context, type, and rationale of an AI suggestion`
- `should clear the suggestions UI section when all pending items have been resolved`

## 5. Verification Method
- **Configuration Check**: Verify `playwright.config.ts` matches standard Vite React configuration.
- **Dry Run**: Create the specified test files with `.skip` or empty bodies, run `npm run test:e2e`, and verify Playwright discovers exactly 40 tests across 8 files.
- **Invalidation Condition**: If the app fails to start with `npm run dev` during Playwright initialization, or if test files are placed outside the `e2e/tests/tier1-feature/` boundary.
