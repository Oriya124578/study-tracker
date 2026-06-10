# BRIEFING — 2026-06-07T05:21:20+03:00

## Mission
Implement Milestone 4.1: Recurrence Logic.

## 🔒 My Identity
- Archetype: Implementer
- Roles: implementer, qa, specialist
- Working directory: c:\src\projects\Calorie Life\.agents\sub_orch_m4\worker_4_1
- Original parent: 1744cf0f-29c3-438c-bf35-7a27e6ca2e5b
- Milestone: 4.1

## 🔒 Key Constraints
- DO NOT CHEAT. Genuine implementations only.
- Read explorer handoff.

## Current Parent
- Conversation ID: 1744cf0f-29c3-438c-bf35-7a27e6ca2e5b
- Updated: 2026-06-07T05:21:20+03:00

## Task Summary
- **What to build**: Support generating future instances for recurring tasks and editing/skipping them.
- **Success criteria**: User can skip and edit individual occurrences of recurring tasks.
- **Interface contracts**: `generateFutureInstances` in `recurrence.js`, `editRecurringInstance` in `useStore.js`.
- **Code layout**: src/lib, src/store, src/components/tasks.

## Key Decisions Made
- `generateFutureInstances` uses the pure `recurrenceMatches` to determine future dates, looking up to 5 years ahead.
- `UpcomingInstancesList` is built inside `TasksView.jsx` to render future instances inline under the recurring tasks.

## Artifact Index
- handoff.md — Report of implementation details and verification steps.
