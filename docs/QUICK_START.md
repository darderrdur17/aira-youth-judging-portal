# Quick Start Guide
### Get Running in 5 Minutes! ⚡

The fastest way to get the platform up and running.

---

## Try Demo Mode (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Visit: http://localhost:3000
```

**That's it!** Click "Demo Login" to explore.

---

## Deploy for Real (10 minutes)

### What You Need
- Free Supabase account (database)
- Free Vercel account (hosting)
- Free Resend account (email, optional)

### Steps

**1. Database (Supabase)**
```
→ Visit supabase.com
→ Create project
→ SQL Editor → Run supabase-schema.sql
→ Copy URL and API keys
```

**2. Configure**
```bash
# Create .env.local file
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

**3. Deploy (Vercel)**
```
→ Visit vercel.com
→ Import project
→ Add environment variables
→ Deploy!
```

---

## Customize (5 minutes)

Edit `src/lib/config/event.ts`:

```typescript
export const EVENT_CONFIG = {
  eventName: 'Your Event Name',
  brandColor: '#YourColor',
  judgingCriteria: [
    { name: 'Criterion 1', weight: 25, ... },
    // Add yours...
  ],
  categories: [
    { name: 'Category 1', ... },
    // Add yours...
  ],
}
```

Save and refresh - done!

---

## Next Steps

**Learn More:**
- 📖 [User Guide](./USER_GUIDE.md) - How to use everything
- ⚙️ [Setup Guide](./SETUP.md) - Detailed setup instructions  
- ✨ [Features Guide](./FEATURES.md) - All features explained
- 🎯 [Admin Guide](./ADMIN_GUIDE.md) - Run successful events

**Get Help:**
- Check documentation
- Read error messages carefully
- Google the error
- Ask in community

---

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Run production build

# Testing
npm run lint         # Check code quality
npm run type-check   # Verify TypeScript

# Deploy
git push             # Auto-deploys on Vercel
```

---

## Troubleshooting

**Can't connect to database?**
→ Check .env.local file exists and has correct values

**Email not sending?**
→ Add Resend API key or use demo mode

**Changes not showing?**
→ Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

**Build errors?**
→ Delete node_modules and reinstall: `rm -rf node_modules && npm install`

---

*That's all you need to get started! 🚀*
