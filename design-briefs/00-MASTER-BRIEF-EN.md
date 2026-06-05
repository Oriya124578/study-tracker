# Calori Life — Master Design Brief (EN)

> Drop this file into Claude Design (claude.ai/design) as the canonical source. Every Prototype, Slide deck, Template, and Design System entry should cite the section number below.

---

## 0. Product in one paragraph

**Calori Life** is a Hebrew‑first (RTL), iOS‑inspired personal life manager for Israeli university students. It unifies three layers in one timeline: **studies** (courses, weekly tasks, exams, pomodoro), **personal life** (events, tasks, quick notes), and a **read‑only bridge to the Calori nutrition + fitness app** (meals, workouts, daily score). The home screen is a "command center" timeline that mixes all three chronologically. Built with React 19 + Vite, Tailwind 4, Framer Motion, Zustand, Firebase (Auth + Firestore + Storage).

**Design north star v2 (2026-06):** *Editorial · warm · scholarly — like a beautifully-printed journal that happens to know you.* The visual personality moved from "iOS Health clone" to **premium stationery × Craft × Things 3**. Cream warm backgrounds, italic editorial accents, characterful Fraunces numbers, forest-green forest. Color used as information; italic used as emphasis.

**Canonical visual references (must be matched):**
- Home: `combo-B-style3-cream.html` + `font-2-instrument.html` (font system)
- Calendar: `inst-1-calendar.html`
- Studies: `inst-2-studies.html`
- Tasks: `inst-3-tasks.html`
- Calori: `inst-4-calori.html`
- Pomodoro: `inst-5-pomodoro.html`

If a brief description ever disagrees with these HTML files, the **HTML files win**.

---

## 1. Brand voice & visual personality

| Axis | Lean toward | Avoid |
|---|---|---|
| Tone | Editorial, warm, scholarly, confident | Gamey, cute, corporate, generic-SaaS |
| Density | Generous whitespace, ample card padding (20px) | Cramped lists, flat-edge density |
| Background | Warm cream `#FAF7F2`, never neutral gray | Cool grays (`#F5F5F7`), pure white pages |
| Color | Semantic floods on cream + italic green accents as emphasis | Decorative gradients, multi-color backgrounds |
| Type | **Instrument Serif** (headings, italic accents) + **Fraunces 600** (all numbers) + **Inter** (body/UI). Hebrew → **Rubik**. | Plus Jakarta Sans, Heebo display, SF Pro for headings, mixed-font chaos |
| Italic | Use as **editorial accent** — one or two words per heading, always in green | Italicizing body text, italic on numbers (only Fraunces does italic numbers) |
| Motion | Spring physics, 180–220ms | Slow eases, parallax tricks |
| Imagery | Soft abstract shapes, gradient ring strokes only | Stock photos, photo backgrounds, decorative emojis as icons |

---

## 2. Design tokens (paste into Design System project)

### 2.1 Color (v2 — warm cream palette)

```css
/* Brand — nutrition (green / forest) */
--color-nutrition-primary:      #059669;  /* meals, FAB shadow, active nav, primary CTA, italic accents */
--color-nutrition-primary-deep: #065F46;  /* avatar, FAB body, deep accents */
--color-nutrition-secondary:    #10B981;
--color-nutrition-tertiary:     #047857;  /* mid stop in green gradients */
--color-nutrition-soft:         #F0FDF4;  /* light tints, chip backgrounds */
--color-nutrition-softer:       #ECFDF5;  /* lightest tints */

/* Brand — fitness (purple) */
--color-fitness-primary:   #7C3AED;       /* workouts, pomodoro flood */
--color-fitness-secondary: #8B5CF6;
--color-fitness-soft:      #F3EFFB;
--color-fitness-softer:    #EDE9FE;

/* Neutrals — warm cream (THIS IS THE BIG CHANGE) */
--color-canvas:        #FAF7F2;            /* warm cream — full screen bg */
--color-surface:       #FFFFFF;            /* cards */
--color-ink:           #2A1A0A;            /* warm dark brown — primary text */
--color-ink-soft:      #8A7A6A;            /* warm muted — secondary text */
--color-hairline:      rgba(180,140,80,.14); /* warm gold-toned borders */
--color-hairline-soft: rgba(180,140,80,.10);
--color-tint-warm:     #F5F0E8;            /* segmented control track */

/* Semantic */
--color-info:         #2563EB;             /* study events */
--color-info-soft:    #EFF6FF;
--color-info-deep:    #1E40AF;
--color-warning:      #D97706;             /* notes, due-soon, carbs */
--color-warning-soft: #FFFBEB;
--color-warning-deep: #92400E;
--color-danger:       #EF4444;             /* exam flood */
--color-danger-soft:  #FEF2F2;             /* exam reminder card bg */
--color-danger-deep:  #991B1B;             /* exam text */
--color-danger-strong:#DC2626;             /* overdue, fats */
--color-success:      #10B981;

/* Dark mode (warm-toned) */
--color-canvas-dark:    #1A140E;
--color-surface-dark:   #241B12;
--color-ink-dark:       #FAF7F2;
--color-ink-soft-dark:  #A89888;
--color-hairline-dark:  rgba(180,140,80,.18);
```

