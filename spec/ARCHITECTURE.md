# ARCHITECTURE – "חה חה חה"

> מסמך ארכיטקטורה טכנית למוצר "חה חה חה", על בסיס PRD.md.
> המסמך מתאר את ה-Technology Stack שנבחר ואת מבנה המערכת. הוא אינו כולל Milestones, משימות או לוחות זמנים.
>
> **החלטות שהתקבלו מול בעלת המוצר בשלב זה:**
> 1. בשלב הראשון נעשה שימוש במודל GPT5, וההחלפה למודל אחר תתבצע לפני מועד הסרתו (ראו סעיף 1.3).
> 2. האתר מוגדר כפרויקט אישי שאינו מסחרי, ולכן הוא מתארח בתוכנית Hobby החינמית של Vercel.
> 3. תקרת הוצאה (Hard Spend Limit) של 10$ בחודש מוגדרת לכל Project ב-OpenAI, כבר בשלב ההקמה.
> 4. הבדיקות במהלך הפיתוח מתבצעות בהרצה מקומית על מחשב בעלת המוצר (נדרש Node.js).

---

## 1. Technology Stack שנבחר

### 1.1 טבלת רכיבים

| תחום | טכנולוגיה | תפקיד |
|---|---|---|
| Framework (Frontend + Backend) | **Next.js 16** (App Router), עם **TypeScript** | מסך ה-UI ונקודת ה-API בצד השרת, באותו פרויקט |
| UI | **React** (מגיע עם Next.js) | רכיבי הממשק והניהול של מצבי המסך |
| עיצוב | **Tailwind CSS** | עיצוב Mobile-first ותמיכה ב-RTL |
| PWA – Manifest | Manifest מובנה של Next.js ‏(`app/manifest.ts`) | הגדרות התקנה: שם, אייקונים, צבעים |
| PWA – Service Worker | Service Worker ידני וקטן ‏(`public/sw.js`) | שמירת מעטפת האפליקציה ב-Cache, כדי שתיטען גם בלי חיבור |
| Backend | **Next.js Route Handler** שרץ כ-Vercel Function ‏(Node.js runtime) | קבלת הבקשה, ולידציה, קריאה ל-AI והחזרת הבדיחה |
| שירות AI | **OpenAI API**, דרך ה-SDK הרשמי ‏`openai` ו-Responses API | יצירת הבדיחה |
| מודל AI | `gpt-5`, מוגדר במשתנה סביבה | המודל שנקבע ב-PRD (ראו מגבלה בסעיף 1.3) |
| Database | **אין** | ה-PRD לא דורש שמירת נתונים |
| Authentication | **אין** | ה-PRD מגדיר שימוש אנונימי |
| ניהול קוד | **Git + GitHub** | Repository אחד |
| Hosting ו-Deployment | **Vercel**, תוכנית Hobby, עם חיבור ל-GitHub | Build ופריסה אוטומטיים בכל Push |

### 1.2 נימוקים להחלטות המרכזיות

- **Next.js על Vercel.** המוצר צריך Frontend וגם Backend, כי מפתח ה-AI חייב להישאר בשרת. Next.js מאפשר את שניהם בפרויקט אחד ובפריסה אחת. Vercel היא ברירת המחדל המועדפת לסוג מערכת כזה, והיא החברה שמפתחת את Next.js, כך שאין צורך בהגדרות פריסה מיוחדות. ל-Next.js יש גם תיעוד רשמי נרחב, כולל מדריך רשמי לבניית PWA, והיקף דוגמאות גדול שמתאים לפיתוח בעזרת כלי AI.
  - חלופות שנבחנו: ‏Vite + React עם Vercel Functions נפרדות, ו-SvelteKit. הן אפשריות, אבל Next.js מספק את שני החלקים באופן מובנה ונפוץ יותר.
