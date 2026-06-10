# Synthesis Plan for Milestone 1

## Overview
The backend data model for `cl_categories` and the update to `cl_personalTasks` (adding `courseId` and `categoryIds`) are already largely implemented in `src/lib/firestoreRepo.js` and `src/store/useStore.js`. The focus of the Worker should be on creating the UI components for Category Management and integrating category selection into task creation and task display.

## Step-by-Step Implementation Plan

### 1. Update `src/components/settings/SettingsView.jsx`
- Add a new "Categories" option under the "Content" group: `{ id: 'settings/categories', icon: <Tags.../>, title: 'קטגוריות תיוג', sub: 'ניהול תגיות וקטגוריות' }`.
- Create a `CategoryManager` view (similar to how `settings/studies` is handled) that lists current `data.categories`.
- Add an Edit/Add modal or sheet to allow users to modify `name`, `color`, and `icon`.
- Connect the UI to `useStore` actions: call `setCategory(uid, id, data)` to save and `deleteCategory(uid, id)` to remove. Ensure it matches Vanilla CSS styling from the `cream-*.html` design briefs.

### 2. Update `src/components/add-item/AddItemSheet.jsx`
- Remove the legacy `list` state.
- Add `const [categoryIds, setCategoryIds] = useState([])`.
- Implement a selectable Category Chips UI for task creation. Users should be able to select multiple categories.
- Update the `handleSubmit` logic so that when `addPersonalTask` is called, it passes the `categoryIds` array instead of `list`. `courseId` is already supported.

### 3. Update Task Display (e.g., `src/components/tasks/TasksView.jsx` or related components)
- Create a reusable `CategoryChips` or `CategoryBadge` component.
- In the task lists, map over the task's `categoryIds` and use `data.categories` to display the corresponding category name and color.
- Ensure grace fallback (e.g., if a task has no `categoryIds` or has legacy `list` data, don't crash).

## Verification
- Run `npm run dev` or `npm run build` and ensure there are no compilation errors.
- Confirm that categories can be created and deleted in Settings.
- Confirm that a category can be assigned to a new task in Add Item.
- Confirm that the assigned category chip appears on the task in the tasks list.
