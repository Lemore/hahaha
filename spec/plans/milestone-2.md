# תוכנית – Milestone 2: קבלת בדיחה מקצה לקצה

> מבוסס על: `MILESTONES.md` (Milestone 2), ‏`PRD.md` (User Stories 1–4, 6; Flows 1–3; F1–F4), ‏`ARCHITECTURE.md` (סעיפים 2.2–2.8, 2.11), ‏`DESIGN.md` (סעיפים 1–2), ‏`mockups.png`, ‏`style-guide.png`, ‏`wireframes.png`.
> מצב הקוד הנוכחי: Next.js 16.4.2 עם `cacheComponents: true`, ‏Tailwind 4, ‏`layout.tsx` עם `lang="he" dir="rtl"`, דף זמני עם כותרת, ‏`lib/ui-text.ts` עם הכותרת בלבד, ‏`.env.example` עם `OPENAI_API_KEY` ו-`OPENAI_MODEL`.

---

## 1. היקף

**בתוך ה-Milestone:**
- נקודת `POST /api/joke` שעובדת מול OpenAI ומחזירה בדיחה בעברית.
- המסך הראשי המעוצב במלואו: איור, כותרת, תיבה, לחצן, בועת בדיחה, ומצבי ברירת מחדל / Focus / טעינה / הצגת בדיחה.

**מחוץ ל-Milestone (נדחה ל-Milestone 3):**
- הודעות ה-Alert (Offline, שגיאה כללית, `no_joke`) ועיצובן.
- זיהוי `NO_JOKE` והחזרת `422`, ורישום לוג מסודר של שגיאות.
- **התנהגות ביניים ב-Milestone 2:** אם הבקשה נכשלת מכל סיבה, השרת מחזיר `502` (`generation_failed`) והלקוח חוזר למצב ברירת מחדל (בועה ריקה, לחצן פעיל), בלי הודעה. כך המסך לא נתקע בטעינה. ההודעות עצמן ייבנו ב-Milestone 3.

**מחוץ לתחום לגמרי:** Manifest, ‏Service Worker ואייקונים (Milestone 4).

---

## 2. תלויות חדשות

| חבילה | סיבה |
|---|---|
| `openai` | ה-SDK הרשמי, לקריאה ל-Responses API (ARCHITECTURE 1.1) |
| `server-only` | מבטיח ש-`joke-service.ts` לא ייובא לצד הלקוח (ARCHITECTURE 2.2) |

התקנה: `npm install openai server-only`.

אין צורך במשתני סביבה חדשים. `.env` המקומי צריך להכיל `OPENAI_API_KEY` (מפתח הפיתוח) ו-`OPENAI_MODEL=gpt-5`. **לפני הבנייה יש לוודא עם המשתמשת ששני הערכים מולאו** (בלי לקרוא את הקובץ). אם לא — לעצור ולבקש.

---

## 3. קבצים ליצירה / שינוי

| קובץ | פעולה | תיאור |
|---|---|---|
| `lib/ui-text.ts` | שינוי | הוספת כל טקסטי הממשק לפי PRD 3.ג |
| `lib/validation.ts` | חדש | כללי ולידציה של הנושא, משותף ללקוח ולשרת |
| `lib/joke-service.ts` | חדש | `server-only`; ‏Prompt וקריאה ל-OpenAI |
| `app/api/joke/route.ts` | חדש | `POST` – ולידציה, קריאה לשירות, תשובה אחידה |
| `app/page.tsx` | שינוי | המסך הראשי (Client Component) |
| `app/layout.tsx` | שינוי | טעינת הגופנים מ-Google Fonts, צבע רקע ו-Halftone |
| `app/globals.css` | שינוי | ‏Design Tokens (צבעים, גופנים) ב-`@theme` של Tailwind 4, ורקע Halftone |
| `public/hero.png` | חדש | העתקה של `spec/image.png` |

אין קבצי רכיבים נפרדים: המסך קטן, ולכן הכול ב-`page.tsx`. אם הקובץ מתארך מאוד, אפשר לפצל את הבועה / ה-Pill לקובץ `app/joke-area.tsx` — רק אם זה מקל על הקריאה.

---

## 4. Backend

### 4.1 `lib/validation.ts`
```ts
export const MAX_TOPIC_LENGTH = 100;
// Returns the trimmed topic, or null if the value is not a valid topic.
export function normalizeTopic(value: unknown): string | null
```
- `undefined` → `""` (נושא חסר = בדיחה כלשהי).
- לא מחרוזת → `null`.
- מחרוזת → `trim()`; אם האורך אחרי `trim` גדול מ-100 → `null`; אחרת המחרוזת.

