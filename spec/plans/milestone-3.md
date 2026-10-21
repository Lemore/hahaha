# תוכנית – Milestone 3: טיפול בשגיאות ובחיבור

> מבוסס על: `MILESTONES.md` (Milestone 3), ‏`PRD.md` (User Story 7, ‏F6, טבלת מקרי הקצה 4.ב, טקסטים 3.ג), ‏`ARCHITECTURE.md` (סעיפים 2.3, 2.4, 2.6, 2.8), ‏`DESIGN.md` (סעיף 1.1 – מצבי המסך, סעיף 2.3 – Status & Messages, Icons), ‏`style-guide.png`.
> מצב הקוד הנוכחי (סוף Milestone 2): `POST /api/joke` עובד ומחזיר `200` / `400` / `502`. כל כישלון מחזיר `502`, והלקוח חוזר בשקט לבועה ריקה. כל טקסטי השגיאה כבר קיימים ב-`lib/ui-text.ts` (`offlineError`, ‏`generalError`, ‏`noJokeError`).

---

## 1. היקף

**בתוך ה-Milestone:**
- שרת: זיהוי סירוב (`NO_JOKE`) או פלט ריק והחזרת `422` (`no_joke`); מיפוי כל שגיאה אחרת של OpenAI / Timeout ל-`502`; לוג שמכיל רק סוג שגיאה וקוד סטטוס.
- לקוח: מצב `error` עם שלושה סוגים — `offline`, ‏`noJoke`, ‏`general` — ושתי הודעות Alert מעוצבות במקום בועת הבדיחה.
- אחרי שגיאה הלחצן פעיל ואפשר לנסות שוב.

**מחוץ ל-Milestone:** Manifest, ‏Service Worker ואייקוני PWA (Milestone 4). אין שינוי במראה של מצבים קיימים.

**אין תלויות חדשות ואין משתני סביבה חדשים.**

---

## 2. קבצים לשינוי

| קובץ | פעולה | תיאור |
|---|---|---|
| `lib/joke-service.ts` | שינוי | זיהוי `NO_JOKE` / פלט ריק, והחזרת `null` במקרה כזה |
| `app/api/joke/route.ts` | שינוי | `null` ← `422`; שגיאה ← `502`; לוג מינימלי |
| `app/page.tsx` | שינוי | מצב `error`, זיהוי Offline, רכיב `AlertMessage` ושני אייקונים |

`lib/ui-text.ts` כבר מכיל את כל הטקסטים — אין צורך לשנות. אין קבצים חדשים.

---

## 3. Backend

### 3.1 `lib/joke-service.ts`
- חתימה חדשה: `generateJoke(topic: string): Promise<string | null>`.
  - `null` = המודל לא החזיר בדיחה.
  - Exception = שגיאת OpenAI, ‏Timeout, או `OPENAI_MODEL` חסר (כמו היום).
- לוגיקה אחרי הקריאה:
  - `const text = response.output_text.trim()`.
  - אם `text` ריק ← `null`. (זה מכסה גם סירוב מובנה של המודל, שאינו נכלל ב-`output_text`, וגם תשובה שנקטעה.)
  - אם `text` מכיל את הסימן `NO_JOKE` ← `null`. בודקים "מכיל" ולא "שווה בדיוק", כי המודל עלול להוסיף נקודה או רווח. ככה טקסט הסירוב לעולם לא נשלח ללקוח.
  - אחרת ← מחזירים את `text`.
- ה-Instructions וה-Timeout (25 שניות, בלי Retries) נשארים כמו שהם.

### 3.2 `app/api/joke/route.ts`
- ולידציה ותשובות `400` — ללא שינוי.
- קריאה לשירות:
  - תוצאה `null` ← `console.warn("joke generation: no_joke", 422)` ותשובת `422` עם `{ error: "no_joke" }`.
  - תוצאה מחרוזת ← `200` עם `{ joke }` (ללא שינוי).
  - Exception ← `console.error("joke generation failed", <שם השגיאה>, <status אם יש>)` ותשובת `502` עם `{ error: "generation_failed" }`. זה מכסה מפתח שגוי (`401`), מודל לא קיים (`404`), חריגה מ-Spend Limit ‏(`429`), Timeout (`APIConnectionTimeoutError`) ושגיאות רשת מול OpenAI.
- **כלל הלוג:** לעולם לא מדפיסים את `topic`, את הבדיחה, את `output_text` או את אובייקט השגיאה המלא (`error.message` של OpenAI עלול לכלול פרטים מהבקשה). רק `error.name` ו-`status`.
- תוספת קטנה: הערה בקוד שמסבירה את כלל הלוג.

---

## 4. Frontend – `app/page.tsx`

### 4.1 מצב
```ts
type Status = "idle" | "loading" | "success" | "error";
type ErrorKind = "offline" | "noJoke" | "general";
```
- State נוסף: `errorKind: ErrorKind`.
- `inFlight` (useRef) נשאר כמו שהוא, למניעת לחיצות כפולות.

### 4.2 זרימת `handleSubmit`
1. אם `inFlight` ← יציאה.
2. **בדיקת Offline לפני שליחה:** אם `navigator.onLine === false` ← מצב `error` / `offline`, בלי לשלוח בקשה ובלי לעבור דרך מצב טעינה.
3. מעבר ל-`loading` ושליחת ה-`fetch`.
4. אם ה-`fetch` עצמו זורק (שגיאת רשת – אין חיבור, השרת לא זמין) ← `offline`. לכן ה-`fetch` עטוף ב-`try` נפרד מקריאת ה-JSON.
5. קריאת התשובה (`response.json()` בתוך `try`, כי תשובת `504` מ-Vercel אינה JSON):
   - `response.ok` ו-`joke` מחרוזת ← `success` עם הבדיחה.
   - סטטוס `422` ← `error` / `noJoke`.
   - כל דבר אחר (`400`, ‏`502`, ‏`504`, JSON לא תקין) ← `error` / `general`.
