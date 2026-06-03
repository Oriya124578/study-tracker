# Prototype Brief — Studies (StudiesHub)

## Goal
Course‑centric overview. Hub for everything academic.

## Layout
1. **Header** — "הקורסים שלי" + semester chip (e.g., "סמסטר ב'").
2. **Course grid** — 2 columns mobile, 3 desktop.
3. **StudiesStats** section — progress ring (overall), exam board (next 30 days), pomodoro chart (last 7 days).

## CourseCard
- Color stripe 4px on the leading side.
- Name `text-18 semibold`.
- "שבוע 7 מתוך 13" `text-13 ink-soft`.
- Progress bar (track hairline, fill `nutrition.primary`), 6px tall.
- Tap → CourseDetail.
- Long‑press → quick menu (rename, archive, files).

## StudiesStats
- **Progress ring** — overall completion across all courses, big number center.
- **Exam board** — list of upcoming exams sorted by date, each row = course color stripe + name + countdown chip.
- **Pomodoro chart** — bar chart, last 7 days focus minutes (Recharts).

## States
Empty (no courses) · Loading skeleton grid · One course only · Many courses (scroll).

## Sample data
אינפי 2 (week 7/13) · אלגברה לינארית 2 (5/13) · תכנות בשפת C (8/13) · מבני נתונים (4/13) · לוגיקה ותורת הקבוצות (6/13).

## Prompt
```
Design the Studies hub for Calori Life (Hebrew, RTL).
Header with title + semester chip.
2-column grid of CourseCards (3 on desktop). Each card: 4px color stripe on the start side,
course name, "Week N/M" subtitle, thin progress bar.
Below the grid: StudiesStats section with a big overall progress ring,
an upcoming-exams list with countdown chips, and a 7-day pomodoro bar chart.
Use Calori Life tokens. Quiet by default. AA contrast.
Sample 5 Hebrew courses.
```
