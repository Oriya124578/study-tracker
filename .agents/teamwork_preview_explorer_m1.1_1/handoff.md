# Handoff Report: Milestone 1.1 Data Model & Initialization

## Observation
1. **Firestore Repository (`src/lib/firestoreRepo.js`)**: Defines all data access methods and path helpers (e.g., `eventsCol`, `personalTasksCol`). Currently lacks any definitions for `cl_categories`.
2. **Initialization Flow (`src/store/useStore.js`)**: Default records for new users (e.g., `taskLists` and `noteCategories`) are created inside the `initFromAuth` function. When the snapshot listener (e.g., `subscribeTaskLists`) returns an empty array, it triggers `fsSetTaskList` to create the defaults.
3. **Data Models (`src/data.js`)**: `generateInitialState` defines the base client state. `personalTasks` is documented in comments as `{ id, title, dueDate, dueTime, done, doneAt, priority, list, notes, courseId?, subtasks[] }` (line 89).
4. **Task Creation (`src/store/useStore.js`)**: `addPersonalTask` (line 1034) handles task creation and already includes `courseId: input.courseId || null`, but does not mention `categoryIds`.

## Logic Chain
1. **Create `cl_categories` definitions**: We must add path helpers (`categoriesCol`, `categoryDoc`), CRUD methods (`subscribeCategories`, `setCategory`, `deleteCategory`), and update `newId` to support `kind === 'category'` in `src/lib/firestoreRepo.js`.
2. **Default category creation logic**: Using the existing pattern, we should add `unsubCategories = subscribeCategories(...)` to `initFromAuth` in `src/store/useStore.js`. If the fetched array is empty, we instantiate the 3 required categories using `fsSetCategory` with IDs like 'studies', 'work', 'personal' and the specified Hebrew names, colors, and icons.
3. **Update state and types**: `src/data.js` must be updated to include `categories: []` in the initial state and document `categoryIds?: string[]` in the `personalTasks` comment.
4. **Update `cl_personalTasks`**: The `addPersonalTask` function in `src/store/useStore.js` should be modified to accept and save `categoryIds: input.categoryIds || []`. Any update functions (like `updatePersonalTask`) handle arbitrary fields natively via spreading, so they do not require explicit structural changes.

## Caveats
- The UI components (like `AddItemSheet.jsx`) currently do not pass `categoryIds` when calling `addPersonalTask`. This is fine for Milestone 1.1, as the UI integration is scheduled for Milestones 1.2 and 1.3, but it should be noted that the payload will default to an empty array `[]` until the UI is updated.
- No explicit "scope" parameter is specified for default categories in the prompt, though the project brief mentions it. The initialization logic should ideally include `scope: 'global'` or similar if the system uses it.

## Conclusion
The recommended strategy integrates natively with the current Zustand + Firestore architecture:
1. **`src/lib/firestoreRepo.js`**: Add `cl_categories` references and CRUD helpers.
2. **`src/store/useStore.js`**: 
   - Add `subscribeCategories` in `initFromAuth`. 
   - Add default initialization for לימודים, עבודה, אישי if the collection is empty.
   - Update `addPersonalTask` to include `categoryIds: input.categoryIds || []`.
3. **`src/data.js`**: Add `categories: []` to `generateInitialState()` and update the `personalTasks` schema comment.

## Verification Method
1. **Code Review**: Ensure `src/lib/firestoreRepo.js` contains `categoriesCol`, `categoryDoc`, `subscribeCategories`, and `setCategory`.
2. **Runtime Initialization**: Log in as a new user. Inspect the Redux/Zustand store or Firestore console to verify `cl_categories` is populated with the 3 default categories.
3. **Data Model**: Programmatically call `useStore.getState().addPersonalTask({ title: "Test", categoryIds: ["work"] })` and verify the document created in `users/{uid}/cl_personalTasks` contains `categoryIds: ["work"]`.