**The 30% rule.** ~70% of any screen is warm cream + white surfaces + ink text. ~30% is green (FAB, primary CTA, italic accents, meal floods, hero card top accent line). Any other color (red, blue, purple, amber) is **information** — appears only on item-type cards or stat values.

### 2.2 Item‑type → visual mapping (the single most important rule)

| Item | Card style | Background | Border | Text |
|---|---|---|---|---|
| Study event (lecture/tutorial) | soft-bg + border | `info-soft #EFF6FF` | `info` 1px | `info-deep #1E40AF` |
| Personal event | white card | `surface` | `hairline` 1px | `ink` |
| Exam reminder | soft-bg + border | `danger-soft #FEF2F2` | `danger` 1px | `danger-deep #991B1B` |
| Calori meal | flood | `nutrition-primary #059669` | — | `#FFFFFF` |
| Calori workout | flood | `fitness-primary #7C3AED` | — | `#FFFFFF` |
| Note | soft-bg + border | `warning-soft #FFFBEB` | `warning` 1px | `warning-deep #92400E` |
| Pomodoro session | white + icon chip | `surface` | `hairline` | `ink`, icon-chip `fitness-softer` |
| Personal task | white, round checkbox | `surface` | `hairline` | `ink`, priority dot |
| Empty slot | dashed warm | `rgba(180,140,80,.05)` | `1.5px dashed hairline` | `ink-soft` italic Instrument Serif |

The italic empty-state placeholder ("ריק · לחץ + להוסיף") in Instrument Serif italic is a brand signature — always use this style.

### 2.3 Typography — Three-font editorial system (v2)

**Concept.** Three fonts each play a specific role: a characterful italic serif for emphasis, a chunkier display serif for all numbers, a clean sans for body/UI. Hebrew falls back to Rubik in every stack.

```html
<!-- Google Fonts import (paste in head) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600;1,9..144,700&family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700;800&family=Rubik:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

```css
/* Three-font system */
--font-display:  'Instrument Serif', 'Rubik', serif;    /* headings, page titles, hero greetings, italic accents */
--font-numbers:  'Fraunces', 'Rubik', serif;            /* ALL numbers, weight 600 */
--font-body:     'Inter', 'Rubik', sans-serif;          /* body, UI, labels */

/* Number style — ALWAYS apply when rendering any number ≥ 14px */
.num {
  font-family: var(--font-numbers);
  font-weight: 600;
  font-variation-settings: 'opsz' 144, 'SOFT' 0, 'WONK' 0;
  letter-spacing: -0.04em;
}
.num.italic { font-style: italic; }     /* Calori 398, Pomodoro :23, stat values */

/* Italic accent — paint <em> green for editorial pull-quote effect */
h1 em, h2 em, h3 em, .hero em {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-nutrition-primary);
}

/* Type ramp (v2) */
--text-10: 10px / 14px;   /* eyebrow / uppercase label */
--text-11: 11px / 16px;   /* chip / meta */
--text-12: 12px / 18px;   /* secondary body */
--text-13: 13px / 20px;   /* primary body */
--text-14: 14px / 20px;   /* body large */
--text-16: 16px / 22px;   /* list title */
--text-18: 18px / 24px;   /* card title (Instrument Serif) */
--text-22: 22px / 26px;   /* section title (Instrument Serif) */
--text-27: 27px / 30px;   /* hero greeting (Instrument Serif) */
--text-32: 32px / 34px;   /* page hero (Instrument Serif) */
--text-42: 42px / 40px;   /* calendar month (Instrument Serif italic) */
--text-64: 64px / 60px;   /* Calori calories — Fraunces 600 italic */
--text-78: 78px / 70px;   /* Pomodoro timer — Fraunces 600 + italic on seconds */

