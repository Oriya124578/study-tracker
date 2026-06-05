# Prototype Brief — Calendar (CalendarView) v2

> Paste into a Prototype project. Target 390×844 mobile + 1280 desktop. 5 view modes.

> ⚠️ **This brief is v2.0 (warm cream + editorial serif). It supersedes any earlier description.**
>
> **Canonical visual references:**
> - Tokens: `tokens.json` v2
> - Master brief: `00-MASTER-BRIEF-EN.md`
> - Visual style + font system: `inst-1-calendar.html`
> - Design system library: `bento-design-system.html`
>
> If a textual description below disagrees with the HTML files, **the HTML files win.**

---

## v2 Typography (three-font system)

- Headings + italic accents: `'Instrument Serif', 'Rubik', serif` (weight 400, italic for `<em>`).
- ALL numbers ≥ 14px: `'Fraunces', 'Rubik', serif` (weight 600, opsz 144, `letter-spacing: -0.04em`).
- Body + UI: `'Inter', 'Rubik', sans-serif` (400-700).
- Hebrew falls back to Rubik in every stack.

**Italic accent rule** — every Instrument Serif heading contains 1-2 italic `<em>` words in green (`#059669`).
Examples on this screen: `"יוני <em>2026</em>"`, `"היום · <em>רביעי</em>"`, `"שבוע <em>23</em>"`.
Never italicize body text.

## v2 Color tokens

- Canvas `#FAF7F2` (warm cream). Surfaces `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`.
- Brand green `#059669` (italic accents, CTAs, today circle). Forest deep `#065F46` (FAB, avatar).
- Greens-soft: `#F0FDF4` / `#ECFDF5`. Purples-soft: `#F3EFFB`.

## Goal
See everything (study + personal + calori) on a real calendar, switch fluidly between day/3‑day/week/month/list.

## Layout
1. **Top bar** — title "לוח שנה" + segmented control (Day · 3‑Day · Week · Month · List).
2. **Date navigator** — prev chevron · "היום" pill · next chevron · trailing month label.
3. **Grid area** — view‑specific.
4. **FAB +** — pre‑filled date when opening AddItemSheet.

## View specs

### Day
- Vertical time rail 06:00 → 24:00, 1 hour = 64px.
- Items as colored blocks anchored to start/end time. Multi‑hour blocks show title + meta.
- "Now" indicator — horizontal 1px `danger` line + 8px dot at the leading edge.
- All‑day banner row above the rail.

### 3‑Day
- 3 columns equal width, shared time rail on the leading side.
- Headers show day name + date.
- Today column has subtle green tint background `nutrition.soft @ 30%`.

### Week
- 7 columns, condensed; items render as 1‑line chips with color + start time.
- Tap a column → switches to Day view focused on that date.

### Month
- 6‑row × 7‑col grid; week starts Sunday.
- Each cell shows up to 3 colored dots (max per type/day); "+N" pill if more.
- Today cell has solid green circle behind date number.
- Tap a cell → Day view.

### List (agenda)
- Grouped by date, sticky day headers, infinite scroll forward 60 days.
- Each item = ListRow with color chip + title + time + meta.

## Item color mapping (v2, strict)
- **Meal** (Calori): `#059669` flood, white text.
- **Workout** (Calori): `#7C3AED` flood, white text.
- **Exam reminder card**: bg `#FEF2F2` + 1px border `#EF4444` + text `#991B1B`.
- **Active exam block (in calendar grid only)**: `#EF4444` flood, white text.
- **Study event (lecture/tutorial)**: bg `#EFF6FF` + 1px border `#2563EB` + text `#1E40AF`.
- **Personal event**: `#FFFFFF` + 1px hairline border `rgba(180,140,80,.14)` + ink `#2A1A0A` text.
- **Note**: bg `#FFFBEB` + 1px border `#D97706` + text `#92400E`.
- **Pomodoro**: white card + purple-soft icon chip (`#F3EFFB`).
- **Tasks**: white card + priority dot.
- **Empty slot**: dashed warm border `1.5px dashed rgba(180,140,80,.20)` + Instrument Serif italic placeholder (e.g. `"ריק · לחץ + להוסיף"`).
- **Today cell / today circle**: solid green `#059669` background behind the date numeral.

