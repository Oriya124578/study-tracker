# Scope: Milestone 3

## Architecture
- Cloud Functions for Google Calendar OAuth.
- React Calendar UI with Segmented control.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Calendar Integration | Google Calendar OAuth via Cloud Functions, read-only event sync. React Calendar UI (5 views: day, 3 days, week, month, schedule) with Segmented control. | none | PLANNED |

## Interface Contracts
### `Cloud Functions` ↔ `Client`
- Google Calendar OAuth: endpoints to initiate OAuth, callback, and fetch events using securely stored tokens.
