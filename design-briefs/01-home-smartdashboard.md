# Prototype Brief — Home / SmartDashboard ("Command Center") v2

> Paste into a **Prototype** project in claude.ai/design.
> Target: **390×844 mobile** primary, **1280 desktop** secondary (max content width 1120, centered).

> ⚠️ **This brief is v2.0 (warm cream + editorial serif). It supersedes any earlier "iOS Health bento" description.**
> 
> **Canonical visual references — these HTML files are the ground truth:**
> - Layout: `combo-B-style3-cream.html` (signature merged hero card)
> - Font system: `font-2-instrument.html` (Instrument Serif + Fraunces + Inter)
> - Tokens: `tokens.json` v2
> - Master brief: `00-MASTER-BRIEF-EN.md`
> 
> If a textual description below disagrees with the HTML files, **the HTML files win.**

---

## 0. North star

*Editorial · warm · scholarly — like a beautifully-printed journal that happens to know you.* Premium stationery × Craft × Things 3 × Apple Health.

## Goal
In one glance, answer: *"What's next for me, right now?"* across studies, personal life, and Calori (nutrition + fitness).

## Audience
Hebrew-speaking BSc year-1 student, iPhone heavy, juggling 5 courses + personal life + fitness/nutrition.

---

## Color & font primer (must use these — no substitutions)

```css
/* Canvas & ink */
--canvas:   #FAF7F2;   /* warm cream — full screen bg */
--surface:  #FFFFFF;   /* cards */
--ink:      #2A1A0A;   /* warm dark brown */
--ink-soft: #8A7A6A;
--hairline: rgba(180,140,80,.14);

/* Brand */
--green:        #059669;  /* italic accents, CTA, meals flood */
--green-deep:   #065F46;  /* FAB, avatar, deep accents */
--green-soft:   #F0FDF4;
--green-softer: #ECFDF5;
--purple:       #7C3AED;  /* workouts, pomodoro */

/* Fonts */
--font-display: 'Instrument Serif', 'Rubik', serif;   /* headings + italic */
--font-numbers: 'Fraunces', 'Rubik', serif;           /* weight 600, opsz 144 */
--font-body:    'Inter', 'Rubik', sans-serif;
```

```html
<!-- Google Fonts import -->
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600;1,9..144,700&family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700;800&family=Rubik:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

**Italic accent rule.** Every Instrument Serif heading contains 1-2 italic words in green (`#059669`) — the editorial signature.

**Number rule.** All numbers ≥ 14px → Fraunces 600 with `letter-spacing: -0.04em`. Big numbers (calories, timer) also italic.

---

## Layout — strict order (top → bottom)

### Container
- Outer phone: 390×844, border-radius 50, background `#FAF7F2`.
- Screen padding: `14px 14px 0` (top, sides, no bottom — bottom-nav handles).
- Vertical rhythm between cards: `gap: 12px`.

### Tile 1 — **The Hero Card** (signature — Combo-B layout)

This is the most important visual element of the entire app. **Greeting + nutrition stats live in ONE merged card.** This is non-negotiable.

**Container:**
- `background: #FFFFFF`
- `border-radius: 22px`
- `border: 1px solid rgba(180,140,80,.14)`
- `box-shadow: 0 4px 24px rgba(40,20,0,.07)`
- `padding: 20px 18px 18px`
- `position: relative; overflow: hidden;`

**Top accent line** (the signature green stripe):
```css
.hero::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #065F46, #059669 50%, #047857);
}
```

**Content structure:**

```
┌─────────────────────────────────────────┐
│  [eyebrow date]    [green countdown ▭]  │
│                                          │
│  ערב טוב,             ┌──────────────┐  │
│  אוריה 👋  (italic)   │  30          │  │
│                        │  ימים…       │  │
│  [● הלוז הושלם…]      └──────────────┘  │
│                                          │
│  ─────────────  divider  ─────────────  │
│                                          │
│  398    +0    86.5    ◯ ring 88×88     │
│  קק"ל   נשרף  ק"ג                       │
└─────────────────────────────────────────┘
```

