# Project: Calorie Life Phase 2 & 3

## Architecture
- **Frontend**: React UI using vanilla CSS / CSS Modules to match `design-briefs/cream-INDEX.html` exactly.
- **Backend/Data**: Firebase/Firestore for data storage. Cloud Functions for OAuth and CRON jobs.
- **Core Modules**:
  - `cl_categories`: Category definitions (name, color, icon, scope).
  - `cl_personalTasks`: Tasks model (now with optional `courseId`, `categoryIds`, `recurrence`).
  - Google Calendar integration via Cloud Functions for OAuth token security.
  - AI Manager via Cloud Functions running twice a day.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Category System & Data | `cl_categories` collection, default categories via Cloud Function or client init, `categoryIds` in tasks/events, `courseId` optional. Category management UI (add/edit/delete, select modal, chips). | none | DONE |
| 2 | UI Fixes & Navigation | Split settings into 8 routes. Profile photo sync from `users/{uid}/profile/photoURL`. Header wordmark UI. Home CTA. Calori deep links. | none | IN_PROGRESS |
| 3 | Calendar Integration | Google Calendar OAuth via Cloud Functions, read-only event sync. React Calendar UI (5 views: day, 3 days, week, month, schedule) with Segmented control. | none | IN_PROGRESS |
| 4 | Recurrence & AI Engine | Recurring tasks logic (generate future instances, edit specific/all). AI Manager Cloud Function (runs 7:00 & 21:00), generating `cl_aiSuggestions`. AI suggestions UI. | none | IN_PROGRESS |
| 5 | Final E2E Test Pass (Phase 1) | Run and pass E2E tests (Tiers 1-4). Decomposed sequentially. Explorer analyzes failures -> Worker fixes -> Reviewer verifies -> gate. | 1, 2, 3, 4 | PLANNED |
| 6 | Adversarial Hardening (Phase 2) | Tier 5 adversarial testing. Challenger initiates gap report and generates adversarial cases -> Worker fixes -> Reviewer verifies. | 5 | PLANNED |

## Interface Contracts
### `Firestore` ↔ `Client`
- `cl_categories`: `{ id, name, color, icon, scope, userId }`
- `cl_personalTasks` extension: `courseId` (optional), `categoryIds: string[]`, `recurrence: { type, interval, until, ... }`
- `cl_aiSuggestions`: `{ id, userId, type, suggestion, context, status: 'pending'|'accepted'|'rejected', createdAt }`
- User Profile: Listener on `users/{uid}/profile/photoURL`.

### `Cloud Functions` ↔ `Client`
- Google Calendar OAuth: endpoints to initiate OAuth, callback, and fetch events using securely stored tokens.
- AI Manager CRON: No direct client invocation; client listens to `cl_aiSuggestions` where `status == 'pending'`.

## Code Layout
- `/src/components/*` - React components
- `/src/lib/` - Services (firebaseRepo, googleCalendar, etc.)
- `/functions/` - Cloud Functions for OAuth and AI Manager
- `/design-briefs/` - Source of truth for UI (Vanilla CSS matching)
