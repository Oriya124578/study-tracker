# Handoff: Milestone 1.2 - Category UI Components

## 1. Observation
- The project scope (`SCOPE.md`) requires the creation of Category management UI (add/edit/delete) and a Category selection modal.
- `PROJECT.md` dictates that the React UI must use vanilla CSS or CSS Modules to exactly match the `design-briefs/cream-INDEX.html` designs (avoiding Tailwind for these new matching components).
- Existing React components are located under `src/components/`. There is no `src/components/categories` directory yet. `AddItemSheet.jsx` currently uses Tailwind CSS and a native `<select>` element for categories.
- The design briefs `cream-08-notes.html` and `cream-07-tasks.html` define the Category Chips layout:
  - `.cats-row` (horizontal scrollable flex container)
  - `.cat-c` (individual chip), with `.active` state and `.dot` colors (`.dot.r`, `.dot.b`, etc.)
  - `.cat-c.add` (the dashed "+ קטגוריה" button)
- The design brief `cream-03a-add-event.html` defines the layout for bottom-sheet modals and color selection:
  - `.bg-dim`, `.sheet`, `.s-header`, `.s-title`, `.s-body`, `.s-save`, `.s-cancel` (Bottom sheet structure)
  - `.title-input` (Bottom-bordered large text input)
  - `.color-row`, `.colors`, `.c-dot`, `.c-dot.active` (Color selector)

## 2. Logic Chain
1. Since the design requires pixel-perfect adherence using Vanilla CSS, we must extract the raw CSS from the `cream-*.html` files into a dedicated CSS Module.
2. The UI functionality is logically divided into three parts: displaying selected/available categories (Chips), selecting multiple categories for an item (Select Modal), and creating/editing a category's properties (Management UI).
3. We should centralize these components in a new directory: `src/components/categories/`.
4. The **Category Management UI** can reuse the bottom-sheet structure and `.title-input` / `.color-row` from `cream-03a-add-event.html` to allow users to input a category name and select a color dot.
5. The **Category Selection Modal** can also use the bottom-sheet structure, displaying the existing categories as selectable rows or chips, and containing a button to open the Management UI.
6. The **Category Chips** will just be a reusable component implementing the `.cats-row` and `.cat-c` CSS from `cream-08-notes.html`.

## 3. Caveats
- The existing `AddItemSheet.jsx` and other components use Tailwind CSS. Migrating them entirely to Vanilla CSS might be out of scope for Milestone 1.2 alone, but the *new* Category components must strictly use the CSS Modules.
- Integration (Milestone 1.3) will eventually replace the native `<select>` dropdown in `AddItemSheet.jsx` with these new components.
- The design briefs do not explicitly contain a standalone "Category Management UI" screen. However, `cream-03a-add-event.html` provides all necessary UI primitives (bottom sheet, text input, color selector) to synthesize one that matches the design language perfectly.

## 4. Conclusion & Recommended Fix Strategy
Create a new folder `src/components/categories/` with the following files:

1. **`CategoryStyles.module.css`**: Extract the vanilla CSS rules from `cream-03a-add-event.html` and `cream-08-notes.html` (e.g., `.cats-row`, `.cat-c`, `.dot`, `.sheet`, `.s-header`, `.title-input`, `.color-row`, `.c-dot`).
2. **`CategoryChips.jsx`**: A reusable component rendering the horizontal list of category chips (`.cats-row`). It takes categories, selected state, and an `onAddClick` callback.
3. **`CategorySelectModal.jsx`**: A bottom-sheet modal (`.sheet`, `.bg-dim`) that lists user categories for selection (toggling active state), and an "Edit/Add New" button to open the Manager.
4. **`CategoryManagerUI.jsx`**: A bottom-sheet modal (`.sheet`) for Add/Edit/Delete actions. It includes:
   - Name input using `.title-input`.
   - Color picker using `.color-row` and `.c-dot`.
   - Save button (`.s-save`) and Cancel button (`.s-cancel`).
   - A delete action (can be a standard `.fld-row` or textual button at the bottom).

## 5. Verification Method
- Inspect the newly created `.jsx` and `.module.css` files to ensure no Tailwind classes are used for the category-specific UI.
- Verify the CSS class names match the design brief exactly (e.g., `styles['cats-row']`, `styles['cat-c']`).
- Temporarily render `<CategoryChips />`, `<CategorySelectModal />`, and `<CategoryManagerUI />` in `App.jsx` or `Home.jsx` to visually compare against `cream-03a-add-event.html` and `cream-08-notes.html`.
