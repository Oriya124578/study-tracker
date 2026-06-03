# Prototype Brief — Tasks (Google Tasks style)

## Goal
Lightweight personal to‑dos with subtasks, due dates, priorities.

## Layout
1. **Quick‑add bar** — single input top, Enter saves; magic parse for "מחר 18:00 לקנות חלב".
2. **Active list** — rows with round checkbox · title · due chip · priority dot · expand caret.
3. **Completed (collapsible)** — gray, strike‑through; show last 10, "טען עוד".

## Row
- Checkbox 22 round.
- Title `text-16 medium`.
- Due chip — color‑coded (red if overdue, amber if today, neutral else).
- Priority dot — red high / amber med / gray low.
- Caret expands to subtasks indented 16 with smaller checkbox.

## Gestures
- Swipe leading → complete (green action background).
- Swipe trailing → delete (red action background).
- Drag handle to reorder.

## States
Empty ("הוסף משימה ראשונה") · loading skeleton (3 rows) · overdue items grouped on top · completed collapsed.

## Prompt
```
Design Tasks view for Calori Life (Hebrew RTL, Google-Tasks-style).
Top quick-add input that parses dates ("tomorrow 18:00").
Active list of rows: round 22px checkbox, title, due chip (color-coded: red overdue / amber today / neutral else), priority dot (red/amber/gray), caret for subtasks (indented).
Swipe: complete on leading, delete on trailing. Drag handle to reorder.
Collapsible "Completed" section: muted, strikethrough.
Empty state + skeleton loading.
Quiet by default. Spring motion.
```
