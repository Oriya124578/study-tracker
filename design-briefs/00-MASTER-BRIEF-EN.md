# Calori Life — Master Design Brief (EN)

> Drop this file into Claude Design (claude.ai/design) as the canonical source. Every Prototype, Slide deck, Template, and Design System entry should cite the section number below.

---

## 0. Product in one paragraph

**Calori Life** is a Hebrew‑first (RTL), iOS‑inspired personal life manager for Israeli university students. It unifies three layers in one timeline: **studies** (courses, weekly tasks, exams, pomodoro), **personal life** (events, tasks, quick notes), and a **read‑only bridge to the Calori nutrition + fitness app** (meals, workouts, daily score). The home screen is a "command center" timeline that mixes all three chronologically. Built with React 19 + Vite, Tailwind 4, Framer Motion, Zustand, Firebase (Auth + Firestore + Storage).

**Design north star:** *24me meets Apple Health meets Notion — calm, premium, color used as information, not decoration.*

---

## 1. Brand voice & visual personality

| Axis | Lean toward | Avoid |
|---|---|---|
| Tone | Calm, confident, friendly | Gamey, cute, corporate |
| Density | Generous whitespace | Cramped lists |
| Color | Semantic floods (meal/workout/exam) on a quiet canvas | Decorative gradients everywhere |
| Type | System sans (SF Pro / Heebo) | Display fonts, italic body |
| Motion | Spring physics, 180–220ms | Slow eases, parallax tricks |
| Imagery | Soft abstract shapes, no stock photos | Photo backgrounds |

---

## 2. Design tokens (paste into Design System project)

### 2.1 Color

```css
/* Brand — nutrition (green) */
--color-nutrition-primary:   #059669;
--color-nutrition-secondary: #10B981;
--color-nutrition-soft:      #D1FAE5;

/* Brand — fitness (purple) */
--color-fitness-primary:   #7C3AED;
--color-fitness-secondary: #8B5CF6;
--color-fitness-soft:      #EDE9FE;

/* Neutrals (light) */
--color-canvas:    #F5F5F7;
--color-surface:   #FFFFFF;
--color-ink:       #1D1D1F;
--color-ink-soft:  #6B7280;
--color-hairline:  #E5E7EB;

/* Semantic — info-blue must exactly match the logo gradient blue stop */
--color-info:    #2563EB;
--color-warning: #F59E0B;
--color-danger:  #EF4444;
--color-success: #10B981;

/* Dark mode overrides */
--color-canvas-dark:    #0B0B0D;
--color-surface-dark:   #17171A;
--color-ink-dark:       #F5F5F7;
--color-ink-soft-dark:  #9CA3AF;
--color-hairline-dark:  #26262B;
```

### 2.2 Item‑type → visual mapping (the single most important rule)

| Item | Card | Accent | Text |
|---|---|---|---|
| Study event (lecture/tutorial) | white | left‑border `info` (4px) | ink |
| Personal event | white | left‑border `ink-soft` (4px) | ink |
| Exam | flood `danger` | — | white |
| Calori meal | flood `nutrition-primary` | — | white |
| Calori workout | flood `fitness-primary` | — | white |
| Note | white | left‑border `warning` (4px) | ink |
| Pomodoro | white | icon chip `fitness-soft` | ink |
| Personal task | white, round checkbox | priority dot (red/amber/gray) | ink |

### 2.3 Typography

```css
--font-family-sans: -apple-system, "SF Pro Text", "Heebo", system-ui, sans-serif;
--font-family-display: "SF Pro Display", "Heebo", system-ui, sans-serif;

/* Type ramp */
--text-12: 12px / 16px;   /* caption */
--text-13: 13px / 18px;   /* meta */
--text-14: 14px / 20px;   /* body */
--text-16: 16px / 24px;   /* body large */
--text-18: 18px / 26px;   /* subtitle */
--text-22: 22px / 28px;   /* title */
--text-28: 28px / 34px;   /* h1 */
--text-34: 34px / 40px;   /* hero */

/* Weights */
--font-w-regular: 400;
--font-w-medium:  500;
--font-w-semibold:600;
--font-w-bold:    700;
```

**Hebrew rule.** Wrap numbers / Latin in `<bdi>` to prevent direction bleed.

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

## 10. Prompt header to paste before every Claude Design generation

```
Use the Calori Life Design System (see master brief).
Hebrew first, RTL. Logical props only.
Follow item-type color mapping: meals green flood, workouts purple flood,
exams red flood, lectures white + info border, personal events white + neutral border,
notes white + warning border.
Quiet by default; color is information, not decoration.
iOS-inspired, calm, premium. System sans. Spring motion 180-220ms.
44px minimum touch targets. AA contrast.
```

---

*Master brief v1. Generated 2026‑06‑03 for use with claude.ai/design.*
