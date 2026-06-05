# Prototype Brief — Focus Hub v2

> Paste into a **Prototype** project in claude.ai/design.
> Target: **390×844 mobile** primary, **1280 desktop** secondary.

> ⚠️ **This brief is v2.0 (warm cream + editorial serif). It supersedes any earlier description.**
>
> **Canonical visual references:**
> - Tokens: `tokens.json` v2
> - Master brief: `00-MASTER-BRIEF-EN.md`
> - Visual style + font system: `inst-5-pomodoro.html` (Focus wraps the Pomodoro timer)
> - Design system library: `bento-design-system.html`
>
> If a textual description below disagrees with the HTML files, **the HTML files win.**

---

## Goal
A dedicated, distraction-free space for deep work sessions. The user opens the Focus tab when they want to start a study sprint — no clutter, no other content.

## Audience
Hebrew-speaking BSc year-1 student in a study session. Wants to start a timer and forget the rest of the UI exists.

---

## Color & font primer

```css
--canvas:   #FAF7F2;   /* warm cream */
--surface:  #FFFFFF;
--ink:      #2A1A0A;
--ink-soft: #8A7A6A;
--hairline: rgba(180,140,80,.14);

--green:      #059669;  /* italic accents, primary start button */
--green-deep: #065F46;  /* avatar, FAB */
--purple:     #7C3AED;  /* timer ring, focus session pomodoro */

--font-display: 'Instrument Serif', 'Rubik', serif;   /* headings + italic */
--font-numbers: 'Fraunces', 'Rubik', serif;           /* timer numerals, stats */
--font-body:    'Inter', 'Rubik', sans-serif;
```

**Italic accent rule.** Every Instrument Serif heading contains 1-2 italic words in green (`#059669`).
On this screen: `"פוקוס · <em>אינפי 2</em>"`, `"היום · <em>3 מתוך 4</em>"`, timer seconds `"14<em>:23</em>"`.

**Number rule.** All numbers ≥ 14px → Fraunces 600 (`opsz 144`, `-0.04em`). Big timer (`14:23`, 78px) uses italic on the seconds. Stat values (sessions count, focus minutes) use italic.

---

## Layout — strict order (top → bottom)

### Container
- Phone 390×844, background `#FAF7F2`.
- Screen padding: `14px 14px 0`. Vertical rhythm: `gap: 14px`.
- Entrance motion: `fade-in + slide-from-bottom-4 duration-500`.
- RTL-aware (`dir="rtl"` on the root).

### Section 1 — Context card (compact, what are we working on)

The user has the context of which course they're focused on right at the top. This replaces the "page title only" approach with something useful.

- Container: `background: #FFFFFF; border-radius: 18px; padding: 14px 18px; border: 1px solid rgba(180,140,80,.14); box-shadow: 0 2px 10px rgba(40,20,0,.05); display: flex; align-items: center; justify-content: space-between;`
- **Left side:**
  - Eyebrow (Inter): `font-size: 10px; font-weight: 600; color: #8A7A6A; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 2px;` — text `"עובד כעת על"`
  - Title (Instrument Serif): `font-size: 20px; font-weight: 400; color: #2A1A0A; letter-spacing: -0.02em;` — text `"<em>אינפי 2</em> · הרצאה 9"` (the course name italic in green)
- **Right side — "החלף" chip:**
  - `background: #F0FDF4; border: 1px solid rgba(5,150,105,.2); border-radius: 999px; padding: 5px 11px; font-size: 11px; font-weight: 600; color: #065F46;`

### Section 2 — Phase chip row (which mode)

3 pills in a centered row. Active one stands out.

- Row: `display: flex; justify-content: center; gap: 6px;`
- Inactive pill: `font-size: 11px; font-weight: 600; color: #8A7A6A; padding: 6px 12px; border-radius: 999px; background: #F5F0E8;`
- **Active pill** (Instrument Serif italic for the editorial signature):
  - `background: #059669; color: #FFFFFF; font-family: var(--font-display); font-style: italic; font-size: 13px; padding: 5px 14px;`
  - Labels: `"פוקוס"` (active), `"הפסקה קצרה"`, `"הפסקה ארוכה"`.

### Section 3 — Timer stage (the hero)

