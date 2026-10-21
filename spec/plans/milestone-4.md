# תוכנית – Milestone 4: התקנה כ-PWA ופתיחה בלי חיבור

> מבוסס על: `MILESTONES.md` (Milestone 4), ‏`PRD.md` (User Story 7 "חזרה עתידית", ‏Flows 4–5, ‏F5, פלטפורמות), ‏`ARCHITECTURE.md` (סעיפים 2.3, 2.8, 2.9, Rendering, בדיקות), ‏`DESIGN.md` (סעיף 2.3 – App Icon, ניווט).
> מצב הקוד הנוכחי (סוף Milestone 3): המסך הראשי (`app/page.tsx`, ‏Client Component) עובד מקצה לקצה, כולל הודעות Offline ושגיאה. אין Manifest, אין Service Worker ואין אייקוני PWA. האיור נטען דרך `next/image` (`/hero.png`, עם `priority`). הגופנים נטענים מ-Google Fonts ב-`layout.tsx`.

---

## 1. היקף

**בתוך ה-Milestone:**
- Web App Manifest ‏(`app/manifest.ts`) לפי טבלת ARCHITECTURE 2.9.
- אייקוני PWA: ‏192px, ‏512px ו-maskable — 😂 מ-Noto Emoji (רישיון פתוח) על רקע Comic Yellow.
- Service Worker ידני (`public/sw.js`): שמירה מראש של מעטפת האפליקציה, Network-only ל-`/api/*`, מהרשת קודם ומה-Cache בהיעדר רשת לכל השאר, ניקוי Caches ישנים לפי גרסה.
- רישום ה-Service Worker ב-Production בלבד.

**מחוץ ל-Milestone:** הצעת התקנה מותאמת אישית (לחצן "התקן") — לא מופיעה ב-PRD/DESIGN; ההתקנה נעשית דרך הדפדפן. Push Notifications. בדיחות Offline (מוחרג במפורש ב-PRD). אין שינוי במראה המסך.

**אין תלויות npm חדשות ואין משתני סביבה חדשים.**

---

## 2. קבצים

| קובץ | פעולה | תיאור |
|---|---|---|
| `app/manifest.ts` | חדש | Manifest לפי ARCHITECTURE 2.9 |
| `public/icons/icon-192.png` | חדש | אייקון 192×192 |
| `public/icons/icon-512.png` | חדש | אייקון 512×512 |
| `public/icons/icon-maskable-512.png` | חדש | אייקון maskable, האימוג'י בתוך אזור בטוח של ~80% |
| `app/apple-icon.png` | חדש | אייקון 180×180 למסך הבית ב-iPhone (קונבנציית הקבצים של Next.js) |
| `public/sw.js` | חדש | ה-Service Worker |
| `app/sw-register.tsx` | חדש | Client Component קטן שרושם את ה-Service Worker ב-Production בלבד |
| `app/layout.tsx` | שינוי | הוספת `<SwRegister />`, ‏`viewport.themeColor` ו-`metadata.appleWebApp` |
| `next.config.ts` | שינוי | כותרות HTTP ל-`/sw.js` (בלי Cache בדפדפן) |
| `scripts/generate-icons.mjs` | חדש | סקריפט חד-פעמי ליצירת האייקונים (נשמר בפרויקט לתיעוד ולשחזור) |
| `public/icons/LICENSE-noto-emoji.txt` | חדש | ציון הרישיון של Noto Emoji ‏(Apache 2.0) |

---

## 3. Manifest – `app/manifest.ts`

לפי התיעוד: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/manifest.md`. מחזיר `MetadataRoute.Manifest`:

| שדה | ערך |
|---|---|
| `name`, ‏`short_name` | `UI_TEXT.title` ("חה חה חה") |
| `lang` / `dir` | `"he"` / `"rtl"` |
| `start_url` | `"/"` |
| `display` | `"standalone"` |
| `theme_color` | `"#F6B41F"` |
| `background_color` | `"#FFF3D1"` |
| `icons` | 192 ו-512 עם `purpose: "any"`, והאייקון ה-maskable עם `purpose: "maskable"` |

Next.js מוסיף את `<link rel="manifest">` לבד. ה-Manifest נשאר סטטי (נוצר בזמן Build).

---

## 4. אייקונים

- **מקור:** קובץ ה-SVG של 😂 (`emoji_u1f602.svg`) מה-Repository הרשמי של Noto Emoji של Google ב-GitHub. **הורדת הקובץ דורשת את אישורך בזמן הבנייה** (אציין שם, מקור וגודל).
- **יצירה:** `scripts/generate-icons.mjs` משתמש ב-`sharp`, שכבר מותקן כחלק מ-Next.js (אין תלות חדשה). הסקריפט:
  - יוצר ריבוע Comic Yellow ‏(`#F6B41F`) ומניח עליו את האימוג'י במרכז.
  - **רגיל (192, 512, apple 180):** האימוג'י ~75% מרוחב האייקון.
  - **maskable (512):** האימוג'י ~60% מהרוחב, כך שהוא כולו בתוך העיגול הבטוח (80%) ולא ייחתך ב-Android.
  - בלי שקיפות (רקע מלא) — נדרש ל-iPhone ול-maskable.
