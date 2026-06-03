# Prototype Brief — Home / SmartDashboard ("Command Center")

> Paste into a **Prototype** project in claude.ai/design.
> Target: **390×844 mobile** primary, **1280 desktop** secondary (max content width 1120, centered).

> ⚠️ **This brief reflects the live implementation in `src/components/dashboard/SmartDashboard.jsx`.**
> It is the canonical source. If a different home layout appears in `bento-design-system.html` examples — this brief overrides them.

---

## Goal
In one glance, answer: *"What's next for me, right now?"* across studies, personal life, and Calori (nutrition + fitness).

## Audience
Hebrew-speaking BSc year-1 student, iPhone heavy, juggling 5 courses + personal life + fitness/nutrition.

---

## Layout — strict order (top → bottom)

### Container
- Outer: `max-w-4xl mx-auto`, padding `px-4 sm:px-6 py-5`, vertical rhythm `space-y-6`.
- Inner bento grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.
- Mobile: every tile stacks single-column. The 2-col / 3-col layout only applies on `md` and `lg`.

### Tile 1 — Greeting & Status banner (FULL WIDTH, always)
- **Span:** `col-span-1 md:col-span-2 lg:col-span-3`. `min-h-[140px]`.
- **Background:** white card (`bg-card`), `rounded-3xl`, `border border-border`, `shadow-sm`.
- **Decorative blobs** (positioned absolute, blurred, low opacity):
  - Top-right: `#059669/5` (nutrition green), `w-36 h-36 rounded-full blur-2xl`.
  - Bottom-left: `#7C3AED/5` (fitness purple), `w-36 h-36 rounded-full blur-2xl`.
- **Content** flex column space-between:
  - **Top row** (flex md:row, stacks on mobile):
    - Left:
      - Tiny date label, uppercase, bold, muted: `"יום רביעי, 3 יוני"`
      - H1 greeting + name: `"ערב טוב, אוריה מרגלית! 👋"` — `text-2xl md:text-3xl font-extrabold tracking-tight`
    - Right: **status chip** — pill, background `#D1FAE5` (greenSoft), border `#059669/10`, contains `<Sparkles>` icon + summary text in `#059669`. Examples:
      - tasks-due > 0 → `"יש לך 4 משימות להיום"`
      - else if exam ≤ 14d → `"מבחן באינפי 2 בעוד 30 ימים"`
      - else → `"הכל סגור — תהנה מהיום"`
  - **Bottom row** (separated by `border-t border-border/60 pt-4`):
    - If next-up block exists: small pulsing green dot + `"הבא בלוז"` label + title + time + countdown chip on the right (`bg-primary/10 text-primary rounded-full px-3 py-1`).
    - Empty: `"🌟 הלוז הושלם להיום"` muted.

### Tile 2 — Nutrition & Fitness (2 columns wide on md+)
- **Span:** `col-span-1 md:col-span-2`. `min-h-[220px]`.
- **Type:** clickable button (opens Calori tab). White card, rounded-3xl.
- **Layout:** flex row, content on the left, ring on the right.
- **Left content:**
  - **Header**: small Calori logo image (`<img src="/logo-calori.jpg" className="w-8 h-8 rounded-xl object-contain">`) + label `"תזונה וכושר היום"` (bold sm). Right side: `"פתח קלורי"` chip with external-link icon.
  - **Stats row** (3 columns with thin dividers):
    - Calories eaten: `text-2xl font-black text-[#059669]` ("398") + `"קק"ל שנאכלו / 2000"` (10px muted).
    - Calories burned: `text-2xl font-black text-[#7C3AED]` ("+0") + `"קק"ל שנשרפו (0 דק)/300"`.
    - Weight: 9px uppercase label `"משקל"` + value `"86.5"` (xl black) + `kg` + sub-line `"Target: 78 kg"`.
  - **Macros strip** (border-t pt-2): 3 columns — Protein `#059669`, Carbs `amber-500`, Fats `rose-500`. Each: 8px uppercase label + `text-xs font-extrabold` value + `g`.
- **Right side** — Apple-Watch-style **double ring**:
  - 128×128. Outer ring (r=38) `#059669` track 10% opacity, progress = caloriesEaten / dailyGoal.
  - Inner ring (r=27) `#7C3AED` track 10% opacity, progress = burned / 300.
  - Center: percentage number bold + tiny "הושלם" label.

