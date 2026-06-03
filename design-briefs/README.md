# Calori Life — Claude Design briefs

מדריך השימוש בתיקייה הזאת ב-claude.ai/design.

## תיקייה הזאת מכילה

| קובץ | מטרה | פרויקט מתאים ב-Claude Design |
|---|---|---|
| `00-MASTER-BRIEF-EN.md` | המסמך הראשי — system, tokens, rules | Design System |
| `tokens.json` | טוקני עיצוב מובנים | Design System (import / paste) |
| `01-home-smartdashboard.md` | brief מסך הבית | Prototype |
| `02-calendar.md` | brief לוח שנה (5 תצוגות) | Prototype |
| `03-add-item-sheet.md` | brief sheet הוספה | Prototype |
| `04-studies-hub.md` | brief מסך לימודים | Prototype |
| `05-course-detail.md` | brief מסך קורס | Prototype |
| `06-more-hub.md` | brief תפריט "עוד" | Prototype |
| `07-tasks.md` | brief משימות | Prototype |
| `08-notes.md` | brief הערות | Prototype |
| `09-calori.md` | brief מסך קלורי (read-only) | Prototype |
| `10-pomodoro.md` | brief פומודורו | Prototype |
| `11-settings.md` | brief הגדרות | Prototype |
| `12-auth.md` | brief התחברות | Prototype |
| `13-onboarding.md` | brief אונבורדינג 4 שלבים | Prototype |
| `20-slide-deck.md` | brief מצגת 12 שקפים | Slide deck |
| `21-templates-assets.md` | brief לאייקון, OG, צילומי מסך, באנרים | Template (one each) |

## איך לעבוד

### שלב 1 — Design System
1. פתח ב-claude.ai/design את הפרויקט "Design System" שלך.
2. צור את הסעיפים: Colors, Typography, Spacing, Motion, Components.
3. הדבק את התוכן מ-`00-MASTER-BRIEF-EN.md` סעיף §2 ו-§4 לכל סעיף בהתאמה.
4. אופציונלי: ייבא את `tokens.json` אם הכלי תומך בייבוא.

### שלב 2 — Prototypes (מסכים)
לכל מסך:
1. צור Prototype חדש (מובייל 390×844).
2. פתח את קובץ ה-brief המתאים (`01`–`13`).
3. העתק את הסעיף **Prompt** בסוף הקובץ והדבק כפרומפט הראשון ב-Prototype.
4. הוסף `aspect: mobile + desktop` אם הכלי שואל.
5. אחרי שמופק עיצוב — בקש איטרציות לפי States שבקובץ (loading, empty, error, dark…).

### שלב 3 — Slide deck
1. צור Slide deck חדש.
2. הדבק את ה-Prompt מ-`20-slide-deck.md`.
3. אחרי הפקה ראשונה — בקש לעדכן שקפים ספציפיים לפי הצורך.

### שלב 4 — Templates / נכסים
לכל נכס ב-`21-templates-assets.md`:
1. צור Template חדש בגודל המתאים.
2. הדבק את ה-Prompt של הנכס.

## פרומפט עוטף (להוסיף לתחילת כל בקשה)

```
Use the Calori Life Design System (see master brief).
Hebrew first, RTL. Logical props only.
Item-type colors: meals green flood, workouts purple flood, exams red flood,
lectures white + info border, personal events white + neutral border,
notes white + warning border.
Quiet by default; color is information, not decoration.
iOS-inspired, calm, premium. Spring motion 180–220ms. AA contrast.
```

## טיפים

- **תמיד באנגלית בפרומפט**, גם אם הפלט בעברית — Claude Design עובד טוב יותר באנגלית בהוראות עיצוב.
- **התחל מ-Design System לפני המסכים** — זה מעלה את עקביות העיצוב משמעותית.
- **שמור גרסאות** — בכל איטרציה משמעותית, שמור snapshot.
- **State לפני state** — אל תבקש "תעצב את כל המסכים" בפרומפט אחד. מסך אחד, ואז states שלו, ואז המסך הבא.

---

*v1 · 2026-06-03*
