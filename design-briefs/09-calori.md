# Prototype Brief — Calori (READ‑ONLY bridge) v2

> Paste into a **Prototype** project in claude.ai/design.

> ⚠️ **This brief is v2.0 (warm cream + editorial serif). It supersedes any earlier description.**
>
> **Canonical visual references:**
> - Tokens: `tokens.json` v2
> - Master brief: `00-MASTER-BRIEF-EN.md`
> - Visual style + font system: `inst-4-calori.html`
> - Design system library: `bento-design-system.html`
>
> If a textual description below disagrees with the HTML files, **the HTML files win.**

---

## v2 Typography (three-font system)

- Headings + italic accents: Instrument Serif weight 400, italic for `<em>` in green.
- ALL numbers ≥ 14px: Fraunces weight 600, opsz 144, `-0.04em`.
  Big calorie hero number is also italic.
- Body + UI: Inter 400-700.

**Italic accent rule.** Examples here: `"היום · <em>רביעי</em>"`,
`"<em>398</em> קק\"ל"` (italic Fraunces),
section headers `"<em>ארוחות</em>"`, `"<em>אימונים</em>"`.

## v2 Color tokens

- Canvas `#FAF7F2`. Surface `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`.
- Brand green `#059669` (meal flood). Purple `#7C3AED` (workout flood).
- Forest deep `#065F46` (FAB, avatar, deep numerals on green-soft chips).

## Goal
See today's Calori (meals + workouts + score) inside Calori Life. Strictly read‑only.

## Layout
1. **Date navigator** — prev / "היום" pill / next + date label.
2. **Daily summary hero card** — `surface` card, padding 20:
   - Big calories number `text-34 bold` + "קק"ל" label.
   - Macro pills row: P (חלבון), C (פחמימה), F (שומן) with grams.
   - Nutrition score badge top‑trailing (e.g. "ציון 84 / 100"), color depends on score (>80 green, 60–80 amber, <60 red).
   - Workout summary line: "2 אימונים · 47 דק׳ · 320 קק"ל".
3. **Meals list** — section header "ארוחות"; rows flooded green (`nutrition.primary`), white text:
   - Category icon (breakfast/lunch/dinner/snack) leading.
   - Name + grams.
   - Calories trailing `text-18 semibold`.
4. **Workouts list** — section header "אימונים"; rows flooded purple (`fitness.primary`), white text:
   - Activity icon leading.
   - Name + duration.
   - Calories burned trailing.
5. **Deep link** — secondary button "פתח באפליקציית קלורי" at bottom.

## States
- Empty day → friendly illustration + "אין נתונים מקלורי להיום".
- Future day → "תחזית ריקה — תיכנס לקלורי כדי לתכנן".
- Loading → 1 summary skeleton + 3 meal skeletons.
- Calori not connected → CTA "חבר את חשבון קלורי".

## Rule
**No add/edit/delete affordances anywhere.** All write actions live in the Calori app.

## Prompt to paste into Claude Design
```
Design CaloriView for "Calori Life" v2 — a Hebrew-first (RTL),
editorial-warm READ-ONLY mirror of the Calori nutrition/fitness app.

VISUAL DIRECTION:
- Canvas #FAF7F2 (warm cream). Surfaces #FFFFFF. Ink #2A1A0A.
- Hairlines rgba(180,140,80,.14). ink-soft #8A7A6A.
- Brand green #059669 (meal flood, italic accents). Purple #7C3AED (workout flood).
  Forest deep #065F46 (FAB, avatar, deep numerals on soft chips).
- Three-font system: Instrument Serif (page title + section headers + date eyebrow
  with italic day, italic <em> in green), Fraunces weight 600 italic for big calorie
  number (-0.04em), Fraunces 600 non-italic for macro grams + score + workout numbers.
  Inter for body, meta lines, chip text. Hebrew → Rubik.
- Italic accent rule: "היום · <em>רביעי</em>", "<em>398</em> קק\"ל",
  "<em>ארוחות</em>", "<em>אימונים</em>".

LAYOUT (read-only — no add/edit/delete UI anywhere):
1) Date navigator: prev chevron · "היום" pill (white, hairline border) · next
   chevron · date label "<em>רביעי</em> · 4 יוני 2026" (Instrument Serif).
2) Daily summary hero card: white surface, radius 22, hairline border,
   shadow 0 4px 24px rgba(40,20,0,.07), 3px green top accent line
   (linear-gradient #065F46 → #059669 → #047857).
   - Huge calories number Fraunces 600 italic 48px, color #059669, "<em>398</em>"
     with "קק\"ל" 13px ink-soft below.
   - Macro pills row: P (חלבון), C (פחמימה), F (שומן) — each pill on green-soft
     #F0FDF4 with Fraunces grams in #065F46.
   - Nutrition score badge top-trailing — colored by score:
     >80 green #F0FDF4 bg + #065F46 text + "<em>84</em> / 100"
     60-80 amber #FFFBEB + #92400E text
     <60 red #FEF2F2 + #991B1B text
   - Workout summary line (Inter 13 ink-soft): "<em>2</em> אימונים · <em>47</em> דק׳ · <em>320</em> קק\"ל"
     (numbers in Fraunces inline).
3) Meals section: header Instrument Serif "<em>ארוחות</em>" 18px.
   Each row flooded #059669, white text, radius 14, padding 11/14:
   category icon leading (white on rgba(255,255,255,.18) chip) ·
   name Inter 13 weight 700 + grams Inter 11 rgba(255,255,255,.65) ·
   trailing calories Fraunces 600 italic 18px white.
4) Workouts section: header Instrument Serif "<em>אימונים</em>".
   Each row flooded #7C3AED, white text, same shape: activity icon, name+duration,
   trailing calories burned Fraunces 600 italic white.
5) Deep-link secondary button bottom: "פתח באפליקציית <em>קלורי</em>"
   — white surface, hairline border, ink text.

ITEM-TYPE COLORS (strict):
- Meal: #059669 flood, white text
- Workout: #7C3AED flood, white text
- (No exam/event types on this screen.)

CHROME:
- Header: avatar #065F46 + page title "<em>קלורי</em>" Instrument Serif 22px +
  wordmark "calori<em> life</em>".
- BottomNav: 4 items — המנהל האישי · בית · לימודים · פוקוס.
- No FAB on this screen (read-only).

States: default, empty day (Instrument Serif italic "אין נתונים <em>מקלורי</em>
להיום"), future-empty ("תחזית <em>ריקה</em> — תיכנס לקלורי לתכנן"),
loading (1 summary skeleton + 3 meal-row skeletons), not-connected
(CTA "חבר את <em>חשבון קלורי</em>" primary green).

Mobile 390×844 primary. AA contrast (white on #059669 = 4.52:1,
white on #7C3AED = 5.93:1). Spring motion 180-220ms.

DO NOT:
- Use #F5F5F7 or #1D1D1F or Heebo display or SF Pro for headings
- Use weight < 600 on any number ≥ 14px
- Add edit/delete/+ affordances (writes live in the Calori app only)
- Italicize body text (only headings + the hero calorie number + inline
  Fraunces accents inside headings)
- Add decorative gradients beyond the 3px hero top accent
```
