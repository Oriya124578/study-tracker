# Scope: Milestone 3.2 - Calendar UI Views

## Architecture
- **Frontend**: React components for Calendar UI.
- **Feature**: 5 views (Day, 3-Day, Week, Month, Schedule), matching design-briefs/cream-INDEX.html perfectly using Vanilla CSS.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 3.2.1 | Segmented Control & Layout | Create Calendar layout, Segmented Control (Day, 3 Days, Week, Month, Schedule) to switch views. Implement mock data fetching. | none | PLANNED |
| 3.2.2 | Day & 3-Day Views | Implement 02a (Day) and 02b (3-Day) views. Use Vanilla CSS based on cream-INDEX.html. | 3.2.1 | PLANNED |
| 3.2.3 | Week & Month Views | Implement 02c (Week) and 02d (Month) views. Use Vanilla CSS based on cream-INDEX.html. | 3.2.1 | PLANNED |
| 3.2.4 | Schedule View | Implement 02e (Schedule) view with continuous agenda layout. | 3.2.1 | PLANNED |

## Interface Contracts
### Client ? Cloud Functions
- Will eventually use GET /api/calendar/events implemented in M3.1. For now, use mock events.