- הסקריפט מורץ פעם אחת; קובצי ה-PNG נשמרים בפרויקט. קובץ ה-SVG שהורד אינו נשמר בפרויקט — רק האייקונים והרישיון.
- `app/favicon.ico` הקיים נשאר כמו שהוא.

---

## 5. Service Worker – `public/sw.js`

JavaScript פשוט (לא עובר Build), כ-60 שורות.

### 5.1 גרסה
- `const CACHE_NAME = "hahaha-v1";` — מעלים את המספר בכל שינוי ב-`sw.js` שמחייב רענון של ה-Cache.

### 5.2 `install` – שמירה מראש
1. שומרים ב-Cache את: `/`, ‏`/manifest.webmanifest`, האייקונים, ‏`/apple-icon.png`, ‏`/hero.png`.
2. **קובצי JS/CSS של Next.js:** שמותיהם משתנים בכל Build (`/_next/static/...`), ולכן אי אפשר לרשום אותם מראש בקוד. במקום זה: אחרי שה-HTML של `/` הורד, מחלצים ממנו (בביטוי רגולרי פשוט) את כל הכתובות שמתחילות ב-`/_next/static/` ואת כתובות האיור שמתחילות ב-`/_next/image?` (מתוך `src`/`srcset`, אחרי פענוח `&amp;`), ושומרים גם אותן. כך המעטפת המלאה, כולל האיור, נשמרת כבר בביקור הראשון.
3. `self.skipWaiting()`.

### 5.3 `activate` – ניקוי
- מוחקים כל Cache ששמו שונה מ-`CACHE_NAME`, ואז `self.clients.claim()`.

### 5.4 `fetch`
- מתעלמים (לא קוראים ל-`respondWith`) מ:
  - בקשות שאינן `GET`.
  - בקשות לדומיין אחר (Google Fonts) — **הגופנים אינם נשמרים**, ובלי חיבור הדפדפן מציג גופן מערכת.
- **`/api/*` — Network-only:** `return;` בלי `respondWith`, כך שהבקשה הולכת ישר לרשת ואף פעם לא נשמרת. בלי חיבור `fetch` נכשל, והלקוח מציג את הודעת ה-Offline (קיים מ-Milestone 3).
- **כל השאר (ניווט ונכסים סטטיים) — מהרשת קודם:**
  - מנסים רשת. אם התשובה תקינה (`ok`, ‏`type === "basic"`), שומרים עותק ב-Cache ומחזירים.
  - אם הרשת נכשלה: מחזירים מה-Cache. לבקשת ניווט (`request.mode === "navigate"`) שאינה ב-Cache, מחזירים את `/` מה-Cache (אפליקציה עם מסך אחד).
  - בקשות RSC/Prefetch של Next.js (כותרת `RSC` או `Next-Router-Prefetch`) — אינן נשמרות, כדי לא למלא את ה-Cache בתשובות שאינן HTML.

### 5.5 אבטחה
- ה-Service Worker אינו מכיל מפתחות, ואינו נוגע בתשובות `/api/*` (PRD 4.א, ARCHITECTURE 2.8).

---

## 6. רישום – `app/sw-register.tsx`

- `"use client"`; ‏`useEffect` אחד:
  - אם `process.env.NODE_ENV !== "production"` או `!("serviceWorker" in navigator)` ← לא עושים כלום.
  - אחרת `navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })`. כישלון ברישום נבלע בשקט (האתר עובד גם בלעדיו).
- מחזיר `null` (לא מציג כלום).
- ב-`layout.tsx` מוסיפים `<SwRegister />` בתוך `<body>`.

---

## 7. שינויים נוספים

### 7.1 `app/layout.tsx`
- `export const viewport: Viewport = { themeColor: "#F6B41F" };` — צבע שורת המערכת בדפדפן ובאפליקציה המותקנת.
- `metadata.appleWebApp = { capable: true, title: UI_TEXT.title }` — כדי שב-iPhone השם במסך הבית יהיה "חה חה חה" והפתיחה תהיה בלי שורת כתובת.

