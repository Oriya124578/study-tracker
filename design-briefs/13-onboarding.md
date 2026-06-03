# Prototype Brief — Onboarding (4 steps)

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
