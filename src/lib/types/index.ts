export type UserRole = 'judge' | 'organiser' | 'admin'

export type JudgingStatus = 'pending' | 'in_progress' | 'submitted'

export type Country =
  | 'Brunei'
  | 'Cambodia'
  | 'Indonesia'
  | 'Laos'
  | 'Malaysia'
  | 'Myanmar'
  | 'Philippines'
  | 'Singapore'
  | 'Thailand'
  | 'Timor-Leste'
  | 'Vietnam'

export interface Competition {
  id: string
  name: string
  slug: string
  logo_url: string | null
  deadline: string
  created_by: string
  created_at: string
}

export interface Criterion {
  id: string
  competition_id: string
  key: string
  name: string
  weight: number
  description: string
  sort_order: number
}

export interface Project {
  id: string
  competition_id: string
  name: string
  country: Country
  pdf_url: string | null
  video_url: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Judge {
  id: string
  user_id: string
  competition_id: string
  name: string
  email: string
  is_active: boolean
  created_at: string
}

export interface Assignment {
  id: string
  judge_id: string
  project_id: string
  assigned_at: string
  project?: Project
  judge?: Judge
}

export interface Score {
  id: string
  assignment_id: string
  criterion_id: string
  score: number
  saved_at: string
  submitted_at: string | null
}

export interface Feedback {
  id: string
  assignment_id: string
  personal_notes: string
  team_feedback: string
  updated_at: string
}

export interface AuditLogEntry {
  id: string
  assignment_id: string
  criterion_id: string | null
  old_score: number | null
  new_score: number | null
  changed_at: string
  changed_by: string
  action: string
  assignment?: Assignment
}

export interface AssignmentWithDetails extends Assignment {
  project: Project
  judge: Judge
  scores: Score[]
  feedback: Feedback | null
  weighted_total: number
  status: JudgingStatus
}

export interface JudgeProgress {
  judge: Judge
  total_assigned: number
  judged_count: number
  completion_percentage: number
  last_active: string | null
}

export interface ProjectResult {
  project: Project
  judge_count: number
  average_score: number
  min_score: number
  max_score: number
  judge_scores: { judge_name: string; score: number }[]
  rank: number
}

// The 8 AISG judging criteria
export const JUDGING_CRITERIA: Omit<Criterion, 'id' | 'competition_id'>[] = [
  {
    key: 'problem_definition',
    name: 'Problem Definition',
    weight: 10,
    description:
      'Clarity and comprehensiveness of the issue addressed, target audience, and scope of proposed solution. The issue identified should align with at least one of Google.org\'s focus areas (Knowledge & Skills, Scientific Progress, Stronger Communities).',
    sort_order: 1,
  },
  {
    key: 'relevance_impact',
    name: 'Relevance & Impact',
    weight: 10,
    description:
      'Relevance of the proposed solution and its potential benefits for the identified target audience.',
    sort_order: 2,
  },
  {
    key: 'ai_application',
    name: 'AI Application',
    weight: 15,
    description:
      'Sound and responsible use of AI to solve the identified problem. Appropriateness and sophistication of AI/ML techniques in the solution.',
    sort_order: 3,
  },
  {
    key: 'viability',
    name: 'Viability',
    weight: 10,
    description:
      'Technical and operational feasibility of the proposed solution. Demonstrates that the idea can be realistically implemented.',
    sort_order: 4,
  },
  {
    key: 'innovation',
    name: 'Innovation',
    weight: 10,
    description:
      'Creativity and originality of the solution. Novelty compared to existing solutions in the space.',
    sort_order: 5,
  },
  {
    key: 'sustainability',
    name: 'Sustainability',
    weight: 10,
    description:
      'Ability to maintain and grow the solution over time. Long-term impact and ability to sustain operations beyond the challenge.',
    sort_order: 6,
  },
  {
    key: 'practicality',
    name: 'Practicality',
    weight: 10,
    description:
      'How realistic and easy it is to implement your proposed awareness outreach plan. Real-world applicability and ease of adoption by target communities.',
    sort_order: 7,
  },
  {
    key: 'effectiveness',
    name: 'Effectiveness',
    weight: 10,
    description:
      'Effectiveness of your proposed outreach plan to engage at least 1,000 community members for awareness raising on AI.',
    sort_order: 8,
  },
]

export const TOTAL_MAX_SCORE = JUDGING_CRITERIA.reduce((sum, c) => sum + c.weight, 0) // 85

export function computeWeightedScore(
  scores: Record<string, number>,
  criteria: typeof JUDGING_CRITERIA
): number {
  return criteria.reduce((total, criterion) => {
    const score = scores[criterion.key]
    if (score === undefined || score === null) return total
    return total + (score / 10) * criterion.weight
  }, 0)
}

export const COUNTRY_COLORS: Record<string, string> = {
  Singapore: 'bg-teal-100 text-teal-800 border-teal-200',
  Philippines: 'bg-amber-100 text-amber-800 border-amber-200',
  Indonesia: 'bg-red-100 text-red-800 border-red-200',
  Malaysia: 'bg-blue-100 text-blue-800 border-blue-200',
  Thailand: 'bg-purple-100 text-purple-800 border-purple-200',
  Vietnam: 'bg-orange-100 text-orange-800 border-orange-200',
  Cambodia: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Myanmar: 'bg-lime-100 text-lime-800 border-lime-200',
  Brunei: 'bg-sky-100 text-sky-800 border-sky-200',
  Laos: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Timor-Leste': 'bg-rose-100 text-rose-800 border-rose-200',
}
