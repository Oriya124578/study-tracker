# Handoff: Tier 3 Cross-Feature Interactions Test Plan

## 1. Observation
- `TEST_INFRA.md` outlines 8 major features for Calorie Life: (F1) Category Management, (F2) Assign Categories, (F3) Navigation & Settings, (F4) Profile Photo Sync, (F5) Google Calendar, (F6) Calendar Views, (F7) Recurring Tasks, and (F8) AI Suggestions.
- `SCOPE.md` and `TEST_INFRA.md` specify that Tier 3 tests should target pairwise coverage of major feature interactions.
- The test suite runs via Playwright, and Tier 3 files should be placed under `e2e/tests/tier3-pairwise/`.
- The user requested exact test case titles and file structure for at least 8 robust test cases.

## 2. Logic Chain
To achieve meaningful pairwise coverage without exhaustively testing all 28 possible pairs (which would be overkill), I mapped the most logical and high-impact feature interactions that reflect realistic usage. 

The selected feature pairings guarantee that every single feature (F1-F8) is tested in combination with at least one other feature, with complex features (Calendar, Recurring Tasks, Categories) interacting multiple times:
1. **F1 + F7**: Updating/deleting a category affects all instances of a recurring task.
2. **F2 + F5 + F6**: Categorizing an imported Google Calendar event and checking its rendering across multiple views.
3. **F7 + F8**: Accepting an AI suggestion that creates a recurring sequence.
4. **F3 + F5**: Toggling Google Calendar connection within the settings routes and observing immediate UI updates.
5. **F6 + F7**: Verifying the complex logic of expanding recurring tasks across Day, Week, Month, Schedule, and Agenda views.
6. **F4 + F3**: Ensuring the synced profile photo persists seamlessly across SPA navigation.
7. **F1 + F8**: Applying custom categories to dynamically generated AI tasks.
8. **F5 + F7**: Validating the visual overlap of imported Google Calendar events with internal Recurring Tasks.

## 3. Caveats
- "Pairwise coverage" in software testing can sometimes mean generating the full orthogonal array of all possible state combinations. Given the prompt, I scoped this to 8 high-value interaction pairs.
- Tests are not implemented; this is strictly the architectural plan and specification. 
- Assumes the UI supports assigning categories to external Google Calendar events (if read-only, the test logic would pivot to ensuring they *cannot* be categorized, which is still a valid F2+F5 interaction test).

## 4. Conclusion
Below is the proposed file structure and test case definitions for Tier 3. All files reside in `e2e/tests/tier3-pairwise/`.

### File Structure & Test Cases

1. **`category-recurring.spec.ts`** (F1 + F7)
   - *Test Case*: `Edit and Delete Category Assigned to a Recurring Task`
   - *Description*: Create a category and assign it to a recurring task. Modify the category color/name, verifying future instances update. Delete the category, verifying recurring instances handle the deleted reference gracefully.

2. **`gcal-category-views.spec.ts`** (F2 + F5 + F6)
   - *Test Case*: `Assign Categories to Google Calendar Events across Views`
   - *Description*: Sync a Google Calendar event. Assign a custom category to it. Switch between Month, Week, and Day views to ensure the event retains the category label and correct color coding.

3. **`ai-recurring.spec.ts`** (F7 + F8)
   - *Test Case*: `Accept AI Suggestion for a Recurring Task`
   - *Description*: Trigger an AI suggestion that recommends a recurring habit. Accept it, and verify the correct recurring sequence is generated in the calendar.

4. **`settings-gcal.spec.ts`** (F3 + F5)
   - *Test Case*: `Disconnect Google Calendar from Settings clears Events`
   - *Description*: Connect GCal and verify events populate. Navigate to settings, disconnect GCal, and verify events immediately disappear from the dashboard views without requiring a page reload.

5. **`views-recurring.spec.ts`** (F6 + F7)
   - *Test Case*: `Verify Recurring Tasks across all 5 Calendar Views`
   - *Description*: Create a daily and a weekly recurring task. Validate their presence and correct rendering in Day, Week, Month, Schedule, and Agenda views.

6. **`profile-navigation.spec.ts`** (F4 + F3)
   - *Test Case*: `Persistent Profile Photo Sync across Routes`
   - *Description*: Sync profile photo. Navigate rapidly through all 8 settings routes and main application views. Ensure the avatar component reliably displays the synced photo without flickering or reverting to default.

7. **`category-ai.spec.ts`** (F1 + F8)
   - *Test Case*: `Categorize Accepted AI Suggestions`
   - *Description*: Receive AI suggestions. Accept them. Immediately assign custom categories to the newly created tasks. Verify the categories persist after reloading.

8. **`gcal-recurring.spec.ts`** (F5 + F7)
   - *Test Case*: `Overlap Handling of GCal Events and Recurring Tasks`
   - *Description*: Create a recurring task overlapping with a known Google Calendar synced event. Verify the UI handles the visual overlap gracefully in Day and Week views without layout breaking.

## 5. Verification Method
- **Coverage Check**: Review the 8 proposed test cases against the 8 features listed in `TEST_INFRA.md` to ensure all features are represented in cross-interactions.
- **Path Validation**: Verify the planned test paths all correctly map under the `e2e/tests/tier3-pairwise/` directory.