### 7.2 `next.config.ts`
- `headers()` עבור `/sw.js`: ‏`Cache-Control: no-cache, no-store, must-revalidate` ו-`Content-Type: application/javascript; charset=utf-8` (לפי המדריך הרשמי), כדי שגרסה חדשה של ה-Service Worker תגיע מיד.

---

## 8. בדיקות שלי בזמן הבנייה

ה-Service Worker נרשם רק ב-Production, ולכן בודקים עם `npm run build` ואז `npm run start` (כתובת `http://localhost:3000` — דפדפנים מאפשרים Service Worker ב-localhost גם בלי HTTPS).

1. `npm run lint` ו-`npm run build` עוברים.
2. `/manifest.webmanifest` מחזיר את כל השדות מטבלה 3; האייקונים נפתחים בגדלים הנכונים, וה-maskable נראה תקין בתוך עיגול.
3. ב-DevTools → Application: ה-Service Worker פעיל, ‏Manifest ללא שגיאות, Cache Storage מכיל רק את `hahaha-v1`.
4. בקשת בדיחה כשיש חיבור — עובדת; ב-Cache Storage **אין** אף רשומה של `/api/joke`.
5. סימון Offline ב-DevTools ורענון: הדף נטען עם הצבעים, הפריסה והאיור (גופן מערכת); לחיצה על הלחצן מציגה את הודעת ה-Offline.
6. ביטול Offline: בקשה חוזרת מחזירה בדיחה.
7. Lighthouse (או DevTools → Manifest → Installability) מאשר שהאתר Installable.
8. העלאת `CACHE_NAME` ל-`v2` ובנייה מחדש: ה-Cache הישן נמחק (ואז מחזירים ל-`v1`).
9. ב-`npm run dev` ה-Service Worker **אינו** נרשם.
10. הסעיפים של Milestones 2–3 עדיין עוברים (נושא בעברית/אנגלית, ריק, 100 תווים, שגיאות).

בסיום — סוגרים את השרת.

---

## 9. בדיקה בטלפון – דורשת החלטה שלך

סעיפי ה-DoD הראשונים (התקנה במסך הבית, פתיחה standalone, מצב טיסה) נבדקים **בטלפון**, וזה דורש כתובת HTTPS. בהרצה המקומית אין HTTPS, ולכן בדיקה כזו אפשרית רק אחרי חיבור הפרויקט ל-Vercel — שלב שנדחה ב-Milestone 1. זה מחייב **push ל-GitHub**, ולכן אעצור ואבקש את אישורך לפני כן.

בסיום הבנייה אציג את התוצאות מהבדיקה המקומית במחשב, ואת שתי האפשרויות:
- **א.** לחבר עכשיו את GitHub ו-Vercel (אדריך אותך צעד אחר צעד) ולבדוק בטלפון במסגרת Milestone 4.
- **ב.** לאשר את Milestone 4 על בסיס הבדיקה במחשב, ולבצע את הבדיקה בטלפון ב-Milestone 5 (שבה ממילא נבדק הכול בכתובת Production).

---

## 10. ADR

אוסיף ל-ARCHITECTURE.md:
- **ADR: שמירת קובצי ה-Build ב-Service Worker** — שמות הקבצים של Next.js משתנים בכל Build, ולכן ה-Service Worker מחלץ אותם מה-HTML של `/` בזמן ההתקנה, במקום רשימה קבועה או ספריית PWA.

---

## 11. Definition of Done (מ-MILESTONES.md)

- [ ] הדפדפן במובייל מאפשר להתקין את האתר, והאייקון מופיע במסך הבית בשם "חה חה חה". *(טלפון – ראו סעיף 9)*
- [ ] האפליקציה המותקנת נפתחת במצב standalone, בלי שורת כתובת. *(טלפון – ראו סעיף 9; במחשב אפשר לבדוק התקנה ב-Chrome)*
- [ ] במצב טיסה, האפליקציה המותקנת נטענת עם הצבעים, הפריסה והאיור, ולחיצה על הלחצן מציגה את הודעת ה-Offline. *(במחשב: בדיקה 5)*
- [ ] תשובות `/api/joke` אינן נשמרות ב-Cache. *(בדיקה 4)*
- [ ] Lighthouse מאשר שהאתר Installable. *(בדיקה 7)*
- [ ] כל הסעיפים של Milestones 2–3 עדיין עוברים. *(בדיקה 10)*
