# Handoff: Milestone 2 Investigation

## 1. Observation
- The app uses Zustand (`useStore`) and an `activeCategory` string to drive routing in `Layout.jsx` rather than `react-router-dom`, though `react-router-dom` is installed in `package.json`.
- `SettingsView.jsx` is a monolithic file (760 lines) containing 8 logical sub-views, keyed by `activeCategory` values like `settings/profile`, `settings/notifications`, etc.
- Profile photo sync logic exists partially in `useStore.js` via `subscribeCaloriProfile` (which reads `doc(db, 'users', uid)` and attempts to extract `profile.photoURL`), but `PROJECT.md` specifies an interface contract for a listener on `users/{uid}/profile/photoURL`.
- The "Header wordmark UI" is styled in `Layout.jsx` but is completely static (`<div>...<span>calorilife</span></div>`) and not clickable.
- "Home CTA" likely refers to making the header wordmark a clickable Home CTA, or ensuring a primary call-to-action exists on the `SmartDashboard.jsx` Hero section.
- `caloriDate` state exists in Zustand, but there is no mechanism to set it via a URL deep link (`/app/day/<date>`).

## 2. Logic Chain
- To implement **React Router configuration for split settings screen** and **Calori deep links**, we must wrap `<App>` in `<BrowserRouter>` (inside `main.jsx`).
- Instead of rewriting the entire `Layout.jsx` to use `<Routes>`, the safest and most backwards-compatible strategy is to build a bidirectional synchronization layer (a `RouteSyncer` component) inside `App.jsx` that listens to `location.pathname` and updates `activeCategory` / `caloriDate`, and conversely updates `navigate()` when Zustand state changes.
- This immediately gives us 8 URL-addressable settings routes (e.g. `/settings/profile` mapping to `activeCategory = 'settings/profile'`).
- The **Calori deep link** (`/app/day/<date>`) can be intercepted in the same syncer, extracting the date parameter to call `setCaloriDate(date)` and `setActiveCategory('calori')`.
- The **Header wordmark UI** and **Home CTA** requirement can be met by wrapping the static wordmark in `Layout.jsx` with an interactive `<button>` that triggers navigation to `/app/overview` (Home).
- For **Profile photo sync**, the listener in `useStore.js` might need to be explicitly pointed to `doc(db, 'users', uid, 'profile', 'main')` or verify the field path `profile.photoURL` inside `users/{uid}`. Since `Avatar` and `SettingsView` already use `data.profile.photoURL`, fixing the Firestore read path completes the feature.

## 3. Caveats
- I did not refactor `SettingsView.jsx` into 8 separate files. It currently renders sub-sections using `if (activeCategory === 'settings/profile')`. If the milestone demands actual file separation, `SettingsView.jsx` should be broken down into individual components inside `src/components/settings/`.
- The exact Firestore structure of `users/{uid}/profile/photoURL` could mean a subcollection `profile` or a map field. The implementer should verify which structure the external Flutter app uses.

## 4. Conclusion
Milestone 2 can be achieved by:
1. Adding `<BrowserRouter>` in `main.jsx`.
2. Adding a `useEffect` route-sync hook in `App.jsx` to map URLs like `/settings/:sub` and `/app/day/:date` to `activeCategory` and `caloriDate`.
3. Making the wordmark in `Layout.jsx` a clickable Home CTA to `overview`.
4. Ensuring the `subscribeProfile` / `subscribeCaloriProfile` listener exactly matches the `photoURL` path and merges it into `data.profile.photoURL`.

## 5. Verification Method
- **Deep links**: Visit `/app/day/2026-06-10` in the browser; verify it loads `CaloriView` with the correct date.
- **Settings routes**: Visit `/settings/profile`; verify it opens the profile settings pane directly.
- **Header wordmark**: Click "calori life" in the header; verify it navigates to the SmartDashboard.
- **Profile Photo**: Add a `photoURL` to the Firebase `users/{uid}` document manually and verify the Avatar updates in real-time.