**Greeting row** (flex space-between):
- **Left side:**
  - **Eyebrow date** — `font-family: var(--font-body); font-size: 10px; font-weight: 600; color: #8A7A6A; letter-spacing: 0.12em; text-transform: uppercase;` — e.g. `"רביעי · 4 יוני 2026"` — `margin-bottom: 5px`.
  - **Greeting h1** — `font-family: var(--font-display); font-size: 27px; font-weight: 400; color: #2A1A0A; letter-spacing: -0.04em; line-height: 1.05;`
    - Format: `"ערב טוב,<br><em>אוריה 👋</em>"`
    - The `<em>` contains the name + waving emoji → `font-style: italic; color: #059669;`
  - **Status row** — small pulsing dot + status text:
    - Dot: 6px circle, `background: #059669`.
    - Text: `font-size: 12px; font-weight: 500; color: #8A7A6A;`
    - Examples:
      - tasks-due > 0 → `"יש 4 משימות להיום"`
      - schedule complete → `"הלוז הושלם להיום"`
      - else → `"הכל סגור · תהנה מהיום"`

- **Right side — Countdown badge:**
  - `background: #F0FDF4; border: 1px solid rgba(5,150,105,.2); border-radius: 14px; padding: 9px 12px; text-align: center;`
  - **Number** (Fraunces): `font-family: var(--font-numbers); font-weight: 600; font-size: 26px; color: #065F46; line-height: 1; letter-spacing: -0.04em;` — e.g. `"30"`
  - **Label** (Inter): `font-size: 9px; color: rgba(6,95,70,.5); margin-top: 1px;` — e.g. `"ימים לאינפי 2"`
  - If no upcoming exam → use a different summary chip (e.g. `"5 קורסים"`).

**Inner divider:** `border-top: 1px solid rgba(180,140,80,.10); margin: 0 0 14px;`

**Stats row** — 3 columns with thin dividers + ring on the right:
- Left side: 3 stat columns (`flex: 1` each, with `border-right: 1px solid rgba(180,140,80,.10)` between them).
- **Calories eaten** (Fraunces italic green): `font-size: 30px; font-weight: 600; font-style: italic; color: #059669; letter-spacing: -0.04em; line-height: 1;` — e.g. `"398"`
- **Calories burned** (Fraunces italic purple): `font-size: 20px; font-weight: 600; font-style: italic; color: #7C3AED;` — e.g. `"+0"`
- **Weight** (Fraunces, no italic): `font-size: 18px; font-weight: 600; color: #2A1A0A;` — e.g. `"86.5"`
- Each stat's sub-line (Inter): `font-size: 10px; color: #8A7A6A; margin-top: 3px;`
  - `"קק"ל / 2,000"` · `"שנשרפו / 300"` · `"ק"ג · יעד 78"`

**Ring** (right side, 88×88):
- Outer track: `stroke: rgba(5,150,105,.10); stroke-width: 10;`
- Outer progress: `stroke: #059669; stroke-width: 10; stroke-linecap: round;` — `dasharray: 233`, `dashoffset` based on calories eaten / 2000.
- Inner track: `stroke: rgba(124,58,237,.08); stroke-width: 9;`
- Inner progress: `stroke: #7C3AED; stroke-width: 9; stroke-linecap: round;` — `dasharray: 163`.
- Center: Fraunces 15px weight 600 percentage + 9px Inter `"הושלם"` muted.

### Tile 2 — **Quick Actions strip** (horizontal scrollable pills)

Below the hero card. Spacing `margin-top: 12px`.

- Container: `display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;`
- Each pill: `flex-shrink: 0; border-radius: 14px; padding: 11px 16px; display: flex; align-items: center; gap: 8px;`
- **Primary pill** — `background: #059669; box-shadow: 0 4px 16px rgba(5,150,105,.28);`
  - Icon chip 26×26 `background: rgba(255,255,255,.2)` + `✦`
  - Label: `font-size: 12px; font-weight: 700; color: #FFFFFF;` → `"ארגן עם AI"`
- **Secondary pills** — `background: #FFFFFF; border: 1px solid rgba(180,140,80,.18); box-shadow: 0 2px 8px rgba(40,20,0,.06);`
  - Icon chip 26×26 with tinted bg:
    - `⏱` chip `background: #F3EFFB` → `"פומודורו"`
    - `＋` chip `background: #EFF4FF` → `"הוסף פריט"`
    - `🥗` chip `background: #ECFDF5` → `"תזונה"`
  - Label: `font-size: 12px; font-weight: 700; color: #2A1A0A;`

### Tile 3 — **Timeline (היום)**

The "what's happening today" feed. Mixed event types.

