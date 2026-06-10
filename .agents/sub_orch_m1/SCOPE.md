# Scope: Milestone 1

## Architecture
- Category definitions in Firestore (`cl_categories`).
- Update `cl_personalTasks` model to include `courseId` (optional) and `categoryIds`.
- UI for category management (add/edit/delete, select modal, chips) in Vanilla CSS matching `cream-*.html`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Category System & Data | `cl_categories` collection, default categories via Cloud Function or client init, `categoryIds` in tasks/events, `courseId` optional. Category management UI (add/edit/delete, select modal, chips). | none | DONE |

## Interface Contracts
### `Firestore` ↔ `Client`
- `cl_categories`: `{ id, name, color, icon, scope, userId }`
- `cl_personalTasks` extension: `courseId` (optional), `categoryIds: string[]`