/* Weights */
--fw-display:  400;       /* Instrument Serif only has 400 */
--fw-numbers:  600;       /* Fraunces — never lower for numbers */
--fw-hero-num: 700;       /* Fraunces — for today's day-of-month, headline numbers */
--fw-regular:  400;       /* Inter */
--fw-medium:   500;
--fw-semibold: 600;
--fw-bold:     700;

/* Letter spacing (use these — they're calibrated for Hebrew + Latin mix) */
--ls-heading-tight:   -0.04em;   /* hero greeting, big numbers */
--ls-heading-default: -0.03em;   /* page titles */
--ls-heading-loose:   -0.02em;   /* subtitles */
--ls-label-wide:       0.14em;   /* uppercase eyebrows */
--ls-label-x-wide:     0.16em;   /* preview labels, status banner */
```

**Italic accent rule (brand signature).** Every Instrument Serif heading should contain **one or two italic words in green** — the "editorial pull-quote" effect. Examples:
- `ערב טוב, <em>אוריה</em> 👋` (italic name)
- `חמישה <em>קורסים</em>` (italic noun)
- `היום · <em>רביעי</em>` (italic day)
- `14<em>:23</em>` (italic seconds in timer)

**Number rule.** All numbers ≥ 14px MUST use Fraunces 600 with `letter-spacing: -0.04em`. Tabular numbers (`font-feature-settings: 'tnum' 1`) on stacked numeric lists like timelines and date lists.

**Hebrew fallback.** Every font-family stack ends with `'Rubik', sans-serif|serif`. Hebrew text falls through to Rubik automatically. **Do not** wrap in `<bdi>` — the inline fallback chain handles it.

### 2.4 Spacing & shape

```css
--space-1:  4px;
--space-2:  8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;

--radius-sm:   8px;
--radius-md:  12px;
--radius-lg:  16px;
--radius-xl:  20px;
--radius-pill: 999px;

--shadow-card:  0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.04);
--shadow-sheet: 0 -8px 24px rgba(0,0,0,.08);
--shadow-focus: 0 0 0 3px var(--color-nutrition-soft);
```

### 2.5 Motion

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--dur-fast: 140ms;
--dur-base: 180ms;
--dur-slow: 220ms;

/* Spring (Framer) */
--spring-sheet: { stiffness: 380, damping: 32 };
--spring-tap:   { stiffness: 500, damping: 30 };
```

---

## 3. Layout grid

- **Mobile (default):** 390×844 viewport, 16px gutters, 8‑col grid, content max‑width 358.
- **Tablet:** 768 wide, 24px gutters, 12‑col.
- **Desktop:** 1280 wide, 32px gutters, 12‑col, content max‑width 1120.
- **BottomNav height:** 64 + safe‑area bottom inset.
- **Top safe area:** 12 + safe‑area top inset.

---

## 4. Component library (atoms → organisms)

### 4.1 Atoms
- **Button** — variants: `primary` (green flood, white text), `secondary` (surface + hairline border), `ghost` (transparent), `destructive` (danger flood). Sizes: `sm 32 / md 40 / lg 48`. Pressed state scales 0.97 with spring.
- **IconButton** — 40×40, radius `pill`, hover bg `hairline` 40%.
- **Input** — height 44, radius `md`, 1px hairline border; focus → 3px `nutrition-soft` ring + ink border.
- **Chip** — height 28, radius `pill`, padding 0/12. Variants: neutral, green, purple, info, warning.
- **Checkbox** — round 22px; unchecked = 1.5px hairline; checked = `nutrition-primary` with white check.
- **Switch** — iOS style, 51×31 track; on = `nutrition-primary`.
- **Badge** — dot 8px or count pill `text-12 semibold`.
- **Avatar** — 32 / 40 / 56; initials fallback in `nutrition-soft`.

