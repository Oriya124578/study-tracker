# איך לעבוד עם Claude Design — מדריך אישי לבניית מסכי Calori Life

> מטרה: לקבל מ-Claude Design (claude.ai/design) מסכים שמתאימים **בדיוק** למה שיש לנו באפליקציה בפועל, בלי "התלהבויות עיצוביות" של המודל.

> ⚠️ **חוק הברזל של הקנון:** הקוד החי תחת `src/components/` הוא מקור האמת. הקבצי brief (`01–13`) חייבים לתאר את מה שיש בקוד. אם נראה פער בין `bento-design-system.html` (מסמך השראה) לבין brief מסך — **ה-brief תמיד גובר**. ה-HTML הוא ספריית tokens ורכיבים, לא מבנה מסך.

---

## עקרון על — Ground Truth אחד

Claude Design יעצב לפי מה שאתה מזין. כל בקשה חייבת להתחיל מאותו מקור — אחרת כל מסך ייצא בסגנון אחר. המקור שלנו:

1. **`tokens.json`** — הטוקנים המדויקים (צבעים, גופנים, רדיוסים, מרווחים, motion). כולל את `color.logoGradient` עם 4 הסטופים המדויקים.
2. **`00-MASTER-BRIEF-EN.md`** — המסמך הראשי (voice, rules, item-type colors).
3. **`bento-design-system.html`** — האמת הויזואלית (איך זה אמור להיראות בפועל).

**חוק ברזל:** לפני כל פרומפט מסך, תוודא ש-Claude Design ראה את שלושת המקורות הללו. בלי זה הוא ינחש.

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

### פרומפט פתיחה (הדבק בפרויקט Design System):

```
You are building the design system for "Calori Life" — a Hebrew-first (RTL),
iOS-inspired personal life manager for Israeli university students.

Authoritative sources (in priority order):
1. tokens.json — exact values for all colors, type, spacing, motion, components.
2. 00-MASTER-BRIEF-EN.md — voice, rules, item-type color mapping.
3. bento-design-system.html — the visual ground truth I already approved.

Hard rules:
- Use the exact hex values from tokens.json. Do not "improve" or substitute.
- Info blue is #2563EB (matches our logo gradient blue stop), NOT #3B82F6.
- The brand gradient (logo gradient) has 4 stops, in order:
  0% #10B981 → 35% #059669 → 65% #2563EB → 100% #7C3AED, linear 135deg.
- Hebrew first, RTL. Use logical CSS properties only (margin-inline-start, etc.).
- iOS-inspired: generous whitespace, rounded corners (16/20px), spring motion
  (stiffness 380, damping 32, 180–220ms).
- Color is information, not decoration. No decorative gradients except the
  brand gradient on hero/logo/headings.
- AA contrast minimum.

Task: build the Design System library with sections for Colors, Typography,
Spacing, Radius, Shadow, Motion, and Components (Button, Input, Checkbox,
Switch, Chip, Card, ListRow, BottomSheet, BottomNav, FAB).
Pull all values directly from tokens.json. Do not invent values.
```

ואז העלה את `tokens.json` + `00-MASTER-BRIEF-EN.md` + `bento-design-system.html` כקבצים מצורפים.

### לוודא לפני המעבר לשלב 2:

בקש: *"Show me the Color palette swatches. Confirm info-blue = #2563EB."*

אם הוא הציג `#3B82F6` או צבע אחר — תעצור ותתקן לפני שממשיכים. **אל תמשיך עם Design System לא נכון.**

---

## שלב 2 — מסך אחד בכל פעם

לכל מסך מ-01 עד 13:

### תבנית הפרומפט (תמיד אותו פורמט):

```
Design Goal: <screen name from the brief file>
Design System: Use the "Calori Life — Design System" library I built. Do not
use any colors, fonts, or sizes that aren't in it.

Sources:
- Read the brief file <NN-screen-name.md> in full.
- Cross-reference bento-design-system.html for visual style and density.

Output:
- Mobile (390×844) as primary.
- Desktop (1280) as secondary, max content width 1120.
- Hebrew RTL content. Use the example strings from the brief.
- All states the brief lists (loading / empty / error / dark).

Constraints (do NOT break):
- No decorative gradients outside hero/logo.
- Brand gradient only allowed on: logo ring, page title, hero card border.
- Item-type colors are RULES, not suggestions:
  · Lecture/Tutorial event: white card + info border (#2563EB), no flood
  · Personal event: white card + neutral border (#E5E7EB)
  · Exam: RED flood card (#EF4444), white text
  · Meal: GREEN flood (#059669), white text
  · Workout: PURPLE flood (#7C3AED), white text
  · Note: white card + amber accent (#F59E0B)
  · Pomodoro: white card + purple-soft icon chip (#EDE9FE)
- Font: Heebo (sans). Bold weight = 700, never 800+ for body.
- Spring motion 180–220ms. No long eases, no parallax.
- AA contrast.

If you need to make a judgment call, choose the QUIETER option.
```

