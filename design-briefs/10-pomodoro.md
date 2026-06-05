# Prototype Brief — Pomodoro v2

> Paste into a **Prototype** project in claude.ai/design.

> ⚠️ **This brief is v2.0 (warm cream + editorial serif). It supersedes any earlier description.**
>
> **Canonical visual references:**
> - Tokens: `tokens.json` v2
> - Master brief: `00-MASTER-BRIEF-EN.md`
> - Visual style + font system: `inst-5-pomodoro.html`
> - Design system library: `bento-design-system.html`
>
> If a textual description below disagrees with the HTML files, **the HTML files win.**

---

## v2 Typography (three-font system)

- Headings + italic accents: Instrument Serif weight 400, italic for `<em>` in green.
- ALL numbers ≥ 14px: Fraunces weight 600, opsz 144, `-0.04em`.
  The big timer numerals (`25:00`) are Fraunces 600 italic.
- Body + UI: Inter 400-700.

**Italic accent rule.** Examples: `"<em>פוקוס</em>"`, `"<em>25</em>:00"`,
phase chip `"<em>הפסקה</em> קצרה"`.

## v2 Color tokens

- Canvas `#FAF7F2`. Surface `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`.
- Purple `#7C3AED` (focus ring, phase chip — focus is the fitness lineage).
- Brand green `#059669` (Start CTA, italic accents). Forest deep `#065F46` (FAB).

## Goal
Calm focus timer with course context.

## Layout
- **Big circular timer** 260px, purple progress ring (`fitness.primary`), inner large numerals "25:00" `text-34 bold`.
- **Phase chip** under timer: focus · short break · long break.
- **Course chip** (optional) — tap to attach the session to a course; shows colored stripe + name.
- **Controls** — Start/Pause primary (green, large) · Reset secondary · Skip ghost.
- **Today summary** — bottom card: sessions completed, focus minutes, longest streak.

## States
Idle · Running · Paused · Phase change (toast + chime) · Completed session (celebration micro‑anim) · No course attached.

## Feedback
- Phase change: soft chime + medium haptic.
- Last 10s: ring color saturates slightly + tick.
- Completed: brief confetti dots in purple/green.

## Prompt to paste into Claude Design
```
Design the Pomodoro screen for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm focus timer.

VISUAL DIRECTION:
- Canvas #FAF7F2 (warm cream). Surfaces #FFFFFF. Ink #2A1A0A.
- Hairlines rgba(180,140,80,.14). ink-soft #8A7A6A.
- Purple #7C3AED is the focus-domain color (timer ring, phase chip).
  Brand green #059669 (Start CTA, italic accents). Forest deep #065F46
  (FAB, avatar).
- Three-font system: Instrument Serif (page header + italic <em> accents
  in green), Fraunces weight 600 italic for the big timer numerals
  (-0.04em letter-spacing), Inter (controls, body, chips). Hebrew → Rubik.
- Italic accent rule: "<em>פוקוס</em>", "<em>25</em>:00",
  "<em>הפסקה</em> קצרה".

LAYOUT:
- Page header Instrument Serif "<em>פומודורו</em>" 22px (or hosted inside
  Focus Hub — see brief 14).
- Center: 260px circular timer:
  · Outer track stroke rgba(124,58,237,.10), stroke-width 12.
  · Progress stroke #7C3AED, stroke-width 12, stroke-linecap round.
  · Inside: Fraunces 600 italic 56px "25:00" (or current value), color #2A1A0A,
    letter-spacing -0.04em. Colon NOT italicized? Yes italicize whole numerals as one.
- Phase chip below timer: white pill, hairline border, Inter 13 weight 700.
  Active phase glows with purple-soft #F3EFFB bg + #7C3AED text:
  focus · short break · long break (Hebrew: פוקוס · הפסקה קצרה · הפסקה ארוכה).
- Course chip (optional): white pill with 4px course-color stripe on the
  leading side + course name Instrument Serif 14. Tap → course picker.
- Controls row: Start/Pause primary #059669 large (white "התחל" /
  "<em>השהה</em>", radius 16, shadow rgba(5,150,105,.28)) ·
  Reset secondary white outline · Skip ghost.
- Bottom mini-card: white surface, radius 16, hairline border. Three Fraunces 600
  numbers (24px) + Inter 10 labels:
  · "<em>0</em>" סבבים · "<em>0</em>" דקות · "<em>0</em>" רצף.

ITEM-TYPE COLORS (for the attached course chip):
- Per-course accent stripe on the chip (each course has its own color in tokens).
- If a meal/workout is referenced anywhere: meal #059669 flood, workout #7C3AED flood.

CHROME:
- Header: avatar #065F46 + page title + "calori<em> life</em>" wordmark.
- BottomNav: 4 items — המנהל האישי · בית · לימודים · פוקוס (active).
- FAB: 52×52 #065F46, white +, shadow rgba(6,95,70,.35), bottom-left.

States: idle, running (ring filling), paused (ring frozen, Resume CTA),
phase-change (toast slides from top: "כל ה<em>כבוד</em>! זמן להפסקה" + chime),
completed (12-16 confetti dots in purple+green for 1.2s, streak number
increments with spring), no course attached (chip shows ghost outline +
"צרף <em>קורס</em>" hint), dark mode.

Last 10 seconds: ring color saturates slightly + soft tick. AA contrast.
Mobile 390×844 primary. Spring motion 180-220ms.

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on any number ≥ 14px
- Italicize body text or phase labels (only headings + the timer numerals
  + counter accents)
- Add decorative gradients (ring color = solid purple)
```
