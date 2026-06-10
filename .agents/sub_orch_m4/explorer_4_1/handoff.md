# Handoff Report: Milestone 4.1 - Recurrence Logic

## 1. Observation
- The scope requires implementing recurring tasks logic (generate future instances, edit specific/all) and a UI to manage recurrences and edit exceptions.
- Currently, `src/lib/recurrence.js` provides `recurrenceMatches(rule, date)` and `recurringInstancesForDate(rules, dateStr)`. It handles `skips` and `completions`, but has no `exceptions` logic for editing specific instances' times.
- `src/store/useStore.js` has actions for rules (`addRecurringTask`, `updateRecurringTask`, `deleteRecurringTask`) and placeholders for skipping/completing specific instances (`completeRecurringInstance`, `skipRecurringInstance`).
- `TasksView.jsx` includes a `RecurringTasksSection` that displays a list of recurring task rules and a `RecurringForm` to create/edit the entire rule. It does NOT generate or display future instances, nor does it allow editing specific instances (exceptions).

## 2. Logic Chain
1. To satisfy "generate future instances", we need a helper function in `src/lib/recurrence.js` (e.g., `generateFutureInstances(rule, count)`) that iterates through upcoming dates and returns matches using `recurrenceMatches`.
2. To satisfy "edit specific" (exceptions), the recurring task schema needs an `exceptions` map (e.g., `exceptions: { 'yyyy-MM-dd': { time, durationMinutes } }`). 
3. `src/lib/recurrence.js`'s `recurringInstancesForDate` must be updated to apply overrides from `rule.exceptions[dateStr]`.
4. `src/store/useStore.js` needs a new action `editRecurringInstance(id, dateStr, overrides)` to write to `exceptions.${dateStr}` in Firestore.
5. In `TasksView.jsx`, the expanded view for a recurring rule must display a list of upcoming instances (using `generateFutureInstances`).
6. Each instance in that list should have UI actions to "Skip" (calling `skipRecurringInstance`) or "Edit" (opening a form to call `editRecurringInstance`). "Edit all" is already handled by the existing edit button for the rule.

## 3. Caveats
- `recurringInstancesForDate` skips completed tasks. This means completed recurring tasks will disappear from the AI schedule instead of showing as "done". If this is unintended, the logic should be changed, but that is out of scope for the recurrence UI task itself.
- Ensure time-zone/date-boundary logic aligns with `parseLocalDate` and `toDateKey` from `recurrence.js`.

## 4. Conclusion
The foundation for recurring rules exists, but specific instance management is missing. The Worker must:
1. Add `generateFutureInstances` to `recurrence.js`.
2. Update `recurringInstancesForDate` in `recurrence.js` to merge data from `rule.exceptions`.
3. Add `editRecurringInstance` to `useStore.js`.
4. Update `TasksView.jsx` (`RecurringTasksSection`) to render a sub-list of upcoming instances for each rule, with "Skip" and "Edit specific instance" buttons.

## 5. Verification Method
- **Commands**: Run the UI locally using the project dev command.
- **Inspect**: Open Tasks View > Recurring Tasks.
- **Actions**:
  1. Expand a recurring task and verify that the next `N` instances are listed with correct dates.
  2. Click "Skip" on an instance and verify it disappears from the future instances list (and writes to `skips` in Firestore).
  3. Click "Edit" on an instance, change its time, and verify the time updates only for that date.
  4. Ensure `cl_recurringTasks` in Firestore reflects the `skips` and `exceptions` changes.
