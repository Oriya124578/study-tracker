# Scope: Milestone 4

## Architecture
- Recurring tasks logic (client/server).
- AI Manager Cloud Function (CRON 07:00 & 21:00 global).
- AI suggestions UI.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Recurrence & AI Engine | Recurring tasks logic (generate future instances, edit specific/all). AI Manager Cloud Function (runs 7:00 & 21:00), generating `cl_aiSuggestions`. AI suggestions UI. | none | PLANNED |

## Interface Contracts
### `Firestore` ↔ `Client`
- `cl_personalTasks` extension: `recurrence: { type, interval, until, ... }`
- `cl_aiSuggestions`: `{ id, userId, type, suggestion, context, status: 'pending'|'accepted'|'rejected', createdAt }`

### `Cloud Functions` ↔ `Client`
- AI Manager CRON: No direct client invocation; client listens to `cl_aiSuggestions` where `status == 'pending'`.
