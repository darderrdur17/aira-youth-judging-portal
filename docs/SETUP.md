# Setup Guide
### Get Your Competition Platform Running in Minutes!

This guide walks you through setting up the judging platform for your own event. Don't worry - we'll take it step by step!

---

## Table of Contents

- [Quick Start (Demo Mode)](#quick-start-demo-mode) - Try it out in 2 minutes
- [Full Setup](#full-setup) - Production-ready deployment
- [Customizing for Your Event](#customizing-for-your-event)
- [Troubleshooting](#troubleshooting)

---

## Quick Start (Demo Mode)

**Want to try it before setting everything up?** Demo mode lets you explore the platform without any configuration!

### Step 1: Get the Code

```bash
# Clone or download the project
git clone [repository-url]
cd judging-portal
```

### Step 2: Install Dependencies

```bash
npm install
```

This downloads all the necessary software the platform needs to run.

### Step 3: Start the Platform

```bash
npm run dev
```

### Step 4: Open in Your Browser

Visit: `http://localhost:3000`

That's it! You can now:
- Click **"Demo Login"** to try the judge portal
- Click **"Organiser Demo"** to see the admin side
- Click **"People's Choice Vote"** to try voting

💡 **Note:** In demo mode, data is temporary and resets when you refresh.

---

## Full Setup

Ready to run a real competition? Let's set everything up properly!

### What You'll Need

- [ ] A computer (Mac, Windows, or Linux)
- [ ] Node.js installed (version 18 or higher)
- [ ] A free Supabase account (your database)
- [ ] A free Vercel account (where your site will live)
- [ ] 30 minutes of time

### Step 1: Database Setup (Supabase)

**What is Supabase?**  
It's a free service that stores all your competition data (projects, judges, scores).

**Setting it up:**

1. Go to [supabase.com](https://supabase.com) and sign up (it's free!)

2. Click **"New Project"**
   - Choose a name (e.g., "MyCompetition")
   - Set a database password (save this!)
   - Select a region close to you
   - Click **"Create project"**

3. Wait 2 minutes for your project to be ready

4. Copy your credentials:
   - Go to **Settings** → **API**
   - Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy the **anon/public key** (long string of letters/numbers)

5. Run the database setup:
   - Go to **SQL Editor**
   - Click **"New Query"**
   - Copy and paste the contents of `supabase-schema.sql` (from the project files)
   - Click **"Run"**

✅ **Done!** Your database is ready.

### Step 2: Email Setup (Optional but Recommended)

**What is this for?**  
Judges need to log in via email. This service sends them secure login links.

**Setting it up:**

1. Go to [resend.com](https://resend.com) and sign up (free for 100 emails/day)

2. Click **"API Keys"**

3. Click **"Create API Key"**
   - Name it "Judging Platform"
   - Copy the key (starts with `re_`)

4. Verify your sending domain:
   - Go to **Domains**
   - Add your domain (e.g., `yourcompetition.com`)
   - Follow the DNS instructions they provide

✅ **Done!** You can now send login emails.

### Step 3: Configuration

Create a file named `.env.local` in the project folder:

```env
# Database (from Step 1)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Email (from Step 2)
RESEND_API_KEY=re_your_key_here
RESEND_FROM="Competition Platform <noreply@yourcompetition.com>"

# Admin (from Step 1)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find Service Role Key:**
- Supabase → Settings → API → `service_role` key

### Step 4: Deploy to Vercel

**What is Vercel?**  
It hosts your website for free and makes it accessible worldwide.

**Deploying:**

1. Go to [vercel.com](https://vercel.com) and sign up

2. Click **"Add New Project"**

3. Import your project:
   - Connect your GitHub (if code is there)
   - Or drag & drop your project folder

4. Add environment variables:
   - Paste the same values from `.env.local`
   - Click **"Add"** for each one

5. Click **"Deploy"**

6. Wait 2 minutes...

✅ **Done!** Your platform is live at `your-project.vercel.app`

---

## Customizing for Your Event

Now make it yours! Edit the configuration file to match your competition.

### Step 1: Open the Configuration

Edit this file: `src/lib/config/event.ts`

### Step 2: Update Basic Info

```typescript
eventName: 'Your Competition Name',
eventSlug: 'your-competition-2024',
eventYear: '2024',
eventDescription: 'What your competition is about',
```

### Step 3: Set Your Colors

```typescript
brandColor: '#Your-Color-Here',  // Your main brand color
secondaryColor: '#Another-Color',
```

**Need help picking colors?** Check out [coolors.co](https://coolors.co)

### Step 4: Update Dates

```typescript
submissionDeadline: '2024-12-31T23:59:59Z',
judgingDeadline: '2025-01-15T23:59:59Z',
```

💡 **Tip:** Use [timestamp.online](https://timestamp.online) to get the correct format.

### Step 5: Customize Judging Criteria

Change what judges score:

```typescript
judgingCriteria: [
  {
    key: 'your_criterion',        // Internal name (no spaces)
    name: 'Criterion Name',       // What judges see
    weight: 20,                   // Points (must total 80-100)
    description: 'What to look for...',
  },
  // Add more...
],
```

### Step 6: Set Categories

These could be countries, regions, age groups, or topics:

```typescript
categories: [
  { 
    id: 'category_1', 
    name: 'Display Name',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  // Add more...
],
```

### Step 7: Redeploy

```bash
git add .
git commit -m "Customized for my event"
git push
```

Vercel automatically redeploys with your changes!

---

## Troubleshooting

### "Cannot find module" errors

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### "Supabase connection failed"

1. Check your `.env.local` file - are the keys correct?
2. Is your Supabase project running? Check the dashboard.
3. Did you run the `supabase-schema.sql` script?

### "Email not sending"

1. Is your Resend API key correct?
2. Did you verify your sending domain?
3. Check Resend dashboard → Logs for error messages

### "Page not loading after deploy"

1. Check Vercel dashboard → Deployments → Latest log
2. Make sure all environment variables are set
3. Try redeploying: Vercel → Deployments → "Redeploy"

### Changes not showing

1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check if Vercel finished deploying (takes ~2 minutes)
3. Make sure you pushed your changes to GitHub

### Database errors

1. Go to Supabase → SQL Editor
2. Check if tables exist: `SELECT * FROM competitions;`
3. If empty, re-run the schema script

---

## Advanced Setup

### Custom Domain

Want `competitions.yourcompany.com` instead of `vercel.app`?

1. Vercel → Settings → Domains
2. Add your domain
3. Update DNS records (Vercel shows you how)

### Email Template Customization

Edit: `src/lib/email/templates/` to change how emails look.

### Database Backups

Supabase → Database → Backups (automatic daily backups on paid plans)

---

## Next Steps

- ✅ Setup complete? Read the [Features Guide](./FEATURES.md)
- ✅ Ready to run your event? See the [Admin Guide](./ADMIN_GUIDE.md)
- ✅ Need help? Check the [User Guide](./USER_GUIDE.md)

---

## Getting Help

**Still stuck?**

1. Check error messages carefully - they usually tell you what's wrong
2. Google the error message - someone likely solved it before
3. Check Supabase and Vercel dashboards for clues
4. Ask in the project's issues/discussions if available

**Common Resources:**
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)

---

*You've got this! 🚀*
