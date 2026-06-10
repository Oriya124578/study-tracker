# Milestone 4 Implementation Strategy

## 1. Recurring Tasks Logic (Client/Server)

**Goal:** Extend `cl_personalTasks` to support recurrence (daily, weekly, monthly) and allow generating future instances automatically, with the ability to edit a specific instance or all following instances.

### Strategy:
- **Data Model:** Update `cl_personalTasks` schema to include the `recurrence` field:
  ```javascript
  recurrence: {
    type: 'daily' | 'weekly' | 'monthly',
    interval: number,
    until: string | null, // 'YYYY-MM-DD'
    byWeekday: number[] | null,
    byMonthday: number[] | null,
    exceptions: { [dateStr: string]: { /* specific overrides */ } }
  }
  ```
  *(Note: Currently `src/lib/recurrence.js` and `TasksView.jsx` use a separate `cl_recurringTasks` collection. This should be refactored to merge into `cl_personalTasks` as per `SCOPE.md`.)*

- **Client Logic (`src/lib/recurrence.js` & `useStore.js`):**
  - Refactor `recurrenceMatches`, `generateFutureInstances`, and `recurringInstancesForDate` to operate on `cl_personalTasks` objects that have the `recurrence` property.
  - Add functions to handle editing "only this one" (which creates an entry in `exceptions` for that date) vs "all following" (which splits the task: caps the old task's `until` date to yesterday, and creates a new `cl_personalTasks` starting today).

- **UI (`src/components/tasks/TasksView.jsx`):**
  - Remove the standalone `RecurringTasksSection` that uses `cl_recurringTasks`.
  - Add recurrence configuration inside the standard Add/Edit task flow (or inline when expanding a `TaskRow`).
  - When displaying upcoming instances or editing them, show a prompt asking: "Edit this instance only, or all following?".

## 2. AI Manager Cloud Function (CRON)

**Goal:** A Cloud Function running daily at 07:00 and 21:00 global time (Israel Time) to generate contextual `cl_aiSuggestions`.

### Strategy:
- **Location:** Modify `functions/index.js` (and potentially break out into `functions/src/aiManager.js`).
- **Scheduling:** Configure the function using `firebase-functions/v2/scheduler`:
  ```javascript
  exports.aiManager = onSchedule({ schedule: '0 7,21 * * *', timeZone: 'Asia/Jerusalem' }, async (event) => { ... });
  ```
- **Execution Logic:**
  - Iterate through active users in Firestore (`users/{uid}`).
  - Fetch recent data context: `cl_personalTasks`, `cl_events`, and `cl_dailyAnalytics` (for the current/next day).
  - Use Gemini (or heuristic logic if prompt limits apply) to generate actionable suggestions based on their schedule (e.g., "You have uncompleted high priority tasks, should we move them to tomorrow morning?").
  - Save the generated suggestions to the `users/{uid}/cl_aiSuggestions` collection with `status: 'pending'`.

## 3. AI Suggestions UI

**Goal:** Listen for pending `cl_aiSuggestions` and present them to the user for acceptance or rejection.

### Strategy:
- **State Management (`src/store/useStore.js`):**
  - Call `subscribeAiSuggestions(uid, cb)` to populate `data.aiSuggestions` in the global state.
  - Expose an action `resolveAiSuggestion(id, status)` which updates the document status to `accepted` or `rejected`.
  
- **UI Component (`src/components/command-center/CommandCenterView.jsx`):**
  - Add a new "AI Manager Inbox" section at the top of the view (just below the Date/Weather header or as an actionable banner).
  - Map over `data.aiSuggestions` to display cards showing the `context` and `suggestion` text.
  - Provide two primary actions:
    - **Accept (✓):** Calls `resolveAiSuggestion(id, 'accepted')` and, if applicable, triggers the relevant store action to apply the suggestion (e.g., moving a task).
    - **Reject (X):** Calls `resolveAiSuggestion(id, 'rejected')` to dismiss the card.
  - Use `framer-motion` for smooth swipe-to-dismiss or collapse animations.
