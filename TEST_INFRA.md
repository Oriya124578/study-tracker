# E2E Test Infra: Calorie Life Phase 2 & 3

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Category Management (CRUD) | PROJECT.md M1 | 5 | 5 | ✓ |
| 2 | Assign Categories to Tasks | PROJECT.md M1 | 5 | 5 | ✓ |
| 3 | Navigation & 8 Settings Routes | PROJECT.md M2 | 5 | 5 | ✓ |
| 4 | Profile Photo Sync | PROJECT.md M2 | 5 | 5 | ✓ |
| 5 | Google Calendar Integration | PROJECT.md M3 | 5 | 5 | ✓ |
| 6 | Calendar 5-Views UI | PROJECT.md M3 | 5 | 5 | ✓ |
| 7 | Recurring Tasks | PROJECT.md M4 | 5 | 5 | ✓ |
| 8 | AI Suggestions (Accept/Reject) | PROJECT.md M4 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: `npm run test:e2e` (using Playwright or similar E2E framework depending on the tech stack). Since it's a Vite + React app, we will use Playwright.
- Test case format: Playwright test spec files `*.spec.ts`.
- Directory layout:
  - `e2e/tests/tier1-feature/`
  - `e2e/tests/tier2-boundary/`
  - `e2e/tests/tier3-pairwise/`
  - `e2e/tests/tier4-workload/`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Setup profile, create custom categories, and assign them to a recurring task. | F1, F2, F4, F7 | Medium |
| 2 | Connect Google Calendar, view an event in the Week view, and add a category to it. | F2, F5, F6 | Medium |
| 3 | Receive an AI suggestion, accept it, which creates a categorized recurring task, and view it in Schedule view. | F1, F2, F6, F7, F8 | High |
| 4 | Navigate through all settings routes, updating profile photo, and disconnecting Google Calendar. | F3, F4, F5 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature
- Tier 2: ≥5 per feature (where boundaries exist)
- Tier 3: pairwise coverage of major feature interactions
- Tier 4: ≥5 realistic application scenarios
