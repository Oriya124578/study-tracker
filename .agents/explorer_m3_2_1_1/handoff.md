# Handoff Report: Milestone 3.2.1 - Segmented Control & Calendar Layout

## 1. Observation
- The project targets an exact replica of `design-briefs/cream-02-calendar.html` using React and standard CSS/Tailwind.
- Current `CalendarView.jsx` uses a custom top navigation bar with a dropdown menu (`isViewMenuOpen`) to switch between 'day', '3days', 'week', 'month', and 'list'.
- `cream-02-calendar.html` features a unified "Month Hero" header: a large white card with a top gradient border, displaying the Year and italicized Month (`Instrument Serif`), Next/Prev buttons, a 5-item horizontal **Segmented Control** (`יום`, `3 ימים`, `שבוע`, `חודש`, `רשימה`), and the Week Strip (`א`, `ב`, `ג`...) inside the card.
- The `cream-02-calendar.html` day timeline (`tl-row`) uses a specific layout: time (`t-tm`), colored dot and vertical line (`t-dc`), and an offset card with background matching the item type (`t-c`). The current React code maps items into a generic `CalendarItem` card without the timeline UI.
- `index.css` lacks imports for `Instrument Serif` and `Fraunces`, which are crucial for the "Cream" aesthetic.

## 2. Logic Chain
1. To match the design precisely, `Instrument Serif` and `Fraunces` must be added to the global stylesheet or via inline styles for specific text nodes.
2. The current dropdown toggle must be removed and replaced with a dedicated `month-hero` card at the top of the Calendar component.
3. The Segmented Control needs to be a flex container with 5 toggleable tabs updating the `viewMode` state.
4. The day columns must be refactored to use the vertical timeline design (`tl-row` structure). Events should map to colored dots and specific card backgrounds based on `item.kind`.
5. Since the prompt asks to "Implement mock data fetching", we need to inject specific mock data (e.g., Protein drink, Calculus lecture, Exam) locally in `CalendarView.jsx` when actual `allItems` are empty, ensuring the UI can be showcased without requiring backend integration first.

## 3. Caveats
- Integrating the Week Strip inside the `month-hero` during `month` view mode requires merging it with the top of the month grid.
- Tailoring the custom timeline dots and lines with existing Tailwind classes is preferred over adding vanilla CSS classes to keep the React component self-contained, but inline styles or custom Tailwind extensions may be needed for exact hex codes.

## 4. Conclusion & Step-by-Step Implementation Strategy

**Step 1: Typography Configuration**
- In `src/index.css`, add the font imports at the very top:
  `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');`
- Use these fonts for the Month title, day numbers, and timeline times via inline styles `style={{ fontFamily: '"Instrument Serif", serif' }}`.

**Step 2: Month Hero & Segmented Control**
- In `src/components/calendar/CalendarView.jsx`, delete the top `isViewMenuOpen` dropdown header.
- Create the `month-hero` container spanning full width at the top of the view:
  - Add a pseudo-element or absolute `div` for the top 3px gradient line (`bg-gradient-to-r from-[#065F46] via-[#059669] to-[#047857]`).
  - Add a header row: Year and italicized Month on one side, and `<` `>` navigation buttons on the other.
  - Below it, add the Segmented Control: a flex row with `bg-[#F5F0E8] dark:bg-muted` containing 5 buttons (`יום`, `3 ימים`, `שבוע`, `חודש`, `רשימה`). Set the active button to `bg-white dark:bg-card text-foreground shadow-sm`.
  - Place the `week-strip` container (S, M, T, W...) directly beneath the segmented control when in `day`, `3days`, or `week` view.

**Step 3: Timeline Day View refactor (`renderDayColumn`)**
- Rewrite the `renderDayColumn(day)` function to generate the `tl-row` HTML structure:
  - Container: `flex gap-[10px] mb-2 items-stretch`
  - Time column: `w-[38px] text-start pt-[11px] text-[13px] text-muted-foreground` using `Instrument Serif`.
  - Dot & Line: A vertical flex container with a `9x9px` colored dot and a `1.5px` vertical line expanding to fill the height.
  - Card: `flex-1 rounded-[14px] p-[11px_14px]` with background and text color classes based on the item type (e.g., green for meals/calori, blue for courses, red for exams).
  - Include an "Empty Slot" (`t-c ds`) rendered between gaps if desired, or simply map the items exactly.

**Step 4: Mock Data Fetching**
- Create a `useEffect` or modify the `useMemo` for `allItems` to inject a standard set of mock events if the actual data is empty. 
- The mock data should exactly match `cream-02-calendar.html`:
  - `09:54`: משקה חלבון אייס קפה (398 קק"ל · חלבון 45g) — mapped to Green.
  - `14:00`: הרצאה · אינפי 2 (בניין 9 · חדר 305) — mapped to Blue.
  - `21:00`: ⏰ אינפי 2 · 30 ימים לבחינה (מועד A) — mapped to Red.

## 5. Verification Method
- **Run the app locally:** Execute `npm run dev`.
- **Navigate:** Open the `/` route, click the "Calendar" (`לוח שנה`) tab in the bottom navigation.
- **Inspect UI:** Verify that the top hero section exactly matches the styling of `cream-02-calendar.html` (fonts, gradients, segmented control).
- **Functionality:** Click through `יום`, `3 ימים`, `שבוע`, `חודש` to confirm the segmented control correctly switches views.
- **Timeline:** Verify the mock events render with the precise dot-and-line timeline aesthetic rather than standard boxed cards.
