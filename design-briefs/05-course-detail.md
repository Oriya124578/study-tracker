# Prototype Brief — CourseDetail v2

> Paste into a **Prototype** project in claude.ai/design.

> ⚠️ **This brief is v2.0 (warm cream + editorial serif). It supersedes any earlier description.**
>
> **Canonical visual references:**
> - Tokens: `tokens.json` v2
> - Master brief: `00-MASTER-BRIEF-EN.md`
> - Visual style + font system: `inst-2-studies.html` (use as general font/color reference)
> - Design system library: `bento-design-system.html`
>
> If a textual description below disagrees with the HTML files, **the HTML files win.**

---

## v2 Typography (three-font system)

- Headings + italic accents: `'Instrument Serif', 'Rubik', serif` (weight 400, italic for `<em>`).
- ALL numbers ≥ 14px: `'Fraunces', 'Rubik', serif` (weight 600, opsz 144, `-0.04em`).
- Body + UI: `'Inter', 'Rubik', sans-serif` (400-700).

**Italic accent rule.** Examples here: course name itself gets the italic accent
treatment — e.g. `"אינפי <em>2</em>"`, `"שבוע <em>7</em>"`,
`"תרגיל בית <em>4</em>"`.

## v2 Color tokens

- Canvas `#FAF7F2`. Surface `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`. Brand green `#059669` / forest deep `#065F46`.

## Goal
Everything for a single course: meta, weekly tasks, files, notes, links.

## Layout
- **Hero** — back chevron · course name · color stripe.
- **Meta row** — lecturer · credits · schedule chips.
- **Tabs** — Overview · Weekly · Files · Notes · Links.

### Overview
- Big progress ring (overall course completion).
- Next deliverable card — "תרגיל בית 4 — להגיש עד 12.6".
- Quick stats: lectures attended, hw completed, pomodoro minutes.

### Weekly
- Week selector — horizontal scroll 1..N with current week pinned.
- Task templates per week: Lecture · Tutorial · Homework · Custom — each a round checkbox row.
- "סמן שבוע כהושלם" CTA.

### Files
- Folder tree (start side) + file list.
- Upload via drag‑drop or "+ העלאת קובץ" button.
- Thumbnails for images/PDFs (PDFs → first page).
- File row: icon · name · size · uploaded date · overflow menu.

### Notes
- Rich text editor, autosave indicator top‑right ("נשמר עכשיו").

### Links
- Pill list: NotebookLM · Gemini · Moodle · Lecturer email · Custom.
- "+ הוסף קישור" inline.

## States
Course with 0 weekly tasks (empty checklist) · file upload progress (linear bar) · file upload error · note autosaving · long content scroll.

## Prompt to paste into Claude Design
```
Design CourseDetail for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm student life manager.

VISUAL DIRECTION:
- Canvas #FAF7F2 (warm cream). Surfaces #FFFFFF. Ink #2A1A0A.
- Hairlines rgba(180,140,80,.14). ink-soft #8A7A6A.
- Brand green #059669 (italic accents, progress fill, primary chips, CTA).
  Forest deep #065F46 (FAB, avatar).
- Three-font system: Instrument Serif (course name, section titles, italic
  accents in green), Fraunces weight 600 (ALL numbers ≥ 14px,
  -0.04em — week numbers, percentages, file sizes, credit counts), Inter (body/UI).
  Hebrew → Rubik.
- Italic accents: "אינפי <em>2</em>", "שבוע <em>7</em>",
  "תרגיל בית <em>4</em>", "<em>12</em> קבצים".

LAYOUT:
- Hero (top): back chevron (leading) · course name "אינפי <em>2</em>"
  Instrument Serif 24px · 4px colored stripe on the leading side (course accent).
- Meta row: lecturer · credits (Fraunces numbers) · schedule chips
  (white pill, hairline border, Inter 12px).
- Tabs (sticky, sliding green underline): Overview · Weekly · Files · Notes · Links.

OVERVIEW TAB:
- Big progress ring (Fraunces 600 center number for % completion).
- Next deliverable card — white surface, radius 18, hairline border:
  Instrument Serif "תרגיל בית <em>4</em>", subtext "להגיש עד 12.6"
  with Fraunces for the date.
- Quick stats row (3 mini cards): lectures attended, HW completed, pomodoro minutes.
  Each card: Fraunces 600 number (24px), Inter 10px label, ink-soft.

WEEKLY TAB:
- Week selector: horizontal scroll, current week pinned, each pill
  with Fraunces number "שבוע <em>7</em>".
- Task templates per week: Lecture / Tutorial / Homework / Custom — each
  a round 22px checkbox row, title in Inter 16, due chip on the trailing side.
- "סמן שבוע <em>כהושלם</em>" CTA — primary #059669 button.

FILES TAB:
- Folder tree (leading side) + file list.
- Upload: drag-drop zone or "+ העלאת קובץ" button (white, hairline border).
- Thumbnails for images/PDFs (PDFs → first page).
- File row: icon · name (Inter 14) · size (Fraunces 13) · uploaded date · overflow menu.

NOTES TAB:
- Rich text editor on white surface, radius 18, hairline border.
- Autosave indicator top-trailing: "נשמר עכשיו" Inter 11px ink-soft.

LINKS TAB:
- Pill list (white pills with hairline border):
  NotebookLM · Gemini · Moodle · Lecturer email · Custom.
- "+ הוסף קישור" inline at the end of the list.

ITEM-TYPE COLORS (when shown):
- Meal: #059669 flood, white text
- Workout: #7C3AED flood, white text
- Exam: #FEF2F2 bg + #EF4444 border + #991B1B text
- Study event: #EFF6FF bg + #2563EB border + #1E40AF text
- Note: #FFFBEB bg + #D97706 border + #92400E text

CHROME:
- Header: avatar #065F46 + page title + "calori<em> life</em>" wordmark.
- BottomNav: 4 items — המנהל האישי · בית · לימודים (active) · פוקוס.
- FAB: 52×52 #065F46, white +, shadow rgba(6,95,70,.35), bottom-left.

Mobile 390×844 primary. AA contrast. Spring motion 180-220ms.

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on any number ≥ 14px
- Italicize body text (only headings and stat hero numbers)
- Add decorative gradients (only allowed: 3px green top accent on hero cards)
```
