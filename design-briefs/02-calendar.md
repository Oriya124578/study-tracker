# Prototype Brief — Calendar (CalendarView)

> Paste into a Prototype project. Target 390×844 mobile + 1280 desktop. 5 view modes.

## Goal
See everything (study + personal + calori) on a real calendar, switch fluidly between day/3‑day/week/month/list.

## Layout
1. **Top bar** — title "לוח שנה" + segmented control (Day · 3‑Day · Week · Month · List).
2. **Date navigator** — prev chevron · "היום" pill · next chevron · trailing month label.
3. **Grid area** — view‑specific.
4. **FAB +** — pre‑filled date when opening AddItemSheet.

## View specs

### Day
- Vertical time rail 06:00 → 24:00, 1 hour = 64px.
- Items as colored blocks anchored to start/end time. Multi‑hour blocks show title + meta.
- "Now" indicator — horizontal 1px `danger` line + 8px dot at the leading edge.
- All‑day banner row above the rail.

### 3‑Day
- 3 columns equal width, shared time rail on the leading side.
- Headers show day name + date.
- Today column has subtle green tint background `nutrition.soft @ 30%`.

### Week
- 7 columns, condensed; items render as 1‑line chips with color + start time.
- Tap a column → switches to Day view focused on that date.

### Month
- 6‑row × 7‑col grid; week starts Sunday.
- Each cell shows up to 3 colored dots (max per type/day); "+N" pill if more.
- Today cell has solid green circle behind date number.
- Tap a cell → Day view.

### List (agenda)
- Grouped by date, sticky day headers, infinite scroll forward 60 days.
- Each item = ListRow with color chip + title + time + meta.

## Item color mapping
Per Calori Life item‑type rules: study events white+info border, personal events white+neutral, exams red flood, meals green flood, workouts purple flood, notes white+warning, pomodoro white+purple icon chip, tasks white+priority dot.

## States
- Loading skeleton (rail + 4 ghost blocks).
- Empty day → "אין אירועים — הוסף +".
- Past day full of completed items → muted opacity 70%.
- Today first paint → auto‑scroll to current hour − 1.
- Calori day data mismatch (caloriDate ≠ focused day) → calori items hidden.

## Motion
- View switch = 140ms crossfade + segmented thumb slide.
- Date navigator transitions slide 200ms horizontally (mirrored in RTL).
- Now indicator pulses subtly every 60s (2% opacity breathe).

## A11y
- Segmented control `role="tablist"`, each option `aria-selected`.
- Grid cells `<button aria-label="3 ביוני 2026, 2 אירועים">`.
- Items in day rail are `<article>` with full title + time read.

## RTL
- Time gutter on the right (start edge).
- Day view → "prev" chevron points right; week starts Sunday on the right.
- Month grid columns flow right‑to‑left.

## Prompt to paste
```
Design the unified Calendar for Calori Life (Hebrew, RTL).
5 views in one screen, switched by a segmented control:
Day (vertical time rail with colored blocks + now indicator),
3-Day (3 columns + shared rail, today column tinted),
Week (7 condensed columns, items as colored chips),
Month (6×7 grid with up to 3 dots per day, "today" green circle),
List (agenda grouped by date, sticky headers).

Items use Calori Life item-type mapping:
- study events: white card + info blue start-border
- personal events: white + neutral start-border
- exams: red flood, white text
- calori meals: green #059669 flood, white text
- calori workouts: purple #7C3AED flood, white text

FAB + at trailing-bottom opens AddItemSheet with focused date.
Mobile 390×844 + desktop 1280.
States: default, loading, empty day, past-day muted, dark mode.
Quiet by default. Spring motion. AA contrast.
```
