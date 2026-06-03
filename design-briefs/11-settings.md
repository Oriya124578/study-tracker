# Prototype Brief — Settings

## Goal
Standard, calm, grouped iOS‑style settings.

## Layout
Grouped list, section headers in `text-13 ink-soft uppercase`.

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

## Prompt
```
Design Settings for Calori Life (Hebrew RTL, iOS-style grouped list).
Sections: Profile, Notifications, Language (HE/EN segmented), Theme (Light/Dark/Auto segmented),
Connected services (Firebase + Calori bridge with status + connect/disconnect),
Data (export/import/clear cache), About, Sign out (destructive red row).
Rows: leading icon, label, trailing meta + chevron.
States: default, sign-out confirmation, dark mode, theme live preview.
Quiet. AA contrast.
```
