import type { Assignment, Competition, Criterion, Feedback, Judge, Project, Score } from './types'
import { JUDGING_CRITERIA } from './types'

/** Example PDF path for import templates (AgriSense AI demo file). */
export const SAMPLE_TEAM_SUBMISSION_PDF = '/samples/projects/proj-001.pdf'

export const DEMO_COMPETITION: Competition = {
  id: 'comp-2026',
  name: 'AI Ready ASEAN Youth Challenge 2026',
  slug: 'airayc-2026',
  logo_url: null,
  deadline: '2026-04-15T04:00:00Z', // 15 April 2026 12:00 GMT+8
  created_by: 'organiser-1',
  created_at: '2026-01-05T00:00:00Z',
}

export const DEMO_CRITERIA: Criterion[] = JUDGING_CRITERIA.map((c, i) => ({
  ...c,
  id: `crit-${i + 1}`,
  competition_id: 'comp-2026',
}))

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    competition_id: 'comp-2026',
    name: 'AgriSense AI',
    country: 'Philippines',
    pdf_url: '/samples/projects/proj-001.pdf',
    video_url: 'https://www.youtube.com/watch?v=example1',
    metadata: { team: 'Team Alpha', members: 3 },
    created_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 'proj-002',
    competition_id: 'comp-2026',
    name: 'MedBot SEA',
    country: 'Indonesia',
    pdf_url: '/samples/projects/proj-002.pdf',
    video_url: 'https://www.youtube.com/watch?v=example2',
    metadata: { team: 'HealthForward', members: 4 },
    created_at: '2026-03-20T11:00:00Z',
  },
  {
    id: 'proj-003',
    competition_id: 'comp-2026',
    name: 'EduPath Lite',
    country: 'Singapore',
    pdf_url: '/samples/projects/proj-003.pdf',
    video_url: null,
    metadata: { team: 'LearnSG', members: 2 },
    created_at: '2026-03-21T09:00:00Z',
  },
  {
    id: 'proj-004',
    competition_id: 'comp-2026',
    name: 'FloodAlert MY',
    country: 'Malaysia',
    pdf_url: '/samples/projects/proj-004.pdf',
    video_url: 'https://www.youtube.com/watch?v=example4',
    metadata: { team: 'SafeNet', members: 3 },
    created_at: '2026-03-21T14:00:00Z',
  },
  {
    id: 'proj-005',
    competition_id: 'comp-2026',
    name: 'LinguaBridge TH',
    country: 'Thailand',
    pdf_url: '/samples/projects/proj-005.pdf',
    video_url: null,
    metadata: { team: 'TranslateTech', members: 2 },
    created_at: '2026-03-22T08:00:00Z',
  },
  {
    id: 'proj-006',
    competition_id: 'comp-2026',
    name: 'CropDoc VN',
    country: 'Vietnam',
    pdf_url: '/samples/projects/proj-006.pdf',
    video_url: 'https://www.youtube.com/watch?v=example6',
    metadata: { team: 'AgriTech VN', members: 4 },
    created_at: '2026-03-22T10:00:00Z',
  },
  {
    id: 'proj-007',
    competition_id: 'comp-2026',
    name: 'SafeSchool KH',
    country: 'Cambodia',
    pdf_url: '/samples/projects/proj-007.pdf',
    video_url: null,
    metadata: { team: 'EduGuard', members: 3 },
    created_at: '2026-03-23T09:00:00Z',
  },
  {
    id: 'proj-008',
    competition_id: 'comp-2026',
    name: 'WasteWise MM',
    country: 'Myanmar',
    pdf_url: '/samples/projects/proj-008.pdf',
    video_url: 'https://www.youtube.com/watch?v=example8',
    metadata: { team: 'GreenFuture', members: 2 },
    created_at: '2026-03-23T11:00:00Z',
  },
]

