# איך לעבוד עם Claude Design — מדריך לבניית מסכי Calori Life **v2.0** (Warm Cream + Editorial Serif)

> מטרה: לקבל מ-Claude Design (claude.ai/design) מסכים שמתאימים **בדיוק** ל-Combo-B + מערכת הפונטים החדשה.

> ⚠️ **הקנון:** קבצי ה-HTML הם **מקור האמת**:
> - `combo-B-style3-cream.html` + `font-2-instrument.html` — מסך הבית
> - `inst-1-calendar.html` / `inst-2-studies.html` / `inst-3-tasks.html` / `inst-4-calori.html` / `inst-5-pomodoro.html` — מסכים אחרים
> 
> אם יש פער בין טקסט brief ל-HTML reference — **ה-HTML גובר**.

---

## מה השתנה מ-v1?

| | v1 (ישן) | v2 (חדש) |
|---|---|---|
| Canvas | `#F5F5F7` אפור קר | **`#FAF7F2` קרם חמים** |
| Ink | `#1D1D1F` שחור גרי | **`#2A1A0A` חום-כהה חמים** |
| Font headings | SF Pro / Heebo display | **Instrument Serif** עם italic accents |
| Font numbers | SF Pro Display bold | **Fraunces weight 600** italic |
| Font body | Heebo | **Inter + Rubik fallback** |
| Hero card | Bento עם 4 tiles נפרדים | **Combo-B — greeting + nutrition מאוחדים בכרטיס אחד** |
| Italic | לא בשימוש | **חתימת המותג** — em בירוק בכל כותרת |

---

## עקרון על — Ground Truth אחד (v2)

Claude Design יעצב לפי מה שאתה מזין. כל בקשה חייבת להתחיל מאותו מקור:

1. **`tokens.json`** v2 — פלטה חדשה, מערכת פונטים, hero card spec.
2. **`00-MASTER-BRIEF-EN.md`** v2 — voice, rules, item-type colors, italic accent rule.
3. **`bento-design-system.html`** — דף הספריה הויזואלי (הוחלף לחלוטין).
4. **`combo-B-style3-cream.html`** — קובץ ה-reference של מסך הבית.
5. **`inst-1...5`** — קבצי ה-reference של 5 המסכים האחרים.

**חוק ברזל:** לפני כל פרומפט מסך, תוודא ש-Claude Design ראה את 5 המקורות. בלי זה הוא ינחש.

---

## מבנה הפרויקטים ב-claude.ai/design

צור 3 פרויקטים נפרדים:

| פרויקט | תוכן | מקור |
|---|---|---|
| **Calori Life — Design System** | Colors, Typography, Spacing, Motion, Components | tokens.json + section §2,§4 מ-Master Brief |
| **Calori Life — Prototypes** | 13 מסכים | briefs 01–13 |
| **Calori Life — Templates** | App Icon, OG, Screenshots, Banners | brief 21 |

---

## שלב 1 — בניית Design System (חד-פעמי)

זה השלב הכי חשוב. אם תדלג עליו ותתחיל ממסכים, **כל המסכים ייצאו לא עקביים**.

### פרומפט פתיחה v2 (הדבק בפרויקט Design System):

