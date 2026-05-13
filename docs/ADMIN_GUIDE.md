# Admin Guide
### How to Run a Successful Competition

This guide shares best practices for organizers running competitions using the platform. Learn from those who've done it before!

---

## Table of Contents

- [Planning Your Competition](#planning-your-competition)
- [Timeline & Milestones](#timeline--milestones)
- [Setting Up](#setting-up)
- [During the Competition](#during-the-competition)
- [Judging Phase](#judging-phase)
- [After Judging](#after-judging)
- [Best Practices](#best-practices)
- [Common Challenges](#common-challenges)

---

## Planning Your Competition

### Define Your Goals

**Before you start, answer:**
- What's the purpose of this competition?
- Who is your target audience?
- What outcomes do you want?
- How will you measure success?

**Example Goals:**
- Discover innovative solutions
- Engage community members
- Find talent
- Raise awareness
- Create partnerships

### Choose Your Format

**Judging Style:**
- Expert panel only
- Expert + public voting (recommended!)
- Public voting only
- Tiered judging (prelims + finals)

**Categories:**
- Geographic (countries, regions, cities)
- Topics (healthcare, education, environment)
- Age groups (youth, adults, seniors)
- Experience level (beginner, intermediate, advanced)

### Define Success Criteria

**What makes a winning project?**

Write clear judging criteria. Each should have:
- **Name**: What you're evaluating
- **Weight**: How important it is (as percentage)
- **Description**: What judges should look for

**Example Criteria:**
1. **Innovation** (20%) - How creative and original is it?
2. **Impact** (20%) - Will it make a real difference?
3. **Feasibility** (15%) - Can it actually be built?
4. **Presentation** (15%) - How well explained?
5. **Technical Merit** (15%) - Is it well-designed?
6. **Sustainability** (15%) - Can it last long-term?

💡 **Tip:** Use 5-8 criteria. Too few = not enough detail. Too many = judges get overwhelmed.

### Set Your Budget

**Main Costs:**
- Platform hosting (~$0-50/month)
- Email service (~$0-20/month)
- Prizes
- Judge compensation (optional)
- Marketing
- Event hosting (if in-person)

**Free Tier Options:**
- Vercel: Free for small competitions
- Supabase: Free up to 500MB database
- Resend: Free for 100 emails/day

---

## Timeline & Milestones

### Recommended Timeline

**8-12 weeks before event:**
- ✅ Define goals & criteria
- ✅ Set up platform
- ✅ Customize branding
- ✅ Create landing page
- ✅ Start marketing

**6-8 weeks before:**
- ✅ Open registrations
- ✅ Recruit judges
- ✅ Send save-the-date
- ✅ Build social media presence

**4-6 weeks before:**
- ✅ Submission deadline reminder
- ✅ Finalize judge panel
- ✅ Test platform thoroughly
- ✅ Prepare communications

**2-4 weeks before judging:**
- ✅ Close submissions
- ✅ Review all projects
- ✅ Make judge assignments
- ✅ Send judge welcome emails

**During judging (1-2 weeks):**
- ✅ Monitor progress daily
- ✅ Send reminder emails
- ✅ Answer judge questions
- ✅ Handle conflicts of interest

**After judging:**
- ✅ Review results
- ✅ Check for anomalies
- ✅ Prepare announcements
- ✅ Contact winners
- ✅ Send feedback to teams

---

## Setting Up

### Step 1: Configure Your Event

Edit `src/lib/config/event.ts` with your details:

```typescript
{
  eventName: "Your Competition 2024",
  judging Criteria: [
    { name: "Your Criterion", weight: 20, ... },
    // Add more...
  ],
  categories: [
    { name: "Your Category", ... },
    // Add more...
  ],
  // ... other settings
}
```

### Step 2: Customize Branding

**Colors:**
- Choose 2-3 brand colors
- Use consistently throughout
- Ensure good contrast (accessibility!)

**Logo:**
- Add to `public/` folder
- Update in config
- Use PNG or SVG format

**Messaging:**
- Write welcome messages
- Prepare email templates
- Create FAQ page

### Step 3: Test Everything

**Create Test Data:**
1. Add 3-5 test projects
2. Invite yourself as a judge
3. Make assignments
4. Try scoring
5. Check results page

**Test Workflows:**
- ✅ Judge invitation email
- ✅ Login process
- ✅ Scoring interface
- ✅ Progress tracking
- ✅ Results export
- ✅ Public voting

💡 **Tip:** Ask a friend to test as well. Fresh eyes catch issues!

---

## During the Competition

### Managing Submissions

**As projects come in:**
1. Review for completeness
2. Check all materials load correctly
3. Validate category assignments
4. Contact teams if info missing

**Quality Control:**
- Set minimum requirements
- Reject spam/inappropriate content
- Ensure fair play
- Document decisions

### Communication

**Keep Teams Informed:**
- Confirmation emails (automated)
- Status updates
- Deadline reminders
- What happens next

**Be Responsive:**
- Answer questions quickly
- Provide clear guidance
- Be helpful and encouraging
- Document common questions (update FAQ)

---

## Judging Phase

### Before Judging Starts

**Prepare Judges:**
1. Send welcome email with:
   - Login instructions
   - Judging timeline
   - Criteria explanations
   - FAQs
   - Your contact info

2. Host orientation (optional but recommended):
   - Platform walkthrough
   - Q&A session
   - Set expectations
   - Build excitement!

**Make Assignments:**

**Rules of Thumb:**
- 2-3 judges per project (minimum)
- Balance workload (same number per judge)
- Distribute across categories
- Consider judge expertise
- Check for conflicts

**Example Assignment:**
- 20 projects, 10 judges
- Each project → 3 judges
- Each judge → 6 projects
- Total: 60 assignments

### During Judging

**Monitor Progress (Daily):**
- Check dashboard
- Identify slow judges
- Watch for stuck projects
- Track overall completion

**Send Reminders:**

**Day 1:** Welcome & instructions  
**Day 3:** Progress check  
**Day 5:** Midpoint reminder (if 7-day window)  
**Day 6:** Final push  
**Day 7:** Last call (deadline today!)

**Handle Issues:**

**Judge Conflicts:**
- Respond quickly
- Reassign if needed
- Document reason
- Thank judge for flagging

**Technical Problems:**
- Check if widespread or individual
- Test yourself
- Provide workarounds
- Fix and notify

**Score Anomalies:**
- Contact judge privately
- Ask for clarification
- Allow corrections if genuine mistake
- Document in audit log

### Keeping Judges Motivated

**Engagement Strategies:**
- Share progress milestones
- Highlight interesting projects (anonymously)
- Send encouraging updates
- Offer support
- Show appreciation

💡 **Tip:** A simple "You're doing great! 80% complete!" email works wonders.

---

## After Judging

### Review Results

**Quality Checks:**
1. All projects have minimum judge count
2. No obvious score manipulation
3. Check audit log for anomalies
4. Verify calculations

**Analysis:**
- Look at score distributions
- Check for consensus (or lack thereof)
- Identify close races
- Note any patterns

### Handle Edge Cases

**Ties:**
- Pre-define tiebreaker rules
- Consider public vote weight
- May need additional review
- Be transparent about process

**Contested Results:**
- Review audit log
- Check for technical issues
- May need judge consultation
- Document resolution

**Missing Scores:**
- Contact judge immediately
- Set hard deadline
- Have backup plan (exclude that assignment)
- Learn for next time

### Announce Winners

**Preparation:**
1. Verify top 3-5 winners
2. Contact winners first (before public announcement)
3. Prepare social media posts
4. Create press release if applicable

**Announcement Timing:**
- Give winners 24hr heads-up
- Announce at optimal time (weekday afternoon)
- Multiple channels (email, social, website)
- Celebrate publicly!

### Share Feedback

**For Participants:**
- Aggregate judge feedback
- Deliver constructively
- Include scores (if policy allows)
- Encourage future participation

**For Judges:**
- Thank them profusely!
- Share final results
- Solicit feedback on process
- Invite to next event

---

## Best Practices

### Communication

✅ **Do:**
- Be clear and specific
- Communicate early and often
- Set expectations upfront
- Provide all necessary information
- Be responsive and helpful

❌ **Don't:**
- Assume people know what to do
- Wait until last minute
- Overwhelm with too much info at once
- Ignore questions or concerns

### Fairness

✅ **Do:**
- Treat all participants equally
- Have clear, published rules
- Document all decisions
- Handle conflicts of interest seriously
- Be transparent about process

❌ **Don't:**
- Show favoritism
- Change rules mid-competition
- Make arbitrary decisions
- Hide information

### Timing

✅ **Do:**
- Give adequate time for each phase
- Build in buffer time
- Send reminders
- Track progress actively
- Have contingency plans

❌ **Don't:**
- Rush critical phases
- Ignore delays
- Assume everything will go perfectly
- Skip testing

---

## Common Challenges

### Challenge: Low Judge Participation

**Causes:**
- Too many assignments per judge
- Unclear instructions
- Technical difficulties
- Busy schedules

**Solutions:**
- Reduce assignment load
- Send more reminders
- Provide better support
- Offer incentives (certificates, small gifts)
- Make expectations clear upfront

### Challenge: Inconsistent Scoring

**Causes:**
- Vague criteria descriptions
- No judge orientation
- Different interpretations
- Personal biases

**Solutions:**
- Write detailed criteria
- Host judge orientation
- Provide scoring examples
- Use normalization (statistical adjustment)
- Accept some variation (it's normal!)

### Challenge: Technical Issues

**Causes:**
- Browser compatibility
- File upload problems
- Email delivery failures
- Database errors

**Solutions:**
- Test thoroughly beforehand
- Have backup plans
- Provide clear error messages
- Offer multiple support channels
- Document solutions for common issues

### Challenge: Participant Confusion

**Causes:**
- Complex rules
- Poor communication
- Unclear deadlines
- Missing information

**Solutions:**
- Create comprehensive FAQ
- Use simple language
- Multiple communication channels
- Proactive updates
- Designate point person for questions

---

## Checklists

### Pre-Event Checklist

- [ ] Platform configured
- [ ] Branding applied
- [ ] Test account created
- [ ] All flows tested
- [ ] Judge panel confirmed
- [ ] Communications drafted
- [ ] FAQ prepared
- [ ] Support plan ready
- [ ] Backup plan documented
- [ ] Launch date confirmed

### During Event Checklist

- [ ] Monitor submissions daily
- [ ] Respond to questions quickly
- [ ] Send scheduled reminders
- [ ] Track judge progress
- [ ] Handle issues promptly
- [ ] Update FAQ as needed
- [ ] Keep team informed
- [ ] Document problems
- [ ] Maintain positive atmosphere

### Post-Event Checklist

- [ ] Review all scores
- [ ] Verify calculations
- [ ] Check for anomalies
- [ ] Contact winners
- [ ] Prepare announcements
- [ ] Send feedback
- [ ] Thank judges
- [ ] Export data for records
- [ ] Conduct post-mortem
- [ ] Document lessons learned

---

## Measuring Success

### Quantitative Metrics

**Participation:**
- Number of submissions
- Geographic diversity
- Completion rate
- Voter engagement

**Efficiency:**
- Time to complete judging
- Judge response rate
- Support ticket volume
- Technical issues

**Quality:**
- Score consensus (standard deviation)
- Judge satisfaction
- Participant satisfaction
- Winner caliber

### Qualitative Feedback

**Collect From:**
- Judges (survey)
- Participants (survey)
- Winners (interviews)
- Observers (testimonials)

**Ask About:**
- Overall experience
- Platform usability
- Communication quality
- Suggestions for improvement
- Would they participate again?

---

## Resources

### Templates

**Email Templates:**
- Judge invitation
- Progress reminder
- Deadline warning
- Winner notification
- Feedback delivery

**Documents:**
- Judge handbook
- FAQ document
- Rules & regulations
- Privacy policy

### Tools

**Project Management:**
- Notion, Trello, or Asana for task tracking
- Google Sheets for judge assignment planning
- Calendar for timeline management

**Communication:**
- Mailchimp or SendGrid for bulk emails
- Slack or Discord for judge communication
- Social media scheduling tools

---

## Learning & Improving

### Conduct Post-Mortem

**Within 1 week of event:**
1. Gather team feedback
2. Review metrics
3. Identify what worked
4. Note what didn't
5. Brainstorm improvements

**Document:**
- Timeline (actual vs planned)
- Budget (actual vs planned)
- Participation numbers
- Issues encountered
- Solutions applied
- Lessons learned

### Plan for Next Time

**Key Questions:**
- What would we keep?
- What would we change?
- What would we add?
- What would we remove?
- How can we scale?

---

## Need Help?

**Resources:**
- 📚 [User Guide](./USER_GUIDE.md)
- ⚙️ [Setup Guide](./SETUP.md)
- ✨ [Features Guide](./FEATURES.md)

**Community:**
- GitHub Discussions
- Discord (if available)
- Email support

---

*You're ready to run an amazing competition! 🏆*