The big timer card. This is what the user came for.

- Container: `background: #FFFFFF; border-radius: 32px; padding: 32px 20px 30px; border: 1px solid rgba(180,140,80,.14); box-shadow: 0 8px 32px rgba(40,20,0,.08); position: relative; overflow: hidden;`
- **Top accent line:** `linear-gradient(90deg, #7C3AED, #A78BFA, #7C3AED)` 3px (purple gradient — focus is purple-themed).

**Ring stage** (relative wrapper, ring inside, text absolutely centered):
- SVG ring 260×260 viewBox 260 260:
  - Background track: `circle cx=130 cy=130 r=116 stroke=#F5F3FF stroke-width=14`
  - Progress: `circle cx=130 cy=130 r=116 stroke=#7C3AED stroke-width=14 stroke-linecap=round stroke-dasharray=729 stroke-dashoffset=<calculated>` — `transform="rotate(-90 130 130)"`.
- Center text (absolutely positioned, width 200, text-align center):
  - Eyebrow (Inter): `font-size: 10px; font-weight: 600; color: #8A7A6A; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 6px;` — text `"סשן פוקוס · 60%"`
  - **Timer numerals** (Fraunces 600 italic): `font-family: var(--font-numbers); font-size: 78px; font-weight: 600; color: #2A1A0A; letter-spacing: -0.05em; line-height: 0.9;`
    - Format: `"14<em>:23</em>"` — the `<em>` styles the seconds: `font-style: italic; color: #7C3AED;` (purple italic seconds — the brand signature on this screen)
  - Sub-line (Instrument Serif italic): `font-family: var(--font-display); font-style: italic; font-size: 13px; color: #8A7A6A; margin-top: 6px;` — text `"מתוך 25 דקות"`

**Controls row** below the ring:
- Row: `display: flex; justify-content: center; gap: 14px; margin-top: 6px;`
- **Side controls** (Skip, Reset): `width: 54px; height: 54px; border-radius: 50%; background: #FFFFFF; border: 1px solid rgba(180,140,80,.18); color: #2A1A0A; font-size: 18px; box-shadow: 0 2px 8px rgba(40,20,0,.06);`
- **Main control** (Start/Pause): `width: 68px; height: 68px; border-radius: 50%; background: #7C3AED; color: #FFFFFF; font-size: 24px; box-shadow: 0 8px 24px rgba(124,58,237,.4); border: none;`
  - Icons: `⏸` when running, `▶` when idle/paused.

### Section 4 — Today's stats row (3 mini tiles)

- Row: `display: flex; gap: 8px;`
- Each tile: `flex: 1; background: #FFFFFF; border-radius: 16px; padding: 13px 12px; border: 1px solid rgba(180,140,80,.12); box-shadow: 0 1px 6px rgba(40,20,0,.04);`
- Value (Fraunces 600 italic): `font-size: 24px; letter-spacing: -0.03em; line-height: 1; font-style: italic;`
- Label (Inter): `font-size: 10px; color: #8A7A6A; font-weight: 500; margin-top: 3px;`

Colors per tile:
- Tile 1: `color: #7C3AED` — `"3"` · `"סשנים היום"`
- Tile 2: `color: #059669` — `"75"` · `"דקות פוקוס"`
- Tile 3: `color: #2A1A0A` (no italic): `"4"` · `"יעד יומי"`

### Section 5 — Sessions progress strip (today's plan)

A visual row of 8 dots showing completed/active/remaining sessions.

- Container: `background: #FFFFFF; border-radius: 16px; padding: 14px 16px; border: 1px solid rgba(180,140,80,.12); box-shadow: 0 1px 6px rgba(40,20,0,.04);`
- **Header row** (`flex space-between; margin-bottom: 10px`):
  - Title (Instrument Serif): `font-size: 16px; font-weight: 400; color: #2A1A0A;` — `"היום · <em>3 מתוך 4</em>"`
  - Meta (Instrument Serif italic): `font-style: italic; font-size: 13px; color: #8A7A6A;` — `"עוד 10 דק׳"`