- **בלי Database ובלי Authentication.** ה-PRD מגדיר שימוש אנונימי, בלי היסטוריה ובלי שמירת נתונים. לכן Supabase או כל מסד נתונים אחר אינם נדרשים, וגם ההנחיות לגבי סביבות Supabase ו-Database Migrations אינן רלוונטיות למוצר הזה.
- **SDK רשמי של OpenAI במקום שכבת הפשטה.** יש קריאה אחת בלבד, בלי Streaming ובלי כלים, ולכן ה-SDK הרשמי מספיק. ספרייה כמו Vercel AI SDK הייתה מוסיפה תלות בלי תועלת ממשית.
- **Service Worker ידני במקום ספריית PWA.** הדרישה היחידה במצב Offline היא שהממשק ייטען ויציג הודעת שגיאה. Service Worker קצר שמטפל בכך פשוט יותר מספרייה כמו Serwist, וזו גם הגישה שמוצגת במדריך הרשמי של Next.js. Manifest נוצר בכלי המובנה של Next.js.
- **תשובה מלאה במקום Streaming.** בדיחה היא טקסט קצר, וה-PRD מגדיר חיווי טעינה עד שהתשובה מגיעה. כך הלקוח והשרת פשוטים יותר.

### 1.3 סיכונים, מגבלות והסתייגויות

| נושא | פירוט | טיפול |
|---|---|---|
| **הסרת GPT5** | לפי עמוד ה-Deprecations הרשמי של OpenAI, ‏`gpt-5-2025-08-07` מוסר מה-API ב-11 בדצמבר 2026. ההחלפה הרשמית שמומלצת עבורו היא `gpt-5.6-sol`. | שם המודל נשמר במשתנה סביבה ‏`OPENAI_MODEL`, כך שההחלפה דורשת שינוי ערך ופריסה מחדש בלבד, בלי שינוי קוד. **חובה לבצע את ההחלפה לפני 11 בדצמבר 2026.** אפשר לבדוק את מועד ההסרה של כל מודל דרך שדה `shutdown_date` שמחזירה נקודת `GET /v1/models`. |
| **אין הגבלת קצב (לפי ה-PRD)** | אין מגבלה מצד המוצר על עלות השימוש ב-OpenAI. שימוש חריג עלול גם למצות את מכסות Vercel Hobby. | **Hard Spend Limit של 10$ בחודש** בכל Project ב-OpenAI, שמוגדר כבר ב-Milestone 1, לפני שהאתר החי משתמש במפתח. זו הגדרה תפעולית בחשבון OpenAI ולא פיצ'ר במוצר. כשהתקרה מושגת, הבקשות נכשלות עם שגיאת `429`, והמשתמש יראה את הודעת השגיאה הכללית. |
| **מגבלות Vercel Hobby** | שימוש לא מסחרי בלבד. ל-Function יש זמן ריצה ברירת מחדל של 10 שניות, שאפשר להגדיל עד 60. יש מכסות חודשיות, ובחריגה ממכסה ב-Hobby צריך בדרך כלל להמתין עד שיעברו 30 יום. | `maxDuration` של נקודת ה-API מוגדר ל-30 שניות. אם האתר יהפוך למסחרי, יש לעבור לתוכנית Pro. |
| **זמן תגובה של המודל** | GPT5 הוא מודל Reasoning, וזמן התגובה שלו עשוי להיות ארוך יחסית לבדיחה קצרה. | הבקשה נשלחת עם רמת ה-Reasoning הנמוכה ביותר שהמודל תומך בה, ועם Timeout בצד השרת. |
| **איכות הומור בעברית** | לא נבדקה. | יש לבדוק ידנית בסביבת Preview לפני פריסה ל-Production. |

---

## 2. ארכיטקטורת המערכת

### 2.1 מבנה כללי

```
┌──────────────────────────────┐        HTTPS         ┌──────────────────────────────┐        HTTPS        ┌─────────────┐
│  דפדפן / PWA מותקנת (Client) │ ───────────────────▶ │  Vercel                       │ ──────────────────▶ │  OpenAI API │
│  • מסך יחיד (React)          │  POST /api/joke      │  • Next.js – קבצים סטטיים      │  Responses API      │  (GPT5)     │
│  • Service Worker (Cache)    │ ◀─────────────────── │  • Route Handler /api/joke    │ ◀────────────────── │             │
│  • Manifest                  │   { joke } / error   │    + OPENAI_API_KEY (סודי)    │                     │             │
└──────────────────────────────┘                      └──────────────────────────────┘                     └─────────────┘
```

