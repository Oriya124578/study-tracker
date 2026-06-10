# Handoff: Tier 2 Boundary & Corner Cases Test Plan

## 1. Observation
- `TEST_INFRA.md` specifies 8 features: Category Management (CRUD), Assign Categories to Tasks, Navigation & 8 Settings Routes, Profile Photo Sync, Google Calendar Integration, Calendar 5-Views UI, Recurring Tasks, AI Suggestions (Accept/Reject).
- `TEST_INFRA.md` sets the coverage threshold for Tier 2 to "≥5 per feature (where boundaries exist)".
- `SCOPE.md` explicitly states "Implement 5+ boundary/edge-case tests for each of the 8 features" under the Tier 2 milestone.
- The test directory layout specified in `TEST_INFRA.md` is `e2e/tests/tier2-boundary/`.

## 2. Logic Chain
- To meet the scope requirement, I must design 5 distinct boundary/corner-case tests for each of the 8 features (totaling 40 test cases).
- Boundary and corner cases target typical software failure points: empty strings, null values, excessive length, maximum capacity limits, duplicate entries, timeouts, unsupported formats, extreme concurrency (race conditions), and invalid data types.
- To organize these tests in the project layout, I mapped the cases into 8 individual `*.spec.ts` files under `e2e/tests/tier2-boundary/`, dedicating one file per feature for maintainability.

## 3. Caveats
- Exact technical limits (e.g., maximum string length of 255 chars, max file size of 10MB) are used as examples for test design because specific implementation constraints were not defined in the provided docs.
- Security-related edge cases (like malicious HTML input in AI suggestions) assume the frontend needs robust parsing and sanitization.
- Network edge cases (timeouts, rate limits, offline mode) are included as standard boundary scenarios for integrated features (Google Calendar, Photo Sync).

## 4. Conclusion
The Tier 2 test plan is fully designed, consisting of 40 specific test cases targeting boundary and corner scenarios. 

### Proposed File Structure
- `e2e/tests/tier2-boundary/category-management.spec.ts`
- `e2e/tests/tier2-boundary/category-assignment.spec.ts`
- `e2e/tests/tier2-boundary/navigation-settings.spec.ts`
- `e2e/tests/tier2-boundary/profile-photo.spec.ts`
- `e2e/tests/tier2-boundary/google-calendar.spec.ts`
- `e2e/tests/tier2-boundary/calendar-views.spec.ts`
- `e2e/tests/tier2-boundary/recurring-tasks.spec.ts`
- `e2e/tests/tier2-boundary/ai-suggestions.spec.ts`

### Proposed Test Cases

**1. Category Management (CRUD)**
- `should reject category creation with empty name`
- `should reject category creation with name exceeding maximum length (e.g., 255 chars)`
- `should handle creating a category with special characters and emojis`
- `should reject creating a duplicate category name`
- `should handle rapid consecutive category deletions (prevent double-delete race condition)`

**2. Assign Categories to Tasks**
- `should handle assigning the maximum allowed number of categories to a single task`
- `should correctly handle deleting a category that is currently assigned to a task`
- `should reject assigning a non-existent category to a task`
- `should handle unassigning the last category from a task (empty category state)`
- `should prevent assigning the same category to a task multiple times`

**3. Navigation & 8 Settings Routes**
- `should handle rapid switching between all 8 settings routes continuously`
- `should maintain settings form state when navigating away and immediately back`
- `should handle deep-linking directly to a non-existent settings route (404/redirect)`
- `should gracefully handle network interruption while saving settings`
- `should correctly render very long text inputs in settings fields without breaking layout`

**4. Profile Photo Sync**
- `should reject uploading a profile photo exceeding the maximum file size limit (e.g., > 10MB)`
- `should reject uploading an unsupported file format (e.g., .txt, .pdf) for profile photo`
- `should handle uploading an extremely high-resolution image (e.g., 8K)`
- `should correctly handle profile photo sync when the user is offline`
- `should handle clearing the profile photo and reverting to the default avatar`

**5. Google Calendar Integration**
- `should gracefully handle Google Calendar authentication timeout or rejection`
- `should correctly handle syncing an event with an extremely long title and description`
- `should handle rate limits (429 Too Many Requests) gracefully during mass sync`
- `should handle syncing a calendar with zero events`
- `should handle simultaneous offline creation of events and conflicting Google Calendar sync`

**6. Calendar 5-Views UI**
- `should render correctly when a single day has an extreme number of events (e.g., >50)`
- `should correctly display multi-day events that span across months and leap years`
- `should handle switching views rapidly while events are still loading`
- `should gracefully handle navigating to an extremely distant future or past date (e.g., year 1900 or 2100)`
- `should correctly render overlapping events that occur at the exact same minute`

**7. Recurring Tasks**
- `should handle creating a recurring task with an end date in the past`
- `should correctly generate instances for a daily recurring task spanning across a leap year/day (Feb 29)`
- `should handle modifying a single instance of a recurring task without breaking the series`
- `should prevent creating a recurring task with zero interval (e.g., every 0 days)`
- `should handle deleting a recurring task series that has thousands of future instances`

**8. AI Suggestions (Accept/Reject)**
- `should gracefully handle AI suggestion API timeout or failure to respond`
- `should handle extremely long AI suggestions that exceed normal UI constraints`
- `should prevent duplicate task creation when rapidly clicking "Accept" multiple times`
- `should handle rejecting all AI suggestions until the queue is empty`
- `should correctly parse and sanitize malicious input or raw HTML returned in AI suggestions`

## 5. Verification Method
- **Implement**: Create the 8 spec files under `e2e/tests/tier2-boundary/` and implement the logic for all 40 tests.
- **Run**: Execute `npm run test:e2e` to trigger Playwright (or the chosen E2E framework).
- **Validate**: Verify that all boundary tests pass, confirming the application behaves safely under extreme or invalid conditions.
