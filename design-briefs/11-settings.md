# Prototype Brief — Settings v2

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
- ALL numbers ≥ 14px: Fraunces weight 600. Version strings count as numbers.
- Body + UI: Inter 400-700. Row labels are Inter.
- Section headers: Inter 11 weight 700 uppercase with 0.12em tracking, ink-soft `#8A7A6A`.

**Italic accent rule.** Page title: `"<em>הגדרות</em>"`. Confirmation sheet titles
get italic accents too (e.g. `"להתנתק <em>מהחשבון</em>?"`).

## v2 Color tokens

- Canvas `#FAF7F2`. Surface `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`. Brand green `#059669` (toggles, active segmented thumb).
  Forest deep `#065F46` (FAB, avatar). Danger `#DC2626`.

## Goal
Standard, calm, grouped iOS‑style settings.

## Layout
Grouped list on canvas. Section headers in Inter 11 weight 700, uppercase, 0.12em tracking, ink-soft.
Each group: white surface card, radius 16, hairline border, no inner shadow.
Rows: 44px min, padding `12px 14px`, divided by 1px `rgba(180,140,80,.10)` between rows.

- **Profile** — avatar + name + email row → opens edit.
- **Notifications** — switches for tasks/events/exams reminders + time window.
- **Language** — HE / EN segmented.
- **Theme** — Light / Dark / Auto segmented.
- **Connected services** — Firebase status row, Calori bridge status row (with connect/disconnect).
- **Data** — Export · Import · Clear cache.
- **About** — version, build, links to policy / terms.
- **Sign out** — destructive row, danger color.

## States
Default · Sign‑out confirmation sheet · Connection error pill · Theme live preview.

## Prompt to paste into Claude Design
```
Design Settings for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm, iOS-style grouped settings list.

VISUAL DIRECTION:
- Canvas #FAF7F2 (warm cream). Surfaces #FFFFFF. Ink #2A1A0A.
- Hairlines rgba(180,140,80,.14). ink-soft #8A7A6A.
- Brand green #059669 (toggles ON, segmented active thumb, primary CTA).
  Forest deep #065F46 (FAB, avatar). Danger #DC2626 (sign-out, destructive rows).
- Three-font system: Instrument Serif (page title + italic <em> accents in green),
  Fraunces weight 600 (any number ≥ 14px — version, build, counts, time-window
  values), Inter (section headers uppercase 0.12em ink-soft, row labels, meta).
  Hebrew → Rubik.
- Italic accent rule: page title "<em>הגדרות</em>", confirmation sheet
  "להתנתק <em>מהחשבון</em>?".

LAYOUT (grouped list on canvas, groups are white surface cards radius 16
with hairline border, rows separated by inner 1px rgba(180,140,80,.10)):
- Section header (above each group): Inter 11 weight 700 uppercase tracking 0.12em,
  ink-soft, padding-inline 14px.
- Row anatomy: 44px min height, leading icon chip (24×24 in a soft-tinted bg
  per category — green-soft for nutrition, purple-soft for focus, neutral for
  generic), label Inter 14 ink, trailing meta Inter 13 ink-soft + chevron 16px.

GROUPS:
1) Profile — avatar #065F46 32×32 + name Inter 16 weight 600 + email ink-soft
   → tap opens edit sheet.
2) Notifications — switches (track #059669 when ON) for tasks/events/exams
   reminders + a time-window picker row with Fraunces "<em>08</em>:00 — <em>22</em>:00".
3) Language — HE / EN segmented (active thumb white on green #059669 bg,
   inactive ink-soft).
4) Theme — Light / Dark / Auto segmented. Live preview swatch row above.
5) Connected services — Firebase status row (green dot + "מחובר") +
   Calori bridge status row with connect/disconnect button.
6) Data — Export · Import · Clear cache (Inter rows + chevron).
7) About — Version "<em>6.5.0</em>" + build number (Fraunces for numerals),
   links to policy / terms.
8) Sign out — destructive row: leading icon in red-soft #FEF2F2 bg,
   label "התנתק" Inter 14 weight 600 in #DC2626.

ITEM-TYPE COLOR REMINDER (for connected-service status pills):
- Connected: green-soft #F0FDF4 bg + #065F46 text.
- Disconnected: ink-soft.
- Error: #FEF2F2 bg + #991B1B text.

CHROME:
- Header: avatar #065F46 + page title "<em>הגדרות</em>" Instrument Serif 22px
  + wordmark "calori<em> life</em>".
- BottomNav: 4 items — המנהל האישי · בית · לימודים · פוקוס.
- FAB: 52×52 #065F46, white +, shadow rgba(6,95,70,.35), bottom-left.
  (FAB still shown for consistency with rest of app, though Settings rarely uses it.)

States: default, sign-out confirmation sheet (Instrument Serif title
"להתנתק <em>מהחשבון</em>?" + danger CTA + cancel ghost), connection error pill,
theme live preview, dark mode.

Mobile 390×844 primary. AA contrast. Spring motion 180-220ms.

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on any number ≥ 14px (version, time, etc.)
- Italicize row labels or section headers (only page title + confirmation titles)
- Add decorative gradients
```
