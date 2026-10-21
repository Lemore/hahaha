# Milestone 1 – הקמת הפרויקט ופריסה אוטומטית

> תוכנית בנייה ל-Milestone 1, לפי `MILESTONES.md`, `ARCHITECTURE.md` ו-`DESIGN.md`.

## מטרה
שלד פרויקט Next.js 16 שרץ מקומית ומציג דף עברי זמני עם הכותרת "חה חה חה", ומסלול פריסה אוטומטי GitHub → Vercel (Production מ-`main`, ‏Preview מכל ענף אחר).

## מצב קיים (נבדק)
- Node.js ‏`v24.14.0` ו-npm כבר מותקנים במחשב → שלב "התקנת Node.js" כבר בוצע; רק לוודא שזו גרסת LTS (24 היא LTS).
- ה-repo המקומי קיים, וכבר מחובר ל-`https://github.com/Lemore/hahaha.git` (`origin`).
- `.gitignore` קיים וכבר חוסם `.env`, `.env.*` (חוץ מ-`.env.example`), `node_modules/`, `.next/`, `.vercel/`, `*.tsbuildinfo`.
- בתיקייה יש `CLAUDE.md` ו-`spec/` → `create-next-app` לא ירוץ ישירות בתיקייה הזו (הוא מסרב לתיקייה עם קבצים קיימים).

## גישה
1. ליצור את שלד Next.js בתיקייה זמנית ב-scratchpad בעזרת `npx create-next-app@latest` עם האפשרויות: TypeScript, Tailwind CSS, App Router, ESLint, בלי תיקיית `src/`, alias ברירת מחדל `@/*`, ‏npm.
2. להעתיק לשורש הפרויקט את קובצי השלד **חוץ מ-`.gitignore`, `README.md` ו-`.git`** (לא מחליפים את ה-`.gitignore` הקיים).
3. להריץ `npm install` בשורש הפרויקט, ולוודא ש-`next` בגרסה 16.x העדכנית (גרסת תיקון אחרונה).
4. לפשט את קובצי השלד לדף הזמני (ראו טבלה), ולמחוק את קובצי הדוגמה של התבנית שלא בשימוש (למשל SVG-ים ב-`public/`) — אלה קבצים שנוצרו זה עתה בשלד, לא קבצים של המשתמשת.

## קבצים ליצור / לשנות

| קובץ | תוכן |
|---|---|
| `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts` | מהשלד של create-next-app, בלי שינוי מהותי. |
| `app/layout.tsx` | `<html lang="he" dir="rtl">`, ‏`metadata` עם `title: "חה חה חה"`, ייבוא `globals.css`. בלי גופני Geist של התבנית (הגופנים האמיתיים נכנסים ב-Milestone 2). בלי רישום Service Worker (Milestone 4). |
| `app/page.tsx` | דף זמני: כותרת `<h1>` ממורכזת עם הטקסט מ-`UI_TEXT.title`. Server Component פשוט (יהפוך ל-Client Component ב-Milestone 2). |
| `app/globals.css` | `@import "tailwindcss";` בלבד, בלי משתני ה-dark mode של התבנית. |
| `lib/ui-text.ts` | `export const UI_TEXT = { title: "חה חה חה" } as const;` — שאר הטקסטים יתווספו ב-Milestone 2–3. |
| `.env.example` | `OPENAI_API_KEY=` ו-`OPENAI_MODEL=` בלי ערכים. |
| `.env` | העתקה חד-פעמית של `.env.example`. **לא קוראים אותו** אחרי היצירה; המשתמשת ממלאת. |
| `.gitignore` | הוספת שורה `next-env.d.ts` (קובץ שנוצר אוטומטית על ידי Next.js; זו גם ברירת המחדל של התבנית). לא מסירים שום שורה. |
| `CLAUDE.md` | מילוי "פקודות הרצה": הרצה `npm run dev`, בדיקות "אין" (לפי ARCHITECTURE סעיף 2.11 — בדיקות ידניות). |
| `spec/MILESTONES.md` | סימון 🟡 ליד כותרת Milestone 1 בסיום הבנייה. |

**לא בונים ב-Milestone זה:** `app/api/joke/route.ts`, ‏`lib/joke-service.ts`, ‏`lib/validation.ts`, ‏`app/manifest.ts`, ‏`public/sw.js`, ‏`public/icons/`, ‏`public/hero.png`, חבילת `openai`, גופנים ועיצוב — כל אלה שייכים ל-Milestones 2–4.