### 4.2 Molecules
- **Card** — surface, radius `lg`, padding `space-4`, shadow `card`.
- **ListRow** — min‑height 56, leading slot (icon/avatar) · title (`text-16 medium`) · subtitle (`text-13 ink-soft`) · trailing slot (meta/chevron).
- **SegmentedControl** — track `hairline`, thumb `surface` + shadow, animates with `dur-base ease-out`.
- **EmptyState** — illustration 120×120, h2 `text-18 semibold`, helper `text-14 ink-soft`, optional CTA.
- **Toast** — bottom 16, `surface`, shadow `sheet`, auto‑dismiss 3s, swipe to dismiss.
- **BottomSheet** — drag handle 36×4 `hairline`, snap points `[40vh, 92vh]`, scrim `rgba(0,0,0,.4)`.
- **DatePill** — chip with leading calendar icon, label "today/tomorrow/Jun 5".

### 4.3 Organisms
- **TimelineRow** — leading time gutter (56w) · color chip · title · meta. Six variants per item type from §2.2.
- **CourseCard** — color stripe (4px, right side in RTL) · name · week N/M · progress bar.
- **CaloriSummaryCard** — hero calories `text-34 bold` · macro pills row · score badge top‑right.
- **AddItemSheet** — full bottom sheet, 3 tabs (Event/Task/Note), shared header + footer.
- **BottomNav** — 5 slots, center FAB 56×56 raised −8 above bar with shadow.
- **DayTimeline** — vertical 06:00→24:00 rail, "now" indicator 1px `danger`.

---

## 5. Screen catalog (paste section as Prototype brief)

Each screen lists: **purpose, layout, primary states, key components, motion notes, a11y, RTL.**

### 5.1 Home — SmartDashboard (Command Center)
- **Purpose.** Answer "what's next for me now?" in one glance.
- **Layout.** (1) Smart header — greeting + dynamic subtitle (today task count → nearest exam countdown → "all clear"). (2) Quick‑actions row — Pomodoro · Calori · Tasks pills. (3) AI quick‑links horizontal strip (owner only). (4) My Day timeline. (5) Coming‑up card when today empty.
- **States.** Loading (3 skeleton rows) · empty (illustration + "all clear") · error toast.
- **Motion.** Subtitle crossfades on count change. Timeline rows stagger 40ms.
- **A11y.** `<h1>` greeting; timeline `<ol>`; calori rows say "Meal / Workout" in screen reader.
- **RTL.** All logical props; chevrons mirror.

### 5.2 Calendar — CalendarView
- **Purpose.** See study + personal + calori on a real calendar.
- **Layout.** Top bar (title + segmented Day/3‑Day/Week/Month/List) → date navigator → grid → FAB.
- **Views.** Day = vertical time rail with colored blocks + now indicator. 3‑Day = 3 columns. Week = 7 columns condensed. Month = grid with up to 3 dots per cell. List = agenda grouped by date, infinite scroll.
- **Color.** Items use §2.2 mapping. Calori items appear only if `caloriDate` matches focused day.
- **A11y.** Segmented = `role="tablist"`; cells = buttons with full‑date aria‑label.
- **RTL.** Week starts Sunday; Hebrew day abbreviations.

### 5.3 AddItemSheet (FAB)
- **Purpose.** Capture any personal item in <10 seconds.
- **Layout.** Bottom sheet 92vh, drag handle, 3 tabs: Event / Task / Note.
  - **Event:** title, date, start/end, all‑day toggle, course (optional), location, auto color.
  - **Task:** title, priority segmented, due chips, course, inline subtasks.
  - **Note:** title (optional), content, 6 color swatches, pin toggle.
- **Footer.** Cancel · Save (primary green, full‑width on mobile).
- **Motion.** Spring slide (`spring-sheet`). Tab change crossfades content 140ms.
- **A11y.** `role="dialog"`, focus trap, Esc/swipe closes; tabs `role="tablist"`.

### 5.4 Studies — StudiesHub
- **Purpose.** Course‑centric overview.
- **Layout.** Header ("My Courses" + semester chip) → 2‑col course grid (3‑col desktop) → StudiesStats (progress ring, exam board, pomodoro chart).
- **CourseCard.** Color stripe · name · week · progress bar. Tap → CourseDetail. Long‑press → quick menu.
- **Empty.** "No courses — let's add" CTA.

### 5.5 CourseDetail
- **Tabs.** Overview · Weekly Tasks · Files · Notes · Links.
  - **Overview:** meta + progress ring + next deliverable card.
  - **Weekly Tasks:** week selector (1..N), templated checklist (lecture/tutorial/homework/custom), bulk complete.
  - **Files:** folder tree, drag‑drop upload, image/PDF thumbnails.
  - **Notes:** autosaved rich text.
  - **Links:** pill list to NotebookLM / Gemini / Moodle / lecturer email.

