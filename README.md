# AI Ready ASEAN Youth Challenge 2026 — Judging Portal

A purpose-built, full-stack competition judging platform for the AISG/ASEAN Foundation/Google.org hackathon — replacing ad-hoc spreadsheets with structured, auditable, real-time judging workflows.

## Quick Start

```bash
npm install
cp .env.local .env.local  # edit with your Supabase credentials
npm run dev               # http://localhost:3000
```

## Demo Mode

Open `http://localhost:3000` and click either:
- **"Enter Judge Demo"** → `/judge/dashboard` — pre-loaded with 5 projects, 2 already scored
- **"Enter Organiser Demo"** → `/organiser/dashboard` — full competition management view

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

## Judging Criteria (8 weighted, max 85 pts)

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

> Public Engagement (20%) = community votes — not judge-scored.

Formula: `Σ (score/10) × weight` → max 85.00 pts

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

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
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