הדבק את התוכן של קובץ ה-brief המתאים (`01-home-smartdashboard.md` למשל) **מתחת** לפרומפט הזה.

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

הסטיות הנפוצות:

| סטייה | תיקון |
|---|---|
| משתמש ב-`#3B82F6` במקום `#2563EB` | *"info-blue is #2563EB. Replace all #3B82F6 instances."* |
| מוסיף gradient רקע "להרגשה" | *"Remove decorative gradient. Brand gradient is allowed only on logo ring and page title."* |
| משתמש ב-bold 800/900 לטקסט גוף | *"Body weight is 400 or 500. Bold is 700, used only for titles and emphasis."* |
| RTL לא נכון (margin-left במקום logical) | *"Use logical properties only: margin-inline-start, padding-inline-end, text-start. The layout flips for RTL."* |
| ארוחת קלורי כ-card לבן עם border ירוק | *"Calori meal items are GREEN FLOOD (#059669 background, white text). Not a bordered card."* |
| משתמש ב-icon ספציפי (לוסייד) במקום הלוגו של calori | *"Use `<img src='/logo-calori.jpg' className='w-8 h-8 rounded-xl object-contain'>` instead of UtensilsCrossed."* |
| מסך כהה בברירת מחדל | *"Default theme is light. Dark is an opt-in mode."* |
| BottomNav עם 5 פריטים + FAB מרכזי | *"BottomNav has exactly 3 items: המנהל האישי (Bot), בית (Home), לימודים (BookOpen). The FAB is a separate floating button at fixed bottom-right, not centered in the nav."* |
| Home כ-bento 6 עמודות | *"Home uses a 3-column responsive bento (lg). Tiles in order: greeting (span 3), nutrition+fitness (span 2), studies (span 1), schedule (span 2). See 01-home-smartdashboard.md."* |
| FAB נפתח ישר ל-AddSheet | *"The FAB toggles a fan-out radial menu with 5 buttons (Add / Tasks / Notes / Calori / Pomodoro). Only the Add button opens AddItemSheet."* |

---

## שלב 4 — סדר העבודה המומלץ

```
01 — Home (SmartDashboard)      ← הכי חשוב, מסך הראייה
13 — Onboarding                  ← מה שמשתמש רואה ראשון
12 — Auth (login/register)
04 — Studies Hub                 ← נקודת התייחסות לכרטיסים
07 — Tasks                       ← דפוס משימות
08 — Notes                       ← דפוס פתקים צבעוניים
03 — Add Item Sheet              ← bottom sheet עם 3 tabs
02 — Calendar (5 views)          ← הכי מורכב
05 — Course Detail
09 — Calori (read-only)
10 — Pomodoro
11 — Settings (incl. notifications)
06 — More Hub
```

הסדר הזה בנוי כך שהכרטיסים והכפתורים יציבים לפני שאתה ניגש למסכים שתלויים בהם.

---

## שלב 5 — איך לוודא שמה שיצא תואם ל-bento

לכל מסך שיצא, השווה ל-`bento-design-system.html` בכמה ממדים:

- [ ] צבעי הרקע: canvas `#F5F5F7` או surface `#FFFFFF`?
- [ ] רדיוס הכרטיסים: 16px (lg) או 20px (xl)?
- [ ] טיפוגרפיה: Heebo? heading 28/22/18, body 16/14?
- [ ] item-type colors נכונים לפי הטבלה ב-Master Brief?
- [ ] FAB ירוק `#059669` במיקום **floating bottom-right** (לא במרכז ה-nav)?
- [ ] FAB נפתח ל-**fan-menu של 5 כפתורים** (Add / Tasks / Notes / Calori / Pomodoro), לא ל-AddSheet ישירות?
- [ ] BottomNav עם **3 פריטים בלבד** (המנהל האישי / בית / לימודים)?
- [ ] דף בית כ-bento **3 עמודות ב-lg** עם 4 tiles (greeting full-width, calori 2-col, studies 1-col, schedule 2-col), לא 6-עמודות כמו ב-mockup הישן?
- [ ] לוגו calori life (4-ריבועים עם ספר) ב-header, לא book-icon מ-lucide?
- [ ] טקסט "calori" ב-ink + "life" בירוק primary?

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