export const DEMO_JUDGES: Judge[] = [
  {
    id: 'judge-001',
    user_id: 'user-judge-1',
    competition_id: 'comp-2026',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@example.com',
    is_active: true,
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'judge-002',
    user_id: 'user-judge-2',
    competition_id: 'comp-2026',
    name: 'Prof. Marcus Tan',
    email: 'marcus.tan@example.com',
    is_active: true,
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'judge-003',
    user_id: 'user-judge-3',
    competition_id: 'comp-2026',
    name: 'Ms. Priya Nair',
    email: 'priya.nair@example.com',
    is_active: true,
    created_at: '2026-04-01T00:00:00Z',
  },
]

export const DEMO_ASSIGNMENTS: Assignment[] = [
  { id: 'assign-001', judge_id: 'judge-001', project_id: 'proj-001', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-002', judge_id: 'judge-001', project_id: 'proj-002', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-003', judge_id: 'judge-001', project_id: 'proj-003', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-004', judge_id: 'judge-001', project_id: 'proj-004', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-005', judge_id: 'judge-001', project_id: 'proj-005', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-006', judge_id: 'judge-002', project_id: 'proj-001', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-007', judge_id: 'judge-002', project_id: 'proj-003', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-008', judge_id: 'judge-002', project_id: 'proj-005', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-009', judge_id: 'judge-002', project_id: 'proj-006', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-010', judge_id: 'judge-002', project_id: 'proj-007', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-011', judge_id: 'judge-003', project_id: 'proj-002', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-012', judge_id: 'judge-003', project_id: 'proj-004', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-013', judge_id: 'judge-003', project_id: 'proj-006', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-014', judge_id: 'judge-003', project_id: 'proj-007', assigned_at: '2026-04-01T00:00:00Z' },
  { id: 'assign-015', judge_id: 'judge-003', project_id: 'proj-008', assigned_at: '2026-04-01T00:00:00Z' },
]

// Pre-seeded scores for demo (judge-001 has completed proj-001 and proj-002)
export const DEMO_SCORES: Score[] = [
  // assign-001 (judge-001, proj-001) - fully scored
  ...DEMO_CRITERIA.map((c, i) => ({
    id: `score-001-${i}`,
    assignment_id: 'assign-001',
    criterion_id: c.id,
    score: [8, 9, 8, 7, 9, 7, 8, 8][i],
    saved_at: '2026-04-10T08:00:00Z',
    submitted_at: '2026-04-10T08:05:00Z',
  })),
  // assign-002 (judge-001, proj-002) - fully scored
  ...DEMO_CRITERIA.map((c, i) => ({
    id: `score-002-${i}`,
    assignment_id: 'assign-002',
    criterion_id: c.id,
    score: [7, 8, 9, 8, 7, 8, 7, 6][i],
    saved_at: '2026-04-11T09:00:00Z',
    submitted_at: '2026-04-11T09:10:00Z',
  })),
  // assign-006 (judge-002, proj-001) - fully scored
  ...DEMO_CRITERIA.map((c, i) => ({
    id: `score-006-${i}`,
    assignment_id: 'assign-006',
    criterion_id: c.id,
    score: [9, 8, 9, 8, 8, 9, 7, 8][i],
    saved_at: '2026-04-12T10:00:00Z',
    submitted_at: '2026-04-12T10:15:00Z',
  })),
]

export const DEMO_FEEDBACK: Feedback[] = [
  {
    id: 'fb-001',
    assignment_id: 'assign-001',
    personal_notes: 'Strong technical implementation. The team clearly understands the problem space.',
    team_feedback: 'Excellent problem definition and strong AI application. Consider expanding the sustainability plan and addressing long-term data privacy concerns. The outreach strategy could be more concrete with specific milestones.',
    updated_at: '2026-04-10T08:05:00Z',
  },
  {
    id: 'fb-002',
    assignment_id: 'assign-002',
    personal_notes: 'Innovative approach but feasibility concerns remain.',
    team_feedback: 'Great innovation in the AI approach. The healthcare application shows real promise. Main areas for improvement: demonstrate a clearer path to regulatory compliance, and strengthen the community outreach plan with measurable targets.',
    updated_at: '2026-04-11T09:10:00Z',
  },
]
