# Scope: Milestone 3.1 - Calendar API & OAuth

## Architecture
- **Backend**: Firebase Cloud Functions
- **Feature**: Google Calendar OAuth flow (store token securely) and event proxying.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 3.1.1 | Cloud Functions Setup | Initialize Firebase Functions environment. Set up package.json, index.js, dependencies (googleapis, firebase-admin, etc.). | none | PLANNED |
| 3.1.2 | Google OAuth Flow | Implement `auth/google` to start OAuth flow, and `auth/google/callback` to handle Google OAuth callback. Store tokens securely in Firestore (`users/{uid}/tokens`) or Secret Manager. | 3.1.1 | PLANNED |
| 3.1.3 | Google Calendar API proxy | Implement `api/calendar/events` to fetch read-only events from Google Calendar for a date range using stored tokens. | 3.1.2 | PLANNED |

## Interface Contracts
### `Client` ↔ `Cloud Functions`
- `GET /auth/google` -> Redirects to Google OAuth
- `GET /auth/google/callback` -> Handles callback, stores token
- `GET /api/calendar/events?start=...&end=...` -> Returns calendar events format suitable for UI
