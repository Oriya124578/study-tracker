# Tier 1 Test Planning Handoff

## Observation
- `TEST_INFRA.md` specifies opaque-box, requirement-driven E2E tests using Playwright.
- The application is built using Vite + React.
- There are 8 features to test: Category Management, Assign Categories to Tasks, Navigation & 8 Settings Routes, Profile Photo Sync, Google Calendar Integration, Calendar 5-Views UI, Recurring Tasks, AI Suggestions.
- `SCOPE.md` outlines Tier 1 as "Feature Coverage" requiring 5+ happy-path tests for each of the 8 features, resulting in 40+ tests.
- `TEST_INFRA.md` specifies the test runner command should be `npm run test:e2e` and directory layout `e2e/tests/tier1-feature/`.

## Logic Chain
- To support Playwright testing, the project must first have Playwright and its dependencies installed and configured (`playwright.config.ts`), and the `test:e2e` script added to `package.json`.
- The Playwright config should be set up to start the Vite dev server or use the built version for E2E tests.
- For Tier 1 Feature Coverage, we need to create one `.spec.ts` file per feature inside the `e2e/tests/tier1-feature/` directory to maintain modularity and organization.
- Since we need ≥5 tests per feature and the testing philosophy is "opaque-box", the tests should focus on user-facing interactions (clicking, typing, verifying visibility) rather than component states or internals.
- For features that depend on external systems (like Google Calendar API or AI Suggestions), we will need to mock API responses or intercepts in Playwright so tests can run deterministically without actual external calls.

## Caveats
- Actual DOM selectors (like `data-testid` or ARIA roles) aren't known yet, so test cases are planned at a conceptual "user interaction" level.
- Google Calendar and AI features require network mocking, which assumes the implementer will set up `page.route()` intercepts.
- The specific URLs for the 8 settings routes aren't explicitly detailed, so tests assume generic navigation.

## Conclusion
The Playwright setup involves initializing Playwright, configuring `playwright.config.ts`, and adding NPM scripts. 
The Tier 1 test suite will consist of 8 test files in `e2e/tests/tier1-feature/`, containing a total of 40 opaque-box test cases targeting the required features.

**Playwright Setup Plan:**
1. Install Playwright: `npm init playwright@latest` or `npm install -D @playwright/test`.
2. Configure `playwright.config.ts`: Set `testDir: './e2e/tests'`, and configure the `webServer` to run `npm run dev` (or preview).
3. Update `package.json`: Add `"test:e2e": "playwright test"`.
4. Create directory structure: `mkdir -p e2e/tests/tier1-feature/`.

**Tier 1 File Structure & Test Cases:**

1. `e2e/tests/tier1-feature/f1-category-management.spec.ts`
   - Should create a new category successfully with a name and color.
   - Should read and display the list of created categories.
   - Should update an existing category's name and color.
   - Should delete an existing category successfully.
   - Should prevent creating a category with an empty name (validation error).

2. `e2e/tests/tier1-feature/f2-assign-categories.spec.ts`
   - Should allow assigning a single category to a new task during creation.
   - Should allow assigning multiple categories to an existing task.
   - Should display the assigned category colors/labels on the task in the list view.
   - Should allow removing an assigned category from a task.
   - Should filter tasks by a specific assigned category.

3. `e2e/tests/tier1-feature/f3-navigation-settings.spec.ts`
   - Should navigate to the General Settings page via the settings menu.
   - Should navigate to the Appearance Settings page via the settings menu.
   - Should navigate to the Notifications Settings page via the settings menu.
   - Should navigate to the Integrations Settings page via the settings menu.
   - Should successfully navigate through the remaining 4 settings routes (Account, Security, Privacy, Help) sequentially.

4. `e2e/tests/tier1-feature/f4-profile-photo.spec.ts`
   - Should display the default profile avatar when no photo is uploaded.
   - Should allow uploading a new profile photo and display it on the user profile page.
   - Should sync and display the updated profile photo in the global top navigation bar.
   - Should allow removing the current profile photo and revert to the default avatar.
   - Should display the uploaded profile photo correctly after a full page reload.

5. `e2e/tests/tier1-feature/f5-google-calendar.spec.ts`
   - Should display the "Connect Google Calendar" button in the Integrations settings.
   - Should initiate the Google Calendar OAuth flow when the connect button is clicked.
   - Should display mocked Google Calendar events on the dashboard after a successful connection.
   - Should allow disconnecting Google Calendar and remove its events from the UI.
   - Should sync a newly created app task to the connected Google Calendar (verifying the mocked API call payload).

6. `e2e/tests/tier1-feature/f6-calendar-views.spec.ts`
   - Should render the Day view and correctly display tasks scheduled for today.
   - Should render the Week view and correctly display tasks scheduled for the current week.
   - Should render the Month view and correctly display tasks scheduled for the current month.
   - Should render the Year view and display a summary or heat map of tasks/events.
   - Should render the Schedule (Agenda) view and list upcoming tasks chronologically.

7. `e2e/tests/tier1-feature/f7-recurring-tasks.spec.ts`
   - Should create a daily recurring task and display it on consecutive days in the calendar.
   - Should create a weekly recurring task and display it on the same day next week.
   - Should create a monthly recurring task and display it on the same date next month.
   - Should allow editing a single instance of a recurring task without affecting the rest of the series.
   - Should allow deleting the entire series of a recurring task.

8. `e2e/tests/tier1-feature/f8-ai-suggestions.spec.ts`
   - Should display a list of AI-suggested tasks to the user (mocked API).
   - Should allow accepting an AI suggestion, converting it into a regular scheduled task.
   - Should allow rejecting an AI suggestion, removing it from the suggestions list.
   - Should persist accepted AI suggestions as standard tasks after a page reload.
   - Should persist rejected AI suggestions so they do not reappear after a page reload.

## Verification Method
- Ensure `npm run test:e2e` executes tests in `e2e/tests/tier1-feature/`.
- Ensure the total number of tests implemented is exactly 40.
- Execute Playwright UI or headless mode to verify that the tests are strictly using opaque-box selectors (e.g. `getByRole`, `getByText`) without relying on React internals.
