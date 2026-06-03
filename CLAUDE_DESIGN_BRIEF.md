# Calori Life — Claude Design Master Brief

> Paste sections of this file into Claude Design (claude.ai/design) as the source-of-truth for prototypes, slide decks, templates, and design system entries.

---

## 0. One-paragraph product pitch

Calori Life is a Hebrew‑first (RTL) personal life manager for Israeli university students. It unifies **studies** (courses, weekly tasks, exams, pomodoro), a **personal layer** (events, tasks, quick notes), and a **live read‑only bridge to the Calori app** (meals + workouts). The home screen is a "command center" timeline that mixes all of these into one chronological day. Inspired by 24me. Tech: React 19 + Vite, Firebase, Tailwind 4, Framer Motion.

---

## 1. Brand & Design System

### 1.1 Personality
- **Calm, premium, friendly** — not gamey, not corporate.
- **Hebrew first**, RTL everywhere, with full English mirror.
- **Quiet by default** — color is information, not decoration. Color floods only used for high‑signal items (meals, workouts, exams).

### 1.2 Color tokens

**Brand**
| Token | Hex | Used for |
|---|---|---|
| `nutrition.primary` | `#059669` | Meals, FAB, active nav, today circle, primary CTA |
| `nutrition.secondary` | `#10B981` | Hover/secondary green |
| `nutrition.soft` | `#D1FAE5` | Green tints, chips |
| `fitness.primary` | `#7C3AED` | Workouts, pomodoro accent |
| `fitness.secondary` | `#8B5CF6` | Hover/secondary purple |
| `fitness.soft` | `#EDE9FE` | Purple tints, chips |

**Neutrals**
| Token | Hex | Used for |
|---|---|---|
| `canvas` | `#F5F5F7` | App background |
| `surface` | `#FFFFFF` | Cards, sheets |
| `ink` | `#1D1D1F` | Primary text |
| `ink.soft` | `#6B7280` | Secondary text |
| `hairline` | `#E5E7EB` | Borders, dividers |

**Semantic**
| Token | Hex | Used for |
|---|---|---|
| `info` | `#3B82F6` | Lecture/tutorial accents |
| `warning` | `#F59E0B` | Notes accent, due‑soon |
| `danger` | `#EF4444` | Exam flood, destructive |
| `success` | `#10B981` | Completed states |

### 1.3 Item‑type → visual mapping (CORE RULE)

| Item type | Card style | Accent |
|---|---|---|
| Study event (lecture/tutorial) | white card | left‑border `info` |
| Personal event | white card | left‑border `ink.soft` |
| Calori meal | **flooded green** card, white text | `nutrition.primary` bg |
| Calori workout | **flooded purple** card, white text | `fitness.primary` bg |
| Exam | **flooded red** card, white text | `danger` bg |
| Note | white card | left‑border `warning` |
| Pomodoro | white card | icon chip `fitness.soft` |
| Personal task | white card, round checkbox | priority dot (red/amber/gray) |

### 1.4 Typography
- **Family:** system sans (San Francisco / Segoe UI / Heebo for Hebrew).
- **Scale:** 12 / 13 / 14 / 16 / 18 / 22 / 28 / 34.
- **Weights:** 400 body, 500 medium UI, 600 titles, 700 hero numbers.
- **Hebrew rule:** never mix LTR punctuation tails — wrap numbers in `<bdi>`.

### 1.5 Spacing & shape
- **Spacing scale:** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48.
- **Radii:** `sm 8`, `md 12`, `lg 16`, `xl 20`, `pill 999`.
- **Shadows:** `card` = `0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.04)`; `sheet` = `0 -8px 24px rgba(0,0,0,.08)`.
- **Hit target:** 44×44 minimum.

### 1.6 Motion
- **Default:** 180ms `ease-out`.
- **Sheet open:** 220ms spring (stiffness 380, damping 32).
- **Tab switch:** 140ms crossfade.
- **List add:** items fade+slide 12px up.
- **Reduced motion:** respect `prefers-reduced-motion`.

---

## 2. Information architecture

```
BottomNav (5 slots)
├── Home          → SmartDashboard (command center)
├── Calendar      → CalendarView (day/3‑day/week/month/list)
├── FAB (+)       → AddItemSheet (event / task / note tabs)
├── Studies       → StudiesHub (course grid + StudiesStats)
└── More          → MoreHub → {Tasks, Notes, Calori, Pomodoro, Settings}
```

