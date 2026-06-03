# Prototype Brief — Home / SmartDashboard ("Command Center")

> Paste into a **Prototype** project in claude.ai/design. Target: **390×844 mobile**, secondary **1280 desktop**.

---

## Goal
In one glance, answer: *"What's next for me, right now?"* across studies, personal life, and Calori (nutrition + fitness).

## Audience
Hebrew‑speaking BSc year‑1 student, iPhone heavy, juggling 5 courses + personal life + fitness/nutrition.

## Hierarchy (top → bottom)
1. **Smart header** — time‑based greeting ("בוקר טוב, אוריה") + dynamic subtitle that picks the most relevant prompt:
   - if tasks due today > 0 → "יש לך 4 משימות להיום"
   - else if exam in ≤ 14 days → "בחינה במבני נתונים בעוד 8 ימים"
   - else → "הכל סגור — תהנה מהיום"
2. **Quick actions row** — 3 pills: Pomodoro · Calori · Tasks. Tap → deep link.
3. **AI quick links strip** (owner only) — horizontal scrollable course chips → NotebookLM / Gemini.
4. **My Day timeline** — unified, time‑sorted list mixing exams · events · tasks due today · calori meals (green flood) · calori workouts (purple flood). Group label per period (בוקר / צהריים / אחה״צ / ערב).
5. **Coming‑up card** — appears when today is empty. Shows next 7 days' top 3 items.

## Layout spec
- Page padding: 16 horizontal, 12 top (after safe area), 96 bottom (above BottomNav).
- Section spacing: 24.
- Card radius: 16. Card shadow: `0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.04)`.
- Timeline row height: 72 (single‑line) or 96 (with location/meta).

## Components used
`SmartHeader`, `QuickActionsRow`, `AIQuickLinkChip`, `TimelineRow` (variants: study, personal, exam, meal, workout, task), `ComingUpCard`, `BottomNav`, `FAB`.

## States to design
- **Default** with 6 mixed items.
- **Loading** — 3 skeleton timeline rows + header skeleton.
- **Empty today** — illustration + "אין כלום היום ☀" + ComingUpCard.
- **Error fetch** — top toast "לא הצלחנו לטעון, מנסים שוב…".
- **Owner without AI links** — strip hidden, no gap.
- **Non‑owner** — strip always hidden.
- **Dark mode** — full mirror.

## Motion
- Header subtitle crossfades on count change (180ms).
- Timeline rows stagger 40ms on first paint.
- Tap on QuickAction springs 0.97 → 1.

## Accessibility
- `<h1>` for greeting.
- Each QuickAction `<button aria-label="פתח פומודורו">` etc.
- Timeline = `<ol>` with `aria-label="היום שלי"`.
- Each calori row announces "ארוחה" or "אימון" + name + time.

## RTL
- All logical props (`ps`, `pe`, `ms`, `me`).
- Chevrons mirror via `:dir(rtl)` CSS.
- Time gutter on the right side of timeline rows.

## Sample data to include in the prototype
| Time | Type | Title |
|---|---|---|
| 08:30 | Meal (green) | בוקר חלבונים — 480 קק"ל |
| 10:00 | Study event | אינפי 2 — תרגול |
| 13:00 | Personal task | להחזיר ספרים לספרייה |
| 15:00 | Workout (purple) | ריצת ערב — 32 דק׳ |
| 18:00 | Personal event | פגישה עם מנחה |
| 21:00 | Exam (red) | בחינה: מבני נתונים — בעוד 8 ימים |

## Prompt to paste into Claude Design
```
Design the Home / SmartDashboard for Calori Life — a Hebrew-first (RTL) iOS-inspired student life manager.
Use the Calori Life Design System tokens (see master brief).

Layout top→bottom:
1) Smart header — greeting + dynamic subtitle.
2) Quick actions row — Pomodoro, Calori, Tasks pills.
3) AI quick links horizontal strip (course chips).
4) My Day unified timeline grouping morning/noon/afternoon/evening, mixing
   study events (white + info border), personal events (white + neutral border),
   exams (red flood, white text), calori meals (green #059669 flood, white text),
   calori workouts (purple #7C3AED flood, white text), tasks (white card with round checkbox + priority dot).
5) BottomNav with centered green FAB.

Mobile 390×844. Quiet by default; color is information.
Include states: default, loading skeleton, empty + coming-up card, dark mode.
Spring motion 180–220ms. 44px min touch targets. AA contrast.
Hebrew sample data from the brief.
```
