# Prototype Brief — MoreHub v2

> Paste into a **Prototype** project in claude.ai/design.

> ⚠️ **This brief is v2.0 (warm cream + editorial serif). It supersedes any earlier description.**
>
> **Canonical visual references:**
> - Tokens: `tokens.json` v2
> - Master brief: `00-MASTER-BRIEF-EN.md`
> - Visual style + font system: `inst-2-studies.html` (use as general reference)
> - Design system library: `bento-design-system.html`
>
> If a textual description below disagrees with the HTML files, **the HTML files win.**

---

## v2 Typography (three-font system)

- Headings + italic accents: Instrument Serif, weight 400, italic for `<em>` in green.
- ALL numbers ≥ 14px: Fraunces 600, opsz 144, `-0.04em`.
- Body + UI: Inter 400-700.

**Italic accent rule.** Example: `"<em>עוד</em>"` (the whole word) or `"מרכז <em>הניהול</em>"`.

## v2 Color tokens

- Canvas `#FAF7F2`. Surface `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`. Brand green `#059669` / forest deep `#065F46`.

## Goal
A clean hub, not a settings dump.

## Layout
- Header "<em>עוד</em>" Instrument Serif 22px.
- 2×3 tile grid: **Tasks · Notes · Calori · Pomodoro · Settings · (reserved)**.
- Each tile: 96×96 icon area + label below; tile bg `#FFFFFF`, radius 16px,
  border 1px `rgba(180,140,80,.14)`, shadow `0 2px 10px rgba(40,20,0,.05)`.
- Icon chip 44×44 with soft-colored bg per category:
  - tasks → neutral `#F5F1EA`
  - notes → warning-soft `#FFFBEB`
  - calori → green-soft `#ECFDF5`
  - pomodoro → purple-soft `#F3EFFB`
  - settings → hairline `rgba(180,140,80,.10)`
- Tile label below icon: Inter 13 weight 700, ink.

## Motion
- Tap → spring 0.97 + 180ms route.

## A11y
- Tile = `<button>` with descriptive label.

## Prompt to paste into Claude Design
```
Design MoreHub for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm student life manager.

VISUAL DIRECTION:
- Canvas #FAF7F2 (warm cream). Surfaces #FFFFFF. Ink #2A1A0A.
- Hairlines rgba(180,140,80,.14). ink-soft #8A7A6A.
- Brand green #059669 (italic accents). Forest deep #065F46 (FAB, avatar).
- Three-font system: Instrument Serif (header + italic accents in green),
  Fraunces weight 600 (any number ≥ 14px), Inter (tile labels, body).
  Hebrew → Rubik.
- Italic accent rule: header reads "<em>עוד</em>" — the word itself in
  Instrument Serif italic green.

LAYOUT:
- Header: Instrument Serif "<em>עוד</em>" 22px, ink.
- 2×3 tile grid (gap 12px): Tasks · Notes · Calori · Pomodoro · Settings · (reserved blank).
- Each tile: bg #FFFFFF, radius 16, border 1px rgba(180,140,80,.14),
  shadow 0 2px 10px rgba(40,20,0,.05), padding 18.
- Inside each tile: 44×44 icon chip with soft category bg
  (tasks #F5F1EA · notes #FFFBEB · calori #ECFDF5 · pomodoro #F3EFFB · settings rgba(180,140,80,.10)),
  centered icon in matching darker tone, then label in Inter 13 weight 700 below.

CHROME:
- Header: avatar #065F46 + page title + "calori<em> life</em>" wordmark.
- BottomNav: 4 items — המנהל האישי · בית · לימודים · פוקוס.
- FAB: 52×52 #065F46, white +, shadow rgba(6,95,70,.35), bottom-left.

Mobile 390×844 primary. AA contrast. Spring tap motion 180ms (scale 0.97).

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on any number ≥ 14px
- Italicize tile labels
```