---

## 3. Screen‑by‑screen design guide

For every screen below: **purpose → layout → states → components → motion → a11y → RTL notes**.

### 3.1 Home — SmartDashboard ("Command Center")

**Purpose.** Answer "what's next for me, right now?" in one glance.

**Layout (top → bottom)**
1. **Smart header** — time‑based greeting ("בוקר טוב, אוריה") + dynamic subtitle (today's task count → nearest exam countdown → "all clear").
2. **Quick actions row** — 3 pills: Pomodoro, Calori, Tasks.
3. **AI quick links strip** (owner only) — horizontal scroll of course chips → NotebookLM / Gemini.
4. **My Day timeline** — unified, time‑sorted list. Mixes: exams, events, tasks due today, meals (green), workouts (purple).
5. **Empty / coming up** — when today empty, show next 7 days.

**States.** Loading skeleton (3 ghost rows) · empty ("all clear" + illustration) · error toast.

**Components.** `SmartHeader`, `QuickActionsRow`, `AIQuickLinkChip`, `TimelineRow`, `ComingUpCard`.

**Motion.** Header subtitle crossfades when count changes. Timeline rows stagger 40ms on first paint.

**A11y.** `<h1>` greeting; quick actions are `<button>` with aria‑label; timeline is `<ol>`; calori rows announced as "ארוחה" / "אימון".

**RTL.** All paddings use logical props (`ps`, `pe`). Chevrons mirror.

---

### 3.2 Calendar — CalendarView

**Purpose.** See everything (study + personal + calori) on a real calendar.

**Layout.**
- **Top bar** — title + view‑switcher segmented control (Day / 3‑Day / Week / Month / List).
- **Date navigator** — prev / today pill / next + month label.
- **Grid** — view‑specific (see below).
- **FAB** — green +, opens AddItemSheet pre‑filled with the focused date.

**View modes**
- **Day** — vertical time rail 06:00–24:00, items as colored blocks. Now‑indicator (1px red line).
- **3‑Day** — 3 columns, same time rail.
- **Week** — 7 columns, condensed; tap a day to drop into Day view.
- **Month** — classic grid; each day cell shows up to 3 colored dots; tap → Day view.
- **List** — agenda style, grouped by date, infinite scroll forward.

**States.** Empty day shows "אין אירועים היום" with a "+ הוסף" link.

**Color rule.** Items use the §1.3 mapping. Calori items only appear if `caloriDate` matches the focused day.

**A11y.** View switcher is `role="tablist"`. Grid cells are buttons with `aria-label="3 ביוני, 2 אירועים"`.

**RTL.** Week starts Sunday. Day labels Hebrew abbreviations (א׳ ב׳ ג׳…).

---

### 3.3 AddItemSheet (FAB sheet)

**Purpose.** One sheet to add anything personal in <10 seconds.

**Layout.** Bottom sheet 92vh, drag handle, 3 tabs: **Event · Task · Note**.

**Event tab.** Title · date · start/end time · all‑day toggle · course picker (optional) · location · color (auto from course/type).

**Task tab.** Title · priority (low/med/high segmented) · due date (chips: today/tomorrow/pick) · course picker · subtasks (inline add).

**Note tab.** Title (optional) · multi‑line content · color picker (6 swatches) · pin toggle.

**Footer.** Cancel · Save (primary green, full width on mobile).

**Motion.** Spring slide up. Tab change = 140ms underline slide + content crossfade.

**A11y.** Tabs `role="tablist"` + `aria-controls`. Sheet `role="dialog"` + focus trap. Esc / swipe‑down closes.

**RTL.** Tabs and segmented controls flow right‑to‑left; underline animates accordingly.

---

### 3.4 Studies — StudiesHub

**Purpose.** Course‑centric overview.

**Layout.**
1. **Header** — "הקורסים שלי" + semester chip.
2. **Course grid** — 2 columns mobile, 3 desktop. Each `CourseCard` = course name, week N/M, **progress bar** (completed weekly tasks), color stripe.
3. **StudiesStats section** (appended) — progress ring, exam board, pomodoro chart.

**CourseCard interactions.** Tap → CourseDetail. Long‑press → quick menu (rename, archive, files).

**Empty state.** "אין קורסים — בוא נוסיף" CTA → onboarding step 2.

**RTL.** Stripe on the right (start side).

---

### 3.5 CourseDetail

**Purpose.** Drill into one course.

**Tabs.** Overview · Weekly Tasks · Files · Notes · Links.

- **Overview** — meta (lecturer, credits, schedule), progress ring, next deliverable card.
- **Weekly Tasks** — week selector (1..N), checklist with template types (lecture / tutorial / homework / custom). Bulk‑complete week button.
- **Files** — folder tree → file list. Upload via drag or `+`. Thumbnails for images/PDFs.
- **Notes** — rich text, autosaved per‑course.
- **Links** — NotebookLM, Gemini, Moodle, lecturer email; pill list.

---

### 3.6 More — MoreHub

**Purpose.** Grid hub, not a settings dump.

**Layout.** 2×3 tiles: Tasks · Notes · Calori · Pomodoro · Settings · (reserved).

**Tile.** 96×96 icon area + label, soft‑colored background per category.

---

### 3.7 Tasks (Google‑Tasks style)

**Purpose.** Lightweight personal to‑dos.

**Layout.**
- **Quick‑add bar** at top — single input, Enter to save, magic parse for "מחר 18:00".
- **Active list** — round checkbox · title · due chip (color‑coded) · priority dot · expand caret for subtasks.
- **Completed (collapsible)** — fades to gray, struck‑through.

**Interactions.** Swipe left to delete, swipe right to complete. Drag handle to reorder.

**Subtasks.** Indented 16px, smaller checkbox, inline `+ הוסף תת‑משימה`.

---

### 3.8 Notes

**Purpose.** Quick captures, Apple‑Notes feel.

**Layout.**
- **Pinned section** (if any).
- **2‑column masonry grid** of colored cards.
- **FAB +** opens edit sheet.

**Edit sheet.** Title · content · 6 color swatches · pin toggle · delete.

**Card.** Background = chosen color (pastel), ink text always readable (AA on every swatch).

---

### 3.9 Calori — CaloriView (read‑only bridge)

**Purpose.** See today's calori activity inside Calori Life.

**Layout.**
1. **Date navigator** — prev / "היום" / next, with current date display.
2. **Daily summary card** — big calories number · macro pills (P / C / F) · nutrition score badge · workout count.
3. **Meals list** — green flooded rows, white text, meal category icon, calories on the trailing side.
4. **Workouts list** — purple flooded rows, white text, duration + calories burned.

**States.** Empty day → friendly "אין נתונים מקלורי להיום". Future day → "תחזית ריקה". Loading skeletons.

**Important.** READ‑ONLY. No edit/add buttons here. Provide a deep link "פתח באפליקציית קלורי".

---

### 3.10 Pomodoro

**Purpose.** Focus timer with course context.

**Layout.**
- **Big circular timer** (260px) — progress ring purple `fitness.primary`.
- **Phase chip** — focus / short break / long break.
- **Course chip** (optional) — tap to attach session to a course.
- **Controls** — start/pause primary, reset secondary, skip tertiary.
- **Today summary** — sessions completed, focus minutes.

**Sound/haptic.** Soft chime + medium haptic at phase change.

---

### 3.11 Settings

**Sections.** Profile · Notifications · Language (HE/EN) · Theme (light / dark / auto) · Connected services (Firebase, Calori) · Data export · About · Sign out.

**Pattern.** Grouped list, ink rows, chevrons trailing, destructive row red.

---

### 3.12 Auth — AuthView

**Layout.** Centered card on canvas, logo top, segmented "Sign in / Sign up", email + password fields, Google button (full width, secondary).

**States.** Loading on submit · inline field errors · top toast on auth error.

---

### 3.13 Onboarding (4 steps)

1. **Welcome + name** — hero illustration, name input.
2. **Pick courses** — preset list + "+ קורס אחר" inline add (name + weeks).
3. **Choose AI tools** (owner) — NotebookLM/Gemini link templates.
4. **Weekly task templates** — toggles for lecture / tutorial / homework + custom.

**Progress.** 4‑dot indicator top, "דלג" (skip) trailing.

---

## 4. Component library (atomic → molecular)

### Atoms
- **Button** — primary (green flood) / secondary (white + border) / ghost / destructive. Sizes: sm 32, md 40, lg 48.
- **IconButton** — 40×40, circular hover bg.
- **Input** — 44h, 12 radius, focus ring `nutrition.soft` 3px.
- **Chip / Pill** — bg `hairline` or `nutrition.soft`; with optional leading icon.
- **Checkbox** — round 22px; checked = `nutrition.primary`.
- **Switch** — iOS style, on = `nutrition.primary`.
- **Badge** — dot 8px or label pill.

### Molecules
- **Card** — surface, radius `lg`, padding 16, shadow `card`.
- **ListRow** — 56 min‑height, leading icon · title · subtitle · trailing meta.
- **SegmentedControl** — pill background, sliding thumb 180ms.
- **EmptyState** — illustration · h2 · helper text · CTA.
- **Toast** — bottom, auto‑dismiss 3s.
- **BottomSheet** — drag handle, snap points (40 / 92 vh).

### Organisms
- **TimelineRow** — time gutter · color chip · title · meta. Variants per item type.
- **CourseCard** — stripe · name · week · progress bar.
- **CaloriSummaryCard** — calories hero + macro pills + score.
- **AddItemSheet** — full sheet with tabs.
- **BottomNav** — 5 slots, center FAB raised 8px above bar.

---

## 5. Asset deliverables to design in Claude Design

Use these as separate projects/files inside claude.ai/design:

1. **Design System** (already started) — drop §1 + §4 here. Add color swatches, type ramp, spacing scale, component thumbnails.
2. **Prototypes** — one file per screen in §3. Mobile 390×844 + desktop 1280 wide.
3. **Slide deck** — 12‑slide pitch: problem · user · solution · architecture · screens (3) · calori bridge · phases shipped · what's next (Phase 5 FCM) · ask.
4. **Templates / banners**:
   - App icon (1024) — green leaf monogram on white.
   - Social OG image (1200×630) — "Calori Life — your day, unified".
   - Store screenshots (1290×2796 iPhone) — 6 screens with Hebrew captions.
   - Phase release banner — phase number + headline.

---

## 6. Per‑feature design checklist

For each feature, design *all* of: default · loading · empty · error · success · disabled · RTL · dark mode · reduced‑motion.

| Feature | Screens involved | Special states |
|---|---|---|
| Add event/task/note | AddItemSheet, Home, Calendar | conflict warning if same hour |
| Pomodoro session | Pomodoro, Home, StudiesStats | phase change toast |
| Course progress | StudiesHub, CourseDetail | 100% celebration micro‑anim |
| Calori day | CaloriView, Home timeline | no calori data today |
| AI quick links | Home, CourseDetail Links | non‑owner empty |
| Notifications (Phase 5) | Settings, system tray | permission denied |
| Onboarding | 4 steps | resume mid‑flow |
| Auth | AuthView | wrong password, email exists |
| Theme switch | Settings | live preview |
| RTL/LTR switch | Settings | mirrors instantly |

---

## 7. Dark mode tokens (preview)

| Token | Light | Dark |
|---|---|---|
| canvas | `#F5F5F7` | `#0B0B0D` |
| surface | `#FFFFFF` | `#17171A` |
| ink | `#1D1D1F` | `#F5F5F7` |
| ink.soft | `#6B7280` | `#9CA3AF` |
| hairline | `#E5E7EB` | `#26262B` |
| nutrition.primary | `#059669` | `#10B981` |
| fitness.primary | `#7C3AED` | `#A78BFA` |

Flood cards (meal/workout/exam) keep their hue but use a slightly lighter tone in dark mode for contrast.

---

## 8. Accessibility checklist (per screen)

- Contrast AA (text on flood cards ≥ 4.5:1 — white on `#059669` = 4.52 ✅, white on `#7C3AED` = 5.93 ✅).
- All icon buttons have `aria-label`.
- Focus ring visible (3px `nutrition.soft` outer + 1px white inner).
- Keyboard: Tab order matches reading order in RTL.
- Screen reader: timeline items announce type + time + title.
- Touch targets ≥ 44×44.
- No motion‑only feedback.

---

## 9. How to use this in Claude Design

1. Open your existing **Design System** project at claude.ai/design.
2. Create entries: **Colors**, **Typography**, **Spacing**, **Components** — copy §1 and §4 into each.
3. Create a new **Prototype** project per screen in §3 — paste the section as the brief.
4. Create a **Slide deck** project — paste §5 deliverable #3 as the outline.
5. Create a **Template** project per asset in §5 #4.
6. For every generation, add at the top of your prompt: *"Use the Calori Life Design System. RTL Hebrew first. Follow item‑type color mapping. Quiet by default."*

---

*Generated 2026‑06‑03 for use with Claude Design (Anthropic Labs).*