- Section header (`flex space-between`, padding `2px 2px 8px`):
  - Title: `font-family: var(--font-display); font-size: 18px; font-weight: 400; color: #2A1A0A; letter-spacing: -0.02em;` — `"היום"` (optionally with italic day: `"היום · <em>רביעי</em>"`)
  - Link: `font-size: 11px; font-weight: 700; color: #059669;` — `"יומן ›"`

- **Time-segment header** between morning/afternoon/evening:
  - `font-size: 10px; font-weight: 700; color: #8A7A6A; letter-spacing: 0.12em; text-transform: uppercase;`
  - After-pseudo: `flex: 1; height: 1px; background: rgba(180,140,80,.10);` — extends the hairline across.
  - Examples: `"בוקר"`, `"צהריים"`, `"ערב"`.

- **Timeline rows** (`display: flex; gap: 10px; align-items: stretch; margin-bottom: 8px;`):
  - Time gutter (38px wide): `font-family: var(--font-display); font-size: 13px; font-weight: 400; color: #8A7A6A; letter-spacing: -0.02em; padding-top: 11px;`
  - Dot column (14px wide): centered dot + vertical line below.
    - Dot 9×9 with 2-3px colored ring shadow (`box-shadow: 0 0 0 2px rgba(color, .2)`)
    - Vertical line: `1.5px solid rgba(180,140,80,.15)`, flex 1.
  - **Card content** (each item type):

| Item type | Background | Border | Text colors |
|---|---|---|---|
| **Meal** (Calori) | `#059669` flood | none | white title, `rgba(255,255,255,.65)` meta |
| **Workout** (Calori) | `#7C3AED` flood | none | white title, `rgba(255,255,255,.65)` meta |
| **Study event** (lecture) | `#EFF6FF` | `1px solid rgba(37,99,235,.15)` | `#1E40AF` title, `#3B82F6` meta |
| **Personal event** | `#FFFFFF` | `1px solid rgba(180,140,80,.14)` | `#2A1A0A` title |
| **Exam reminder** | `#FEF2F2` | `1px solid rgba(239,68,68,.12)` | `#991B1B` title, `#DC2626` meta |
| **Note** | `#FFFBEB` | `1px solid rgba(217,119,6,.15)` | `#92400E` title |
| **Empty slot** | `rgba(180,140,80,.05)` | `1.5px dashed rgba(180,140,80,.20)` | Instrument Serif italic, 13px, `#8A7A6A`, centered |

All cards: `border-radius: 14px; padding: 11px 14px; flex: 1;`
Card title: `font-size: 13px; font-weight: 700;`
Card sub: `font-size: 11px; margin-top: 2px;`

Empty slot text format (italic Instrument Serif): `"ריק · לחץ + להוסיף"`, `"+ הוסף פריט לצהריים"`.

### Tile 4 — **Mini stats row** (bottom)

3 small tiles side-by-side, `display: flex; gap: 8px;`

- Each tile: `flex: 1; background: #FFFFFF; border-radius: 16px; padding: 13px 12px; border: 1px solid rgba(180,140,80,.12); box-shadow: 0 2px 10px rgba(40,20,0,.05);`
- Big number (Fraunces 600, no italic): `font-size: 24px; letter-spacing: -0.04em; line-height: 1;`
  - Tile 1: `color: #059669` — `"30"` · label `"ימים לבחינה"`
  - Tile 2: `color: #7C3AED` — `"0"` · label `"פומודורו היום"`
  - Tile 3: `color: #2A1A0A` — `"0"` · label `"משימות פתוחות"`
- Label: `font-size: 10px; color: #8A7A6A; font-weight: 600; margin-top: 3px;`

---

## App-wide chrome (visible above & below the screen content)

### Top header (sticky)
- `position: sticky; top: 0; padding: 52px 20px 13px; background: rgba(250,247,242,.94); backdrop-filter: blur(22px); border-bottom: 1px solid rgba(180,140,80,.12);`
- **Avatar** (left): 34×34 circle, `background: #065F46`, white initial letter 13px weight 700.
- **Page title** (center): `font-family: var(--font-display); font-size: 22px; font-weight: 400; color: #2A1A0A; letter-spacing: -0.02em;` — for Home: `"בית"`.
- **Wordmark** (right): `font-size: 15px; font-weight: 700; color: #2A1A0A; letter-spacing: -0.02em;`
  - `"calori"` (Inter bold)
  - `<em> life</em>` — Instrument Serif italic, color `#059669`, weight 400, size 17px