**אחריות הרכיבים:**

| רכיב | אחריות |
|---|---|
| **Client** | הצגת הממשק, ולידציה בסיסית של הקלט, שליחת בקשה, הצגת טעינה, בדיחה או שגיאה, וזיהוי מצב Offline |
| **Service Worker** | שמירת מעטפת האפליקציה ב-Cache וטעינתה בלי חיבור. **לעולם אינו שומר ב-Cache את `/api/joke`.** |
| **Route Handler ‏(`/api/joke`)** | ולידציה בצד השרת, בניית ה-Prompt, קריאה ל-OpenAI, טיפול בשגיאות והחזרת תשובה אחידה |
| **OpenAI API** | יצירת הבדיחה. מנגנוני הבטיחות המובנים של המודל הם מנגנון הסינון היחיד, בהתאם ל-PRD (F6). |

### 2.2 חלוקה ל-Modules ולשכבות

```
app/
  layout.tsx            ← <html lang="he" dir="rtl">, ‏metadata, רישום ה-Service Worker
  page.tsx              ← המסך הראשי (Client Component): טופס, טעינה, תוצאה, שגיאות
  manifest.ts           ← Web App Manifest
  api/joke/route.ts     ← POST: שכבת HTTP – ולידציה ומיפוי שגיאות לקודי תשובה
lib/
  joke-service.ts       ← שכבת שירות (server-only): Prompt וקריאה ל-OpenAI
  validation.ts         ← כללי ולידציה של הנושא (משותף ללקוח ולשרת)
  ui-text.ts            ← כל טקסטי הממשק בעברית, במקום אחד
public/
  sw.js                 ← Service Worker
  icons/                ← אייקוני PWA ‏(192px, ‏512px, ‏maskable)
```

**שכבות לוגיות:**
1. **Presentation:** ‏`page.tsx` ורכיביו. מכירה רק את חוזה ה-API ואת `ui-text.ts`.
2. **API ‏(HTTP):** ‏`route.ts`. מקבלת בקשה, מוודאת אותה, קוראת לשכבת השירות וממפה את התוצאה לתשובת HTTP.
3. **Service:** ‏`joke-service.ts`. הקוד היחיד שמכיר את OpenAI. מסומן ב-`import "server-only"`, כך שייבוא שלו בטעות לצד הלקוח ייכשל ב-Build.

### 2.3 Frontend

- **מסך יחיד** עם תיבת טקסט, לחצן ואזור תוצאה, בהתאם ל-PRD.
- **מצבי המסך:**

  | מצב | תיאור |
  |---|---|
  | `idle` | מוכן לבקשה |
  | `loading` | מוצג חיווי טעינה והלחצן מושבת |
  | `success` | מוצגת הבדיחה |
  | `error` | מוצגת הודעת שגיאה, מסוג `offline` או `general` |

  בקשה חדשה מחליפה את התוצאה הקודמת. אין שמירה של היסטוריה.
- **קלט:** `maxLength=100` בתיבת הטקסט. רווחים מנוקים (`trim`), וקלט ריק נשלח כנושא ריק.
- **RTL ועברית:** `dir="rtl"` ו-`lang="he"` ברמת המסמך. העיצוב משתמש ב-Logical Properties של Tailwind, כמו `ps-*` / `pe-*` ו-`text-start`.
- **טקסטי UI:** כל הטקסטים מרוכזים ב-`lib/ui-text.ts`, לפי הטבלה בסעיף 3.ג של ה-PRD.
- **זיהוי Offline:** אם `navigator.onLine === false`, או אם `fetch` נכשל בשגיאת רשת, תוצג הודעת "אין חיבור לאינטרנט".
- **גופנים:** Secular One ו-Rubik נטענים מ-Google Fonts בזמן ריצה, ואינם נשמרים ב-Cache של ה-Service Worker. בלי חיבור, הממשק מוצג בגופן מערכת חלופי.

