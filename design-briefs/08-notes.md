# Prototype Brief — Notes

## Goal
Apple‑Notes feel for quick captures.

## Layout
1. **Pinned section** — small header "מוצמדות" + cards.
2. **All notes** — 2‑column masonry grid, height varies by content.
3. **FAB +** — opens edit sheet.

## Card
- Background = chosen color (6 pastels): cream, peach, blush, lavender, mint, sky.
- Padding 16, radius 16.
- Title `text-16 semibold` (optional).
- Content preview (5 lines max, fade‑out gradient).
- Pin icon on the trailing‑top if pinned.
- Tap → edit sheet.

## Edit sheet
- Title input.
- Multi‑line content (large, 50vh min).
- 6 color swatch circles.
- Pin toggle switch.
- Delete (destructive, trailing).

## Contrast
All 6 colors verified AA with ink text.

## Prompt
```
Design Notes for Calori Life (Hebrew RTL, Apple-Notes feel).
Optional Pinned section, then 2-column masonry grid of colored cards.
Card: pastel bg (6 swatches: cream, peach, blush, lavender, mint, sky), radius 16, padding 16, optional title + content preview with bottom fade, pin icon if pinned.
FAB + opens an edit bottom sheet: title, multiline content, 6 color swatches, pin toggle, delete.
States: empty, loading skeleton, dark mode (cards keep hue but darker).
Quiet by default. AA contrast on every swatch.
```