### BottomNav (sticky bottom, 4 items)
- `height: 72px; background: rgba(250,247,242,.96); backdrop-filter: blur(20px); border-top: 1px solid rgba(180,140,80,.12);`
- 4 items, evenly spaced. Each: vertical stack of 20px icon (opacity 0.25 inactive, 1 active) + 10px label (Inter 700, `rgba(42,26,10,.3)` inactive, `#059669` active).
1. **המנהל האישי** (Bot icon) — Command Center
2. **בית** (Home icon) — active here
3. **לימודים** (BookOpen icon) — Studies hub
4. **פוקוס** (Target icon) — Focus hub / Pomodoro

### Floating FAB
- `position: absolute; bottom: 88px; left: 20px;` (in RTL, "left" is visually the right side — but the Combo-B reference uses `left:20px`).
- 52×52 circle, `background: #065F46`, white `+` icon 26px weight 200.
- `box-shadow: 0 6px 20px rgba(6,95,70,.35);`

---

## States to design
- **Default** with the hero card + actions + timeline + mini stats populated.
- **Loading** — shimmer skeleton for each tile.
- **Empty today** — greeting status = `"הכל סגור — תהנה מהיום"` + timeline shows only empty slot rows + countdown badge becomes `"5 קורסים"`.
- **No calori data** — Tile 1 hero card stats show `"0"`/`"0"`/weight + ring 0%, macros 0g each.
- **No exam** — countdown badge → `"5 קורסים"` (semester chip instead).
- **Dark mode** — full mirror, canvas → `#1A140E`, surface → `#241B12`, ink → `#FAF7F2`, ink-soft → `#A89888`.

## Motion
- Card entrance: `fade-in + slide-from-bottom-4 duration-220 ease-out`.
- Status dot: pulse animation (opacity 1 ↔ 0.35, 2s).
- Ring progress: `transition: stroke-dashoffset 1000ms cubic-bezier(0.16, 1, 0.3, 1);` on data update.
- Tap on cards: `scale(0.97)` with spring, no border-color shift.

## Accessibility
- All interactive cards = `<button>` with `aria-label`.
- The hero card has two roles: greeting (reading) + opens Calori on tap. Provide `aria-label="פתח פרטי תזונה"`.
- FAB `aria-label="הוסף פריט חדש"` (or "סגור" when menu open).
- AA contrast verified:
  - `#2A1A0A` on `#FFFFFF`: 13.2:1 ✅
  - `#8A7A6A` on `#FAF7F2`: 4.8:1 ✅
  - White on `#059669`: 4.52:1 ✅
  - White on `#7C3AED`: 5.93:1 ✅

## RTL
- Logical props throughout (`margin-inline-start`, `padding-inline-end`, `border-inline-start`).
- The Combo-B HTML reference uses `dir="rtl"` on `<html>` — Flexbox automatically mirrors `justify-content: space-between`.
- Numbers stay LTR (browsers handle bidi automatically — no `<bdi>` needed).
- FAB stays at `left: 20px; bottom: 88px;` (in RTL that visually places it bottom-right).
- Chevron in section links: use `‹` for "open" arrow (since `›` would point the wrong way in RTL). Or use `<svg>` ChevronLeft.

---

## Sample data to include in the prototype

```
Profile name: אוריה מרגלית
Date: יום רביעי, 4 יוני 2026
Time: 21:54
Greeting: ערב טוב, אוריה 👋

Hero card:
  Eyebrow:    "רביעי · 4 יוני 2026"
  Status row: "● הלוז הושלם להיום"
  Countdown:  30 / "ימים לאינפי 2"
  Stats:
    Eaten:    398   / "קק\"ל / 2,000"
    Burned:   +0    / "שנשרפו / 300"
    Weight:   86.5  / "ק\"ג · יעד 78"
  Ring: 20% green progress, 0% purple

Quick Actions:
  [Primary] ✦ "ארגן עם AI"
  [Sec]     ⏱ "פומודורו"
  [Sec]     ＋ "הוסף פריט"
  [Sec]     🥗 "תזונה"

Timeline:
  Morning:
    09:54 · meal (green flood) · "משקה חלבון אייס קפה" · "398 קק\"ל · חלבון 45g"
  Noon:
    empty slot · "ריק · לחץ + להוסיף"  (italic)
  Evening:
    "כל היום" · exam reminder (red soft) · "⏰ אינפי 2 · 30 ימים לבחינה"

Mini stats:
  30  / "ימים לבחינה"       (green)
   0  / "פומודורו היום"      (purple)
   0  / "משימות פתוחות"      (ink)
```

