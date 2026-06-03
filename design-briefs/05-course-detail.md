# Prototype Brief — CourseDetail

## Goal
Everything for a single course: meta, weekly tasks, files, notes, links.

## Layout
- **Hero** — back chevron · course name · color stripe.
- **Meta row** — lecturer · credits · schedule chips.
- **Tabs** — Overview · Weekly · Files · Notes · Links.

### Overview
- Big progress ring (overall course completion).
- Next deliverable card — "תרגיל בית 4 — להגיש עד 12.6".
- Quick stats: lectures attended, hw completed, pomodoro minutes.

### Weekly
- Week selector — horizontal scroll 1..N with current week pinned.
- Task templates per week: Lecture · Tutorial · Homework · Custom — each a round checkbox row.
- "סמן שבוע כהושלם" CTA.

### Files
- Folder tree (start side) + file list.
- Upload via drag‑drop or "+ העלאת קובץ" button.
- Thumbnails for images/PDFs (PDFs → first page).
- File row: icon · name · size · uploaded date · overflow menu.

### Notes
- Rich text editor, autosave indicator top‑right ("נשמר עכשיו").

### Links
- Pill list: NotebookLM · Gemini · Moodle · Lecturer email · Custom.
- "+ הוסף קישור" inline.

## States
Course with 0 weekly tasks (empty checklist) · file upload progress (linear bar) · file upload error · note autosaving · long content scroll.

## Prompt
```
Design CourseDetail for Calori Life (Hebrew RTL).
Hero with back chevron, course name, color stripe on the start side.
Tabs: Overview, Weekly Tasks, Files, Notes, Links.
Overview: big progress ring, "next deliverable" card, quick stats row.
Weekly: horizontal week selector 1..N, templated checklist (Lecture/Tutorial/Homework/Custom), "mark week as done".
Files: folder tree + list with thumbnails, drag-drop upload, progress bar.
Notes: rich text editor with autosave indicator.
Links: pills (NotebookLM, Gemini, Moodle, lecturer email), inline add.
Quiet by default. Use tokens. AA contrast.
```