### Tile 3 — Studies / Exams (1 column on md+)
- **Span:** `col-span-1`. `min-h-[220px]`.
- White card, rounded-3xl, clickable (opens Studies tab).
- **Header:** blue-50 chip with `<GraduationCap>` icon (#3B82F6/blue-500) + label `"לימודים"`. Chevron right (muted) animates on hover.
- **Body:** nearest exam panel. If days ≤ 7 → red-tinted `bg-destructive/5 border-destructive/30 text-destructive`. Else → blue tint `bg-blue-500/5 border-blue-500/20 text-blue-600`. Course name (bold), `"מועד A/B/C"` sub, big countdown number + `"ימים"` label on the right.
- **Empty:** 🌤️ + `"אין מבחנים קרובים"`.
- **Footer** (border-t): `"התקדמות סמסטר"` + course count (e.g. `"5 קורסים"`).

### Tile 4 — My Day Schedule (2 columns wide on md+)
- **Span:** `col-span-1 md:col-span-2`. `min-h-[220px]`.
- White card, rounded-3xl, clickable (opens Command Center / AI planner).
- **Header:** primary/10 chip with `<Bot>` icon + label `"לוז היום שלי"`. Right: `"פתח תכנון AI"` + chevron, primary color, hover underline.
- **Body:** up to 3 schedule blocks. Each block = pill row, time on the right:
  - `study` → blue tint
  - `event` → neutral
  - `meal` → green tint `#D1FAE5/40` text `#059669`
  - `workout` → purple tint text `#7C3AED`
  - `travel` → amber
- **Empty:** 🌤️ + `"אין פריטים מתוזמנים להיום"` + `<Sparkles>` "ארגן עם AI" link.

### Strip — Quick Actions (full width, below the grid)
- Section title: `"פעולות מהירות"` (uppercase, bold, muted, tracking-wider).
- Grid `grid-cols-2 sm:grid-cols-4 gap-3`. Each pill: rounded-2xl border + icon-chip + 2-line label.
  - **Action 1** — AI planning: `<Sparkles>` primary, `"ארגן עם AI"` / `"תכנון יומי מותאם"`.
  - **Action 2** — Pomodoro: `<Clock>` `#7C3AED`, `"התחל פומודורו"` / `"התמקד בלימודים"`.
  - **Action 3** — Add: `<Plus>` `#3B82F6`, `"הוסף משימה/אירוע"` / `"רשימות ויומן"`.
  - **Action 4** — Calori: `<UtensilsCrossed>` `#059669`, `"יומן תזונה"` / `"צפה בפרטי היום"`.

### Strip — AI Quick Links (owner-only, full width, optional)
- Hidden when no `data.links` for any course.
- Title row: `<Bot>` + `"קישורי AI מהירים"`.
- Horizontal scrollable row of course chips (rounded-2xl bordered cards), each opens NotebookLM/Gemini URL externally.

### Section — Coming Up (fallback, when today has no tasks)
- Only shown when `todayPersonalTasks === 0 && upcomingItems.length > 0`.
- Title: `"בקרוב"` + week label, right side `"פתח יומן"` link.
- Grid `sm:grid-cols-2` of upcoming pills: colored dot (exam=red, event=blue, task=amber) + title + relative date (`"רביעי 5/6"`).

---

## App-wide chrome (NOT inside this view, but visible)

### Top header (sticky)
- Tiny rounded "settings avatar" button on the start side. If user has displayName → first-letter circle (primary background when settings tab active). Else `<User>` icon.
- Page title in the middle, font-black xl, gradient text using `var(--gradient-brand)`.
- On the end side: "calori" (ink) + " life " (green primary) wordmark + 9×9 gradient-bordered logo card (white inner, `/logo.svg`).

### BottomNav (sticky, 3 items — see `06-more-hub.md`)
The current BottomNav has **3 items only**, not 5:
1. **המנהל האישי** (`<Bot>` icon) — opens Command Center / AI planner.
2. **בית** (`<Home>` icon) — active by default.
3. **לימודים** (`<BookOpen>` icon) — opens Studies hub.

Visual: fixed bottom, `bg-background/95 backdrop-blur-md border-t`, height 64px, items flex around. Active item = `text-primary`. Each: vertical stack of icon (20px) + 10px bold label.

### Floating FAB (bottom-right, fan-out menu)
- **Position:** `fixed right-6 bottom-24 sm:right-8 sm:bottom-28`. **NOT centered in BottomNav.**
- **Resting state:** 56×56 circle, primary green background, white `<MoreHorizontal>` icon, `shadow-lg shadow-primary/30`.
- **Open state:** icon rotates to `<X>`. A blurred backdrop appears. Five smaller (48×48) action buttons fan out in a quarter-circle to the upper-left:
  1. Add item (green primary, `<Plus>`) → opens AddItemSheet.
  2. Tasks (blue-500, `<CheckSquare>`).
  3. Notes (amber-500, `<StickyNote>`).
  4. Calori (`#059669`, calori logo image — NOT the lucide icon).
  5. Pomodoro (purple-500, `<Timer>`).
- Each button has a tiny floating tooltip above with its label.
- Spring motion `stiffness: 550, damping: 20`, 15ms delay stagger between buttons.

---

## States to design
- **Default** with the 4 main tiles populated.
- **Loading** — skeleton for each tile.
- **Empty today** — greeting chip = "הכל סגור" + schedule tile empty + Coming Up section shows up.
- **No calori data** — Tile 2 shows zeros + "0%" ring + macros all 0g.
- **No exam** — Tile 3 shows 🌤️ empty state.
- **Owner without AI links** — AI strip hidden, no gap.
- **Dark mode** — full mirror, light bg flips to `#0A0A0B`.

## Motion
- Tile entrance: `animate-in fade-in slide-in-from-bottom-4 duration-500`.
- Active block: pulsing dot (`animate-ping`) next to "next up" label.
- Ring fills: `transition-all duration-1000 ease-out`.
- Hover on tile: border color shift, no scale change (only on press: `active:scale-[0.98]`).

## Accessibility
- All tiles that navigate = `<button>` with `aria-label`.
- External links: `target="_blank" rel="noopener noreferrer"`.
- FAB: `aria-label` toggles between `"עוד"` and `"סגור"`.
- Color is never the only signal — every colored chip also has a text label.

## RTL
- Logical props throughout (`ms-`, `me-`, `ps-`, `pe-`, `text-start`).
- Chevrons mirror via `Chevron = isRTL ? ChevronLeft : ChevronRight`.
- FAB stays on the right side in RTL (it's a position, not a logical direction in our spec).

---

## Sample data to include in the prototype

```
Profile name: אוריה מרגלית
Date: יום רביעי, 3 יוני 2026
Time: 21:54
Greeting: ערב טוב

Tile 1 status chip: "מבחן באינפי 2 בעוד 30 ימים"
Tile 1 next-up: empty → "🌟 הלוז הושלם להיום"

Tile 2 (Calori):
  Eaten: 398 / 2000
  Burned: +0 / 300 (0 דק)
  Weight: 86.5 kg, Target: 78 kg
  Macros: P 45g · C 36g · F 8g
  Ring: 20% complete

Tile 3 (Studies):
  Next exam: אינפי 2, מועד A, 30 days
  5 courses

Tile 4 (Schedule):
  09:54 · משקה חלבון אייס קפה (meal — green tint)
  (rest of day empty)
```

---

## Prompt to paste into Claude Design

```
Design the Home / SmartDashboard for "Calori Life" — a Hebrew-first (RTL),
iOS-inspired student life manager.

Use the Calori Life Design System tokens (see master brief & tokens.json).

THIS IS THE CANONICAL HOME LAYOUT — follow it exactly. Do NOT use a 6-column
bento grid from other docs. The home is a 3-column (lg) responsive bento with
specific tile spans defined below.

Layout, top → bottom:

1) Greeting banner — FULL WIDTH. White card, rounded-3xl, two soft decorative
   blobs (green top-right, purple bottom-left). Contains: date label + h1 greeting
   with name on the left; a greenSoft status chip with Sparkles icon on the right.
   Below a divider: "next up in schedule" mini-row with pulsing dot, item title,
   countdown chip — OR an empty "schedule complete" state.

2) Bento grid (md: 2-col, lg: 3-col, gap-4):

   • Tile A — Nutrition & Fitness: SPAN 2 on md+. White card. Left side has a
     small calori-logo chip (image, not icon) + "תזונה וכושר היום" + "פתח קלורי"
     external link chip. Stats: big green calories-eaten number + small purple
     calories-burned + weight with target. Macros strip below. Right side: an
     Apple-Watch-style double ring (outer green = eaten, inner purple = burned),
     center shows percentage.

   • Tile B — Studies: SPAN 1. White card. Blue GraduationCap header chip,
     "לימודים" label, chevron. Body shows nearest exam in a tinted panel
     (red if ≤7 days, else blue), with countdown days on the right. Footer:
     semester progress + course count.

   • Tile C — My Day Schedule: SPAN 2 on md+. White card. Bot icon in primary
     chip, "לוז היום שלי" label, "פתח תכנון AI" link with chevron. Body: up
     to 3 schedule blocks as colored pills (study=blue, event=neutral,
     meal=green tint, workout=purple tint, travel=amber). Empty: emoji +
     "אין פריטים מתוזמנים" + Sparkles "ארגן עם AI" link.

3) Quick Actions strip — section label, then a grid-cols-2 sm:grid-cols-4 of
   4 pill buttons: "ארגן עם AI" (Sparkles primary), "התחל פומודורו"
   (Clock purple), "הוסף משימה/אירוע" (Plus blue), "יומן תזונה"
   (UtensilsCrossed green).

4) AI Quick Links — owner-only horizontal scrollable course chips (hidden by
   default; omit if no data).

5) Coming Up — appears only when today is empty.

App chrome (already exists, do not redesign):
- Top sticky header with avatar button (start), gradient page title (center),
  "calori life" wordmark + gradient-bordered logo card (end).
- Bottom sticky nav with EXACTLY 3 items: המנהל האישי (Bot) · בית (Home, active) ·
  לימודים (BookOpen).
- Floating FAB at fixed bottom-right (NOT centered in nav), opens a 5-button
  fan-out menu: Add, Tasks, Notes, Calori (uses logo image), Pomodoro.

Mobile 390×844 primary. Quiet by default; color is information.
Include states: default, loading skeleton, empty today, dark mode.
Spring motion 180–220ms. 44px min touch targets. AA contrast.
Use Hebrew sample data from the brief.
```
