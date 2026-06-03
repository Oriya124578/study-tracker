# Prototype Brief — Calori (READ‑ONLY bridge)

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

## Prompt
```
Design CaloriView for Calori Life (Hebrew RTL) — READ-ONLY mirror of the Calori nutrition/fitness app.
Top: date navigator (prev / "Today" pill / next + date).
Hero "daily summary" card: huge calories number, P/C/F macro pills, nutrition-score badge (green/amber/red), small workouts summary line.
Then a "Meals" section: rows flooded green #059669 with white text — category icon, name+grams, trailing calories.
Then a "Workouts" section: rows flooded purple #7C3AED with white text — activity icon, name+duration, trailing calories burned.
Bottom secondary button "Open in Calori app".
States: default, empty, future-empty, loading, not-connected.
No add/edit affordances. Quiet elsewhere; floods only on meal/workout rows. AA contrast.
```