### 2.4 Backend

**נקודת קצה יחידה:** `POST /api/joke`, ‏Runtime מסוג Node.js, ‏`maxDuration = 30`.

**לוגיקת הטיפול בבקשה:**
1. קריאת ה-JSON. אם הוא לא תקין, מוחזרת שגיאת `400`.
2. ולידציה: `topic` הוא מחרוזת, ואחרי `trim` אורכו לכל היותר 100 תווים. אם לא, מוחזרת שגיאת `400`.
3. קריאה ל-`generateJoke(topic)`:
   - **Instructions (קבועות):** לכתוב בדיחה אחת קצרה, **בעברית בלבד**, לקהל מבוגר (מותר הומור למבוגרים), ולהחזיר טקסט בלבד בלי הקדמות. אם המודל אינו מוכן לכתוב בדיחה על הנושא, עליו להחזיר בדיוק את הסימן `NO_JOKE` ותו לא.
   - **Input:** אם יש נושא, בקשה לבדיחה על הנושא. אם הנושא ריק, בקשה לבדיחה כלשהי.
   - הנושא מועבר כתוכן משתמש נפרד ולא משורשר לתוך ה-Instructions, כדי לצמצם השפעה של קלט זדוני על ההנחיות.
   - הפרמטרים: `model = process.env.OPENAI_MODEL`, רמת Reasoning נמוכה, ו-Timeout של כ-25 שניות.
4. אם המודל מחזיר טקסט בדיחה, מוחזרת תשובת `200` עם `{ joke }`.
5. אם המודל החזיר `NO_JOKE` (סירוב), או שהפלט ריק, מוחזרת תשובת `422` עם `{ error: "no_joke" }`. טקסט הסירוב אינו מוצג למשתמש, בהתאם ל-F6 ב-PRD.
6. אם הייתה שגיאה או Timeout מול OpenAI, מוחזרת שגיאת `502` עם `{ error: "generation_failed" }`. פרטי השגיאה נרשמים בלוג השרת בלבד.

### 2.5 Data Model

**אין ישויות נתונים שנשמרות.** אין Database, אין Cookies לזיהוי משתמש, ואין שימוש ב-`localStorage`.

| מידע | היכן הוא קיים | אורך חיים |
|---|---|---|
| הנושא שהוזן, הבדיחה ומצב המסך | זיכרון הדפדפן (React State) | עד רענון הדף |
| מעטפת האפליקציה (HTML, ‏JS, ‏CSS, אייקונים) | Cache Storage של ה-Service Worker | עד גרסה חדשה של ה-Service Worker |

### 2.6 APIs

**חוזה `POST /api/joke`:**

```
Request  (application/json)
{ "topic": "חתול" }            // אופציונלי; "" או חסר = בדיחה כלשהי

200 OK
{ "joke": "<טקסט הבדיחה בעברית>" }

400 Bad Request
{ "error": "invalid_input" }      // JSON לא תקין, טיפוס שגוי או יותר מ-100 תווים

422 Unprocessable Content
{ "error": "no_joke" }            // המודל סירב (NO_JOKE) או החזיר פלט ריק

502 Bad Gateway
{ "error": "generation_failed" }  // שגיאת OpenAI, Timeout או חריגה מ-Spend Limit
```

**מיפוי שגיאות להודעות בממשק:**

| מצב | הודעה בממשק |
|---|---|
| שגיאת רשת או `navigator.onLine === false` | אין חיבור לאינטרנט. נסו שוב כשהחיבור יחזור. |
| `422` ‏(`no_joke`) | אופס, משהו התפקשש - נסו שוב |
| `400` / `502` / כל שגיאה אחרת | משהו השתבש. נסו שוב. |

**אינטגרציה חיצונית:** OpenAI Responses API, דרך החבילה `openai`. זו האינטגרציה החיצונית היחידה במערכת.

### 2.7 Data Flow

