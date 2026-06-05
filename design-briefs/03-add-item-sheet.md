# Prototype Brief — AddItemSheet (FAB) v2

> Paste into a **Prototype** project in claude.ai/design.

> ⚠️ **This brief is v2.0 (warm cream + editorial serif). It supersedes any earlier description.**
>
> **Canonical visual references:**
> - Tokens: `tokens.json` v2
> - Master brief: `00-MASTER-BRIEF-EN.md`
> - Visual style + font system: `inst-2-studies.html`
> - Design system library: `bento-design-system.html`
>
> If a textual description below disagrees with the HTML files, **the HTML files win.**

---

## v2 Typography (three-font system)

- Headings + italic accents: `'Instrument Serif', 'Rubik', serif` (weight 400, italic for `<em>`).
- ALL numbers ≥ 14px: `'Fraunces', 'Rubik', serif` (weight 600, opsz 144, `-0.04em`).
- Body + UI: `'Inter', 'Rubik', sans-serif` (400-700).
- Hebrew falls back to Rubik in every stack.

**Italic accent rule.** Every heading contains 1-2 italic `<em>` words in green (`#059669`).
Examples on this screen: `"הוספת <em>פריט</em>"`, tab labels stay in Inter (UI text — not italicized).

## v2 Color tokens

- Canvas `#FAF7F2`. Surface `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`. Brand green `#059669` / forest deep `#065F46`.
- Greens-soft `#F0FDF4` / `#ECFDF5`. Purples-soft `#F3EFFB`.

## Goal
Capture any personal item in under 10 seconds without leaving context.

## Layout
- **Bottom sheet** 92vh, scrim `rgba(0,0,0,.4)`, drag handle 36×4 hairline.
- **Header** — Cancel (leading) · "הוספת פריט" title · Save (trailing, primary green).
- **Tabs** — Event · Task · Note (segmented, sliding green underline).
- **Tab content** — scrollable form.
- **Footer (mobile)** — sticky Save button full‑width.

## Event tab
- Title input (large, autofocus).
- Date · Start time · End time (two‑column on tablet+).
- All‑day toggle.
- Course picker (optional, shows colored chip after select).
- Location input.
- Color auto‑derived from course/type; small swatch shows the picked color.

## Task tab
- Title input (autofocus).
- Priority segmented (Low · Med · High) — color dot updates live.
- Due date chips (היום · מחר · בחר תאריך) + custom date picker.
- Course picker (optional).
- Subtasks — inline list, "+ הוסף תת‑משימה" appends a new row.

## Note tab
- Title (optional).
- Content multi‑line (min 120 height).
- Color swatches × 6 — pastel circles.
- Pin toggle (switch).

## States
Default · Loading save · Validation error (red helper text under field) · Conflict warning if event overlaps existing one · Past date warning · Success → sheet closes + toast.

## Motion
- Sheet enters with spring (stiffness 380, damping 32).
- Tab change → underline slides 180ms + content crossfades 140ms.
- Save button morphs to spinner 180ms.

## A11y
- `role="dialog" aria-modal="true"` + focus trap on the sheet.
- Tabs `role="tablist"`, each `role="tab" aria-controls`.
- Esc / swipe‑down closes.
- Save button disabled until required fields valid; reason in `aria-describedby`.

## RTL
- All paddings logical; trailing actions on the leading side in RTL.
- Segmented underline animates from current tab to next in correct direction.

## Prompt to paste into Claude Design
```
Design AddItemSheet for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm student life manager.

VISUAL DIRECTION:
- Canvas behind scrim #FAF7F2. Sheet surface #FFFFFF, radius 22px on top corners.
- Ink #2A1A0A. ink-soft #8A7A6A. Hairlines rgba(180,140,80,.14).
- Brand green #059669 (Save CTA, active tab underline, primary chip).
  Forest deep #065F46 (header avatar/wordmark mark).
- Three-font system: Instrument Serif (sheet title "הוספת <em>פריט</em>" 22px),
  Fraunces weight 600 (date/time numerals ≥ 14px, -0.04em),
  Inter (form labels, tab labels, input text, helper text). Hebrew → Rubik.
- Italic accent rule: header title only — never italicize tab labels or field labels.

LAYOUT:
- Bottom sheet, 92vh, scrim rgba(0,0,0,.4), drag handle 36×4 with hairline color.
- Header row: Cancel ghost (leading) · "הוספת <em>פריט</em>" Instrument Serif (center)
  · Save primary #059669 (trailing).
- Segmented tabs with sliding green #059669 underline 2px: Event · Task · Note.
- Scrollable form per tab.
- Sticky Save full-width #059669 button at bottom on mobile (shadow rgba(5,150,105,.28)).

EVENT TAB:
- Large title input (Instrument Serif 22px placeholder, autofocus).
- Date · Start time · End time fields (Fraunces 600 for the time/date numerals).
- All-day toggle.
- Course picker (optional, shows colored chip with the course's accent stripe).
- Location input.

TASK TAB:
- Large title input (autofocus).
- Priority segmented (Low · Med · High) — round colored dot updates live
  (red high / amber med / gray low).
- Due chips: היום · מחר · בחר תאריך + custom date picker (Fraunces numerals).
- Course picker (optional).
- Inline subtasks list, "+ הוסף תת-משימה" appends a row.

NOTE TAB:
- Title (optional).
- Multiline content (min 120px height).
- 6 pastel color swatches (warm pastels — cream, peach, blush, lavender, mint, sky)
  selected swatch shows ring with brand green.
- Pin toggle (switch with #059669 active track).

ITEM-TYPE COLORS (the dot/swatch that previews the saved item):
- Meal: #059669 flood
- Workout: #7C3AED flood
- Exam: #FEF2F2 bg + #EF4444 border + #991B1B text
- Study event: #EFF6FF bg + #2563EB border + #1E40AF text
- Personal event: white + hairline border + ink
- Note: #FFFBEB bg + #D97706 border + #92400E text

States: default, validation error (red helper text), overlap warning (amber inline),
save loading (button morphs to spinner 180ms), success toast → sheet closes.

Mobile 390×844 primary. AA contrast. Spring motion 180-220ms.
Focus trap on the sheet; role="dialog" aria-modal="true".

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on any number ≥ 14px
- Italicize body text or tab labels (only the sheet title)
- Add decorative gradients
```
