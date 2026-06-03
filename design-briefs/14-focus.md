# Prototype Brief — Focus Hub

> Paste into a **Prototype** project in claude.ai/design.
> Target: **390×844 mobile** primary, **1280 desktop** secondary.

> ⚠️ **This brief reflects the live implementation in `src/components/focus/FocusHub.jsx`.**
> Focus is a new primary tab in BottomNav (4th item, `<Target>` icon). It wraps the Pomodoro timer in an inline container.

---

## Goal
A dedicated, distraction-free space for deep work sessions. The user opens the Focus tab when they want to start a study sprint — no clutter, no other content.

## Audience
Hebrew-speaking BSc year-1 student in a study session. Wants to start a timer and forget the rest of the UI exists.

---

## Layout — strict order (top → bottom)

### Container
- `max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-8`
- Entrance motion: `animate-in fade-in slide-in-from-bottom-4 duration-500`
- RTL-aware (`dir={isRTL ? 'rtl' : 'ltr'}`).

### Section 1 — Hub header (compact, two lines)
- `<h1>` — `text-2xl font-black tracking-tight text-foreground`. Text: **"פוקוס"** (`navFocus`).
- Subtitle — `text-sm text-muted-foreground mt-1`. Text: **"זמן להתרכז במשימות שלך ולעבוד בשיטת פומודורו"** (`focusDesc`).
- No avatar, no chips, no decorations. The page title in the app header above already shows "פוקוס" with the brand gradient.

### Section 2 — Pomodoro card (the main content)
- Wrapper card: `bg-card border border-border rounded-2xl p-4 shadow-sm overflow-hidden relative`.
- Contains the **PomodoroTimer component in inline mode** (`<PomodoroTimer inline={true} />`).
- This is the entire body of the Focus tab.

#### What PomodoroTimer (inline) shows
Refer to `10-pomodoro.md` for the full timer spec. In inline mode:
- Big circular ring timer (260px), purple progress ring, large numerals (`25:00`).
- Phase chip below the timer: **focus · short break · long break**.
- Optional course chip — tap to attach the session to a course.
- Controls row: **Start/Pause** primary green (large) · **Reset** secondary · **Skip** ghost.
- Bottom mini-card: today's sessions count, focus minutes, longest streak.

---

## States to design
- **Idle** — timer at "25:00", Start button primary, no streak yet.
- **Running** — ring filling, Pause button replaces Start, course chip pulses.
- **Paused** — ring frozen, Resume button + Reset button highlighted.
- **Phase change** — soft toast slides down from the top: "כל הכבוד! זמן להפסקה קצרה" + chime.
- **Completed session** — brief confetti micro-anim in purple+green, streak number increments with spring.
- **No course attached** — course chip shows ghost outline + "צרף קורס" hint.
- **Dark mode** — full mirror.

## Motion
- Page entrance: 500ms fade + slide-from-bottom.
- Ring fill: smooth `transition-all duration-1000 ease-out`.
- Phase change toast: spring 200ms.
- Confetti: 1.2s duration, 12-16 dots in primary green + fitness purple.

## Accessibility
- `<h1>` is the page title for screen readers.
- Start/Pause is a single button with dynamic `aria-label` ("התחל סבב" / "השהה סבב").
- Timer numerals: `role="timer"` with `aria-live="polite"`.
- 44px min touch targets on all controls.

## RTL
- Logical props throughout.
- Controls row centers naturally — no flip needed for icons (timer icons are bidirectional).

---

## Sample data to include in the prototype

```
Phase: focus (25:00)
State: idle
Course attached: אינפי 2 (info-blue)
Today: 0 sessions · 0 דקות · streak 0
```

---

## Prompt to paste into Claude Design

```
Design the Focus Hub for "Calori Life" — a Hebrew-first (RTL),
iOS-inspired student life manager.

Use the Calori Life Design System tokens (see master brief & tokens.json).

This is one of the 4 primary tabs in BottomNav (Target icon).
It is a SINGLE-PURPOSE screen: just a header and the Pomodoro timer.

Layout, top → bottom:

1) Hub header (compact):
   - h1 "פוקוס" — text-2xl font-black tracking-tight.
   - Subtitle "זמן להתרכז במשימות שלך ולעבוד בשיטת פומודורו" — text-sm muted.
   - No chips, no decorations.

2) Pomodoro card — bg-card border border-border rounded-2xl p-4 shadow-sm.
   Inside: the inline Pomodoro timer with:
   - Big 260px circular timer with purple progress ring.
   - Large numerals "25:00".
   - Phase chip (focus / short break / long break).
   - Optional course chip with colored stripe.
   - Controls: Start/Pause (primary green large), Reset, Skip.
   - Bottom mini-card with today's session count, focus minutes, streak.

App chrome (already exists, do not redesign):
- Top sticky header with avatar button (start), gradient page title "פוקוס"
  (center), and a LARGE "calori life" wordmark on the end (text-2xl, no logo card).
- Bottom sticky nav with EXACTLY 4 items: המנהל האישי (Bot) · בית (Home) ·
  לימודים (BookOpen) · פוקוס (Target, active).
- Floating FAB at fixed bottom-right (Plus icon, rotates 135° on open).

Mobile 390×844 primary. Quiet by default; color is information.
Include states: idle, running, paused, phase-change toast, completed
celebration, dark mode.
Spring motion 180–220ms. 44px min touch targets. AA contrast.
Use Hebrew sample data.
```
