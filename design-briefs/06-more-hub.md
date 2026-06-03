# Prototype Brief — MoreHub

## Goal
A clean hub, not a settings dump.

## Layout
- Header "עוד".
- 2×3 tile grid: **Tasks · Notes · Calori · Pomodoro · Settings · (reserved)**.
- Each tile 96×96 icon area + label below; soft‑colored background per category (tasks neutral, notes warning‑soft, calori nutrition‑soft, pomodoro fitness‑soft, settings hairline).

## Motion
- Tap → spring 0.97 + 180ms route.

## A11y
- Tile = `<button>` with descriptive label.

## Prompt
```
Design MoreHub for Calori Life (Hebrew RTL).
2×3 tile grid: Tasks, Notes, Calori, Pomodoro, Settings, reserved-empty.
Each tile: rounded 16, soft-colored category bg, centered icon + label.
Quiet by default. Spring tap motion.
```
