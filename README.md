# AI Ready ASEAN Youth Challenge 2026 — Judging Portal

A purpose-built, full-stack competition judging platform for the AI Ready ASEAN Youth Challenge (AISG / ASEAN Foundation / Google.org, with IMDA, ATX Summit, and AI Singapore). It replaces ad-hoc spreadsheets and generic form tools with a single place to run **expert judging**, **organiser operations**, and **public voting** for the People’s Choice track.

## What this project is

The challenge invites youth teams across ASEAN to propose AI solutions for regional problems. This portal supports the **evaluation phase**: organisers configure the competition, judges score assigned submissions against a weighted rubric, and the broader community votes for favourites. Everything is structured for **fairness** (clear criteria, audit trail) and **visibility** (progress dashboards, ranked results).

## Personas

### Judges

Judges are domain experts invited to the competition. They sign in (magic link in production), see only **projects assigned to them**, and score each submission on **eight criteria** from **1–10**. They can save progress, add private notes, write structured feedback for teams, and **submit** when every criterion is scored. After the judging **deadline**, scoring is read-only. The UI shows a **live weighted total** for the current submission so judges understand how criteria weights affect the outcome.

### Organisers

Organisers run the competition: they manage **projects** (create or import), **judges** (invite, activate/deactivate, reminders), and **assignments** (who judges which project). They monitor **completion and progress** per judge, open **ranked results** with per-judge breakdowns, export **CSV**, and review an **audit log** of score changes. They operate in the organiser portal; in production, access is tied to the user who created the competition (see RLS in `supabase-schema.sql`).

### Voters (People’s Choice)

Voters are members of the public (or any audience you expose the link to). They use the **People’s Choice** flow (`/vote`): browse projects, search/filter by country, and support teams with votes. The UI allows **up to three projects** per person. In the current demo, voting uses **client-side state** (e.g. localStorage) with simulated totals; in a full rollout this would connect to your backend. Copy in the app states that **community voting contributes 20%** of the final competition score alongside **85%** from the judge rubric (see **Scoring logic** below).

## Quick Start

```bash
npm install
# Add Supabase (and optional email) keys — see Production Setup
npm run dev               # http://localhost:3000
```

## Demo Mode

Open `http://localhost:3000` and click either:
- **"Enter Judge Demo"** → `/judge/dashboard` — pre-loaded with sample assignments and scores
- **"Enter Organiser Demo"** → `/organiser/dashboard` — full competition management view
- **People’s Choice Vote** → `/vote` — public voting UI (demo behaviour)

No Supabase setup is required to explore the UI.

---

## Production Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Run `supabase-schema.sql` in the SQL editor to create tables, RLS policies, and seed criteria
3. Enable **Magic Link** auth in Authentication → Providers → Email
4. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=re_your_key
RESEND_FROM="AISG Judging Portal <no-reply@yourdomain.com>"
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Deploy to Vercel

```bash
npx vercel --prod
```

Set the same env vars in the Vercel dashboard under Settings → Environment Variables.

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui (base-ui) |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Auth | Supabase Magic Links (passwordless) |
| Email | Resend (magic links + judge reminders) |
| Charts | Recharts |
| Hosting | Vercel |

---

## Scoring logic

The competition uses two complementary parts that sum to **100%** in product terms: **judge-scored criteria (85%)** and **public engagement (20%)** via the People’s Choice vote. Judge criterion **weights are expressed in points that add up to 85** (same as 85% of the overall model); the public slice is **tracked separately** in the voting experience.

### Judge-scored component (85 points max per judge, per project)

For each **assignment** (one judge, one project), every criterion is scored as an integer **1–10**. The **weighted score** is:

```text
WeightedScore = Σ over criteria c of ( rawScore_c / 10 ) × weight_c
```