### 4.2 `lib/joke-service.ts`
- שורה ראשונה: `import "server-only";`.
- יצירת `OpenAI` client עם `timeout: 25_000` ו-`maxRetries: 0` (כדי לא לעבור את ה-30 שניות של ה-Function). המפתח נקרא אוטומטית מ-`OPENAI_API_KEY`.
- `export async function generateJoke(topic: string): Promise<string>`:
  - `client.responses.create({ model: process.env.OPENAI_MODEL, reasoning: { effort: "minimal" }, instructions: INSTRUCTIONS, input: ... })`.
  - **Instructions קבועות (באנגלית, כדי שיהיו ברורות למודל):** כתוב בדיחה אחת קצרה, בעברית בלבד, בלי קשר לשפת הנושא; לקהל מבוגר (מותר הומור למבוגרים); החזר רק את טקסט הבדיחה בלי הקדמות, כותרות או הסברים; אם אינך מוכן לכתוב בדיחה על הנושא, החזר בדיוק `NO_JOKE` ותו לא.
  - **Input – תוכן משתמש נפרד** (לא משורשר ל-Instructions):
    - נושא קיים → `[{ role: "user", content: topic }]` עם הנחיה ב-Instructions שתוכן המשתמש הוא נושא הבדיחה.
    - נושא ריק → `[{ role: "user", content: "בדיחה כלשהי, על כל נושא" }]` (או נוסח דומה).
  - מחזיר `response.output_text.trim()`.
- הטיפול ב-`NO_JOKE` ובפלט ריק (→ `422`) שייך ל-Milestone 3. ב-Milestone 2 השירות פשוט מחזיר את הטקסט.
- אם `OPENAI_MODEL` חסר — זריקת שגיאה (תמופה ל-`502`).
- **לפני הכתיבה:** לבדוק ב-`node_modules/openai` את החתימה העדכנית של `responses.create` ושל `reasoning.effort` (האם `"minimal"` נתמך ב-`gpt-5`).

### 4.3 `app/api/joke/route.ts`
```ts
export const maxDuration = 30;
export async function POST(request: Request): Promise<Response>
```
1. `await request.json()` בתוך try; כישלון → `400 { error: "invalid_input" }`.
2. `normalizeTopic(body?.topic)`; ‏`null` → `400 { error: "invalid_input" }`. גוף שאינו אובייקט → גם `400`.
3. `generateJoke(topic)` בתוך try:
   - הצלחה → `200 { joke }`.
   - כל שגיאה → `502 { error: "generation_failed" }`. לוג: רק `console.error("joke generation failed", <שם/סוג השגיאה>, <status אם יש>)` — **בלי** הנושא ובלי טקסט הבדיחה.
- `runtime` ברירת מחדל הוא `nodejs` ב-Next.js 16, ולכן אין צורך להגדיר אותו. `maxDuration` נתמך גם כש-`cacheComponents` פעיל (נבדק בתיעוד המקומי).

---

## 5. Frontend

### 5.1 `lib/ui-text.ts`
```ts
export const UI_TEXT = {
  title: "חה חה חה",
  topicPlaceholder: "על מה הבדיחה? (אפשר להשאיר ריק)",
  submitButton: "ספרו לי בדיחה",
  loading: "חושב על בדיחה...",
  offlineError: "אין חיבור לאינטרנט. נסו שוב כשהחיבור יחזור.",
  generalError: "משהו השתבש. נסו שוב.",
  noJokeError: "אופס, משהו התפקשש - נסו שוב",
  heroAlt: "<תיאור קצר של האיור>",
} as const;
```
טקסטי השגיאה נכנסים כבר עכשיו כדי שכל הטקסטים יהיו במקום אחד, אבל ישמשו רק ב-Milestone 3. ‏`heroAlt` הוא טקסט נגישות לאיור (לא מוצג על המסך), למשל "איור קומיקס של אדם צוחק".

### 5.2 Design Tokens – `app/globals.css`
ב-Tailwind 4 מגדירים ב-`@theme`:
- צבעים: `pop-red #D7261E`, ‏`comic-yellow #F6B41F`, ‏`halftone-orange #E9822A`, ‏`ink #111111`, ‏`paper #FFFFFF`, ‏`cream #FFF3D1`, ‏`deep-red #9C1A14`, ‏`muted-gray #6B6B6B`, ‏`light-gray #D9D9D9`, ‏`error-tint #FDE3DF`.
- גופנים: `--font-display: "Secular One", system-ui, sans-serif;` ‏`--font-body: "Rubik", system-ui, sans-serif;`.
- `body`: רקע Cream, טקסט Ink, גופן Rubik, ורקע Halftone: ‏`radial-gradient` של נקודות Halftone Orange בשקיפות נמוכה, ברשת של כ-12–16px, על כל רוחב המסך (DESIGN 2.4).

