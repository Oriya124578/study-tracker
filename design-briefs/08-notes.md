# Prototype Brief — Notes v2

> Paste into a **Prototype** project in claude.ai/design.

> ⚠️ **This brief is v2.0 (warm cream + editorial serif). It supersedes any earlier description.**
>
> **Canonical visual references:**
> - Tokens: `tokens.json` v2
> - Master brief: `00-MASTER-BRIEF-EN.md`
> - Visual style + font system: `inst-2-studies.html` (use as general reference)
> - Design system library: `bento-design-system.html`
>
> If a textual description below disagrees with the HTML files, **the HTML files win.**

---

## v2 Typography (three-font system)

- Headings + italic accents: Instrument Serif weight 400, italic for `<em>` in green.
- ALL numbers ≥ 14px: Fraunces 600.
- Body + UI: Inter 400-700. Note titles also Inter (UI-flavored).

**Italic accent rule.** Examples: `"<em>מוצמדות</em>"` section header,
`"כל ה<em>פתקים</em>"`.

## v2 Color tokens

- Canvas `#FAF7F2`. Surface `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`. Brand green `#059669` / forest deep `#065F46`.
- Note swatch palette (warm, AA-verified on ink): cream `#FFFBEB`, peach `#FFE4D1`,
  blush `#FCE4EC`, lavender `#F3EFFB`, mint `#ECFDF5`, sky `#E0F2FE`.

## Goal
Apple‑Notes feel for quick captures.

## Layout
1. **Pinned section** — small header "מוצמדות" + cards.
2. **All notes** — 2‑column masonry grid, height varies by content.
3. **FAB +** — opens edit sheet.

## Card
- Background = chosen color (6 pastels): cream, peach, blush, lavender, mint, sky.
- Padding 16, radius 16.
- Title `text-16 semibold` (optional).
- Content preview (5 lines max, fade‑out gradient).
- Pin icon on the trailing‑top if pinned.
- Tap → edit sheet.

## Edit sheet
- Title input.
- Multi‑line content (large, 50vh min).
- 6 color swatch circles.
- Pin toggle switch.
- Delete (destructive, trailing).

## Contrast
All 6 colors verified AA with ink text.

## Prompt to paste into Claude Design
```
Design Notes for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm Apple-Notes-feel quick-capture surface.

VISUAL DIRECTION:
- Canvas #FAF7F2 (warm cream). Surfaces #FFFFFF. Ink #2A1A0A.
- Hairlines rgba(180,140,80,.14). ink-soft #8A7A6A.
- Brand green #059669 (italic section headers, pin-active, primary CTA).
  Forest deep #065F46 (FAB, avatar).
- Three-font system: Instrument Serif (page title + section headers +
  italic <em> accents in green), Fraunces 600 (any numbers ≥ 14px, e.g.
  pinned counter "<em>3</em> מוצמדות"), Inter (note title + body text).
  Hebrew → Rubik.
- Italic accent rule: "<em>מוצמדות</em>" / "כל ה<em>פתקים</em>".
  Note content itself stays in Inter — do NOT italicize note bodies.

LAYOUT:
- Optional "Pinned" section at top: Instrument Serif "<em>מוצמדות</em>"
  + Fraunces small counter, then a row of pinned cards.
- "All notes" section: Instrument Serif "כל ה<em>פתקים</em>",
  then 2-column masonry grid of colored cards (height varies by content).
- FAB + opens an edit bottom sheet.

CARD:
- Padding 16, radius 16, no shadow (warm pastel needs no extra weight).
- Background = one of 6 warm pastels (cream #FFFBEB · peach #FFE4D1 · blush #FCE4EC
  · lavender #F3EFFB · mint #ECFDF5 · sky #E0F2FE). 1px border in a slightly darker
  version of the same hue.
- Optional title in Inter 16 weight 700, ink #2A1A0A.
- Content preview Inter 14, ink, 5 lines max with bottom fade-out gradient
  matching the card bg.
- Pin icon on the trailing-top in green #059669 when pinned.
- Tap → edit bottom sheet.

EDIT SHEET:
- Bottom sheet 92vh, scrim rgba(0,0,0,.4), drag handle 36×4.
- Header: Cancel · "עריכת <em>פתק</em>" Instrument Serif 22px · Save (primary green).
- Title input (Inter 18, no border, ink placeholder ink-soft).
- Multiline content (50vh min, Inter 16).
- 6 color swatch circles row (selected swatch shows green #059669 ring).
- Pin toggle switch (active track #059669).
- Delete (destructive, trailing, text #DC2626).

ITEM-TYPE COLOR REMINDER (for cross-references):
- Meal: #059669 flood, white text
- Workout: #7C3AED flood, white text
- Exam: #FEF2F2 + #EF4444 border + #991B1B text
- Study event: #EFF6FF + #2563EB border + #1E40AF text
- Note (this surface): warm pastel bg + 1px hue-darker border + ink

CHROME:
- Header: avatar #065F46 + page title + "calori<em> life</em>" wordmark.
- BottomNav: 4 items — המנהל האישי · בית · לימודים · פוקוס.
- FAB: 52×52 #065F46, white +, shadow rgba(6,95,70,.35), bottom-left.

States: empty (Instrument Serif italic "אין <em>פתקים</em> עדיין"),
loading skeleton (4 ghost cards), dark mode (cards keep hue but darker).

Mobile 390×844 primary. AA contrast on every swatch with ink text.
Spring motion 180-220ms.

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on any number ≥ 14px
- Italicize note content (only page/section headers)
- Use shadows on the pastel cards (the hue is the visual weight)
```
