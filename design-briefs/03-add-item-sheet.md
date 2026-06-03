# Prototype Brief — AddItemSheet (FAB)

## Goal
Capture any personal item in under 10 seconds without leaving context.

## Layout
- **Bottom sheet** 92vh, scrim `rgba(0,0,0,.4)`, drag handle 36×4 hairline.
- **Header** — Cancel (leading) · "הוספת פריט" title · Save (trailing, primary green).
- **Tabs** — Event · Task · Note (segmented, sliding green underline).
- **Tab content** — scrollable form.
- **Footer (mobile)** — sticky Save button full‑width.

## Event tab
- Title input (large, autofocus).
- Date · Start time · End time (two‑column on tablet+).
- All‑day toggle.
- Course picker (optional, shows colored chip after select).
- Location input.
- Color auto‑derived from course/type; small swatch shows the picked color.

## Task tab
- Title input (autofocus).
- Priority segmented (Low · Med · High) — color dot updates live.
- Due date chips (היום · מחר · בחר תאריך) + custom date picker.
- Course picker (optional).
- Subtasks — inline list, "+ הוסף תת‑משימה" appends a new row.

## Note tab
- Title (optional).
- Content multi‑line (min 120 height).
- Color swatches × 6 — pastel circles.
- Pin toggle (switch).

## States
Default · Loading save · Validation error (red helper text under field) · Conflict warning if event overlaps existing one · Past date warning · Success → sheet closes + toast.

## Motion
- Sheet enters with spring (stiffness 380, damping 32).
- Tab change → underline slides 180ms + content crossfades 140ms.
- Save button morphs to spinner 180ms.

## A11y
- `role="dialog" aria-modal="true"` + focus trap on the sheet.
- Tabs `role="tablist"`, each `role="tab" aria-controls`.
- Esc / swipe‑down closes.
- Save button disabled until required fields valid; reason in `aria-describedby`.

## RTL
- All paddings logical; trailing actions on the leading side in RTL.
- Segmented underline animates from current tab to next in correct direction.

## Prompt
```
Design AddItemSheet for Calori Life — Hebrew RTL bottom sheet, 92vh.
Three tabs in a sliding segmented control: Event, Task, Note.
Each tab is a clean form (large title input, then fields).
Event: date + start/end time, all-day toggle, course picker (colored chip), location.
Task: title, priority segmented (Low/Med/High), due chips (Today/Tomorrow/Pick), course, inline subtasks.
Note: title, multiline content, 6 pastel color swatches, pin toggle.
Sticky Save (primary green) at bottom on mobile.
States: default, validation error, overlap warning, save loading, success toast.
Spring motion 180-220ms. AA contrast. Quiet by default.
```
