# Prototype Brief — Auth (AuthView) v2

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
- Body + UI: Inter 400-700.

**Italic accent rule.** Tagline reads `"היום שלך, ב<em>מקום אחד</em>"`. The
wordmark on the logo follows the app-wide pattern: `calori` Inter bold +
`<em> life</em>` Instrument Serif italic green.

## v2 Color tokens

- Canvas `#FAF7F2`. Surface `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`. Brand green `#059669` (primary CTA, active segmented thumb).
  Forest deep `#065F46` (logo leaf monogram). Danger `#DC2626`.

## Goal
Smooth Hebrew‑first sign‑in / sign‑up.

## Layout
- Centered card on canvas `#FAF7F2`, max‑width 360.
- Card surface `#FFFFFF`, radius 22px, border 1px `rgba(180,140,80,.14)`,
  shadow `0 4px 24px rgba(40,20,0,.07)`, padding 28.
- Logo top: 56×56 forest-deep `#065F46` rounded square with a white leaf
  monogram inside.
- Wordmark below logo: `calori` Inter 700 + `<em> life</em>` Instrument Serif
  italic green `#059669`.
- Tagline Inter 14 ink-soft: `"היום שלך, ב<em>מקום אחד</em>"` (the italic
  fragment in Instrument Serif italic green).
- Segmented control: "התחברות / <em>הרשמה</em>" — active thumb white on
  `#059669` background, inactive ink-soft.
- Email input: white surface, hairline border, radius 12, Inter 14 ink.
- Password input with show/hide eye icon (ink-soft, tap toggles).
- Primary CTA full-width: bg `#059669`, white label Inter 15 weight 700,
  radius 14, shadow `0 4px 16px rgba(5,150,105,.28)` — "התחבר" / "הרשם".
- Divider "או" with hairline lines on both sides.
- Google button full-width: white surface, hairline border, radius 14,
  Google logo + "המשך עם Google" Inter 14.
- Footer row: "שכחת <em>סיסמה</em>?" link in green (leading),
  "אין לך חשבון? <em>הרשם</em>" toggle (trailing).

## States
Default · Loading on submit (button spinner) · Inline field errors (red helper) · Top toast on server error · Google flow cancelled (toast).

## Prompt to paste into Claude Design
```
Design AuthView for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm sign-in / sign-up surface. No bottom-nav, no FAB on this screen.

VISUAL DIRECTION:
- Canvas #FAF7F2 (warm cream) full-bleed.
- Centered card: surface #FFFFFF, radius 22, border 1px rgba(180,140,80,.14),
  shadow 0 4px 24px rgba(40,20,0,.07), max-width 360, padding 28.
- Ink #2A1A0A. ink-soft #8A7A6A. Hairlines rgba(180,140,80,.14).
- Brand green #059669 (CTA, italic accents, segmented active). Forest deep
  #065F46 (logo monogram square). Danger #DC2626 (field errors).
- Three-font system: Instrument Serif (wordmark italic part + tagline italic
  fragment + section emphases in green), Fraunces weight 600 (any number ≥ 14px
  e.g. validation rules with character counts), Inter (segmented, inputs, CTA,
  body, links). Hebrew → Rubik.
- Italic accent rule: wordmark "calori<em> life</em>", tagline
  "היום שלך, ב<em>מקום אחד</em>", segmented "התחברות / <em>הרשמה</em>",
  forgot-link "שכחת <em>סיסמה</em>?".

LAYOUT (top → bottom inside the centered card):
- 56×56 forest-deep #065F46 rounded square logo with a white leaf monogram.
- Wordmark "calori" Inter bold + "<em> life</em>" Instrument Serif italic green.
- Tagline Inter 14 ink-soft with italic green fragment.
- Segmented control with sliding green thumb.
- Email input (white, hairline border, radius 12, ink, placeholder ink-soft).
- Password input with show/hide eye icon trailing.
- Primary CTA full-width green #059669, white label, radius 14,
  shadow 0 4px 16px rgba(5,150,105,.28).
- "או" divider (Inter ink-soft + hairline lines).
- Google button full-width white + hairline border + Google logo + label.
- Footer row: forgot-link in green (leading), toggle to other mode (trailing).

States: default, loading submit (CTA morphs to spinner 180ms),
field error (1px #DC2626 border + red helper text below the field),
server error toast (slides from top, #FEF2F2 bg + #991B1B text + #EF4444 border),
Google flow cancelled toast (neutral hairline), dark mode (canvas #1A140E,
card #241B12, ink #FAF7F2).

Centered on viewport, no bottom-nav, no FAB. AA contrast.
Mobile 390×844 primary. Spring tap motion 180ms.

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on any number ≥ 14px
- Italicize input labels or the CTA text (only headings + the italic accent fragments)
- Add decorative gradients
```