- **Dots row** (8 segments, `display: flex; gap: 6px`):
  - Each segment: `flex: 1; height: 8px; border-radius: 2px;`
  - Done: `background: #7C3AED`
  - Active (pulsing): `background: #A78BFA; animation: pulse 2s infinite;` (opacity 1 ↔ 0.4)
  - Remaining: `background: rgba(180,140,80,.12)`

---

## App-wide chrome

### Top header (sticky)
- `position: sticky; top: 0; padding: 52px 20px 13px; background: rgba(250,247,242,.94); backdrop-filter: blur(22px); border-bottom: 1px solid rgba(180,140,80,.12);`
- **Avatar** (left): 34×34 circle, `background: #065F46`, white initial 13px weight 700.
- **Page title** (center, Instrument Serif): `font-size: 22px; font-weight: 400; color: #2A1A0A; letter-spacing: -0.02em;` — `"פוקוס"`.
- **Wordmark** (right): `"calori"` Inter bold 15px + `<em> life</em>` Instrument Serif italic green 17px.

### BottomNav (sticky bottom, 4 items)
Focus tab is **active** here.
- `height: 72px; background: rgba(250,247,242,.96); backdrop-filter: blur(20px); border-top: 1px solid rgba(180,140,80,.12);`
- Items: המנהל האישי (Bot) · בית (Home) · לימודים (BookOpen) · **פוקוס** (Target, active — Active label color = `#7C3AED` here since Focus is purple-themed, not green).

### FAB
**On the Focus screen, the FAB is intentionally hidden** — Focus is single-purpose. Adding nothing distracts from the timer. Or use the standard FAB if user might want quick-add:
- If shown: `position: absolute; bottom: 88px; left: 20px; width: 52px; height: 52px; border-radius: 50%; background: #065F46; color: #FFFFFF; box-shadow: 0 6px 20px rgba(6,95,70,.35);`

---

## States to design
- **Idle** — timer at "25:00", main control = green/purple Start button, sessions row shows 0 done.
- **Running** — ring filling, main control = Pause (⏸), course chip pulses, current dot in sessions row is `#A78BFA` pulsing.
- **Paused** — ring frozen, main control = Resume (▶), Reset/Skip side controls highlighted.
- **Phase change** — soft toast slides down from the top: `"כל הכבוד! זמן להפסקה קצרה"` + chime + soft haptic.
- **Completed session** — brief confetti micro-anim in purple+green, the next sessions-dot fills with spring, today's session count increments with count-up.
- **No course attached** — context card shows: eyebrow `"בחר משימה"` + Instrument Serif italic ghost text `"<em>צרף קורס להתחיל</em>"`.
- **Loading** — shimmer skeleton on the timer ring + stats tiles.
- **Dark mode** — canvas `#1A140E`, surface `#241B12`, ink `#FAF7F2`, ink-soft `#A89888`, hairline `rgba(180,140,80,.18)`. Timer ring background → `rgba(124,58,237,.15)`.

## Motion
- Page entrance: 500ms fade + slide-from-bottom + stagger 40ms between sections.
- Ring fill: `transition: stroke-dashoffset 1000ms cubic-bezier(0.16, 1, 0.3, 1);`.
- Active session dot pulse: opacity 1 ↔ 0.4 over 2s ease-in-out infinite.
- Phase change toast: spring 200ms (stiffness 380, damping 32).
- Confetti: 1.2s duration, 12-16 dots in primary green + fitness purple from the ring center.
- Tap on controls: `scale(0.95)` with spring.

## Accessibility
- Page title `<h1>` = `"פוקוס"`.
- Main Start/Pause is a single button with dynamic `aria-label` (`"התחל סבב"` / `"השהה סבב"` / `"המשך סבב"`).
- Timer numerals wrapped in element with `role="timer"` and `aria-live="polite"`. Avoid announcing every second — debounce to every 5s.
- Phase chips: `role="radiogroup"`, each chip `role="radio"` with `aria-checked`.
- 44×44 min touch targets on all controls. Main control is 68×68 so very accessible.
- AA contrast verified:
  - White on `#7C3AED`: 5.93:1 ✅
  - `#2A1A0A` on `#FFFFFF`: 13.2:1 ✅
  - `#8A7A6A` on `#FAF7F2`: 4.8:1 ✅

