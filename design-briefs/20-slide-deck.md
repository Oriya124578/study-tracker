# Slide Deck Brief — Calori Life Pitch (12 slides)

> Paste into a **Slide deck** project in claude.ai/design.

## Tone
Quiet, confident, premium. Big numbers, generous whitespace, occasional flooded color tiles (green/purple) for emphasis. System sans. Hebrew RTL with English mirror available.

## Aspect & grid
16:9 (1920×1080). 12‑col grid, 80px gutters, 96 page margin.

## Color palette
Same brand tokens (green `#059669`, purple `#7C3AED`, neutrals). Avoid gradients except subtle background washes (`#F5F5F7` → `#FFFFFF`).

## Type
Hero `text-72 bold` · Title `text-44 semibold` · Body `text-22 regular` · Caption `text-16 ink-soft`.

## Slides

1. **Title** — "Calori Life" · subtitle "היום שלך, במקום אחד" · small Calori Labs mark bottom.
2. **Problem** — "סטודנט ישראלי ממוצע משתמש ב‑5 אפליקציות ביום." — 5 small app tiles, fading out into one tile labeled "Calori Life".
3. **User** — persona card: שם, גיל, סמסטר, מכשיר, כאבים (3 נקודות).
4. **Solution** — 3 columns: Studies (book icon) · Personal (calendar icon) · Calori bridge (leaf+dumbbell). Tagline "מרכז שליטה אחד".
5. **Home preview** — large iPhone mockup of SmartDashboard with captions calling out the 4 sections.
6. **Calendar preview** — Day + Month view side‑by‑side mockups.
7. **Calori bridge** — split slide: left iPhone mockup of CaloriView, right text bullets explaining read‑only architecture.
8. **Architecture** — diagram: React/Vite ↔ Firestore (`cl_*` collections) ↔ Calori app (read‑only).
9. **Phases shipped** — 6 rows table: Phase 1, 2, 2.5, 3, 4, polish; one‑line highlight per row.
10. **What's next** — Phase 5 FCM notifications + ideas (widgets, dark mode, ML smart‑sort).
11. **Design system** — color swatches grid + type ramp + component thumbnails.
12. **Closing** — "Quiet by default. Loud when it matters." + contact line.

## Prompt
```
Generate a 12-slide pitch deck for "Calori Life" — a Hebrew-first (RTL) student life manager that unifies studies, personal life, and the Calori nutrition/fitness app.
Slides follow the outline below. 16:9, system sans, quiet premium aesthetic, occasional flooded green/purple tiles. Use Calori Life design tokens.

1) Title  2) Problem  3) User persona  4) Solution (3 columns)
5) Home preview (SmartDashboard iPhone mockup)
6) Calendar preview (Day + Month)
7) Calori bridge (read-only)  8) Architecture diagram
9) Phases shipped table  10) What's next (Phase 5)
11) Design system overview  12) Closing tagline

Hebrew RTL. AA contrast. Large numerals. Generous whitespace.
```