## States
- Loading skeleton (rail + 4 ghost blocks).
- Empty day → "אין אירועים — הוסף +".
- Past day full of completed items → muted opacity 70%.
- Today first paint → auto‑scroll to current hour − 1.
- Calori day data mismatch (caloriDate ≠ focused day) → calori items hidden.

## Motion
- View switch = 140ms crossfade + segmented thumb slide.
- Date navigator transitions slide 200ms horizontally (mirrored in RTL).
- Now indicator pulses subtly every 60s (2% opacity breathe).

## A11y
- Segmented control `role="tablist"`, each option `aria-selected`.
- Grid cells `<button aria-label="3 ביוני 2026, 2 אירועים">`.
- Items in day rail are `<article>` with full title + time read.

## RTL
- Time gutter on the right (start edge).
- Day view → "prev" chevron points right; week starts Sunday on the right.
- Month grid columns flow right‑to‑left.

## Prompt to paste into Claude Design
```
Design the unified Calendar for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm student life manager.

VISUAL DIRECTION:
- Canvas #FAF7F2 (warm cream). Surfaces #FFFFFF. Ink #2A1A0A.
- Hairlines rgba(180,140,80,.14). ink-soft #8A7A6A.
- Brand green #059669 (italic accents, CTA, today circle). Forest deep #065F46 (FAB, avatar).
- Three-font system: Instrument Serif (headings + italic accents in green),
  Fraunces weight 600 (ALL numbers ≥ 14px, -0.04em letter-spacing), Inter (body/UI).
  Hebrew → Rubik.
- Italic accent rule: every heading has 1-2 italic <em> words in green.
  Examples: "יוני <em>2026</em>", "היום · <em>רביעי</em>", "שבוע <em>23</em>".

LAYOUT:
5 views in one screen, switched by a segmented control with sliding green underline:
- Day (vertical time rail 06:00→24:00, 1h=64px, with colored blocks + "now" indicator
  = 1px red line + 8px dot at the leading edge). All-day banner above.
- 3-Day (3 equal columns + shared time rail; today column has subtle #F0FDF4 tint).
- Week (7 condensed columns; items render as 1-line chips with color + start time).
- Month (6×7 grid; up to 3 colored dots per cell + "+N" pill; today cell has solid
  green #059669 circle behind the date numeral).
- List/agenda (grouped by date, sticky day headers, infinite scroll forward 60 days).

ITEM-TYPE COLORS (strict):
- Meal: #059669 flood, white text
- Workout: #7C3AED flood, white text
- Active exam (calendar grid): #EF4444 flood, white text
- Exam reminder card: #FEF2F2 bg + #EF4444 border + #991B1B text
- Study event: #EFF6FF bg + #2563EB border + #1E40AF text
- Personal event: white + hairline border + ink
- Note: #FFFBEB bg + #D97706 border + #92400E text
- Empty slot: dashed warm border + Instrument Serif italic placeholder

CHROME:
- Header: avatar #065F46 + page title "לוח שנה" Instrument Serif 22px +
  wordmark "calori" Inter bold + "<em> life</em>" Instrument Serif italic green.
- BottomNav: 4 items — המנהל האישי · בית · לימודים · פוקוס.
- FAB: 52×52 #065F46, white +, shadow rgba(6,95,70,.35), bottom-left
  (visually bottom-right in RTL). Opens AddItemSheet with focused date pre-filled.

Mobile 390×844 primary. AA contrast. Spring motion 180-220ms.

Use Hebrew sample data: dates in יוני 2026, today = רביעי 4 יוני, item titles
in Hebrew (אינפי 2, ארוחת בוקר, ריצה).

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on any number ≥ 14px
- Italicize body text (only headings and stat hero numbers)
- Add decorative gradients (only allowed: 3px green top accent on hero cards)
```
