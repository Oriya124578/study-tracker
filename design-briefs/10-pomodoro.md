# Prototype Brief — Pomodoro

## Goal
Calm focus timer with course context.

## Layout
- **Big circular timer** 260px, purple progress ring (`fitness.primary`), inner large numerals "25:00" `text-34 bold`.
- **Phase chip** under timer: focus · short break · long break.
- **Course chip** (optional) — tap to attach the session to a course; shows colored stripe + name.
- **Controls** — Start/Pause primary (green, large) · Reset secondary · Skip ghost.
- **Today summary** — bottom card: sessions completed, focus minutes, longest streak.

## States
Idle · Running · Paused · Phase change (toast + chime) · Completed session (celebration micro‑anim) · No course attached.

## Feedback
- Phase change: soft chime + medium haptic.
- Last 10s: ring color saturates slightly + tick.
- Completed: brief confetti dots in purple/green.

## Prompt
```
Design Pomodoro for Calori Life (Hebrew RTL).
Center: 260px circular timer with purple progress ring, big numerals "25:00".
Phase chip below (focus / short break / long break).
Optional course chip (colored stripe + name) — tap to change.
Controls row: Start/Pause primary green large, Reset secondary, Skip ghost.
Bottom card: today's sessions count, focus minutes, longest streak.
States: idle, running, paused, phase-change toast, completed celebration.
Quiet by default. AA contrast.
```