### 5.3 גופנים – `app/layout.tsx`
- לפי ARCHITECTURE 2.3 הגופנים נטענים **מ-Google Fonts בזמן ריצה** (ולא דרך `next/font`, שמארח אותם בשרת שלנו). לכן: `<link rel="preconnect">` ו-`<link rel="stylesheet">` ל-`fonts.googleapis.com` עם `Secular One` ו-`Rubik:wght@400;500`, ‏`display=swap`, בתוך `<head>` של ה-Root Layout.
- אם ה-Lint מזהיר על גופן מותאם — לבדוק בתיעוד המקומי של Next.js ולהשאיר את הפתרון שעומד ב-ARCHITECTURE.
- להסיר את ה-`flex`/`min-h` הזמניים רק אם מפריעים; לשמור על `lang="he" dir="rtl"`.

### 5.4 המסך הראשי – `app/page.tsx`
- `"use client"`.
- **State:** ‏`topic: string`, ‏`status: "idle" | "loading" | "success"`, ‏`joke: string`. (מצב `error` יתווסף ב-Milestone 3.)
- **פריסה:** ‏`<main>` ברוחב מלא עם `px-6` (24px) ו-`py-8`; בתוכו עמודה `mx-auto w-full max-w-[480px] flex flex-col gap-4`.
- **רכיבים, מלמעלה למטה:**
  1. **Hero:** מסגרת `relative h-[250px] rounded-[20px] border-4 border-ink shadow-[5px_5px_0_#111111] overflow-hidden bg-paper`; בתוכה `next/image` של `/hero.png` עם `fill`, ‏`object-cover object-center`, ‏`priority`, ו-`sizes="(max-width: 528px) 100vw, 480px"`.
  2. **כותרת:** ‏`<h1>` ‏`font-display text-[40px] leading-[44px] text-center text-ink`, עם `text-shadow: 3px 3px 0 #F6B41F`.
  3. **טופס** (`<form onSubmit>`, כדי ש-Enter במקלדת ישלח):
     - **Input:** ‏`h-14 rounded-xl border-[3px] border-ink bg-paper px-4 text-start text-[18px] font-body placeholder:text-muted-gray`, ‏Focus: ‏`outline-none ring-4 ring-comic-yellow`. ‏`maxLength={MAX_TOPIC_LENGTH}`, ‏`aria-label` לפי ה-Placeholder.
     - **לחצן:** ‏`type="submit"`, ‏`h-[58px] rounded-xl border-[3px] border-ink bg-pop-red text-white font-display text-[20px] leading-6 shadow-[4px_4px_0_#111111]`.
       - Pressed (`active:`): ‏`bg-deep-red`, תזוזה 3px לכיוון הצל ו-shadow קטן יותר (`1px_1px_0`).
       - Disabled: ‏`bg-light-gray text-muted-gray border-muted-gray shadow-none`, ‏`disabled` כשה-status הוא `loading`.
       - **כיוון הצל:** במוקאפ הצל יוצא ימינה-למטה. ב-RTL זה עדיין `4px 4px` (ערכי `box-shadow` פיזיים), ו-Pressed זז `translate-x-[3px] translate-y-[3px]`. לוודא מול ה-Mockup בבדיקה.
  4. **אזור הבדיחה** (עם `mt-4` נוסף לזנב, ו-`aria-live="polite"`):
     - `loading` → **Loading Pill:** ‏`inline-flex items-center gap-2 self-start rounded-full border-[3px] border-ink bg-comic-yellow px-4 py-2`, עם אייקון Burst (SVG Outline קטן, 24px, קו 3px, מעוגל) לפני הטקסט (כלומר מימין ב-RTL), וטקסט `UI_TEXT.loading`.
     - אחרת → **Joke Bubble:** ‏`relative rounded-[20px] border-[3px] border-ink bg-paper shadow-[4px_4px_0_#111111] p-[18px] min-h-[...] text-start text-[18px] leading-7 whitespace-pre-line`:
       - **זנב:** משולש בצד הימני העליון (ב-RTL: צד ה-start) שמצביע למעלה אל הלחצן. מימוש: SVG קטן או שני `::before/::after` (משולש שחור ומשולש לבן מעליו), ממוקם `-top-[...]` ו-`start-[...]`.
       - **Halftone:** בפינה השמאלית התחתונה (צד ה-end) — אלמנט `absolute bottom-0 end-0` עם `radial-gradient` כתום, ברוחב של כרבע מהבועה, `pointer-events-none`, ובשכבה מתחת לטקסט.
       - תוכן: `joke` (ריק במצב `idle` — הבועה מוצגת ריקה לפי DESIGN 1.1, עם גובה מינימלי כדי שתיראה כבועה).
