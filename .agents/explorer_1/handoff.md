# Observation
1. **Settings**: Currently, `Layout.jsx` routes to `<SettingsView />` only for `activeCategory === 'settings'`. `SettingsView.jsx` is a monolithic file without sub-routes. The design-briefs (`cream-11*.html`) detail 8 individual sub-screens and a main index menu.
2. **Profile Photo**: `src/lib/caloriRepo.js` provides `subscribeCaloriProfile` which reads the raw `users/{uid}` document. `useStore.js` receives this via `unsubCaloriProfile`, but only extracts daily goals. The user profile photoURL is not currently stored or used in the header (`Layout.jsx`) or settings.
3. **Header Wordmark**: In `Layout.jsx`, the header wordmark currently uses `text-2xl font-black tracking-tight`. `cream-01-home.html` specifies `.wordmark em` should be `font-family: 'Instrument Serif'`, `font-style: italic`, `color: #059669`. The design layout also places the wordmark appropriately within the header.
4. **Home CTA & Calori**: `SmartDashboard.jsx` displays an empty timeline if no items exist, but lacks the specific "Home CTA" condition (`todayItems.length === 0` AND manager visit). Additionally, external links to Calori (in `CaloriView.jsx` and potentially `SmartDashboard.jsx`) link only to the root domain, rather than deep linking to `/app/day/<date>`.

# Logic Chain
- To implement the 8 settings routes without a router library, `Layout.jsx`'s `renderContent` switch can accept any category starting with `'settings'` and pass it to `SettingsView.jsx`. `SettingsView` should parse this route and render either the main index (matching `cream-11-settings.html`) or the appropriate sub-component.
- The `photoURL` can be extracted within `useStore.js` from `caloriProfile.profile?.photoURL` or `caloriProfile.photoURL` (within the `unsubCaloriProfile` listener) and merged into `data.profile`. `Layout.jsx` can then render `data.profile.photoURL` in an `<img />` tag instead of initials.
- To match `cream-01-home.html`, the wordmark in `Layout.jsx` needs the styling `font-serif italic text-primary text-xl` (or similar Tailwind equivalents for `Instrument Serif` / `#059669`) and should be right-aligned according to RTL flow (`justify-content: space-between`).
- Adding the empty-state Home CTA requires checking `todayScheduleBlocks.length === 0` and `data.schedule?.generatedAt` (indicating the AI manager has run today). 
- Calori deep links require updating the `href` in `CaloriView.jsx` to `https://calori1300.web.app/app/day/${caloriDate}`.

# Caveats
- No caveats. The routing will use the existing `activeCategory` global state, avoiding the need for `react-router-dom` configuration. 

# Conclusion
The codebase is ready for Milestone 2 implementation. The necessary data feeds (like `users/{uid}` via `subscribeCaloriProfile`) already exist, and `useStore` can be easily extended to support sub-category string routing.

# Implementation Plan
1. **Routing (`Layout.jsx` & `SettingsView.jsx`)**:
   - Update `Layout.jsx` to route any `activeCategory.startsWith('settings')` to `<SettingsView />`.
   - Update `SettingsView.jsx` to render a main menu list (`cream-11-settings.html`) if the category is exactly `'settings'`. Add onClick handlers to change the category to `'settings/profile'`, `'settings/studies'`, etc.
   - Refactor the existing monolithic settings blocks into sub-views (e.g., `ProfileView`, `StudiesView`) rendered inside `SettingsView.jsx` based on the active route, each with a "Back" button calling `setActiveCategory('settings')`.
2. **Profile Photo Sync**:
   - In `useStore.js` (`unsubCaloriProfile` callback), extract the photo URL: `photoURL: caloriProfile?.profile?.photoURL || caloriProfile?.photoURL`.
   - Save this to `data.profile.photoURL`.
   - In `Layout.jsx`, update the avatar `<button>` to render an `<img src={data.profile.photoURL} />` if it exists.
3. **Header Wordmark**:
   - In `Layout.jsx`, update the header's wordmark span to match `cream-01-home.html`: e.g., `<span className="text-2xl font-black">calori<span className="text-primary font-serif italic text-xl ms-0.5">life</span></span>`.
   - Ensure the alignment matches the design layout.
4. **Home CTA & Deep Linking**:
   - In `SmartDashboard.jsx`, under the `todayScheduleBlocks.length === 0` condition, check if `data.schedule?.generatedAt` exists. If so, render the empty-state Home CTA.
   - In `CaloriView.jsx`, update the external Calori link: `href={"https://calori1300.web.app/app/day/" + (caloriDate || dateKey())}`.
   - In `SmartDashboard.jsx`'s Calori tile (Tile 2), include the `hero-cta` UI element pointing to Calori, or update any `onClick` routing if requested.

# Verification Method
1. Verify Settings: Click "Settings" in the app, confirm the index page shows 8 categories. Click "Profile" and verify it navigates to the profile view with a back button.
2. Verify Photo: Inject a dummy `photoURL` into `data.profile` in `useStore` and confirm it renders in the `Layout.jsx` header.
3. Verify Wordmark: Inspect the header wordmark styles visually against `cream-01-home.html`.
4. Verify Calori Link: Click the external link in `CaloriView.jsx` and confirm the `href` ends with `/app/day/YYYY-MM-DD`.
