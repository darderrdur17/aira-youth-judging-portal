/**
 * EVENT CONFIGURATION TEMPLATE
 * 
 * Copy this file to create your own event configuration!
 * 
 * Steps to customize for your event:
 * 1. Copy this file to `event.ts`
 * 2. Update all the values below to match your event
 * 3. Save and restart your development server
 * 4. Your event is ready to go!
 */

import type { EventConfig } from './event'

export const MY_EVENT_CONFIG: EventConfig = {
  // ===================
  // BASIC INFORMATION
  // ===================
  
  eventName: 'Your Event Name Here',          // e.g., 'Innovation Challenge 2024'
  eventSlug: 'your-event-slug',               // URL-friendly (e.g., 'innov-2024')
  eventYear: '2024',                          // Year of your event
  eventDescription: 'Brief description of your event', // What is your competition about?
  
  // ===================
  // BRANDING & COLORS
  // ===================
  
  brandColor: '#E85A14',       // Your main brand color (hex code)
  secondaryColor: '#1A2B3C',   // Secondary color
  logoUrl: undefined,          // Optional: URL to your logo image
  
  // ===================
  // ORGANIZER INFO
  // ===================
  
  organizerName: 'Your Organization Name',
  organizerEmail: 'contact@yourorganization.com',
  organizerWebsite: 'https://yourwebsite.com',
  sponsors: [
    'Sponsor 1',
    'Sponsor 2',
    // Add more sponsors...
  ],
  
  // ===================
  // IMPORTANT DATES
  // ===================
  
  submissionDeadline: '2024-12-31T23:59:59Z',     // When projects are due
  judgingDeadline: '2025-01-15T23:59:59Z',        // When judging must be complete
  resultsAnnouncementDate: '2025-01-20T00:00:00Z', // When you'll announce winners
  
  // ===================
  // VOTING FEATURES
  // ===================
  
  enablePublicVoting: true,     // Allow public to vote?
  maxVotesPerPerson: 3,        // How many projects can each person vote for?
  publicVotingWeight: 20,      // What % of final score comes from public votes?
  
  // ===================
  // JUDGING CRITERIA
  // ===================
  // 
  // These are what judges score on. Total weight should equal (100 - publicVotingWeight).
  // For example: if public voting is 20%, judging criteria should total 80%.
  //
  
  judgingCriteria: [
    {
      key: 'criteria_1',                    // Internal ID (no spaces)
      name: 'First Criterion',              // Display name
      weight: 20,                           // How many points (out of 80)
      description: 'What you are looking for in this criterion',
    },
    {
      key: 'criteria_2',
      name: 'Second Criterion',
      weight: 20,
      description: 'Description of second criterion',
    },
    {
      key: 'criteria_3',
      name: 'Third Criterion',
      weight: 20,
      description: 'Description of third criterion',
    },
    {
      key: 'criteria_4',
      name: 'Fourth Criterion',
      weight: 20,
      description: 'Description of fourth criterion',
    },
    // Add more criteria as needed!
    // Remember: total weight should be 80 (if public voting is 20%)
  ],
  
  // ===================
  // CATEGORIES
  // ===================
  //
  // These could be:
  // - Geographic regions (countries, states, cities)
  // - Competition tracks (e.g., "Healthcare", "Education", "Environment")
  // - Age groups (e.g., "Under 18", "18-25", "26+")
  // - Or anything that makes sense for your event!
  //
  
  categories: [
    {
      id: 'category_1',                    // Internal ID
      name: 'Category 1',                   // Display name
      color: 'bg-blue-100 text-blue-800 border-blue-200', // Tailwind color classes
    },
    {
      id: 'category_2',
      name: 'Category 2',
      color: 'bg-green-100 text-green-800 border-green-200',
    },
    {
      id: 'category_3',
      name: 'Category 3',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    // Add more categories...
  ],
  
  // ===================
  // CUSTOM FIELDS (Optional)
  // ===================
  //
  // Want to collect extra information about projects?
  // Add custom fields here!
  //
  
  customProjectFields: [
    {
      key: 'team_name',
      label: 'Team Name',
      type: 'text',         // Options: 'text', 'url', 'number', 'textarea'
      required: false,
    },
    // Add more fields as needed...
  ],
}

/**
 * COLOR PALETTE EXAMPLES
 * 
 * Choose colors that match your brand:
 * 
 * Blues:    #3B82F6 (bright blue)  #1E40AF (dark blue)  #60A5FA (light blue)
 * Greens:   #10B981 (emerald)      #059669 (dark green) #34D399 (light green)
 * Purples:  #8B5CF6 (violet)       #6D28D9 (dark purple) #A78BFA (light purple)
 * Oranges:  #F97316 (orange)       #EA580C (dark orange) #FB923C (light orange)
 * Reds:     #EF4444 (red)          #DC2626 (dark red)    #F87171 (light red)
 * Teals:    #14B8A6 (teal)         #0D9488 (dark teal)   #2DD4BF (light teal)
 */

/**
 * CATEGORY COLOR EXAMPLES
 * 
 * Use Tailwind color classes like these:
 * 
 * 'bg-blue-100 text-blue-800 border-blue-200'
 * 'bg-green-100 text-green-800 border-green-200'
 * 'bg-purple-100 text-purple-800 border-purple-200'
 * 'bg-red-100 text-red-800 border-red-200'
 * 'bg-yellow-100 text-yellow-800 border-yellow-200'
 * 'bg-pink-100 text-pink-800 border-pink-200'
 * 'bg-indigo-100 text-indigo-800 border-indigo-200'
 * 'bg-orange-100 text-orange-800 border-orange-200'
 * 'bg-teal-100 text-teal-800 border-teal-200'
 * 'bg-cyan-100 text-cyan-800 border-cyan-200'
 */
