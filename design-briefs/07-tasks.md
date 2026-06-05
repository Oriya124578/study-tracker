# Prototype Brief — Tasks (Google Tasks style) v2

> Paste into a **Prototype** project in claude.ai/design.

> ⚠️ **This brief is v2.0 (warm cream + editorial serif). It supersedes any earlier description.**
>
> **Canonical visual references:**
> - Tokens: `tokens.json` v2
> - Master brief: `00-MASTER-BRIEF-EN.md`
> - Visual style + font system: `inst-3-tasks.html`
> - Design system library: `bento-design-system.html`
>
> If a textual description below disagrees with the HTML files, **the HTML files win.**

---

## v2 Typography (three-font system)

- Headings + italic accents: Instrument Serif weight 400, italic for `<em>` in green `#059669`.
- ALL numbers ≥ 14px: Fraunces weight 600, opsz 144, `-0.04em`.
- Body + UI: Inter 400-700.

**Italic accent rule.** Examples here: `"<em>משימות</em>"` page title,
`"היום · <em>4</em> פעולות"`, `"הושלמו <em>12</em>"`.

## v2 Color tokens

- Canvas `#FAF7F2`. Surface `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`. Brand green `#059669` / forest deep `#065F46`.

## Goal
Lightweight personal to‑dos with subtasks, due dates, priorities.

## Layout
1. **Quick‑add bar** — single input top, Enter saves; magic parse for "מחר 18:00 לקנות חלב".
2. **Active list** — rows with round checkbox · title · due chip · priority dot · expand caret.
3. **Completed (collapsible)** — gray, strike‑through; show last 10, "טען עוד".

## Row
- Checkbox 22 round.
- Title `text-16 medium`.
- Due chip — color‑coded (red if overdue, amber if today, neutral else).
- Priority dot — red high / amber med / gray low.
- Caret expands to subtasks indented 16 with smaller checkbox.

## Gestures
- Swipe leading → complete (green action background).
- Swipe trailing → delete (red action background).
- Drag handle to reorder.

## States
Empty ("הוסף משימה ראשונה") · loading skeleton (3 rows) · overdue items grouped on top · completed collapsed.

## Prompt to paste into Claude Design
```
Design Tasks view for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm, Google-Tasks-feel personal to-do list.

VISUAL DIRECTION:
- Canvas #FAF7F2 (warm cream). Surfaces #FFFFFF. Ink #2A1A0A.
- Hairlines rgba(180,140,80,.14). ink-soft #8A7A6A.
- Brand green #059669 (italic accents, completed checkbox fill, primary CTA).
  Forest deep #065F46 (FAB, avatar).
- Three-font system: Instrument Serif (page title + section headers +
  italic <em> accents in green), Fraunces weight 600 (counters ≥ 14px,
  -0.04em), Inter (task titles, body, chips). Hebrew → Rubik.
- Italic accent rule: "<em>משימות</em>" page title,
  "היום · <em>4</em> פעולות", "הושלמו <em>12</em>".

LAYOUT:
- Quick-add bar (top, sticky under header): white pill input, hairline border,
  Instrument Serif placeholder "הקלד משימה… (לדוגמה: <em>מחר 18:00 לקנות חלב</em>)".
  Magic-parse hints suggest a date/time chip preview as user types.
- "Active" section header: Instrument Serif "<em>פעיל</em>" + small counter
  Fraunces 600 in ink-soft.
- Task rows (white card-like rows, hairline border, radius 14):
  · Round 22px checkbox (leading), fills #059669 when checked
  · Title Inter 16, ink
  · Due chip on trailing side — color-coded:
    overdue → bg #FEF2F2 + text #991B1B
    today → bg #FFFBEB + text #92400E
    else → bg rgba(180,140,80,.06) + text #8A7A6A
    Numbers in chips use Fraunces.
  · Priority dot (red #EF4444 high / amber #D97706 med / gray #8A7A6A low)
  · Caret expands to subtasks indented 16px with smaller 18px checkboxes
- "Completed" collapsible section: header "הושלמו · <em>12</em>",
  rows muted opacity 0.55, strikethrough, ink-soft.

GESTURES:
- Swipe leading → complete (green action background #059669 with white check).
- Swipe trailing → delete (red action background #EF4444 with white trash).
- Drag handle (3-line icon) to reorder.

ITEM-TYPE COLORS (for task-attached items shown via chip):
- Course-linked task: shows course color stripe chip on leading edge
- Calori-related: green (#059669) or purple (#7C3AED) tinted chip
- Exam-prep task: red soft #FEF2F2 + #EF4444 border + #991B1B text

CHROME:
- Header: avatar #065F46 + page title "<em>משימות</em>" Instrument Serif 22px +
  wordmark "calori<em> life</em>".
- BottomNav: 4 items — המנהל האישי · בית · לימודים · פוקוס.
- FAB: 52×52 #065F46, white +, shadow rgba(6,95,70,.35), bottom-left.

States: empty ("הוסף משימה <em>ראשונה</em>"), loading skeleton (3 rows),
overdue grouped on top, completed collapsed.

Mobile 390×844 primary. AA contrast. Spring motion 180-220ms.

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on any number ≥ 14px
- Italicize task titles (only page header + section headers + counters)
- Add decorative gradients
```
