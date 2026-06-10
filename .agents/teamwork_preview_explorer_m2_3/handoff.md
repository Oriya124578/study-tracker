# Observation
1. **Settings Routing**: `react-router-dom` is installed in `package.json`, and `main.jsx` now wraps `<App />` with `<BrowserRouter>`. However, `App.jsx` and `Layout.jsx` do not currently utilize React Router. Navigation is driven entirely by the `activeCategory` state in `useStore`. `SettingsView.jsx` manually checks `activeCategory` (e.g., `'settings/profile'`) to conditionally render 8 different internal views.
2. **Profile Photo Sync**: The sync from `users/{uid}/profile/photoURL` is **already implemented**. In `src/lib/caloriRepo.js`, `subscribeCaloriProfile` fetches the user document. In `src/store/useStore.js`, the `photoURL` is extracted (`caloriProfile.profile?.photoURL`) and stored in `data.profile`. `Layout.jsx` and `SettingsView.jsx` correctly use this for the Avatar components.
3. **Header Wordmark UI**: The UI for the wordmark is **already implemented**. In `Layout.jsx`, the header contains `<span className="text-[22px] font-extrabold tracking-tight text-foreground leading-none">calori<span className="text-primary font-serif italic font-normal text-[24px] ms-0.5">life</span></span>`, which matches the design brief.
4. **Home CTA**: In `SmartDashboard.jsx`, when `todayScheduleBlocks.length === 0`, the app displays an empty timeline. However, it only checks the length of the blocks array. It does not check if `data.schedule?.generatedAt` exists to specifically prompt the user with a CTA to generate the schedule with the AI Manager if it hasn't run yet.
5. **Calori Deep Links (`/app/day/<date>`)**: Outbound deep links exist in `CaloriView.jsx` (linking to `https://calori1300.web.app/app/day/...`), but the Calorie Life application itself does not have a routing mechanism to handle incoming deep links to `/app/day/<date>` to automatically switch to the Calori view for a specific date.

# Logic Chain
- To implement "Split settings into 8 routes" and "Calori deep links" without breaking the existing `activeCategory` global state (which is deeply tied to `BottomNav.jsx` and `Layout.jsx`), we can synchronize the URL with the `activeCategory` state inside `App.jsx`.
- A custom React hook or a `useEffect` inside `App.jsx` (which is inside `<BrowserRouter>`) can use `useLocation()` and `useNavigate()` to:
  1. Detect `/app/day/:date`, extract the date, call `setCaloriDate(date)`, and update `activeCategory` to `'calori'`.
  2. Detect `/settings/*`, update `activeCategory` accordingly, and navigate the React Router.
- Refactoring `SettingsView.jsx` to use `<Routes>` and `<Route>` will formally split the settings view into the 8 requested routes (`/settings`, `/settings/profile`, `/settings/studies`, etc.), using `useNavigate()` to transition between them instead of directly calling `setActiveCategory`.
- The "Home CTA" requires modifying the empty state block in `SmartDashboard.jsx` (Tile 6) to verify `!data.schedule?.generatedAt` before displaying the primary CTA to trigger AI planning.

# Caveats
- Moving the entire app to a full `react-router-dom` architecture (where every view is an `<Outlet>` or `<Route>`) would require significant refactoring of `Layout.jsx`, `BottomNav.jsx`, and over a dozen components that call `setActiveCategory()`. Using `App.jsx` to synchronize the URL with the `activeCategory` state is a safer and faster approach to fulfill the Milestone.

# Conclusion
The Profile Photo Sync and Header Wordmark are already implemented. To complete Milestone 2:
1. Introduce a Route synchronization layer in `App.jsx` to handle incoming `/app/day/:date` deep links and `/settings/*` URLs, updating the Zustand state (`activeCategory` and `caloriDate`).
2. Refactor `SettingsView.jsx` to use React Router's `<Routes>` and `<Route>` for its 8 internal sub-views, replacing `setActiveCategory` calls with `useNavigate`.
3. Update the empty state in `SmartDashboard.jsx` to act as the Home CTA by checking if `!data.schedule?.generatedAt` is true.

# Verification Method
1. **Settings Routes**: Run `npm run dev`. Navigate directly to `http://localhost:5173/settings/profile` in the browser. It should load the application and render the Profile settings page.
2. **Deep Links**: Navigate to `http://localhost:5173/app/day/2026-06-10`. The app should switch to the Calori view and set the date navigator to June 10, 2026.
3. **Home CTA**: Log in with an account that has no scheduled events today and hasn't run the AI Manager. Verify the Home CTA specifically encourages AI planning.
4. **E2E Tests**: Run `npm run test:e2e` to ensure no routing or layout changes broke existing flows.
