# Naya "Post karo" feature — Setup guide

Ab aapki site 2 naye hisso me kaam karti hai:

- **`/admin/`** — sirf aapke liye. Yahan aap Facebook jaisa post box use karke likh sakte ho, photo laga sakte ho, aur **Post** dabate hi wo turant `/updates/` page pe live ho jaata hai. Apni post **edit/delete** bhi yahin se hoti hai.
- **`/updates/`** — sabke liye. Yahan log sirf **read** kar sakte hain, ❤️ **Like** kar sakte hain, aur **comment** kar sakte hain. Unhe post/edit/delete ka koi button nahi dikhega.

Isse kaam karne ke liye 2 cheezein chahiye: ek **Supabase** account (free, data/photos store karne ke liye) aur Vercel me **4 environment variables**.

---

## Step 1 — Supabase account banayein (5 min, free)

1. https://supabase.com par jaayein → "Start your project" → GitHub/Google se sign up karein.
2. "New project" banayein (koi bhi naam, koi bhi region — India ke paas wala chunein).
3. Project ban jaane ke baad, left sidebar me **SQL Editor** kholein → "New query".
4. Is repo ki `supabase-setup.sql` file kholein, uska pura content copy karke SQL editor me paste karein → **Run** dabayein. (Yeh 2 tables — posts aur comments — aur photos ke liye ek storage bucket bana dega.)
5. Left sidebar me **Project Settings → API** kholein. Yahan se 2 cheezein copy kar lein:
   - **Project URL** (jaisे `https://xxxxx.supabase.co`)
   - **service_role** key (secret wali — anon/public key nahi!)

## Step 2 — Vercel me environment variables add karein

Apne Vercel project → **Settings → Environment Variables** me jaakar ye 4 add karein:

| Name | Value |
|---|---|
| `SUPABASE_URL` | Step 1 wala Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Step 1 wala service_role key |
| `ADMIN_PASSWORD` | Jo password aap login ke liye rakhna chahte hain |
| `SESSION_SECRET` | Koi lamba random string (neeche tarika diya hai) |

`SESSION_SECRET` banane ke liye terminal me chalayein:
```
openssl rand -hex 32
```
(Ya bas koi bhi 40+ random letters/numbers likh dein — sirf lamba aur random hona chahiye.)

Local computer par test karna ho to isi repo ke andar `.env.example` ko `.env` naam se copy karke usme yeh 4 values bhar dein.

## Step 3 — Deploy

Code ko GitHub pe push karein (ya jaise aap normally Vercel pe deploy karte hain) — Vercel automatically naya build bana dega. Deploy hone ke baad:

- `https://<aapki-site>/admin/login/` par jaakar apna `ADMIN_PASSWORD` daalein.
- Login hote hi `/admin/` khulega — wahi Facebook-jaisa post box hai.
- Post karte hi wo turant `https://<aapki-site>/updates/` par sabko dikhne lagega.

## Kya-kya naya add hua (agar aap code dekhna chahein)

- `src/pages/admin/` — login + post-composer page
- `src/pages/updates/` — public feed (read + like + comment)
- `src/pages/api/` — sab backend logic (posts, likes, comments, photo upload, login)
- `src/lib/` — Supabase connection + login/session handling
- `src/middleware.ts` — ye check karta hai ki post/edit/delete sirf aap hi kar sakein
- `supabase-setup.sql` — database setup (ek baar chalana hai)
- Nav bar me ek "Updates" link add kar diya hai (`src/config.ts`)

## Notes

- Aapke purane blog posts (jo markdown files se article banate hain) bilkul waise hi kaam karenge — unhe kuch nahi hua.
- Like ek hi browser se dobara-dobara nahi ho sakti (cookie se track hota hai) — real user login system nahi hai, isliye ekdum bulletproof nahi hai, lekin normal blog ke liye kaafi hai.
- Comments par spam aaye to aap `/admin/` se us post ke comments khol ke unhe delete kar sakte hain (hover karne par cross ka button dikhega).
