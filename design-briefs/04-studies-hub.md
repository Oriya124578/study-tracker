# Prototype Brief — Studies (StudiesHub) v2

> Paste into a **Prototype** project in claude.ai/design.

> ⚠️ **This brief is v2.0 (warm cream + editorial serif). It supersedes any earlier description.**
>
> **Canonical visual references:**
> - Tokens: `tokens.json` v2
> - Master brief: `00-MASTER-BRIEF-EN.md`
> - Visual style + font system: `inst-2-studies.html` (canonical reference)
> - Design system library: `bento-design-system.html`
>
> If a textual description below disagrees with the HTML files, **the HTML files win.**

---

## v2 Typography (three-font system)

- Headings + italic accents: `'Instrument Serif', 'Rubik', serif` (weight 400, italic for `<em>`).
- ALL numbers ≥ 14px: `'Fraunces', 'Rubik', serif` (weight 600, opsz 144, `-0.04em`).
- Body + UI: `'Inter', 'Rubik', sans-serif` (400-700).
- Hebrew falls back to Rubik in every stack.

**Italic accent rule.** Examples on this screen: `"הקורסים <em>שלי</em>"`,
`"סמסטר <em>ב'</em>"`, `"שבוע <em>7</em> מתוך 13"`.

## v2 Color tokens

- Canvas `#FAF7F2`. Surface `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`. Brand green `#059669` / forest deep `#065F46`.

## Goal
Course‑centric overview. Hub for everything academic.

## Layout
1. **Header** — "הקורסים שלי" + semester chip (e.g., "סמסטר ב'").
2. **Course grid** — 2 columns mobile, 3 desktop.
3. **StudiesStats** section — progress ring (overall), exam board (next 30 days), pomodoro chart (last 7 days).

## CourseCard
- Surface `#FFFFFF`, radius 18px, border 1px `rgba(180,140,80,.14)`, shadow `0 2px 10px rgba(40,20,0,.05)`.
- Color stripe 4px on the leading side (per-course accent).
- Course name in Instrument Serif 18px weight 400, `#2A1A0A`.
- `"שבוע <em>7</em> מתוך 13"` — Fraunces 600 for the numbers, Inter for connective words, 13px, ink-soft.
- Progress bar (track `rgba(180,140,80,.10)`, fill `#059669`), 6px tall, radius 999.
- Tap → CourseDetail.
- Long-press → quick menu (rename, archive, files).

## StudiesStats
- **Progress ring** — overall completion across all courses, big number center.
- **Exam board** — list of upcoming exams sorted by date, each row = course color stripe + name + countdown chip.
- **Pomodoro chart** — bar chart, last 7 days focus minutes (Recharts).

## States
Empty (no courses) · Loading skeleton grid · One course only · Many courses (scroll).

## Sample data
אינפי 2 (week 7/13) · אלגברה לינארית 2 (5/13) · תכנות בשפת C (8/13) · מבני נתונים (4/13) · לוגיקה ותורת הקבוצות (6/13).

## Prompt to paste into Claude Design
```
Design the Studies hub for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm student life manager.

VISUAL DIRECTION:
- Canvas #FAF7F2 (warm cream). Surfaces #FFFFFF. Ink #2A1A0A.
- Hairlines rgba(180,140,80,.14). ink-soft #8A7A6A.
- Brand green #059669 (italic accents, progress fills, CTA).
  Forest deep #065F46 (FAB, avatar).
- Three-font system: Instrument Serif (page title + card course names +
  italic accents in green), Fraunces weight 600 (ALL numbers ≥ 14px,
  -0.04em letter-spacing — week counters, exam countdowns, percentages,
  bar chart axis), Inter (body, semester chip label). Hebrew → Rubik.
- Italic accent rule: "הקורסים <em>שלי</em>", "סמסטר <em>ב'</em>",
  "שבוע <em>7</em> מתוך 13", "<em>30</em> ימים לבחינה".

LAYOUT:
- Header (sticky): avatar #065F46 (start) · page title "לימודים"
  Instrument Serif 22px (center) · wordmark "calori<em> life</em>" (end).
- Section header row: Instrument Serif 22px "הקורסים <em>שלי</em>" +
  semester chip "סמסטר <em>ב'</em>" (white pill, hairline border, Fraunces
  for the letter ב').
- Course grid: 2 columns mobile, 3 desktop. Each CourseCard:
  · surface white, radius 18, hairline border, shadow 0 2px 10px rgba(40,20,0,.05)
  · 4px color stripe on the leading side (per-course accent)
  · course name Instrument Serif 18px (ink)
  · "שבוע N/M" with Fraunces numbers, ink-soft
  · 6px progress bar — track rgba(180,140,80,.10), fill #059669
- StudiesStats section below (white card, radius 22, hairline border,
  shadow 0 4px 24px rgba(40,20,0,.07)):
  · Big overall progress ring (Fraunces center number)
  · Upcoming-exams list — each row: course color stripe + name (Instrument Serif)
    + countdown chip "<em>30</em> ימים" (Fraunces in green #065F46 on #F0FDF4 bg)
  · 7-day pomodoro bar chart (Recharts) — bars in #7C3AED, axis labels Fraunces

CHROME:
- Header: avatar #065F46 + title + "calori<em> life</em>" wordmark.
- BottomNav: 4 items — המנהל האישי · בית · לימודים (active) · פוקוס.
  Active label color #059669.
- FAB: 52×52 #065F46, white +, shadow rgba(6,95,70,.35), bottom-left
  (visually bottom-right in RTL).

Mobile 390×844 primary. AA contrast. Spring motion 180-220ms.

Sample 5 Hebrew courses: אינפי 2 (week 7/13), אלגברה לינארית 2 (5/13),
תכנות בשפת C (8/13), מבני נתונים (4/13), לוגיקה ותורת הקבוצות (6/13).

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on any number ≥ 14px
- Italicize body text (only headings and stat hero numbers)
- Add decorative gradients (only allowed: 3px green top accent on hero cards)
```