```
You are building the design system for "Calori Life" v2.0 — a Hebrew-first (RTL),
editorial-warm personal life manager for Israeli university students.

Authoritative sources (in priority order):
1. tokens.json v2 — exact values for all colors, type, spacing, components.
2. 00-MASTER-BRIEF-EN.md v2 — voice, rules, item-type color mapping, italic accent rule.
3. bento-design-system.html — the visual ground truth (warm cream + editorial serif).
4. combo-B-style3-cream.html — the home screen layout reference.

VISUAL DIRECTION (mandatory):
- North star: editorial · warm · scholarly. Like a beautifully-printed journal.
- Canvas (every screen): #FAF7F2 warm cream. NEVER #F5F5F7 or cool gray.
- Surfaces: #FFFFFF.
- Ink (text): #2A1A0A warm dark brown. NEVER #1D1D1F.
- Ink-soft: #8A7A6A. Hairlines: rgba(180,140,80,.14).
- Primary green: #059669 (italic accents, CTA, meals).
- Forest deep: #065F46 (FAB body, avatar, header on green zones).
- Fitness: #7C3AED. Info: #2563EB. Warning: #D97706. Danger: #EF4444.

THREE-FONT SYSTEM (mandatory):
- Headings + italic accents: 'Instrument Serif' (weight 400 only, italic 400).
- ALL numbers ≥ 14px: 'Fraunces' (weight 600, opsz 144, -0.04em letter-spacing,
  italic for hero numbers like 398/timer-seconds/stat values).
- Body + UI: 'Inter' (400-700).
- Hebrew falls back to 'Rubik' in every font stack.

ITALIC ACCENT RULE (brand signature):
Every Instrument Serif heading contains 1-2 italic words wrapped in <em>, colored
in #059669 — the editorial pull-quote effect. Examples:
"ערב טוב, <em>אוריה</em> 👋" / "חמישה <em>קורסים</em>" / "היום · <em>רביעי</em>"
NEVER italicize body text or labels.

Hard rules:
- Use exact hex values from tokens.json. Do not substitute.
- 30% rule: ~70% cream + white + ink, ~30% green, semantic colors only as
  information (not decoration).
- Logical CSS properties (margin-inline-start, etc.).
- Spring motion (stiffness 380, damping 32, 180–220ms).
- No decorative gradients except the 3px green-gradient top border on hero card.
- AA contrast minimum.

Task: build the Design System library with sections for Colors (Neutrals,
Nutrition, Fitness, Semantic), Typography (3-font system + scale), Hero Card
(the signature Combo-B card), Item Types, Components (Button, Chip, Wordmark,
Header, BottomNav, FAB, Ring, MiniTile), Spacing, Radius, Motion.
Pull all values directly from tokens.json and reference bento-design-system.html.
```

ואז העלה את `tokens.json` + `00-MASTER-BRIEF-EN.md` + `bento-design-system.html` + `combo-B-style3-cream.html` כקבצים מצורפים.

### לוודא לפני המעבר לשלב 2:

בקש: *"Show me the Color palette swatches. Confirm canvas = #FAF7F2, ink = #2A1A0A, primary = #059669, primary-deep = #065F46."*

בקש: *"Show me the typography specimen. Confirm the three fonts: Instrument Serif (headings), Fraunces (numbers), Inter (body). Show the italic accent rule with an <em> in green."*

אם הוא הציג צבעים אחרים או פונט אחר (Plus Jakarta Sans, Heebo display, SF Pro) — **תעצור ותתקן**. אל תמשיך עם Design System לא נכון.

---

## שלב 2 — מסך אחד בכל פעם

לכל מסך מ-01 עד 13:

### תבנית הפרומפט v2 (תמיד אותו פורמט):

```
Design Goal: <screen name from the brief file>
Design System: Use the "Calori Life — Design System v2" library I built. Do not
use any colors, fonts, or sizes that aren't in it.

Sources:
- Read the brief file <NN-screen-name.md> in full.
- Cross-reference bento-design-system.html for visual style and density.
- Match the visual style of the canonical reference HTML for the screen type:
  · Home: combo-B-style3-cream.html
  · Calendar: inst-1-calendar.html
  · Studies: inst-2-studies.html
  · Tasks: inst-3-tasks.html
  · Calori (nutrition): inst-4-calori.html
  · Pomodoro / Focus: inst-5-pomodoro.html

Output:
- Mobile (390×844) as primary.
- Desktop (1280) as secondary, max content width 1120.
- Hebrew RTL content. Use the example strings from the brief.
- All states the brief lists (loading / empty / error / dark).

VISUAL CONSTRAINTS (do NOT break):
- Canvas #FAF7F2 (warm cream). NEVER #F5F5F7.
- Ink #2A1A0A (warm). NEVER #1D1D1F.
- Hairlines rgba(180,140,80,.14) (warm gold-toned). NEVER #E5E7EB.
- Three-font system mandatory:
  · Instrument Serif for headings + italic accents in #059669
  · Fraunces weight 600 (opsz 144, -0.04em) for ALL numbers ≥ 14px
  · Inter for body/UI
  · Rubik fallback for Hebrew
- Every heading contains 1-2 italic <em> words in green (editorial signature).
- Item-type colors (strict):
  · Meal: #059669 FLOOD, white text
  · Workout: #7C3AED FLOOD, white text
  · Exam: #FEF2F2 bg + #EF4444 border + #991B1B text
  · Study event: #EFF6FF bg + #2563EB border + #1E40AF text
  · Personal event: #FFFFFF + hairline border + ink text
  · Note: #FFFBEB bg + #D97706 border + #92400E text
  · Empty slot: dashed warm border + Instrument Serif italic placeholder
- No decorative gradients (only allowed: hero card top 3px green gradient,
  brand wordmark gradient on logo).
- Spring motion 180–220ms. No long eases, no parallax.
- AA contrast.

If you need to make a judgment call, choose the QUIETER, MORE EDITORIAL option.
```