- **שליחה (`handleSubmit`):**
  1. `preventDefault`; אם `status === "loading"` → לצאת (הגנה כפולה מלחיצות חוזרות, בנוסף ל-`disabled`).
  2. `status = "loading"`.
  3. `fetch("/api/joke", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: topic.trim() }) })`.
  4. `ok` ו-`joke` קיים → `joke = data.joke`, ‏`status = "success"` (מחליף את הבדיחה הקודמת).
  5. אחרת או `catch` → `joke = ""`, ‏`status = "idle"` (התנהגות ביניים; ראו סעיף 1).
- התיבה **לא** מתרוקנת אחרי קבלת בדיחה (Flow 3: המשתמש משנה או מוחק בעצמו).

### 5.5 האיור
- `cp spec/image.png public/hero.png`.

---

## 6. סדר עבודה

1. לוודא עם המשתמשת ש-`.env` מכיל את שני הערכים.
2. `npm install openai server-only`.
3. `lib/ui-text.ts`, ‏`lib/validation.ts`.
4. `lib/joke-service.ts` ו-`app/api/joke/route.ts`; בדיקה עם `curl` (נושא עברי, ריק, רווחים בלבד, אנגלית, 101 תווים, JSON שבור, `topic` מספרי).
5. `public/hero.png`, ‏`globals.css`, ‏`layout.tsx`.
6. `app/page.tsx`.
7. בדיקה בדפדפן (תצוגת מובייל 375px ותצוגת מחשב), השוואה ל-Mockup.
8. `npm run lint` ו-`npm run build`, וחיפוש המפתח ב-Bundle.
9. סימון 🟡 ליד Milestone 2 ב-`MILESTONES.md`, וסגירת השרת.

---

## 7. בדיקות מול ה-Definition of Done

| תנאי | איך נבדק |
|---|---|
| נושא בעברית ("חתול") → בדיחה בעברית על הנושא | בממשק ובעזרת `curl` |
| תיבה ריקה / רווחים בלבד → בדיחה בעברית | בממשק ובעזרת `curl` עם `""` ו-`"   "` |
| נושא באנגלית → בדיחה בעברית | `"cat"` בממשק |
| לא ניתן להקליד מעל 100 תווים; בקשה ישירה מעל 100 → `400` | הדבקת טקסט ארוך בתיבה; `curl` עם 101 תווים |
| בזמן טעינה: Pill, לחצן מושבת, אין בקשה נוספת | לחיצות חוזרות + ספירת הבקשות ב-Network |
| בקשה נוספת מחליפה את הקודמת | שתי בקשות ברצף |
| המפתח לא בקוד הלקוח ולא בתעבורה | אחרי `npm run build`: ‏`grep -r "sk-" .next/static` (וגם את שם המשתנה) ללא תוצאות; בדיקה ב-Network שהדפדפן פונה רק ל-`/api/joke` |
| התאמה ל-Mockups ול-DESIGN | צילום מסך ב-375px והשוואה; בדיקת צבעים, גופנים, פינות, קווי מתאר, צללים, RTL. הבדיקה בטלפון אחרי העלאה ל-Production נשארת למשתמשת (תלוי בחיבור Vercel שנדחה מ-Milestone 1) |
| במחשב, אזור התוכן ≤480px וממורכז | ‏`getBoundingClientRect` ברוחב 1280px |

**הערה:** כל בקשה לבדיחה עולה מעט כסף במפתח הפיתוח. הבדיקות יוגבלו לכמות קטנה של בקשות.

---

## 8. נקודות לתשומת לב

- **ADR אפשרי:** אם יתברר ש-`reasoning.effort: "minimal"` אינו נתמך במודל, להשתמש ב-`"low"` ולתעד.
- **גודל האיור:** ‏`spec/image.png` שוקל כ-1.3MB. `next/image` מקטין אותו אוטומטית לתצוגה; אין צורך בעיבוד ידני ב-Milestone הזה.
- **סתירה ידועה (כבר פתורה ב-DESIGN):** פס הכותרת שב-Style Guide לא ממומש; הכותרת מוצגת לפי ה-Mockups.
- **לא להוסיף:** הודעות שגיאה, Manifest, ‏Service Worker, או כל פיצ'ר שלא מופיע ב-spec.