## בדיקה עצמית בזמן הבנייה (לפני סימון 🟡)
- `npm run build` עובר בלי שגיאות.
- `npm run lint` עובר.
- `npm run dev` → פתיחת `http://localhost:3000` בדפדפן המובנה: הכותרת "חה חה חה" מוצגת, ול-`<html>` יש `lang="he"` ו-`dir="rtl"`. בדיקה גם בתצוגת מובייל (375px).
- `git status` מראה ש-`.env` **לא** מופיע ברשימת הקבצים שיתווספו, ו-`.env.example` כן.
- סגירת השרת בסיום.

## פעולות של המשתמשת (הדרכה צעד אחר צעד, אחרי הבנייה)
הסדר מתוכנן כך שכל צעד מתבסס על הקודם. בשום שלב לא מדביקים מפתחות בשיחה.

1. **בדיקה מקומית** — "הרץ כדי שאבדוק": פתיחת האתר בדפדפן.
2. **דחיפה ל-GitHub** — לאחר אישור מפורש ("דחוף שינויים לגיטהאב"): commit + push ל-`main`. ה-repo כבר מחובר; צריך לוודא שה-repo `Lemore/hahaha` קיים ב-GitHub (אם לא — המשתמשת יוצרת אותו, ריק, בלי README).
3. **OpenAI** (ב-platform.openai.com):
   - יצירת שני Projects: למשל `hahaha-dev` ו-`hahaha-prod`.
   - בכל Project: הגדרת Hard Spend Limit של 10$ בחודש (Project → Limits / Budget).
   - הפקת מפתח API לכל Project ושמירתו במקום בטוח.
   - מילוי מפתח ה-dev ב-`.env` המקומי, ו-`OPENAI_MODEL=gpt-5`.
4. **Vercel** (vercel.com):
   - יצירת חשבון Hobby דרך "Continue with GitHub".
   - Add New → Project → בחירת ה-repo `hahaha` → Framework: Next.js (מזוהה אוטומטית) → Deploy.
   - Settings → Environment Variables:
     - `OPENAI_API_KEY` = מפתח ה-dev, היקף **Preview** בלבד, מסומן **Sensitive**.
     - `OPENAI_API_KEY` = מפתח ה-prod, היקף **Production** בלבד, מסומן **Sensitive**.
     - `OPENAI_MODEL` = `gpt-5`, היקפים Preview + Production.
   - פריסה מחדש (Redeploy) כדי שהמשתנים ייכנסו לתוקף.
5. **בדיקת Preview** — דורש push לענף נפרד (למשל `preview-test`), ולכן **ייעשה רק אחרי אישור מפורש של המשתמשת**. בודקים ב-Vercel שנוצר Preview Deployment עם כתובת, ופותחים אותה.
6. **בדיקה בטלפון** — פתיחת כתובת ה-Production בטלפון ובדיקה שהדף בעברית ומיושר לימין.

> הערה: המשתנים ב-Vercel לא נצרכים עדיין בקוד (הקריאה ל-OpenAI נבנית ב-Milestone 2), אבל מוגדרים כבר עכשיו לפי ה-Milestone. ה-Spend Limit מוגדר לפני שהאתר החי משתמש במפתח (ARCHITECTURE 1.3).

## מיפוי ל-Definition of Done

| תנאי | איך נבדק | מי |
|---|---|---|
| האתר רץ מקומית (`npm run dev`) ונפתח בדפדפן | בדיקה עצמית + "הרץ כדי שאבדוק" | Claude + המשתמשת |
| הקוד ב-GitHub, ו-`.env` לא קיים בו | `git status` לפני commit + צפייה ב-repo ב-GitHub | Claude + המשתמשת |
| Push ל-`main` יוצר פריסת Production מוצלחת | לשונית Deployments ב-Vercel: סטטוס Ready | המשתמשת (בהדרכה) |
| Push לענף אחר יוצר Preview עם כתובת | push לענף בדיקה (באישור) ופתיחת הכתובת | Claude + המשתמשת |
| הדף בעברית וב-RTL במובייל | תצוגת מובייל בדפדפן המובנה + טלפון אמיתי בכתובת Production | Claude + המשתמשת |
| משתני הסביבה ב-Vercel בהיקפים הנכונים ו-Sensitive | צפייה ב-Settings → Environment Variables | המשתמשת (בהדרכה) |
| Spend Limit של 10$ בשני ה-Projects | צפייה בהגדרות ה-Limits ב-OpenAI | המשתמשת (בהדרכה) |

## החלטות / ADR
- אין החלטה טכנית חדשה שדורשת ADR — הכול לפי ARCHITECTURE.md. (יצירת השלד בתיקייה זמנית היא פרט ביצוע, לא החלטה.)