הדבק את התוכן של קובץ ה-brief המתאים (`01-home-smartdashboard.md` למשל) **מתחת** לפרומפט הזה.

**טיפ:** העלה גם את קובץ ה-HTML reference של המסך (`combo-B-style3-cream.html` או `inst-N-*.html`) כקובץ מצורף נוסף. זה הופך כמעט בלתי אפשרי ל-Claude Design לסטות.

### איטרציות נכונות (חוזרות לכל מסך):

אחרי שמופק עיצוב ראשון:

1. *"Show me the empty state."*
2. *"Show me the loading state."*
3. *"Show me dark mode."*
4. *"Replace the [X] icon with `<img src='/logo-calori.jpg'>` — this represents the Calori brand."*
5. *"This card is too loud. Reduce visual weight: thinner border, smaller shadow, less saturated chip background."*

**אל תבקש "תעצב את כל המסכים".** מסך-מסך, ואז states שלו, ואז המסך הבא.

---

## שלב 3 — מה לעשות כשהמודל סוטה

הסטיות הנפוצות (v2):

| סטייה | תיקון |
|---|---|
| משתמש ב-`#F5F5F7` קר כ-canvas | *"Canvas is #FAF7F2 warm cream. Replace all #F5F5F7."* |
| משתמש ב-`#1D1D1F` ל-ink | *"Ink is #2A1A0A warm dark brown. Replace all #1D1D1F."* |
| משתמש ב-`#E5E7EB` ל-borders | *"Hairlines are rgba(180,140,80,.14) warm gold-toned. Replace all #E5E7EB."* |
| משתמש ב-Plus Jakarta Sans / Heebo display / SF Pro לכותרות | *"Headings use Instrument Serif weight 400. Numbers use Fraunces weight 600 (opsz 144, -0.04em letter-spacing). Body uses Inter. Hebrew falls back to Rubik."* |
| מספרים דקים (Instrument Serif 400 על מספרים) | *"All numbers ≥ 14px must use Fraunces weight 600 with -0.04em letter-spacing. Instrument Serif is for text only."* |
| בלי italic accents בכותרות | *"Add 1-2 italic <em> words in green (#059669) to every Instrument Serif heading. e.g. 'ערב טוב, <em>אוריה</em>' or 'היום · <em>רביעי</em>'. This is the brand signature."* |
| Italic על טקסט body | *"Italic is reserved for accent words in headings and hero numbers only. Body text and labels are upright."* |
| Hero מפוצל לכרטיס greeting + כרטיס nutrition | *"On Home, greeting + nutrition stats are MERGED in ONE white card (Combo-B layout). They share padding, divider, and the 3px green-gradient top accent line. See combo-B-style3-cream.html."* |
| מוסיף gradient רקע "להרגשה" | *"Remove decorative gradient. The only allowed gradient is the 3px green top accent on the hero card and the wordmark stripe on the brand logo."* |
| ארוחת קלורי כ-card לבן עם border ירוק | *"Calori meal items are GREEN FLOOD (#059669 background, white text). Not a bordered card."* |
| Exam reminder כ-flood אדום | *"Exam reminder cards in v2 are SOFT: #FEF2F2 background + 1px #EF4444 border + #991B1B text. Not flood. Flood reds are only for active exam blocks in calendar grid."* |
| Empty slot עם placeholder Inter רגיל | *"Empty slot uses Instrument Serif italic 13px in #8A7A6A on a dashed warm border. e.g. 'ריק · לחץ + להוסיף'. This is part of the editorial signature."* |
| RTL לא נכון | *"Use logical properties only: margin-inline-start, padding-inline-end, text-start."* |
| FAB ירוק `#059669` | *"FAB body is #065F46 (forest deep). The brighter #059669 is only the FAB shadow, italic accents, and meal floods."* |
| Wordmark עם 'life' באותו פונט | *"Wordmark: 'calori' in Inter weight 700 size 15px, ' life' in Instrument Serif italic weight 400 size 17px color #059669."* |
| BottomNav עם 5 פריטים | *"BottomNav has exactly 4 items: המנהל האישי, בית, לימודים, פוקוס. FAB is floating at bottom-left:20 / bottom:88, NOT centered in nav."* |

