# Synthesized Strategy: Milestone 4

## Consensus Findings
1. **Recurring Tasks Logic:**
   - **Current State:** Incorrectly uses a separate `cl_recurringTasks` collection with virtual schedule blocks.
   - **Action:** Refactor `src/components/tasks/TasksView.jsx` and `src/lib/recurrence.js` to use a `recurrence: { type, interval, until, ... }` object on `cl_personalTasks` documents. Implement instance override logic (editing "only this" vs "all following occurrences" which may require creating detached standalone task documents or rewriting future instances).
2. **AI Manager Cloud Function:**
   - **Current State:** The `aiManager` function in `functions/index.js` lacks the required timezone and returns hardcoded text.
   - **Action:** Add `timeZone: "Asia/Jerusalem"` to the schedule (`0 7,21 * * *`). Implement dynamic contextual suggestion generation via LLM (e.g., using Gemini/Vertex API or simulated context).
3. **AI Suggestions UI:**
   - **Current State:** `firestoreRepo.js` implements `subscribeAiSuggestions` but it is unused.
   - **Action:** Connect `subscribeAiSuggestions` to state management in `src/store/useStore.js`. Render these pending suggestions in `src/components/command-center/CommandCenterView.jsx` with Accept/Reject buttons that mutate the `status` field in the database.

## Output for Worker
The Worker should strictly implement these actions to fulfill the Acceptance Criteria in `ORIGINAL_REQUEST.md`. Ensure to follow "cream v3" pixel-perfect vanilla CSS design constraints. Run build/test steps as a QA check.
