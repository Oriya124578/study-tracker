# Handoff Report: Milestone 4 Strategy

## Observation
1. **Recurring Tasks**:
   - `SCOPE.md` and `ORIGINAL_REQUEST.md` require extending `cl_personalTasks` with a `recurrence` field and automatically creating future instances (with "only this" / "all following" edit capabilities).
   - Currently, there is an out-of-band "Phase 6d" implementation using `cl_recurringTasks` and pure functions in `src/lib/recurrence.js` that generates virtual blocks in the `cl_schedule`, but does not materialize actual `cl_personalTasks` documents.
   - `src/components/tasks/TasksView.jsx` implements the UI for `cl_recurringTasks`, including exceptions (skips/edits) but without creating standalone task documents.
2. **AI Manager Cloud Function**:
   - `functions/index.js` contains an `aiManager` CRON job: `exports.aiManager = onSchedule("0 7,21 * * *", ...)` that successfully generates `cl_aiSuggestions` documents.
   - However, it runs in the default UTC timezone, missing the requirement to run at 7:00 & 21:00 global/Israel time.
3. **AI Suggestions UI**:
   - `src/lib/firestoreRepo.js` has a `subscribeAiSuggestions` function.
   - `subscribeAiSuggestions` is not hooked up in `src/store/useStore.js`.
   - `src/components/settings/SettingsView.jsx` (under `settings/manager`) lacks the UI to display pending suggestions and accept/reject them.

## Logic Chain
- To fulfill the **Recurrence** Acceptance Criteria ("generates a future instance... based on the recurrence object"), we must implement a mechanism that actually materializes `cl_personalTasks` documents. The existing virtual-block approach (`cl_recurringTasks`) does not fully meet the requirement of `cl_personalTasks` extension and instance generation.
- To fulfill the **AI Manager Cloud Function** requirements, the existing placeholder needs a timezone configuration (`timeZone: "Asia/Jerusalem"`) to ensure the CRON runs at the correct global time.
- To fulfill the **AI Suggestions UI** requirements, we must connect the existing `subscribeAiSuggestions` to the Zustand store, then render a list of pending suggestions with Accept/Reject buttons inside the `SettingsView.jsx` Manager tab.

## Caveats
- The current codebase has an advanced `cl_recurringTasks` feature built-in (labeled as Phase 6d). The implementer will need to decide whether to migrate `cl_recurringTasks` into `cl_personalTasks.recurrence` (as strictly requested in Phase 3 Scope), or to adapt the existing `cl_recurringTasks` engine to materialize real task instances instead of virtual schedule blocks.
- The Cloud Function currently hardcodes a generic suggestion. If actual AI generation is expected on the server, a Gemini API key needs to be provided to the backend, or the deterministic suggestion is considered sufficient for this milestone's architectural verification.

## Conclusion
**Implementation Strategy:**
1. **Recurrence Logic**: Update the client to support `recurrence` on `cl_personalTasks`. Add logic (either a Cloud Function CRON or client-side generation) to materialize upcoming recurring tasks into actual `cl_personalTasks` documents with a `parentTaskId` reference to support specific/all editing.
2. **AI Manager CRON**: Update `functions/index.js` -> `aiManager` to include `timeZone: "Asia/Jerusalem"` in the `onSchedule` config. 
3. **AI Suggestions UI**: In `src/store/useStore.js`, implement `subscribeAiSuggestions` and action methods `acceptAiSuggestion` / `rejectAiSuggestion`. In `src/components/settings/SettingsView.jsx` (`activeCategory === 'settings/manager'`), add a "Pending Suggestions" UI section that lists the AI suggestions and allows the user to accept or reject them.

## Verification Method
- **Recurrence**: Create a task with a recurrence rule via the UI. Verify in Firestore/UI that separate `cl_personalTasks` instances are generated for future dates.
- **AI Manager**: Run the Firebase emulator (`npm run serve` in functions). Manually trigger the pubsub CRON or inspect the generated schedule to verify timezone configuration. Check Firestore for generated `cl_aiSuggestions` docs.
- **AI Suggestions UI**: Open the app, navigate to Settings > Manager. Verify that `pending` suggestions appear and can be accepted/rejected, updating their status in Firestore.
