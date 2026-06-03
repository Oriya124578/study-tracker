# Prototype Brief — Auth (AuthView)

## Goal
Smooth Hebrew‑first sign‑in / sign‑up.

## Layout
- Centered card on `canvas`, max‑width 360.
- Logo top (Calori Life leaf monogram).
- Tagline `text-14 ink-soft` — "היום שלך, במקום אחד".
- Segmented "התחברות / הרשמה".
- Email input (RTL email handled).
- Password input with show/hide toggle (eye icon).
- Primary green button — "התחבר" / "הרשם".
- Divider "או".
- Secondary full‑width button — Google (logo + "המשך עם Google").
- Footer text — "שכחת סיסמה?" link (leading), "אין לך חשבון?" toggle (trailing) — swaps to opposite tab.

## States
Default · Loading on submit (button spinner) · Inline field errors (red helper) · Top toast on server error · Google flow cancelled (toast).

## Prompt
```
Design AuthView for Calori Life (Hebrew RTL).
Centered card on canvas. Logo top + tagline "Your day, in one place".
Segmented "Sign in / Sign up".
Email + password (with show/hide eye), primary green submit button.
"or" divider, then full-width Google button.
Footer: forgot-password link (leading), toggle to other mode (trailing).
States: default, loading submit, field error, server error toast, dark mode.
Quiet by default. Spring tap motion. AA contrast.
```
