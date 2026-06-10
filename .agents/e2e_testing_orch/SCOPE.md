# Scope: E2E Testing Tiers

## Architecture
- Using Playwright for opaque-box E2E testing of the React frontend.
- Tests will be structured by Tiers (1 to 4) under the `e2e/` folder.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Tier 1: Feature Coverage | Implement 5+ happy-path tests for each of the 8 features (total 40+ tests). | none | PLANNED |
| 2 | Tier 2: Boundary & Corner Cases | Implement 5+ boundary/edge-case tests for each of the 8 features. | Tier 1 | PLANNED |
| 3 | Tier 3: Cross-Feature Interactions | Implement pairwise combinatorial tests across major features. | Tier 2 | PLANNED |
| 4 | Tier 4: Real-World Scenarios | Implement >=5 complex real-world workflows interacting with multiple features. | Tier 3 | PLANNED |