**בקשת בדיחה עם חיבור:**
1. המשתמש לוחץ על הלחצן. ה-Client עובר למצב `loading` ומשבית את הלחצן.
2. ה-Client שולח `POST /api/joke` עם `{ topic }`.
3. ה-Service Worker מעביר את הבקשה ישירות לרשת, בלי Cache.
4. ה-Route Handler מוודא את הקלט וקורא ל-`joke-service`.
5. `joke-service` שולח בקשה ל-OpenAI עם המפתח מהסביבה ומקבל טקסט.
6. השרת מחזיר `{ joke }`. ה-Client עובר למצב `success` ומציג את הבדיחה במקום הקודמת.

**פתיחה בלי חיבור:**
1. ה-Service Worker מגיש את מעטפת האפליקציה מה-Cache, והממשק נטען.
2. לחיצה על הלחצן מזהה שאין חיבור, וה-Client מציג את הודעת `offline`.

### 2.8 Authentication, אבטחה ופרטיות

- **Authentication / Authorization:** אין, בהתאם ל-PRD.
- **הגנה על מפתח ה-API:**
  - המפתח נשמר במשתנה הסביבה `OPENAI_API_KEY`, **בלי** הקידומת `NEXT_PUBLIC_`. ב-Next.js רק משתנים עם הקידומת הזו נחשפים לדפדפן.
  - הקוד שמשתמש במפתח נמצא רק ב-`joke-service.ts`, שמסומן `server-only`.
  - ב-Vercel המפתח מוגדר כ-**Sensitive Environment Variable**, כלומר אי אפשר לקרוא את ערכו אחרי שהוגדר.
  - `.env` נמצא ב-`.gitignore` ולעולם אינו נכנס ל-Repository.
  - ה-Service Worker והקבצים הסטטיים אינם מכילים שום סוד.
- **ולידציה בצד השרת:** בדיקת אורך וטיפוס מתבצעת גם בשרת, ולא רק בדפדפן.
- **פרטיות:** אין חשבונות ואין שמירת נתונים. תוכן הנושא והבדיחה אינו נרשם בלוגים של השרת. רק סוג השגיאה וקוד הסטטוס נרשמים.
- **HTTPS:** מסופק אוטומטית על ידי Vercel. זה גם תנאי להתקנה כ-PWA.

### 2.9 PWA

- **Manifest ‏(`app/manifest.ts`):**

  | שדה | ערך |
  |---|---|
  | `name` / `short_name` | חה חה חה |
  | `lang` | `he` |
  | `dir` | `rtl` |
  | `display` | `standalone` |
  | `start_url` | `/` |
  | `theme_color` | `#F6B41F` ‏(Comic Yellow) |
  | `background_color` | `#FFF3D1` ‏(Cream) |
  | אייקונים | 192px, ‏512px ו-maskable. אימוג'י צוחק על רקע Comic Yellow (ראו DESIGN.md, סעיף 2.3). |

- **Service Worker ‏(`public/sw.js`):**
  - `install`: שמירה מראש ב-Cache של `/`, האייקונים והקבצים הסטטיים.
  - `fetch` עבור `/api/*`: **Network-only**.
  - `fetch` עבור ניווט ונכסים סטטיים: מהרשת קודם, ובהיעדר רשת מה-Cache.
  - שם ה-Cache כולל מספר גרסה. ב-`activate` נמחקים Caches ישנים.
- **רישום:** ה-Service Worker נרשם מצד הלקוח ב-`layout.tsx`, בסביבת Production בלבד, כדי שלא יפריע בפיתוח.

### 2.10 תשתיות, Hosting, Deployment ותצורה

**ניהול קוד:** Repository אחד ב-GitHub. הענף הראשי הוא `main`.

**Build ו-Deployment אוטומטיים:** הפרויקט ב-Vercel מחובר ל-Repository.

| פעולה ב-GitHub | תוצאה ב-Vercel |
|---|---|
| Push / Merge ל-`main` | Build ופריסה אוטומטית ל-**Production** |
| Push לכל ענף אחר / Pull Request | **Preview Deployment** אוטומטי עם כתובת זמנית לבדיקה |

