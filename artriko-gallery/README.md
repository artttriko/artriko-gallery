# ARTRIKO Gallery

אתר הגלריה של ARTRIKO: דף נחיתה, גלריה עם המחשה בחדר, מדריך לפסלי אספנות ופאנל ניהול.

## איך זה בנוי

| חלק | איפה |
|---|---|
| האתר (HTML, CSS, JS) | `index.html`, `src/` — נבנה עם Vite |
| מסד נתונים, קבצים וכניסת מנהל | Supabase, פרויקט `ArtRikoGallery` |
| הצעות AI לכותרת ולתיאור | `api/suggest.js` — פונקציה ב־Vercel שקוראת ל־Gemini |
| ספירת כניסות לפי IP | `api/visit.js` — אותו IP נספר שוב רק אחרי 10 דקות, מנהל לא נספר |
| פרסום | Vercel |

מבנה מסד הנתונים והרשאות האבטחה (RLS) נמצאים ב־`supabase/schema.sql`.

## משתני סביבה (Vercel → Settings → Environment Variables)

| שם | מה זה | סודי? |
|---|---|---|
| `VITE_SUPABASE_URL` | כתובת הפרויקט ב־Supabase | לא |
| `VITE_SUPABASE_ANON_KEY` | המפתח הציבורי (publishable) של Supabase | לא, מוגן ע"י RLS |
| `GEMINI_API_KEY` | מפתח מ־Google AI Studio | **כן** |
| `GEMINI_MODEL` | לא חובה. שם מודל Gemini אחר | לא |
| `VISIT_SECRET` | סוד שמונע זיוף ספירת כניסות. זהה לערך בטבלה `private_config` | **כן** |
| `IP_SALT` | ערך אקראי לגיבוב כתובות IP | **כן** |

אף סוד לא נמצא בקוד או ב־repository.

## פיתוח מקומי

```bash
cp .env.example .env   # ולמלא את הערכים
npm install
npm run dev
```

הפונקציות שב־`api/` רצות רק ב־Vercel (או עם `vercel dev`).

## מנהל

- כניסה דרך המנעול בתחתית העמוד.
- כניסה ראשונה או שכחתי סיסמה: מקבלים קישור למייל, ואז מגדירים סיסמה בלשונית "סיסמה".
- מי מנהל נקבע בטבלה `admins` ב־Supabase.
