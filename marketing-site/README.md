# Calori Life — Marketing Site (אתר תדמית)

A bilingual (Hebrew RTL / English LTR), single-page marketing site for **Calori Life**.
Fully static — no build step. It embeds the real app screens (the `cream-*` design briefs)
inside device frames, plus AI-generated lifestyle visuals.

## Structure

```
marketing-site/
├── index.html          # the whole site (HTML + CSS + JS inline)
├── screens/            # real app screens, embedded via <iframe> in device frames
│   └── cream-*.html
└── assets/
    └── lifestyle-*.png # AI lifestyle stills (Higgsfield / nano-banana)
```

## Preview locally

Any static server works, e.g.:

```bash
npx serve marketing-site -l 4321
# then open http://localhost:4321
```

(A `marketing-site` launch config is also in `.claude/launch.json`.)

## Language toggle

Top-right `עב / EN`. Hebrew is default and sets `dir="rtl"`; English sets `dir="ltr"`.
All copy lives in `data-he` / `data-en` attributes on each element and is swapped by `setLang()`.
The choice is remembered in `localStorage`.

## Deploy to Firebase Hosting (separate site — does NOT touch the calori app)

The main app already uses Firebase Hosting on project `calori1300`. To avoid overwriting it,
deploy this as a **second hosting site** (Hosting supports multiple sites per project):

```bash
# 1. create a new hosting site once (any unique id)
firebase hosting:sites:create calori-life-promo

# 2. from THIS folder, init hosting and pick that site as the target
cd marketing-site
firebase init hosting        # public dir: "."  | single-page: No | target: calori-life-promo

# 3. deploy only this target
firebase deploy --only hosting:calori-life-promo
```

It will be served at `https://calori-life-promo.web.app`.

> ⚠️ Do **not** run `firebase deploy --only hosting` from the project root with the default
> target — that would publish the marketing site over the main app. Always use the named target.

Alternatively, this static folder drops straight into Netlify, Vercel, GitHub Pages, or any
static host with zero configuration.

## AI video (next step)

Higgsfield video generation requires a paid plan (Basic+). The lifestyle stills were generated
on the free plan with `nano_banana_pro`. Once the plan is upgraded, a `kling3_0` clip (~10 credits,
5s, 16:9) can be generated and embedded into the Demo section in place of the lifestyle grid.