---

## שלב 4 — סדר העבודה המומלץ

```
01 — Home (SmartDashboard)      ← הכי חשוב, מסך הראייה (BottomNav: בית)
14 — Focus Hub                   ← מסך ראשי חדש (BottomNav: פוקוס, עוטף Pomodoro)
04 — Studies Hub                 ← מסך ראשי (BottomNav: לימודים)
XX — Command Center              ← מסך ראשי (BottomNav: המנהל האישי, מתכנן AI)
13 — Onboarding                  ← מה שמשתמש רואה ראשון
12 — Auth (login/register)
07 — Tasks                       ← דפוס משימות (FAB → Tasks)
08 — Notes                       ← דפוס פתקים צבעוניים (FAB → Notes)
03 — Add Item Sheet              ← bottom sheet עם 3 tabs (FAB → Add)
02 — Calendar (5 views)          ← הכי מורכב
05 — Course Detail
09 — Calori (read-only)          ← נגיש דרך כרטיס בבית
10 — Pomodoro Timer              ← רכיב פנימי של Focus Hub
11 — Settings                    ← נגיש דרך avatar בheader
06 — More Hub                    ← legacy (לא בשימוש בBottomNav יותר)
```

**מיפוי ניווט אמיתי באפליקציה:**

| איך הגעת? | פותח |
|---|---|
| BottomNav · בית | SmartDashboard (Home) |
| BottomNav · המנהל האישי | CommandCenter (AI planner) |
| BottomNav · לימודים | StudiesHub |
| BottomNav · פוקוס | FocusHub (PomodoroTimer inline) |
| Header avatar | Settings |
| FAB → Add | AddItemSheet (3-tab bottom sheet) |
| FAB → Tasks | TasksView |
| FAB → Notes | NotesView |
| Home: Nutrition tile | CaloriView |
| Studies: course card | CourseView |
| CommandCenter: calendar | CalendarView |

הסדר הזה בנוי כך שהכרטיסים והכפתורים יציבים לפני שאתה ניגש למסכים שתלויים בהם.

---

## שלב 5 — איך לוודא שמה שיצא תואם ל-bento

לכל מסך שיצא, השווה ל-`bento-design-system.html` בכמה ממדים:

- [ ] צבעי הרקע: canvas `#F5F5F7` או surface `#FFFFFF`?
- [ ] רדיוס הכרטיסים: 16px (lg) או 20px (xl)?
- [ ] טיפוגרפיה: Heebo? heading 28/22/18, body 16/14?
- [ ] item-type colors נכונים לפי הטבלה ב-Master Brief?
- [ ] FAB ירוק `#059669` במיקום **floating bottom-right** (לא במרכז ה-nav)?
- [ ] FAB עם אייקון `<Plus>` שמסתובב 135° לפתיחה?
- [ ] FAB נפתח ל-**vertical stack של 3 כפתורים** (Add / Tasks / Notes) עם תוויות טקסט בצד שמאל?
- [ ] BottomNav עם **4 פריטים** (המנהל האישי / בית / לימודים / **פוקוס**)?
- [ ] דף בית כ-bento **3 עמודות ב-lg** עם 4 tiles (greeting full-width, calori 2-col, studies 1-col, schedule 2-col), לא 6-עמודות כמו ב-mockup הישן?
- [ ] Header end side: **wordmark גדול בלבד** "calori life" (text-2xl), בלי ריבוע לוגו?
- [ ] טקסט "calori" ב-ink + "life" בירוק primary עם font-medium (משקל קל יותר)?

אם משהו לא תואם — תקן בפרומפט revision, אל תקבל "אופי שונה".

---

## טיפים אחרונים

- **תמיד באנגלית בפרומפט.** התוכן עצמו בעברית, אבל ההוראות באנגלית — Claude Design עובד טוב יותר ככה.
- **שמור גרסאות.** כל איטרציה משמעותית — snapshot.
- **אל תפחד לאמר "no, redo".** עדיף 3 איטרציות נכונות מאשר לקבל משהו לא תואם.
- **בקש מקורות.** *"Quote which value from tokens.json you used here."* — זה מכריח את המודל להיות מדויק.
- **לוגואים:** הגרדיאנט המדויק זמין גם כ-CSS var: `var(--gradient-brand)`. אם המודל מנסה להמציא גרדיאנט אחר — תפנה לזה.

---

*v1 · 2026-06-03 · עוריה*