### 5.6 More — MoreHub
- **Layout.** 2×3 tile grid: Tasks · Notes · Calori · Pomodoro · Settings · (reserved).
- **Tile.** 96×96 icon, soft‑colored bg per category.

### 5.7 Tasks
- **Layout.** Quick‑add bar (Enter to save, parses "tomorrow 18:00") → active list → collapsible completed.
- **Row.** Round checkbox · title · due chip · priority dot · expand caret for subtasks.
- **Gestures.** Swipe‑left delete, swipe‑right complete, drag handle reorder.

### 5.8 Notes
- **Layout.** Pinned section → 2‑column masonry grid of colored cards → FAB +.
- **Edit sheet.** Title · content · 6 colors · pin toggle · delete.
- **Contrast.** All 6 swatches AA against ink text.

### 5.9 Calori — CaloriView (READ‑ONLY)
- **Layout.** (1) Date navigator. (2) Daily summary hero card (calories + macro pills + score + workout count). (3) Meals list (green flooded rows). (4) Workouts list (purple flooded rows).
- **Empty.** "No data from Calori today" + deep link button.
- **Rule.** No edit/add — strictly mirror.

### 5.10 Pomodoro
- **Layout.** 260px circular timer (purple progress ring) · phase chip (focus/short break/long break) · course chip optional · controls (start/pause/reset/skip) · today summary (sessions, focus minutes).
- **Feedback.** Soft chime + medium haptic on phase change.

### 5.11 Settings
- **Sections.** Profile · Notifications · Language (HE/EN) · Theme (light/dark/auto) · Connected services (Firebase, Calori) · Data export · About · Sign out.
- **Pattern.** Grouped list, chevrons trailing, destructive row danger color.

### 5.12 Auth — AuthView
- **Layout.** Centered card on canvas, logo top, segmented "Sign in / Sign up", email + password, full‑width Google button.
- **States.** Loading on submit, inline field errors, top toast on auth failure.

### 5.13 Onboarding (4 steps)
1. Welcome + name (illustration + input).
2. Pick courses (preset + "+ custom course" inline).
3. AI tools (owner) — NotebookLM/Gemini link templates.
4. Weekly task templates — toggles + custom.
- 4‑dot progress indicator top, "Skip" trailing.

---

## 6. Asset deliverables (one project per row in Claude Design)

| # | Project type in Claude Design | Output | Notes |
|---|---|---|---|
| 1 | Design System | Color, type, spacing, motion, components | Source = §2 + §4 |
| 2 | Prototype × 13 | One per screen in §5 | Mobile 390×844 + desktop 1280 |
| 3 | Slide deck | 12‑slide pitch | Outline in §7 |
| 4 | Template | App icon 1024 | Green leaf monogram on white |
| 5 | Template | OG image 1200×630 | "Calori Life — your day, unified" |
| 6 | Template | iPhone screenshots 1290×2796 ×6 | Hebrew captions overlay |
| 7 | Template | Phase release banner 1600×900 | Phase N + headline + chart motif |

---

## 7. Pitch deck outline (12 slides)

1. **Title** — Calori Life · "Your day, unified."
2. **Problem** — Israeli students juggle 5 apps for studies, life, and health.
3. **User** — Year‑1 BSc student, Hebrew speaker, iPhone‑heavy.
4. **Solution** — One Hebrew‑first command center across studies + life + Calori.
5. **Home preview** — SmartDashboard screenshot.
6. **Calendar preview** — Unified Day view screenshot.
7. **Calori bridge** — CaloriView screenshot + read‑only architecture note.
8. **Architecture** — Firebase shared project, `cl_*` collections, real‑time listeners.
9. **Phases shipped** — 1, 2, 2.5, 3, 4, polish (one row each).
10. **What's next** — Phase 5 FCM notifications.
11. **Design system** — Color + components snapshot.
12. **Closing** — "Quiet by default. Loud when it matters."

---

## 8. Per‑feature state checklist

For each feature, design *all* of: default · loading · empty · error · success · disabled · RTL · dark · reduced‑motion.

