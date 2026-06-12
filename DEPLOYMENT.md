# Maritime AI Guide — Deployment Guide

Follow these steps in order. Do not skip any step.

---

## Prerequisites

- A [Vercel](https://vercel.com) account (free tier is fine to start)
- A [Supabase](https://supabase.com) project with all migrations applied
- An [OpenAI](https://platform.openai.com) API key with a spending limit set
- Your code pushed to a GitHub repository

---

## Step 1 — Apply Database Migrations

In your Supabase dashboard → SQL Editor, run these files **in order**:

1. `supabase/combined_migrations.sql` — creates all tables
2. `supabase/seed.sql` — adds courses, colleges, and initial data

Verify: Go to Table Editor and confirm tables like `profiles`, `colleges`, `courses`, `knowledge_base` exist.

---

## Step 2 — Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Click **Import Git Repository** and select your `maritime-ai-guide` repo
4. Vercel will auto-detect **Next.js** as the framework
5. Set:
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install --legacy-peer-deps`
   - **Output Directory:** `.next` (default)
6. Do **NOT** click Deploy yet — go to Step 3 first

---

## Step 3 — Add Environment Variables

In the Vercel project settings → **Environment Variables**, add each of these:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role secret |
| `OPENAI_API_KEY` | platform.openai.com → API Keys |
| `OPENAI_DAILY_BUDGET_USD` | Set to `5` (increase later) |
| `KV_REST_API_URL` | Vercel Dashboard → Storage → your KV database |
| `KV_REST_API_TOKEN` | Vercel Dashboard → Storage → your KV database |
| `NEXT_PUBLIC_APP_URL` | Your production domain, e.g. `https://maritimeaiguide.in` |
| `NEXT_PUBLIC_APP_ENV` | `production` |

Set all variables for **Production**, **Preview**, and **Development** environments.

> **Security:** `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` must NOT have the `NEXT_PUBLIC_` prefix — this keeps them server-side only.

---

## Step 4 — Deploy

Click **Deploy** in Vercel. The first build takes 2–4 minutes.

If the build fails, check:
- All environment variables are set correctly
- No TypeScript errors (`npm run build` locally first)

---

## Step 5 — Set Up Custom Domain

1. Go to Vercel project → **Settings** → **Domains**
2. Click **Add Domain** and enter your domain (e.g. `maritimeaiguide.in`)
3. Vercel will show you DNS records to add

Add these DNS records at your domain registrar (GoDaddy, Namecheap, etc.):

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

DNS propagation takes 10–60 minutes.

---

## Step 6 — Update Supabase Auth Settings

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://maritimeaiguide.in`
3. Add to **Redirect URLs**:
   - `https://maritimeaiguide.in/callback`
   - `https://maritimeaiguide.in/auth/callback`

---

## Step 7 — Create Admin User

1. Sign up on the live site with your admin email
2. In Supabase SQL Editor, run:

```sql
-- Replace with your actual email
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-admin@email.com'
);
```

Or use the pre-built script: `supabase/make_admin.sql`

---

## Step 8 — Generate Knowledge Base Embeddings

1. Log into the admin dashboard at `https://maritimeaiguide.in/admin`
2. Go to **Knowledge Base** → **Generate Embeddings**
3. Click **Generate All** — this calls OpenAI to embed all knowledge articles
4. Wait for completion (takes 1–3 minutes depending on article count)

---

## Step 9 — Post-Deployment Verification

Test each of these on the live URL:

- [ ] Homepage loads at `https://maritimeaiguide.in`
- [ ] `/eligibility` — run a full eligibility check
- [ ] `/courses` — all 8 courses appear
- [ ] `/colleges` — college list loads
- [ ] Sign up with email — confirmation email arrives
- [ ] Log in — dashboard loads
- [ ] NavAI — open widget, ask a maritime question
- [ ] `/sitemap.xml` — returns valid XML
- [ ] `/robots.txt` — returns correct rules
- [ ] Admin dashboard — accessible only with admin role

---

## Step 10 — First Week Monitoring

| What to check | How often | Where |
|---|---|---|
| OpenAI daily spend | Daily | platform.openai.com → Usage |
| Error logs | Daily | Vercel Dashboard → Functions → Logs |
| User signups | Daily | Admin dashboard → Overview |
| NavAI sessions | Daily | Admin dashboard → AI Logs |
| Analytics events | Weekly | Admin dashboard → Analytics |

---

## Rollback Procedure

If something goes wrong:
1. Go to Vercel → **Deployments**
2. Find the last working deployment
3. Click **...** → **Promote to Production**

This instantly reverts to the previous version with zero downtime.

---

## Support

- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
