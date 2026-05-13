# Competition Judging Platform
### A Complete Solution for Running Fair and Transparent Competitions 🏆

A modern, full-featured platform for managing competitions, challenges, and contests of any kind. From local hackathons to international competitions - this platform handles judging, voting, and results management with ease.

---

## ✨ What Makes This Special?

**For Any Type of Event**
- Tech competitions (hackathons, coding challenges)
- Innovation challenges
- Academic competitions
- Community contests
- Awards programs
- Grant applications

**Built for Everyone**
- **Judges** get a clean, focused scoring interface
- **Organizers** have powerful management tools
- **Participants** can showcase their work
- **Public** can vote and engage

**Actually Usable**
- Beautiful, modern interface
- Works on all devices
- No technical knowledge required
- Comprehensive documentation

---

## 🚀 Quick Start

```bash
# Install
npm install

# Run demo
npm run dev

# Open http://localhost:3000
```

**Try it now!** Click "Demo Login" to explore without any setup.

---

## 📚 Documentation

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get running in 5 minutes
- **[User Guide](./docs/USER_GUIDE.md)** - How to use the platform
- **[Setup Guide](./docs/SETUP.md)** - Full deployment instructions
- **[Features Guide](./docs/FEATURES.md)** - Everything the platform can do
- **[Admin Guide](./docs/ADMIN_GUIDE.md)** - Run successful events

---

## 🎯 Key Features

### For Judges
✅ Score projects on custom criteria  
✅ Weighted scoring with live calculations  
✅ Add private notes and team feedback  
✅ Flag conflicts of interest  
✅ Keyboard shortcuts for speed  
✅ Review materials (PDFs, videos)  

### For Organizers
✅ Manage projects, judges, and assignments  
✅ Real-time progress dashboard  
✅ Bulk import (CSV/Excel)  
✅ Automated email notifications  
✅ Comprehensive results & rankings  
✅ Complete audit trail  

### For Voters
✅ No login required  
✅ Browse and search projects  
✅ Vote for favorites  
✅ See live vote counts  
✅ Mobile-friendly  

### Platform
✅ Works for any type of competition  
✅ Fully customizable (colors, criteria, categories)  
✅ Beautiful, modern design  
✅ Smooth animations  
✅ Accessible & responsive  
✅ Open source  

---

## 🛠️ Technology

- **Frontend:** Next.js 16 + React + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Magic Links (passwordless)
- **Email:** Resend
- **Hosting:** Vercel

---

## 🎨 Customize for Your Event

Simply edit one configuration file:

```typescript
// src/lib/config/event.ts
export const EVENT_CONFIG = {
  eventName: 'Your Competition Name',
  eventYear: '2024',
  brandColor: '#YourColor',
  
  // Define your judging criteria
  judgingCriteria: [
    { 
      name: 'Innovation',
      weight: 20,
      description: 'How creative is the solution?'
    },
    // Add more...
  ],
  
  // Define your categories
  categories: [
    { id: 'web', name: 'Web Apps', color: '...' },
    { id: 'mobile', name: 'Mobile Apps', color: '...' },
    // Add more...
  ],
}
```

That's it! The entire platform updates to match your event.

**See [event.template.ts](./src/lib/config/event.template.ts) for a complete customization template.**

---

## 📖 Example Use Cases

### Tech Hackathon
- Categories: Web, Mobile, AI/ML, Hardware
- Criteria: Innovation, Technical Merit, Design, Impact
- 50 teams, 10 judges, 3 days of judging

### Innovation Challenge
- Categories: Healthcare, Education, Environment, Social
- Criteria: Impact, Feasibility, Scalability, Presentation
- Public voting (30%) + Expert judging (70%)

### Academic Competition
- Categories: By school/university
- Criteria: Research Quality, Originality, Presentation
- Multiple rounds with different judges

### Community Contest
- Categories: Age groups or regions
- Criteria: Creativity, Effort, Community Benefit
- Primarily public voting

---

## 🔒 Security & Privacy

- Secure authentication (magic links)
- Role-based access control
- Encrypted data transmission
- Private judge notes
- Immutable audit log
- GDPR compliant

---

## 🌟 What's New

**Recent Enhancements:**
- ✨ Event configuration system - works for any competition
- 🎨 Enhanced animations and micro-interactions
- 📊 Better export and bulk action features
- 📚 Comprehensive, accessible documentation
- 🎨 Unified AIRA orange theme throughout
- 🎯 Optional materials system (PDF/videos)
- ⚡ Performance optimizations

---

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug reports
- 💡 Feature suggestions
- 📖 Documentation improvements
- 🔧 Code contributions

---

## 📜 License

This project is open source and available under the MIT License.

---

## 🎓 Learn More

### Getting Started
1. Read the [Quick Start Guide](./docs/QUICK_START.md)
2. Try the demo mode
3. Check out the [User Guide](./docs/USER_GUIDE.md)

### For Organizers
1. Review the [Setup Guide](./docs/SETUP.md)
2. Explore the [Features Guide](./docs/FEATURES.md)
3. Study the [Admin Guide](./docs/ADMIN_GUIDE.md)

### For Developers
1. Browse the codebase
2. Check `src/lib/config/event.ts` for customization
3. See `src/lib/types/index.ts` for data structures

---

## 💬 Support

**Documentation:** Check the guides above  
**Issues:** Use GitHub Issues  
**Questions:** GitHub Discussions  
**Email:** For sensitive matters

---

## 🙏 Acknowledgments

Originally built for the AI Ready ASEAN Youth Challenge 2026, now enhanced to work for any competition or event.

Special thanks to:
- AI Singapore
- ASEAN Foundation  
- Google.org
- IMDA
- All contributors

---

## 🎯 Roadmap

Coming soon:
- [ ] Dark mode
- [ ] Mobile apps
- [ ] Advanced analytics
- [ ] Team collaboration features
- [ ] Public leaderboards
- [ ] Certificate generation
- [ ] API access
- [ ] Multi-language support

---

*Built to make competitions fair, transparent, and enjoyable for everyone.* 🌟

**Ready to get started?** Check out the [Quick Start Guide](./docs/QUICK_START.md)!