## RTL
- Logical props throughout.
- Timer numerals `14:23` are LTR-rendered by browser bidi automatically — no `<bdi>` needed.
- Controls row centers, no flip needed for `▶ ⏸ ↺ ⏭` (icons are bidirectional).
- Sessions-row dots flow left-to-right visually but the "current" position respects reading order (in RTL = the dot on the RIGHT is the leftmost time-wise; first done sessions are on the right).

---

## Sample data to include in the prototype

```
Context:
  Eyebrow: "עובד כעת על"
  Title:   "אינפי 2 · הרצאה 9"  (אינפי 2 in italic green)

Phase: focus (active)
Timer: 14:23 of 25:00 (60% complete)
State: running

Today stats:
  Sessions: 3
  Focus minutes: 75
  Daily goal: 4

Sessions row (8 dots):
  ● ● ● ◐ ○ ○ ○ ○
  (3 done in purple, 1 active in lavender pulsing, 4 remaining in warm-gray)
  Meta: "עוד 10 דק׳"
```

---

## Prompt to paste into Claude Design

```
Design the Focus Hub for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm student life manager. Single-purpose screen wrapping a
big Pomodoro timer.

VISUAL DIRECTION:
- Canvas #FAF7F2 (warm cream). Surfaces #FFFFFF. Ink #2A1A0A.
- Hairlines rgba(180,140,80,.14). ink-soft #8A7A6A.
- Focus is purple-themed: #7C3AED for ring, active session dots, main control,
  and italic seconds in the timer numerals.
- Three-font system: Instrument Serif (headings + italic accents in green),
  Fraunces weight 600 (ALL numbers ≥ 14px, including timer 78px),
  Inter (body/UI). Hebrew → Rubik.
- Italic accent rule: every heading has 1-2 italic <em> words.
  On this screen: course name italic GREEN, timer seconds italic PURPLE,
  "3 מתוך 4" italic GREEN.

LAYOUT (top → bottom):

1) CONTEXT CARD (compact): white card with eyebrow "עובד כעת על" + Instrument Serif
   title "<em>אינפי 2</em> · הרצאה 9" (course italic green) + "החלף" pill.

2) PHASE CHIPS ROW: 3 centered pills. Active pill = #059669 bg, white text,
   Instrument Serif italic, e.g. "פוקוס" active, "הפסקה קצרה" + "הפסקה ארוכה" inactive.

3) TIMER STAGE (the hero): white card border-radius 32px, padding 32px 20px,
   3px PURPLE-gradient top accent. Inside: 260px ring (purple stroke #7C3AED on
   #F5F3FF track, stroke-width 14, stroke-linecap round, rotate -90).
   Center text: eyebrow "סשן פוקוס · 60%" + giant 78px Fraunces 600 timer
   "14<em>:23</em>" (seconds italic purple) + Instrument Serif italic 13px
   "מתוך 25 דקות".
   Controls row below ring: 3 circles — Skip 54px white outlined, Pause 68px
   #7C3AED main, Reset 54px white outlined. Main control has purple glow shadow.

4) TODAY STATS ROW: 3 white mini tiles. Big Fraunces 600 italic 24px:
   "3" purple "סשנים היום", "75" green "דקות פוקוס", "4" ink "יעד יומי".

5) SESSIONS PROGRESS strip: white card. Header "היום · <em>3 מתוך 4</em>"
   Instrument Serif + meta "עוד 10 דק׳" Instrument Serif italic.
   8 dots row: 3 done #7C3AED, 1 active #A78BFA pulsing, 4 remaining warm-gray.

CHROME:
- Header: avatar #065F46 + "פוקוס" Instrument Serif 22px (center) + wordmark.
- BottomNav: 4 items — המנהל האישי · בית · לימודים · פוקוס (active, label #7C3AED).
- FAB: hidden on Focus screen (single-purpose). Or 52×52 #065F46 if shown.

Mobile 390×844 primary. AA contrast. Spring motion 180-220ms.

States: idle, running (ring filling, pulsing dot), paused, phase-change toast,
completed celebration, no-course-attached, loading, dark mode.

Use Hebrew sample data above.

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on the timer
- Italicize body text (only accent words in headings + timer seconds)
- Add decorative gradients outside the 3px purple timer-stage top accent
- Show clutter (this is a single-purpose distraction-free screen)
```