---

## Prompt to paste into Claude Design

```
Design the Home / SmartDashboard for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm student life manager.

VISUAL DIRECTION (mandatory):
- Warm cream canvas (#FAF7F2) — NEVER use #F5F5F7 or pure gray
- Forest green accents (#059669 primary, #065F46 deep for FAB & avatar)
- Three-font system:
  · Headings: Instrument Serif (weight 400) — italic <em> in green is the signature
  · Numbers ≥ 14px: Fraunces weight 600, opsz 144, -0.04em letter-spacing
    (italic for hero numbers: calories 398, timer 14:23, stat values)
  · Body/UI: Inter (400-700)
  · Hebrew falls back to Rubik in every stack
- Warm-toned everything: ink #2A1A0A, ink-soft #8A7A6A, hairlines rgba(180,140,80,.14)

ITALIC ACCENT RULE (brand signature):
Every heading contains 1-2 italic words in green for the editorial pull-quote effect.
Examples: "ערב טוב, <em>אוריה</em> 👋", "היום · <em>רביעי</em>", "14<em>:23</em>".
NEVER italicize body text or labels.

LAYOUT — strict order (this is the canonical Combo-B home):

1) HERO CARD (signature — greeting + nutrition MERGED in ONE white card):
   - Background #FFFFFF, border-radius 22px, padding 20px 18px,
     border 1px solid rgba(180,140,80,.14), shadow 0 4px 24px rgba(40,20,0,.07).
   - 3px top accent line: linear-gradient(90deg, #065F46, #059669 50%, #047857).
   - Inside: greeting row (eyebrow date + Instrument Serif greeting with italic name
     + status dot row LEFT, green countdown badge RIGHT)
     → 1px hairline divider
     → 3-column stats row (Fraunces 600 italic 30px green "398" / italic 20px purple "+0"
       / 18px ink "86.5") with thin vertical dividers between, + 88×88 double ring on the right.

2) QUICK ACTIONS strip (horizontal scrollable pills, gap 8px):
   - 1 primary green pill: #059669 bg + white "✦ ארגן עם AI"
   - 3 secondary white pills with tinted icon chips: ⏱ פומודורו, ＋ הוסף פריט, 🥗 תזונה.

3) TIMELINE ("היום"):
   - Section title in Instrument Serif 18px with italic day "היום · <em>רביעי</em>",
     link "יומן ›" in green right side.
   - Uppercase eyebrow segment dividers: "בוקר", "צהריים", "ערב" (with hairline extending right).
   - Each row: 38px time gutter (Instrument Serif 13px) + colored dot column with vertical line +
     event card by type:
     · meal → #059669 FLOOD, white text
     · workout → #7C3AED FLOOD, white text
     · study event → #EFF6FF bg + #2563EB border + #1E40AF text
     · exam → #FEF2F2 bg + #EF4444 border + #991B1B text
     · note → #FFFBEB bg + #D97706 border + #92400E text
     · empty slot → dashed warm border + Instrument Serif italic placeholder

4) MINI STATS row (3 white tiles, border-radius 16):
   - Big Fraunces 600 number (24px) + Inter 10px label
   - Colors: green 30/ימים לבחינה, purple 0/פומודורו, ink 0/משימות פתוחות

CHROME:
- Header (sticky, 52px top safe-area): avatar #065F46 (left) + page title "בית"
  in Instrument Serif 22px (center) + wordmark "calori<em> life</em>" (right,
  Inter bold + Instrument Serif italic green).
- BottomNav (4 items): המנהל האישי · בית (active) · לימודים · פוקוס.
- FAB: 52×52 #065F46 circle, white +, shadow rgba(6,95,70,.35), bottom-left.

Use Hebrew sample data above (אוריה, 398 קק"ל, מבחן באינפי 2 בעוד 30 ימים).
Mobile 390×844 primary. AA contrast. Spring motion 180-220ms. 44px touch targets.

DO NOT:
- Use the old palette (#F5F5F7 canvas, #1D1D1F ink)
- Use Plus Jakarta Sans, Heebo display, or SF Pro for headings
- Use weight < 600 on any number
- Italicize body text or labels (only headings and stat hero numbers)
- Add decorative gradients outside the hero top accent line
- Split greeting and nutrition into separate cards (they MUST merge)
```
