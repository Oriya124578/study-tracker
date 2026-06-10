# Handoff Report: Milestone 3.2.1 - Segmented Control & Layout

## Observation
- `src/components/calendar/CalendarView.jsx` is the main entry point for the Calendar layout.
- The component currently manages state for `viewMode` ('month', 'list', 'day', '3days', 'week').
- View selection is currently handled via a dropdown menu (`isViewMenuOpen`).
- The current 'day', '3days', and 'week' layouts render generic columns instead of the time-rail timeline specified in the design (`cream-02a-day.html` and `cream-02c-week.html`).
- The 'month' layout uses a dense list of text labels instead of the colorful dots design from `cream-02d-month.html`.
- The 'list' (schedule) view uses a generic list instead of the agenda styling from `cream-02e-schedule.html`.
- Data is aggregated into `allItems` using `useStore()`. The prompt requests to "Implement mock data fetching", which suggests we should simulate a loading state and inject dummy data if the real data is empty, or structure the data fetching logic to simulate an API call before rendering.

## Logic Chain
1. **Segmented Control**: 
   - Remove `isViewMenuOpen` state and the dropdown UI in `CalendarView.jsx`.
   - Implement a horizontal Segmented Control (`<div className="flex bg-[#F5F0E8] rounded-xl p-[3px] mb-3">...</div>`) just below the top header, with tabs: "יום", "3 ימים", "שבוע", "חודש", "לוח זמנים".
   - The active tab should receive styling similar to `bg-white text-foreground shadow-sm italic font-serif`.

2. **Day / 3 Days / Week Views**:
   - Add a `day-strip` or `week-strip` below the Segmented Control showing the days of the current selection.
   - Implement the Time Rail timeline (`06:00` to `23:00`). Each hour slot should have a fixed height (e.g., `60px`).
   - Create a helper to map an item's start time to an absolute `top` value (`(hours - 6) * 60 + minutes`).
   - Map `allItems` (and mock items) to absolutely positioned blocks (`.evt`) inside the timeline columns.
   - Render the red `.now-line` absolute element if the current day is being viewed.

3. **Month View**:
   - Refactor `renderMonthGrid` to match the grid layout of `cream-02d-month.html`.
   - Replace the text labels inside the day cells with small colorful dots (`.c-dots`) representing events.
   - Add the Legend section below the grid.

4. **Schedule View (List)**:
   - Refactor `renderList` to follow the Agenda pattern (`cream-02e-schedule.html`).
   - Group items by day, rendering a `.day-row` header for each group.
   - Render items using the `.item` card styling with `.item-time` and `.item-body`.

5. **Mock Data Fetching**:
   - Add an `isLoading` state and a `useEffect` in `CalendarView.jsx`.
   - Simulate a network delay (e.g., `setTimeout` for 500ms).
   - If `allItems` from the store is empty, provide a fallback array of mock events (e.g., "משקה חלבון", "הרצאה אינפי 2", etc.) matching the design's data.

## Caveats
- Handling events without explicit times (`allDay`): They should be rendered at the top of the day column (or stacked) before the 06:00 rail begins.
- Fonts: The design relies on 'Fraunces' and 'Instrument Serif'. The worker should use existing Tailwind font classes (`font-serif`, `italic`, `font-bold`) to best approximate the typography if the custom fonts are not fully integrated into Tailwind.
- Event Duration: If an event does not have an `endDate` or duration, assign a default height (e.g., 40px or 60px) so it renders correctly on the time rail.

## Conclusion
The Worker should modify `src/components/calendar/CalendarView.jsx` to replace the View Dropdown with a custom Segmented Control, implement the Time Rail layout for day/week views using absolute positioning, update the Month and Schedule layouts to match the new Bento/Cream design specifications, and integrate a simulated mock data fetch with dummy data.

## Verification Method
1. Open the application and navigate to the Calendar tab.
2. Verify that the Segmented Control is visible and instantly switches between views when clicked.
3. Verify that a loading state is briefly shown (mock fetching) and mock data appears.
4. Verify the 'Day' and 'Week' views display a vertical time rail with events positioned absolutely.
5. Verify the 'Month' view displays colorful dots inside the day cells.
6. Verify the 'Schedule' view displays the grouped agenda list.