| Feature | Screens | Edge states |
|---|---|---|
| Add event/task/note | AddItemSheet, Home, Calendar | overlap warning, past date |
| Pomodoro | Pomodoro, Home, StudiesStats | phase change toast, session interrupted |
| Course progress | StudiesHub, CourseDetail | 100% celebration |
| Calori day | CaloriView, Home timeline | no data, future date |
| AI quick links | Home, CourseDetail Links | non‑owner empty |
| Notifications (Phase 5) | Settings, system tray | permission denied |
| Onboarding | 4 steps | resume mid‑flow |
| Auth | AuthView | wrong password, email exists, Google cancelled |
| Theme switch | Settings | live preview |
| RTL/LTR switch | Settings | instant mirror |

---

## 9. Accessibility

- Contrast ≥ AA. White on `#059669` = 4.52 ✅. White on `#7C3AED` = 5.93 ✅. White on `#EF4444` = 4.00 — verify on large text only (≥18px or 14px bold).
- Every icon button has `aria-label`.
- Focus ring `shadow-focus`, always visible.
- Touch targets ≥ 44×44.
- Reading order matches visual order in both RTL and LTR.
- Screen reader announces item type + time + title on timeline rows.
- No motion‑only feedback; honor `prefers-reduced-motion`.

---

## 10. Prompt header to paste before every Claude Design generation (v2)

```
Use the Calori Life Design System v2.0 (warm cream + editorial serif).
Hebrew-first, RTL. Logical props only.

CANONICAL VISUAL REFERENCES (must match exactly):
- Layout system: combo-B-style3-cream.html
- Font system: font-2-instrument.html
- Per-screen reference: inst-1-calendar.html / inst-2-studies.html /
  inst-3-tasks.html / inst-4-calori.html / inst-5-pomodoro.html

THREE-FONT SYSTEM (mandatory):
- Headings + italic accents: Instrument Serif (weight 400, italic for <em>)
- ALL numbers ≥ 14px: Fraunces (weight 600, optical-size 144, letter-spacing -0.04em,
  italic for hero numbers like 398/timer-seconds/stat values)
- Body + UI: Inter (400-700)
- Hebrew falls back to Rubik in every stack.

COLORS:
- Canvas (every screen background): #FAF7F2 (warm cream — NEVER use #F5F5F7)
- Ink (primary text): #2A1A0A (warm dark brown — NEVER use #1D1D1F)
- Ink-soft (secondary text): #8A7A6A
- Hairlines/borders: rgba(180,140,80,.14) (warm gold-toned)
- Primary green: #059669 (FAB shadow, italic accents, CTA, meals flood)
- Forest deep: #065F46 (FAB body, deep accents, avatar)
- Hero card top accent line: linear-gradient(90deg, #065F46, #059669 50%, #047857)

ITALIC ACCENT RULE (brand signature):
Every heading/hero text contains ONE OR TWO italic words in green:
'ערב טוב, <em>אוריה</em> 👋' / 'חמישה <em>קורסים</em>' / 'היום · <em>רביעי</em>'
NEVER use italic on body text or labels.

ITEM-TYPE COLORS (the most important rule):
- Study event/lecture: bg #EFF6FF + 1px border #2563EB + text #1E40AF
- Personal event: white + 1px hairline border
- Exam reminder: bg #FEF2F2 + 1px border #EF4444 + text #991B1B
- Calori meal: FLOOD #059669, white text
- Calori workout: FLOOD #7C3AED, white text
- Note: bg #FFFBEB + 1px border #D97706 + text #92400E
- Empty slot: dashed warm border + Instrument Serif italic placeholder

LAYOUT (Combo-B hero card is the home signature):
- Greeting + nutrition stats MERGED in ONE hero card (rounded-2xl, padding 20px 18px)
- Top accent line: 3px green gradient (#065F46→#059669→#047857)
- Inside the card: greeting row → 1px hairline divider → stats row + ring

CHROME:
- Header: avatar (left) + page title in Instrument Serif (center) + 'calori life' wordmark (right)
  Wordmark: 'calori' Inter bold + ' life' Instrument Serif italic green
- BottomNav: 4 items — המנהל האישי · בית · לימודים · פוקוס
- FAB: 52px circle, #065F46 background, fixed bottom-left, shadow 0 6px 20px rgba(6,95,70,.35)

Quiet by default. Italic is emphasis. Color is information.
Editorial-warm-scholarly. Spring motion 180–220ms. 44px touch targets. AA contrast.
```

---

*Master brief v1. Generated 2026‑06‑03 for use with claude.ai/design.*
