# חה חה חה

אתר (PWA) שמחזיר בדיחה קצרה בעברית על נושא שהמשתמש מזין, או בדיחה כלשהי כשהתיבה ריקה.
נבנה ב-Next.js 16, מתארח ב-Vercel, והבדיחות נוצרות דרך OpenAI.

מסמכי האפיון נמצאים בתיקייה `spec/`.

## הרצה מקומית

1. התקנת Node.js (גרסת LTS).
2. `npm install`
3. העתקת `.env.example` ל-`.env` ומילוי הערכים (מפתח הפיתוח של OpenAI).
4. `npm run dev`, ואז פתיחת http://localhost:3000

לפני Push: `npm run lint` ו-`npm run build`.

## משתני סביבה

| שם | תיאור |
|---|---|
| `OPENAI_API_KEY` | מפתח OpenAI. מקומית וב-Preview — מפתח הפיתוח. ב-Production — מפתח ה-Production. ב-Vercel מסומן Sensitive. |
| `OPENAI_MODEL` | שם המודל. ערך נוכחי: `gpt-5`. |

## פריסה

- Push ל-`main` ← פריסה אוטומטית ל-Production ב-Vercel.
- Push לכל ענף אחר ← Preview Deployment עם כתובת זמנית.

## החלפת מודל — חובה לפני 11 בדצמבר 2026

**המועד:** ‏`gpt-5` מוסר מה-API של OpenAI ב-**11 בדצמבר 2026**. אחרי התאריך הזה האתר יפסיק להחזיר בדיחות.
מומלץ לבצע את ההחלפה עד **1 בדצמבר 2026**, כדי שיישאר זמן לתקן אם משהו לא עובד.

**המודל המומלץ להחלפה:** ‏`gpt-5.6-sol`. לפני ההחלפה כדאי לוודא שוב בעמוד ה-[Deprecations של OpenAI](https://developers.openai.com/api/docs/deprecations).

**התהליך:**

1. **מקומית:** לשנות את `OPENAI_MODEL` בקובץ `.env`, להריץ `npm run dev`, ולבדוק כמה בדיחות: נושא בעברית, נושא באנגלית, תיבה ריקה, ונושא שהמודל יסרב לו.
2. **Preview:** ב-Vercel ← Settings ← Environment Variables, לשנות את `OPENAI_MODEL` בהיקף **Preview** בלבד. אחר כך לבצע Redeploy לפריסת Preview ולבדוק שוב בכתובת שלה.
3. **Production:** רק אחרי שהכול עובד — לשנות את `OPENAI_MODEL` בהיקף **Production**, לבצע Redeploy לפריסת ה-Production, ולבדוק בטלפון בדיחה אחת.

**סיכון ידוע:** הקוד שולח רמת Reasoning ‏`minimal` (ב-`lib/joke-service.ts`). אם המודל החדש לא תומך בה, הבקשה תיכשל כבר בשלב 1. במקרה כזה צריך שינוי קוד קטן לפני שממשיכים. לכן בודקים קודם מקומית וב-Preview.
