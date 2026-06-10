# Handoff Report: Tier 4 Real-World Scenarios Test Plan

## Observation
- Read `c:\src\projects\Calorie Life\TEST_INFRA.md`:
  - Outlines 8 main features (F1 to F8).
  - Specifies directory layout as `e2e/tests/tier4-workload/` for Tier 4.
  - Lists 4 real-world application scenarios, leaving a gap for the 5th to meet coverage thresholds ("Tier 4: ≥5 realistic application scenarios").
  - The 4 existing scenarios:
    1. Setup profile, create custom categories, assign to recurring task (F1, F2, F4, F7).
    2. Connect Google Calendar, view event in Week view, add category (F2, F5, F6).
    3. Accept AI suggestion, creates categorized recurring task, view in Schedule view (F1, F2, F6, F7, F8).
    4. Navigate settings, update profile photo, disconnect Google Calendar (F3, F4, F5).
- Read `c:\src\projects\Calorie Life\.agents\e2e_testing_orch\SCOPE.md`:
  - Reinforces requirement: "Implement >=5 complex real-world workflows interacting with multiple features."
  - Notes tests will use Playwright.

## Logic Chain
1. We must define the exact file structure and test case titles for Tier 4 tests.
2. The target directory should follow `TEST_INFRA.md`, specifically `e2e/tests/tier4-workload/`.
3. The first four scenarios are already defined in `TEST_INFRA.md` and successfully combine various features. We will map them to individual `.spec.ts` files.
4. Since `SCOPE.md` and `TEST_INFRA.md` require at least 5 workflows, we must create a 5th workflow that combines features realistically.
5. A suitable 5th workflow is a "Comprehensive Daily Review": editing a category (F1), verifying its color update across all 5 calendar views (F6), modifying a recurring task (F7), and rejecting an AI suggestion (F8).
6. With these 5 workflows, all 8 features (F1-F8) are thoroughly exercised in real-world contexts.

## Caveats
- No code is implemented in this phase, as per constraints.
- File paths assume standard Playwright configuration with the root directory set up for E2E tests in the `e2e/` folder.

## Conclusion
The Tier 4 test plan will consist of 5 workflows structured under `e2e/tests/tier4-workload/`. 

**Proposed File Structure and Test Case Titles:**

* `e2e/tests/tier4-workload/01-setup-profile-and-task.spec.ts`
  * **Test Title:** `Workflow 1: Setup profile, create custom categories, and assign them to a recurring task`
  * **Features Exercised:** F1, F2, F4, F7
* `e2e/tests/tier4-workload/02-calendar-sync-and-categorize.spec.ts`
  * **Test Title:** `Workflow 2: Connect Google Calendar, view an event in the Week view, and add a category to it`
  * **Features Exercised:** F2, F5, F6
* `e2e/tests/tier4-workload/03-ai-suggestion-to-schedule.spec.ts`
  * **Test Title:** `Workflow 3: Receive an AI suggestion, accept it, which creates a categorized recurring task, and view it in Schedule view`
  * **Features Exercised:** F1, F2, F6, F7, F8
* `e2e/tests/tier4-workload/04-settings-and-disconnect.spec.ts`
  * **Test Title:** `Workflow 4: Navigate through all settings routes, updating profile photo, and disconnecting Google Calendar`
  * **Features Exercised:** F3, F4, F5
* `e2e/tests/tier4-workload/05-daily-review-and-updates.spec.ts`
  * **Test Title:** `Workflow 5: Edit category, verify updates in 5-Views UI, modify recurring task, and reject an AI suggestion`
  * **Features Exercised:** F1, F6, F7, F8

## Verification Method
To independently verify this plan:
1. Ensure `e2e/tests/tier4-workload/` is created when implementing.
2. Review the implemented `.spec.ts` files to confirm they correspond to these 5 test titles.
3. Validate each test invokes the identified features (F1-F8).
4. Run `npm run test:e2e` after implementation to ensure the workflows execute successfully and provide realistic end-to-end coverage.
