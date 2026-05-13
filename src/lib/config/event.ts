/**
 * Event Configuration
 * 
 * This file lets you customize the platform for any competition or event.
 * Simply update the values below to match your event details.
 */

export interface EventConfig {
  // Basic Event Information
  eventName: string
  eventSlug: string
  eventYear: string
  eventDescription: string
  
  // Branding
  brandColor: string // Primary color (e.g., '#E85A14')
  secondaryColor: string
  logoUrl?: string
  
  // Organizer Information
  organizerName: string
  organizerEmail: string
  organizerWebsite?: string
  sponsors?: string[]
  
  // Event Dates
  submissionDeadline: string
  judgingDeadline: string
  resultsAnnouncementDate?: string
  
  // Features
  enablePublicVoting: boolean
  maxVotesPerPerson: number
  publicVotingWeight: number // Percentage of total score
  
  // Judging
  judgingCriteria: Array<{
    key: string
    name: string
    weight: number
    description: string
  }>
  
  // Participant Categories (can be countries, regions, categories, etc.)
  categories: Array<{
    id: string
    name: string
    color: string
  }>
  
  // Optional: Custom fields for projects
  customProjectFields?: Array<{
    key: string
    label: string
    type: 'text' | 'url' | 'number' | 'textarea'
    required: boolean
  }>
}

/**
 * DEFAULT CONFIGURATION
 * 
 * This is the current AI Ready ASEAN Youth Challenge setup.
 * Copy this template and modify it for your own event!
 */
export const EVENT_CONFIG: EventConfig = {
  // Basic Information
  eventName: 'AI Ready ASEAN Youth Challenge 2026',
  eventSlug: 'airayc-2026',
  eventYear: '2026',
  eventDescription: 'Empowering youth across ASEAN to propose AI solutions for regional problems',
  
  // Branding
  brandColor: '#E85A14', // AIRA Orange
  secondaryColor: '#1A2B3C', // Navy
  logoUrl: undefined,
  
  // Organizer
  organizerName: 'AI Singapore & ASEAN Foundation',
  organizerEmail: 'info@airayouthchallenge.ai',
  organizerWebsite: 'https://airayouthchallenge.ai',
  sponsors: [
    'AI Singapore',
    'ASEAN Foundation',
    'Google.org',
    'IMDA',
  ],
  
  // Dates
  submissionDeadline: '2026-04-10T23:59:59Z',
  judgingDeadline: '2026-04-15T04:00:00Z', // 12:00 SGT
  resultsAnnouncementDate: '2026-04-20T00:00:00Z',
  
  // Features
  enablePublicVoting: true,
  maxVotesPerPerson: 3,
  publicVotingWeight: 20, // 20% of final score
  
  // Judging Criteria (total weight should equal 100 - publicVotingWeight)
  judgingCriteria: [
    {
      key: 'problem_definition',
      name: 'Problem Definition',
      weight: 10,
      description: 'Clarity and comprehensiveness of the issue addressed, target audience, and scope of proposed solution.',
    },
    {
      key: 'relevance_impact',
      name: 'Relevance & Impact',
      weight: 10,
      description: 'Relevance of the proposed solution and its potential benefits for the identified target audience.',
    },
    {
      key: 'ai_application',
      name: 'AI Application',
      weight: 15,
      description: 'Sound and responsible use of AI to solve the identified problem.',
    },
    {
      key: 'viability',
      name: 'Viability',
      weight: 10,
      description: 'Technical and operational feasibility of the proposed solution.',
    },
    {
      key: 'innovation',
      name: 'Innovation',
      weight: 10,
      description: 'Creativity and originality of the solution.',
    },
    {
      key: 'sustainability',
      name: 'Sustainability',
      weight: 10,
      description: 'Ability to maintain and grow the solution over time.',
    },
    {
      key: 'practicality',
      name: 'Practicality',
      weight: 10,
      description: 'How realistic and easy it is to implement the solution.',
    },
    {
      key: 'effectiveness',
      name: 'Effectiveness',
      weight: 10,
      description: 'Effectiveness of the proposed solution to achieve its goals.',
    },
  ],
  
  // Categories (ASEAN Countries)
  categories: [
    { id: 'brunei', name: 'Brunei', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    { id: 'cambodia', name: 'Cambodia', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'indonesia', name: 'Indonesia', color: 'bg-red-100 text-red-800 border-red-200' },
    { id: 'laos', name: 'Laos', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { id: 'malaysia', name: 'Malaysia', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'myanmar', name: 'Myanmar', color: 'bg-lime-100 text-lime-800 border-lime-200' },
    { id: 'philippines', name: 'Philippines', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { id: 'singapore', name: 'Singapore', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { id: 'thailand', name: 'Thailand', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: 'timor-leste', name: 'Timor-Leste', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    { id: 'vietnam', name: 'Vietnam', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  ],
  
  // Optional custom fields
  customProjectFields: [
    {
      key: 'team_name',
      label: 'Team Name',
      type: 'text',
      required: false,
    },
    {
      key: 'team_size',
      label: 'Number of Team Members',
      type: 'number',
      required: false,
    },
  ],
}

/**
 * Helper Functions
 */

export function getTotalJudgingWeight(): number {
  return EVENT_CONFIG.judgingCriteria.reduce((sum, c) => sum + c.weight, 0)
}

export function getCategoryById(id: string) {
  return EVENT_CONFIG.categories.find(c => c.id === id)
}

export function getCategoryByName(name: string) {
  return EVENT_CONFIG.categories.find(c => c.name.toLowerCase() === name.toLowerCase())
}

/**
 * Validation
 */
export function validateEventConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check judging weights sum to expected value
  const totalWeight = getTotalJudgingWeight()
  const expectedWeight = 100 - EVENT_CONFIG.publicVotingWeight
  if (Math.abs(totalWeight - expectedWeight) > 0.01) {
    errors.push(
      `Judging criteria weights (${totalWeight}) should sum to ${expectedWeight} ` +
      `(100% - ${EVENT_CONFIG.publicVotingWeight}% public voting)`
    )
  }
  
  // Check dates are valid
  const submission = new Date(EVENT_CONFIG.submissionDeadline)
  const judging = new Date(EVENT_CONFIG.judgingDeadline)
  if (judging <= submission) {
    errors.push('Judging deadline must be after submission deadline')
  }
  
  // Check required fields
  if (!EVENT_CONFIG.eventName) errors.push('Event name is required')
  if (!EVENT_CONFIG.organizerEmail) errors.push('Organizer email is required')
  if (EVENT_CONFIG.categories.length === 0) errors.push('At least one category is required')
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
