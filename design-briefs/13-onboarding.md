# Prototype Brief — Onboarding (4 steps) v2

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
- ALL numbers ≥ 14px: Fraunces weight 600 (week counts, course counts).
- Body + UI: Inter 400-700.

**Italic accent rule.** Each step uses one italic accent in its title:
- Step 1: `"ברוך הבא ל-<em>Calori Life</em>"`
- Step 2: `"אילו <em>קורסים</em> אתה לומד?"`
- Step 3: `"כלי <em>AI</em> לקורסים שלך"`
- Step 4: `"אילו משימות <em>שבועיות</em>?"`

## v2 Color tokens

- Canvas `#FAF7F2`. Surface `#FFFFFF`. Ink `#2A1A0A`. Ink-soft `#8A7A6A`.
- Hairlines `rgba(180,140,80,.14)`. Brand green `#059669` (CTA, active chip,
  progress dot). Forest deep `#065F46` (logo, hero illustration anchor).

## Goal
Set up name, courses, AI tools, weekly task templates — quickly.

## Shell
- 4‑dot progress indicator top.
- "דלג" (skip) trailing.
- Back chevron leading from step 2+.
- Primary green CTA full‑width bottom — "המשך" / "סיום" on last step.

## Steps

### 1. Welcome + name
- Hero illustration (abstract leaf + book + dumbbell).
- "ברוך הבא ל-Calori Life".
- Helper "איך לקרוא לך?"
- Name input (autofocus).

### 2. Pick courses
- Header "אילו קורסים אתה לומד?"
- Grid of preset course chips (toggle).
- "+ קורס אחר" inline add — opens a small modal: name + weeks; appears as a removable chip.

### 3. AI tools (owner only)
- Header "כלי AI לקורסים שלך".
- For each selected course: two link inputs (NotebookLM, Gemini).
- "דלג" available.

### 4. Weekly task templates
- Header "אילו משימות שבועיות?"
- Toggles: הרצאה · תרגול · שיעורי בית.
- "+ הוסף סוג משימה" — chips of custom types.
- Helper "המשימות יוחלו על כל הקורסים שבחרת".

## States
Default · Validation (name empty → submit disabled) · Loading on finish (creates Firestore docs) · Resume mid‑flow (deep link).

## Prompt
```
Design a 4-step Onboarding flow for Calori Life (Hebrew RTL).
Shell: 4-dot progress, Skip trailing, back chevron, bottom green CTA.
Step 1: Welcome + name input + hero illustration.
Step 2: Pick preset courses (toggle chip grid) + "+ Add other course" inline modal (name + weeks).
Step 3 (owner only): For each picked course, NotebookLM + Gemini link inputs.
Step 4: Weekly task templates — toggle Lecture/Tutorial/Homework + add custom types.
States: default, validation disabled CTA, loading finish, resume mid-flow.
Quiet by default. AA contrast.
```