- `weight_c` is the criterion weight (e.g. 10 or 15). Weights sum to **85** (`TOTAL_MAX_SCORE` in code).
- `rawScore_c` is the judge’s input from 1 to 10.
- The **maximum** weighted total when all criteria are 10/10 is **85.0** (displayed to two decimal places in the UI).

Implementation: `computeWeightedScore()` in `src/lib/types/index.ts`.

**Example.** If *Problem Definition* = 8 (weight 10) and *AI Application* = 9 (weight 15), their contributions are `(8/10)×10 = 8.0` and `(9/10)×15 = 13.5` respectively. Repeat for all eight criteria and sum.

**Aggregating multiple judges.** For a project, the organiser **results** view uses only assignments where **all** criteria are **submitted**, computes each judge’s `WeightedScore`, then summarises with **average** (and min/max across judges) for ranking. See `buildResults()` in `src/app/organiser/results/page.tsx`.

### Public engagement (20%)

Community votes support the **People’s Choice** outcome and, per challenge messaging, **20%** of the overall competition score. The judge rubric does **not** include this 20%; it is handled in the voting flow. How vote counts map to a 0–20 scale (e.g. normalising by share of votes) is a **policy choice** for the event; the demo UI focuses on ranking and participation.

### Judging criteria (8 weighted)

| # | Criterion | Weight |
|---|---|---|
| 1 | Problem Definition | 10% |
| 2 | Relevance & Impact | 10% |
| 3 | AI Application | **15%** |
| 4 | Viability | 10% |
| 5 | Innovation | 10% |
| 6 | Sustainability | 10% |
| 7 | Practicality | 10% |
| 8 | Effectiveness | 10% |

**Sum of weights:** 85 — aligns with the judge portion of the 85% + 20% model.

---

## Key Features

### Judge Portal
- Magic link login (no password)
- Project dashboard with status badges, progress, country colour-coding
- 8-criterion scoring form (1–10 buttons) with live weighted total sidebar
- Score contribution preview per criterion
- Private notes + team feedback (with structured prompt)
- Auto-save + save progress / submit all
- Deadline enforcement (form becomes read-only after 15 April 2026 12:00 SGT)

### Organiser Portal
- Live judging progress dashboard (per-judge completion %, colour-coded)
- Project management (add manually / bulk import CSV)
- Judge management (invite via email, deactivate, send reminders)
- Assignment management (map judges ↔ projects)
- Ranked results view with per-judge breakdown (click to expand)
- CSV export (full scores + averages)
- Audit log (immutable score history, exportable)

### People’s Choice (voters)
- Public project list with search and country filter
- Vote interaction (demo: local persistence); messaging ties votes to the **20%** public slice of the overall score model

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── vote/                     # People’s Choice (public voting)
│   ├── auth/login/               # Magic link login
│   ├── judge/
│   │   ├── dashboard/            # Project grid + stats
│   │   └── score/[assignmentId]/ # Scoring form
│   └── organiser/
│       ├── dashboard/            # Progress overview
│       ├── projects/             # Project management
│       ├── judges/               # Judge management
│       ├── assignments/          # Assignment mapping
│       ├── results/              # Ranked results + chart
│       └── audit/                # Audit log
├── components/
│   ├── shared/                   # TopNav, CountryBadge, DeadlineCountdown
│   └── ui/                       # shadcn components
└── lib/
    ├── types/                    # TypeScript types + scoring logic
    ├── demo-data.ts              # Demo seed data
    └── supabase/                 # Client/server/middleware helpers
```

---

## Supabase Schema

See `supabase-schema.sql` for the complete schema with:
- 8 tables (competitions, criteria, projects, judges, assignments, scores, feedback, audit_log)
- Row Level Security policies (judges see only own assignments)
- Deadline enforcement trigger (prevents saving after cutoff)
- Auto-audit trigger (logs every score change)

---

*AI Ready ASEAN Youth Challenge 2026 · IMDA · ATX Summit · AI Singapore · ASEAN Foundation · Google.org*
*Contact: info@airayouthchallenge.ai*
