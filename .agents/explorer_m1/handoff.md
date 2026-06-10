# Handoff Report: Milestone 1 - Category System & Data

## Observation
- `src/lib/firestoreRepo.js` **already contains** fully defined logic for `cl_categories` (lines 272-283). It exposes `subscribeCategories`, `setCategory`, and `deleteCategory`.
- `src/store/useStore.js` **already handles** initialization of default categories (lines 324-334). If `cl_categories` is empty, it adds "studies", "work", and "personal" with default colors and icons.
- `src/store/useStore.js` **already supports** `categoryIds` and `courseId` for `cl_personalTasks` in `addPersonalTask` (lines 1072-1073).
- `addEvent` in `src/store/useStore.js` (lines 1020-1036) **does not** yet include `categoryIds`.
- UI for category management does not exist in `src/components/settings/SettingsView.jsx`.
- `src/components/add-item/AddItemSheet.jsx` does not have a UI for selecting `categoryIds` for tasks or events.

## Logic Chain
1. Since `firestoreRepo.js` and `useStore.js` already implement most of the Category data layer, we don't need to write new data layer logic for Categories.
2. We only need to patch `addEvent` and `updateEvent` in `useStore.js` to accept `categoryIds`, so events can have categories as defined in the scope.
3. We need to build a new `CategoryManager.jsx` component for the Settings page, allowing users to add/edit/delete their categories. This must be integrated into `SettingsView.jsx` (e.g., under the "Preferences" or "Content" group).
4. We need to implement a UI for selecting multiple categories when creating Tasks and Events in `AddItemSheet.jsx`. A `CategorySelectModal` (or inline chip selector) should be added.

## Detailed Implementation Plan

**Step 1: Data Model Updates (`src/store/useStore.js`)**
- Find `addEvent` (approx line 1020). Add `categoryIds: input.categoryIds || []` to the event object.
- Find `updateEvent` (approx line 1041). Ensure it merges `categoryIds` if provided.

**Step 2: Category Management UI (`src/components/settings/CategoryManager.jsx` & `SettingsView.jsx`)**
- **Create** `src/components/settings/CategoryManager.jsx`:
  - Use `useStore(state => state.data.categories)` to list categories.
  - Render a list of categories using Vanilla CSS/Tailwind similar to `SettingsView` cards. Each row shows the category `icon`, `name`, and `color` badge.
  - Include an "Add Category" button.
  - Implement a small modal/drawer for creating or editing a category with fields: Name, Color (e.g. hex picker or predefined colors like `bg-red-500`, `bg-blue-500`), and Icon (using lucide-react icons).
  - Use `fsSetCategory` to save and `fsDeleteCategory` to delete.
- **Update** `src/components/settings/SettingsView.jsx`:
  - Add `{ id: 'settings/categories', icon: <Tag className="w-5 h-5 text-indigo-700" />, title: t('categoriesTitle', 'קטגוריות'), sub: 'ניהול תגיות וצבעים' }` to the `groups` array (e.g., under 'preferences').
  - Add conditional rendering `activeCategory === 'settings/categories'` to show the `CategoryManager` component.
  - Make sure to import `Tag` from `lucide-react`.

**Step 3: Add Item Integration (`src/components/add-item/AddItemSheet.jsx`)**
- Add state: `const [categoryIds, setCategoryIds] = useState(addSheetPrefill?.categoryIds || []);`
- In `useEffect` for `showAddSheet`, reset `categoryIds` to `addSheetPrefill?.categoryIds || []`.
- In `handleSubmit`, pass `categoryIds` to `addEvent` and `addPersonalTask`.
- Render a new `FormRow` (for Tasks and Events) with a Tag icon, labeled "Categories" (קטגוריות).
- Inside this row, render chips for currently selected categories.
- Create a `CategorySelectModal` (inline or separate file) that lists all available `data.categories` with checkboxes/toggles. Clicking the "Add Category" chip in the row opens this modal.

## Caveats
- `courseId` is already optional for tasks and events, but it is implemented using `|| null`. This is sufficient.
- The `CategoryManager` component needs to support choosing `color` and `icon`. A simple predefined palette/icon list is recommended to match `cream-11-settings.html` style.

## Conclusion
The data layer for Milestone 1 is 90% complete. The implementation plan focuses on minor store updates, creating the CategoryManager UI in settings, and adding category selection to the AddItemSheet.

## Verification Method
1. Run `npm start` (or project run command) and navigate to Settings -> Categories. Ensure the default categories (studies, work, personal) exist and you can add/edit/delete them.
2. Open the "Add Item" bottom sheet. Select Task or Event. Verify you can select multiple categories via the new chip UI.
3. Create a Task/Event with categories and a course. Verify in Firebase Console (or Redux/Zustand devtools) that `categoryIds` (array) and `courseId` (string) are correctly saved on the created document.
