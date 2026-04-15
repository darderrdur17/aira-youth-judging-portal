# Step-by-Step Supabase Setup Guide

## AI Ready ASEAN Youth Challenge 2026 — Judging Portal

This guide walks you from a blank Supabase project to a fully operational judging portal in about 30 minutes.

---

## Prerequisites

- Node.js 20+ installed
- A free Supabase account at [supabase.com](https://supabase.com)
- A free Resend account at [resend.com](https://resend.com) (for sending emails)
- A Vercel account at [vercel.com](https://vercel.com) (for hosting)

---

## Step 1 — Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and click **New Project**
2. Choose your organisation (or create one)
3. Fill in:
   - **Project name:** `aisg-judging-portal`
   - **Database password:** Generate a strong password and **save it** — you'll need it later
   - **Region:** Select the region closest to Singapore (e.g. **Southeast Asia — Singapore**)
4. Click **Create new project** and wait ~2 minutes for provisioning

---

## Step 2 — Run the Database Schema

### Fresh project (empty database)

1. In your Supabase dashboard, click **SQL Editor** → **New query**
2. Open `supabase-schema.sql` from this repo
3. Paste the **entire** file and click **Run**

This creates all tables, RLS, triggers, seed data, and `link_judge_to_user()`.

> **Verify in Table Editor:** `competitions`, `criteria`, `projects`, `judges`, `assignments`, `scores`, `feedback`, `audit_log`

### Already applied the schema? (Error: `relation "competitions" already exists`)

**Do not re-run the full `supabase-schema.sql`.** That file is for first-time setup only.

If you only need the post-login judge linker (e.g. you set up the DB before that function existed):

1. SQL Editor → **New query**
2. Open and run **`supabase/patch-link-judge-user.sql`** only

That script is idempotent (`create or replace function`).

---

## Step 3 — Get Your Supabase API Keys

1. In the Supabase dashboard, go to **Settings → API**
2. Copy the following values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon/public key** — a long JWT string starting with `eyJ...`

---

## Step 4 — Configure Magic Link Auth

Magic links let judges log in with a single email click — no password required.

1. Go to **Authentication → Providers** in your Supabase dashboard
2. Find **Email** provider and make sure it is **enabled** (it is by default)
3. Scroll down to **Email Templates**
4. Select **Magic Link** template and customise it:

```
Subject: Your AISG Judging Portal Login Link

Body:
<h2>AI Ready ASEAN Youth Challenge 2026</h2>
<p>Click the link below to log in to the Judging Portal. This link expires in 24 hours.</p>
<a href="{{ .ConfirmationURL }}">Log in to Judge Portal →</a>
<p style="color:#999;font-size:12px">If you did not request this, you can safely ignore this email.</p>
```

5. Go to **Authentication → URL Configuration**
6. Set **Site URL** to your app URL (e.g. `https://your-app.vercel.app`)
7. Add to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

> **For local development**, also add `http://localhost:3000/auth/callback`

---

## Step 5 — Set Up Resend for Email Delivery

Supabase uses Resend for reliable email delivery.

1. Go to [resend.com](https://resend.com) and sign up
2. Click **API Keys → Create API Key**
3. Name it `AISG Judging Portal` and copy the key (starts with `re_`)
4. In Supabase dashboard: **Settings → Authentication → SMTP Settings**
5. Enable **Custom SMTP** and fill in:
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** your Resend API key
   - **Sender email:** `noreply@yourdomain.com` (must be a verified domain in Resend)
   - **Sender name:** `AI Ready ASEAN Youth Challenge 2026`

> **Free tier:** Supabase includes 3 emails/hour on free plan. For production, the custom SMTP via Resend removes this limit.

---

## Step 6 — Configure Environment Variables Locally

1. In your project root, open `.env.local`
2. Replace the placeholder values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend (for sending magic links + judge reminder emails)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM="AISG Judging Portal <no-reply@yourdomain.com>"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Organiser access (comma-separated). Use until you set competitions.created_by to your auth user id.
ORGANISER_EMAILS=you@yourdomain.com,backup@yourdomain.com

# Optional: allow the UI “demo” buttons without logging in (staging only — never enable in production)
# NEXT_PUBLIC_ENABLE_UNAUTHENTICATED_DEMO=true
```

3. Save the file. **Never commit this file to Git** (it's already in `.gitignore`)

### Magic links create users in Supabase

1. In Supabase go to **Authentication → Providers → Email**
2. Ensure **“Confirm email”** / signup behaviour matches your workflow. For hackathon judges, teams often allow the magic link to create the user on first sign-in.
3. After a user clicks the magic link, they appear under **Authentication → Users** (this is the “account saved in Supabase”).

### Email + password sign-up (Create account)

The app exposes **`/auth/sign-up?role=judge`** and **`/auth/sign-up?role=organiser`**. Users register with email + password; Supabase creates the `auth.users` row.

1. Keep the **Email** provider **enabled** (same as for magic links).
2. Under **Authentication → Providers → Email**, ensure **“Confirm email”** is configured the way you want:
   - If **enabled**, users must click the confirmation link (redirects to `/auth/callback` — same as magic links).
   - If **disabled**, users can sign in with password immediately after sign-up (development only; not recommended for production).
3. **Redirect URLs** must include your `/auth/callback` URL (see Step 4) so confirmation and OAuth-style flows complete.
4. After confirmation, judges should still have a **`judges`** row with the same email; `link_judge_to_user()` links `user_id` on login. Organisers need **`ORGANISER_EMAILS`** or **`competitions.created_by`** as documented below.

Login page supports **Magic link** and **Email & password** for returning users.

### Judge ↔ auth account linking

The SQL function `link_judge_to_user()` (in `supabase-schema.sql`) runs after login and sets `judges.user_id` for any row where `judges.email` matches the signed-in user. **Invite the judge first** (row in `judges` with their email) so RLS and dashboards work.

---

## Step 7 — Test Auth Locally

1. Start the dev server:
   ```bash
   npm run dev
   ```
2. Go to `http://localhost:3000/auth/login?role=organiser`
3. Enter your email address and click **Send Magic Link**
4. Check your email inbox — you should receive the magic link email
5. Click the link → you'll be redirected to `/auth/callback` → then to `/organiser/dashboard`

> **Troubleshooting:** If email doesn't arrive, check Supabase **Authentication → Logs** in the dashboard.

---

## Step 8 — Create the First Organiser Account

The first user to log in via the Supabase dashboard needs to be set as an organiser.

1. Go to **Authentication → Users** in Supabase dashboard
2. Click **Invite user** and enter the organiser's email
3. After they confirm, note their **User ID** (UUID format)
4. Go to **SQL Editor** and run:

```sql
-- Update the competition to be owned by the organiser
UPDATE competitions
SET created_by = 'paste-organiser-user-uuid-here'
WHERE slug = 'airayc-2026';
```

---

## Step 9 — Add Projects (Two Ways)

### Option A: CSV Import (recommended for bulk)

1. Log in as organiser → go to **Projects** page
2. Click **Import CSV**
3. Use this CSV format:
   ```
   project_name,country,video_url,pdf_url
   AgriSense AI,Philippines,https://youtube.com/...,
   MedBot SEA,Indonesia,,
   EduPath Lite,Singapore,https://vimeo.com/...,
   ```
4. Upload the file — projects are auto-imported with duplicate detection

### Option B: Manual Add

1. Click **Add Project** on the Projects page
2. Fill in project name, country, and optional video URL
3. Click **Add Project**

---

## Step 10 — Invite Judges

1. Go to **Judges** page in the Organiser Portal
2. Click **Invite Judge**
3. Enter the judge's full name and email address
4. Click **Send Invitation** — a magic link email is sent automatically
5. The judge clicks the link and is immediately logged in to their judge dashboard

> **Tip:** Invite all judges at least 5 days before the judging deadline.

---

## Step 11 — Assign Projects to Judges

1. Go to **Assignments** page
2. Click **Assign Project**
3. Select a judge and a project from the dropdowns
4. Click **Assign**

**Recommended pattern for AIRC 2026:**
- Assign each project to at least **2 judges** for cross-validation
- Keep each judge's load to **5–8 projects** for quality scoring
- The Results page will automatically average scores across judges

---

## Step 12 — Monitor Progress

Once judging starts:
1. Go to **Dashboard** — see real-time completion percentages per judge
2. Go to **Calibration** — detect scoring outliers (spread > 15 pts between judges)
3. Click **Remind All** if any judges are behind — sends a targeted reminder email
4. Go to **Results** to see preliminary rankings as scores come in

---

## Step 13 — Enable Row Level Security (verify)

RLS is already configured in `supabase-schema.sql`, but let's verify:

1. Go to **Table Editor → scores** in Supabase
2. Click **Policies** tab
3. Confirm you see policies for:
   - `Judges can manage own scores` (SELECT/INSERT/UPDATE)
   - `Organisers can read all scores` (SELECT)

> **Critical:** Never disable RLS on any table. Judges must only be able to see their own assignments.

---

## Step 14 — Deploy to Vercel

1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial AISG Judging Portal"
   git remote add origin https://github.com/your-username/aisg-judging-portal.git
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new) and import your repository

3. Add environment variables in **Settings → Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   RESEND_API_KEY               = re_...
   NEXT_PUBLIC_APP_URL          = https://your-app.vercel.app
   ```

4. Click **Deploy** — your app will be live in ~2 minutes

5. Update Supabase → **Authentication → URL Configuration**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: add `https://your-app.vercel.app/auth/callback`

---

## Step 15 — Export Results After Judging Closes

Once the deadline passes (15 April 2026 12:00 SGT):

1. Go to **Results** page
2. Click **Export CSV** — downloads full ranked scores with per-criterion breakdown
3. Click **Export PDF** — downloads formatted rankings report (requires Supabase Edge Function)

For the PDF export Edge Function, deploy it with:
```bash
supabase functions deploy export-pdf
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Magic link not arriving | Check Supabase Auth Logs, verify SMTP settings, check spam folder |
| Judge sees "no assignments" | Check RLS policies, ensure judge's user_id is linked in judges table |
| Scores not saving | Check deadline hasn't passed; check network tab for 403 errors |
| Build fails with TypeScript errors | Run `npm run type-check` to see specific errors |
| "Supabase not configured" error | Verify `.env.local` has correct URL and anon key |
| RLS blocking organiser access | Ensure competition's `created_by` = organiser's `auth.uid()` |

---

## Key Dates (AIRC 2026)

| Date | Event |
|---|---|
| 5 Jan 2026 | Challenge period opens |
| 24 Mar 2026 11:59 PM SGT | **Submission deadline** |
| ~1 Apr 2026 | Judges invited & projects assigned |
| **15 Apr 2026 12:00 SGT** | **Judging deadline** — scoring form locks |
| May 2026 | Regional Grand Finals in Singapore |

---

## Security Checklist (before going live)

- [ ] All tables have RLS enabled
- [ ] Supabase anon key is public-safe (never use service_role key client-side)
- [ ] `.env.local` is in `.gitignore` and never committed
- [ ] Magic link expiry set to 24 hours (Supabase default)
- [ ] Judging deadline trigger tested in staging
- [ ] Backup organiser account exists in case primary is locked out
- [ ] All judge email addresses verified before inviting

---

## Need Help?

- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Resend docs: [resend.com/docs](https://resend.com/docs)
- Competition contact: [info@airayouthchallenge.ai](mailto:info@airayouthchallenge.ai)