**הסביבות ופרטי הגישה:**

| סביבה | היכן היא רצה | מפתח OpenAI | היכן נשמרים פרטי הגישה |
|---|---|---|---|
| Development | מחשב מקומי (`npm run dev`) | מפתח של פרויקט OpenAI לפיתוח | `.env` במחשב בלבד |
| Preview | Vercel, ענפים שאינם `main` | אותו מפתח פיתוח | משתני סביבה ב-Vercel, בהיקף Preview |
| Production | Vercel, ענף `main` | מפתח של פרויקט OpenAI נפרד ל-Production | משתני סביבה ב-Vercel, בהיקף Production בלבד |

- יוצרים **שני Projects נפרדים ב-OpenAI**, אחד לפיתוח ואחד ל-Production, כל אחד עם מפתח משלו ועם Spend Limit של 10$ בחודש. כך שימוש בבדיקות לא נוגס בתקציב האתר החי.
- **בדיקה בהרצה מקומית:** כל Milestone נבדק קודם בהרצה מקומית במחשב של בעלת המוצר (`npm run dev`), עם מפתח הפיתוח. לכן נדרשת התקנה של Node.js (גרסת LTS). כתובות ה-Preview של Vercel זמינות כאפשרות נוספת, אבל אינן חלק מתהליך הבדיקה הרגיל.

**משתני סביבה:**

| שם | תיאור | Sensitive |
|---|---|---|
| `OPENAI_API_KEY` | מפתח OpenAI | כן (Preview / Production) |
| `OPENAI_MODEL` | שם המודל. ערך נוכחי: `gpt-5`. יש להחליף לפני 11.12.2026. | לא |

**החלפת מודל:** משנים את `OPENAI_MODEL` ב-Vercel, בודקים ב-Preview ואז מבצעים פריסה מחדש ל-Production. אין צורך לשנות קוד.

**גרסאות:** יש להשתמש בגרסת התיקון העדכנית של Next.js 16, כולל עדכוני אבטחה, ובגרסת Node.js LTS שנתמכת על ידי Vercel.

### 2.11 החלטות טכניות נוספות

- **Rendering:** הדף הראשי הוא סטטי, וכל הלוגיקה הדינמית מתבצעת דרך `/api/joke`. כך הדף נטען מהר ונשמר בקלות ב-Cache של ה-Service Worker.
- **מניעת לחיצות כפולות:** הלחצן מושבת במצב `loading`.
- **Timeouts:** הקריאה ל-OpenAI מוגבלת לכ-25 שניות, וה-Function מוגבלת ל-30 שניות. הלקוח מחכה עד תשובה או שגיאה.
- **בדיקות:** בדיקות ידניות בהרצה המקומית לפני כל Push ל-`main`, ואחר כך בדיקה קצרה בכתובת Production. כדאי לבדוק נושא בעברית, נושא באנגלית, קלט ריק, 100 תווים, סירוב של המודל ומצב Offline. התקנה כ-PWA נבדקת בכתובת Production, כי היא דורשת HTTPS.

---

## מקורות

- [OpenAI – Deprecations](https://developers.openai.com/api/docs/deprecations): מועד הסרת GPT-5 וההחלפות המומלצות.
- [OpenAI – Pricing](https://developers.openai.com/api/docs/pricing): מחירי המודלים העדכניים.
- [OpenAI – Spend limits](https://developers.openai.com/api/docs/guides/spend-limits): תקרת הוצאה חודשית.
- [Next.js – Progressive Web Apps guide](https://nextjs.org/docs/app/guides/progressive-web-apps): Manifest ו-Service Worker ב-Next.js.
- [Vercel – Hobby plan](https://vercel.com/docs/plans/hobby): מגבלות התוכנית החינמית ומשך ריצה של Functions.
- [Vercel – Fair use guidelines](https://vercel.com/docs/limits/fair-use-policy): הגדרת שימוש מסחרי.
- [Vercel – Sensitive environment variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables): שמירת סודות.
