# Review Report: Milestone 2 (UI Fixes & Navigation)

## 1. Observation
- Checked `src/App.jsx` and `src/components/settings/SettingsView.jsx`. Settings are properly split into 8 sub-routes (profile, studies, categories, notifications, manager, calori, general, data, about).
- Checked `src/store/useStore.js` and `src/lib/caloriRepo.js`. `subscribeCaloriProfile` listens to `users/{uid}` and successfully maps the profile photo from the `photoURL` field under the `profile` object (i.e. `users/{uid}/profile/photoURL`).
- Checked `src/components/layout/Layout.jsx`. The Header wordmark UI (`calori life`) has an `onClick={() => setActiveCategory('overview')}` making it clickable to navigate to Home.
- Checked `src/components/dashboard/SmartDashboard.jsx` for the Home CTA. Scanned the component for any mention of `generatedAt` or `data.schedule`. The Home CTA checking `!data.schedule?.generatedAt` is entirely missing from `SmartDashboard.jsx`.
- Checked `src/App.jsx`. Calori deep links (`/app/day/<date>`) correctly sync the URL parameters to the store's `caloriDate` and set the `activeCategory` to `calori`.
- Checked `npm run build`. The build completed successfully.
- Checked `npm run test:e2e`. The test suite fails (e.g. `e2e\tests\tier1-feature\02-assign-categories.spec.ts`, timeout and toBeVisible failed).

## 2. Logic Chain
1. Settings are split into routes via React Router, matching the requirement.
2. The user profile photo correctly syncs from the specified Firestore path through `useStore.js` logic calling `subscribeCaloriProfile`.
3. The Wordmark correctly dispatches `setActiveCategory('overview')`, mapping back to the SmartDashboard.
4. The requirement for Home CTA specifically states it must check `!data.schedule?.generatedAt`. A grep search and manual review confirmed `generatedAt` and this check are completely missing in `SmartDashboard.jsx`. This is an incomplete implementation.
5. Deep link routing parses the pathname correctly and sets internal state to render the CaloriView on the specified date.
6. The application compiles, but the existing e2e tests fail. A failing test suite is a blocker for approval.

## 3. Caveats
- Some failing e2e tests might be related to other components, but test failures must be addressed.

## 4. Conclusion
VERDICT: VETO

The implementation fails on multiple fronts:
1. The Home CTA in `SmartDashboard.jsx` checking `!data.schedule?.generatedAt` is missing entirely.
2. `npm run test:e2e` fails with multiple test timeouts and missing elements (e.g. `02-assign-categories.spec.ts`, `01-category-management.spec.ts`). 

Please implement the Home CTA and ensure the tests pass before resubmitting.

## 5. Verification Method
- Look at `src/components/dashboard/SmartDashboard.jsx`. You will not find any reference to `data.schedule?.generatedAt`.
- Run `npm run test:e2e` and observe the test failures.