6. `finally`: ‏`inFlight = false`. הלחצן חוזר להיות פעיל בכל מצב שאינו `loading`.
- הנושא שבתיבה **נשמר** אחרי שגיאה, כדי שאפשר יהיה ללחוץ שוב מיד.
- הבדיחה הקודמת מתנקה כשיש שגיאה; בקשה מוצלחת אחרי שגיאה מחליפה את ההודעה בבועה עם הבדיחה החדשה.

### 4.3 מה מוצג באזור הבדיחה
| מצב | רכיב |
|---|---|
| `idle` / `success` | `JokeBubble` (כמו היום) |
| `loading` | `LoadingPill` (כמו היום) |
| `error` + `offline` | `AlertMessage` בגרסת Offline |
| `error` + `noJoke` / `general` | `AlertMessage` בגרסת Error, עם הטקסט המתאים |

האזור נשאר בתוך ה-`div` הקיים עם `aria-live="polite"`, כך שקוראי מסך יקריאו את ההודעה.

### 4.4 עיצוב `AlertMessage` (לפי DESIGN 2.3 ו-style-guide.png)
- משותף: רוחב מלא, פינות 14px, קו מתאר 3px ב-Ink Black, ריפוד ~16px, טקסט Rubik 18px/28px מיושר לימין, אייקון 24px **מימין לטקסט** (בתחילת השורה ב-RTL) עם מרווח 12px. בלי צל (כך ב-Style Guide).
- **Offline:** רקע Paper White, טקסט Ink Black, אייקון `WifiOffIcon`: קשתות Wi-Fi ב-Ink Black וקו אלכסוני חוצה ב-Pop Red.
- **Error (כללית ו-no_joke):** רקע Error Tint ‏(`bg-error-tint`), טקסט Deep Red ‏(`text-deep-red`), אייקון `AlertIcon`: עיגול עם "!" ב-Deep Red.
- אייקונים: SVG ב-Outline, ‏viewBox של 24, קו 3px, קצוות מעוגלים — באותו סגנון של `BurstIcon` הקיים, ו-`aria-hidden`.
- כל הצבעים כבר מוגדרים ב-`globals.css` — אין צורך בשינוי CSS.

---

## 5. בדיקות בזמן הבנייה (על ידי Claude)

הרצה מקומית עם `npm run dev`, ובדיקה בדפדפן המובנה בתצוגת מובייל.

| בדיקה | איך מדמים |
|---|---|
| Offline לפני שליחה | הדמיית Offline בדפדפן אחרי שהדף נטען, ולחיצה על הלחצן |
| שגיאת רשת ב-`fetch` | עצירת שרת הפיתוח אחרי טעינת הדף, ולחיצה ← הודעת Offline |
| שגיאה כללית (`502`) | הרצת השרת עם מודל לא קיים, דרך משתנה בפקודת ההרצה בלבד: `OPENAI_MODEL=no-such-model npm run dev` (גובר על `.env`, בלי לגעת בקובץ) |
| `400` | בקשה ישירה עם 101 תווים ← `400`; וידוא שהמסך מציג הודעה כללית אם מתקבל `400` |
| `no_joke` (`422`) | שינוי **זמני** ב-`joke-service.ts` שמחזיר `NO_JOKE` כאילו מהמודל, בדיקה שמוצגת "אופס, משהו התפקשש - נסו שוב" ושהמילה `NO_JOKE` לא מופיעה, ואז **החזרת הקוד** למצבו. בנוסף ניסיון אמיתי עם נושא שהמודל צפוי לסרב לו. |
| ניסיון חוזר | אחרי כל שגיאה, החזרת החיבור / השרת התקין ולחיצה ← מתקבלת בדיחה |
| לוגים | מעבר על פלט השרת: מופיעים רק שם שגיאה וקוד סטטוס, בלי נושא ובלי בדיחה |
| רגרסיה | כל ה-Definition of Done של Milestone 2 (נושא בעברית / אנגלית / ריק, 100 תווים, טעינה, החלפת בדיחה, רוחב 480px) |
| איכות | `npm run lint` ו-`npm run build` עוברים |

**הערה לגבי לוגים ב-Vercel:** האתר עדיין לא עלה ל-Vercel (נדחה ב-Milestone 1). בדיקת הלוגים ב-Vercel תתבצע כשהאתר יעלה; בשלב זה נבדקים הלוגים בהרצה המקומית. הקוד זהה בשתי הסביבות.

---

## 6. Definition of Done – מיפוי לבדיקות

| תנאי | נבדק ב- |
|---|---|
| ניתוק רשת אחרי טעינה ← הודעת Offline | הדמיית Offline + עצירת שרת (סעיף 5) |
| שגיאת שרת ← הודעה כללית | מודל לא קיים בפקודת ההרצה |
| סירוב ← "אופס, משהו התפקשש - נסו שוב", בלי טקסט הסירוב | שינוי זמני + ניסיון אמיתי |
| אחרי שגיאה, לחיצה חוזרת עם חיבור תקין ← בדיחה | ניסיון חוזר |
| אין נושא / בדיחה בלוגים | בדיקת פלט השרת (Vercel – כשיעלה) |
| ההודעות מעוצבות לפי DESIGN.md | צילום מסך בתצוגת מובייל מול ה-Style Guide |
| DoD של Milestone 2 עדיין עובר | בדיקת רגרסיה |
