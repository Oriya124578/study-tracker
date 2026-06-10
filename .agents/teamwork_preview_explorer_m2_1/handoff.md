# Handoff: Milestone 2 Implementation Strategy

## Observation
- **React Router**: `package.json` includes `react-router-dom`, but it is currently not used. `main.jsx` renders `<App />` directly without a `<BrowserRouter>`, and navigation is driven entirely by Zustand's `activeCategory` state (e.g., `'settings/profile'`).
- **Settings Routes**: `SettingsView.jsx` manually conditionally renders 8 different views (Profile, Studies, Notifications, Manager, Calori, General, Data, About) based on `activeCategory`.
- **Profile Photo Sync**: `useStore.js` (`subscribeCaloriProfile`) already attempts to read `photoURL` from the user's `users/{uid}` document (`caloriProfile.profile?.photoURL`), which is then used by the `<Avatar />` component in `Layout.jsx`.
- **Header Wordmark**: A hardcoded wordmark `calori life` (with italic green "life") exists in `Layout.jsx` inside the `<header>`.
- **Home CTA**: `SmartDashboard.jsx` contains Quick Actions (including a Calori nutrition journal CTA), but it may need an explicit Home CTA banner or button depending on design specifics.
- **Deep Links**: There is no mechanism in `App.jsx` or `main.jsx` to parse the URL and handle `/app/day/<date>`.

## Logic Chain
1. To split Settings into 8 routes and handle deep links without breaking the entire `activeCategory` global state, we must introduce `react-router-dom` at the top level.
2. By wrapping `<App />` in `<BrowserRouter>`, we can listen to `location.pathname` inside `App.jsx` and synchronize the URL with the Zustand `activeCategory` state.
3. For deep links, parsing `/app/day/<date>` inside `App.jsx` allows us to extract the date, call `setCaloriDate(date)`, and switch the view to `calori` by updating `activeCategory`.
4. Refactoring `SettingsView.jsx` to use `<Routes>` and `<Route>` will fulfill the "Split settings into 8 routes" requirement. The 8 manual `if` blocks will be replaced with React Router paths (`/settings/profile`, `/settings/studies`, etc.), and navigation within settings will use `useNavigate()`.
5. The profile photo sync is already reading from the map `profile.photoURL` on the `users/{uid}` doc. This should be verified to match the exact requirement (if the requirement means a separate document or subcollection, `firestoreRepo.js` would need a specific `onSnapshot` for that path).

## Caveats
- Moving completely to React Router for all tabs would require refactoring `BottomNav.jsx`, `Layout.jsx`, and all `setActiveCategory` calls. The proposed strategy synchronizes the URL with `activeCategory` instead, minimizing regression risk while adding route support where needed.
- If `users/{uid}/profile/photoURL` is a Firebase Realtime Database path (rather than Firestore), we would need to install `firebase/database` and set up an `onValue` listener. The current code assumes it's a Firestore document field (`caloriProfile.profile.photoURL`).

## Conclusion
To implement Milestone 2:
1. **Wrap App**: Update `main.jsx` to include `<BrowserRouter>`.
2. **Sync Routing & Deep Links**: In `App.jsx`, add a `useEffect` on `location` to catch `/app/day/:date` (updating `caloriDate` and `activeCategory`) and `/settings/*` (syncing with `activeCategory`).
3. **Refactor Settings**: Update `SettingsView.jsx` to use `<Routes>` for its 8 sections (`/`, `/profile`, `/studies`, `/notifications`, `/manager`, `/calori`, `/general`, `/data`, `/about`) and `useNavigate()` for transitions.
4. **Verify Profile Sync**: Ensure `useStore.js` `subscribeCaloriProfile` correctly maps the Firestore `users/{uid}` `profile.photoURL` field to the store and `<Avatar>`.
5. **UI Fixes**: Verify the Header wordmark in `Layout.jsx` and the Home CTA in `SmartDashboard.jsx` match the `design-briefs/cream-INDEX.html` exact styles.

## Verification Method
- **Routing**: Start the app and navigate to `http://localhost:5173/settings/profile`. It should render the Profile settings directly.
- **Deep Links**: Navigate to `http://localhost:5173/app/day/2026-06-10`. The app should open the Calori view and the date navigator should display the correct date.
- **Tests**: Run `npm run test:e2e` to verify existing workflows (onboarding, courses) remain unbroken.
