'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  FileText,
  BarChart3,
  CheckCheck,
  Clock,
  ArrowRight,
  AlertTriangle,
  Mail,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import { DEMO_CRITERIA, DEMO_SCORES } from '@/lib/demo-data'
import type { Assignment, Judge, Project } from '@/lib/types'
import { JUDGING_CRITERIA, computeWeightedScore } from '@/lib/types'
import { useOrganiserDemoStore } from '@/store/organiserDemoStore'
import { toast } from 'sonner'
import { sendMagicLinkToEmail } from '@/lib/auth/send-magic-link'

const WEEK_COLORS = [
  '#EC4899', '#EAB308', '#22D3EE', '#A855F7', '#22C55E', '#3B82F6', '#F97316', '#14B8A6',
  '#D946EF', '#84CC16', '#6366F1', '#F43F5E', '#0EA5E9', '#FBBF24', '#34D399',
]

const AWARENESS_DATA = [
  { name: 'Social Media (Facebook, Insta…)', value: 1620 },
  { name: 'Word of Mouth', value: 648 },
  { name: 'Email', value: 112 },
  { name: 'LinkedIn', value: 96 },
  { name: 'Ecosystem Partner', value: 88 },
  { name: 'Search Engine', value: 72 },
  { name: 'Youtube', value: 54 },
]

const AWARENESS_COLORS = ['#93C5FD', '#C4B5FD', '#5EEAD4', '#FCD34D', '#F9A8D4', '#86EFAC', '#FCA5A5']

const GENDER_DATA = [
  { name: 'Female', value: 39.3, fill: '#60A5FA' },
  { name: 'Male', value: 59.6, fill: '#FBBF24' },
  { name: 'Non-binary', value: 0.8, fill: '#A78BFA' },
  { name: 'Prefer not to disclose', value: 0.3, fill: '#9CA3AF' },
]

function getJudgeProgress(assignments: Assignment[], judges: Judge[]) {
  return judges.map((judge) => {
    const judgeAssignments = assignments.filter((a) => a.judge_id === judge.id)
    const submitted = judgeAssignments.filter((a) =>
      DEMO_SCORES.some((s) => s.assignment_id === a.id && s.submitted_at)
    )
    const pct = judgeAssignments.length > 0 ? (submitted.length / judgeAssignments.length) * 100 : 0
    return {
      judge,
      total: judgeAssignments.length,
      done: submitted.length,
      pct,
      lastActive: submitted.length > 0 ? '2 hours ago' : 'Never',
    }
  })
}

function getTopProjects(assignments: Assignment[], projects: Project[]) {
  return projects
    .map((project) => {
      const projectAssignments = assignments.filter((a) => a.project_id === project.id)
      const projectScores: number[] = []

      projectAssignments.forEach((assignment) => {
        const scores = DEMO_SCORES.filter((s) => s.assignment_id === assignment.id && s.submitted_at)
        if (scores.length === JUDGING_CRITERIA.length) {
          const map: Record<string, number> = {}
          scores.forEach((s) => {
            const crit = DEMO_CRITERIA.find((c) => c.id === s.criterion_id)
            if (crit) map[crit.key] = s.score
          })
          projectScores.push(computeWeightedScore(map, JUDGING_CRITERIA))
        }
      })

      const avg =
        projectScores.length > 0 ? projectScores.reduce((a, b) => a + b, 0) / projectScores.length : null

      return { project, avg, judgeCount: projectAssignments.length, scoredCount: projectScores.length }
    })
    .filter((r) => r.avg !== null)
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
    .slice(0, 5)
}

export default function OrganiserDashboardPage() {
  const projects = useOrganiserDemoStore((s) => s.projects)
  const judges = useOrganiserDemoStore((s) => s.judges)
  const assignments = useOrganiserDemoStore((s) => s.assignments)
  const competitionName = useOrganiserDemoStore((s) => s.competitionName)
  const competitionDeadline = useOrganiserDemoStore((s) => s.competitionDeadline)
  const [reminding, setReminding] = useState(false)

  const judgeProgress = useMemo(() => getJudgeProgress(assignments, judges), [assignments, judges])
  const topProjects = useMemo(() => getTopProjects(assignments, projects), [assignments, projects])

  const totalAssignments = assignments.length
  const submittedAssignments = assignments.filter((a) =>
    DEMO_SCORES.some((s) => s.assignment_id === a.id && s.submitted_at)
  ).length
  const overallPct = totalAssignments > 0 ? (submittedAssignments / totalAssignments) * 100 : 0
  const judgesNeedingReminder = judgeProgress.filter((j) => j.pct < 100)

  const registrationsTotal = useMemo(
    () =>
      Math.min(
        9999,
        projects.length * 240 + judges.length * 180 + Math.floor(assignments.length * 12.5) + 800
      ),
    [projects.length, judges.length, assignments.length]
  )

  const teamStatus = useMemo(() => {
    const totalTeams = Math.max(projects.length, 1)
    const solo = Math.max(1, Math.round(judges.length * 94 + assignments.length * 3.2))
    const fullTeam = Math.max(totalTeams * 2, Math.round(projects.length * 238 + 200))
    return { totalTeams: totalTeams + Math.floor(assignments.length / 3), solo, fullTeam }
  }, [projects.length, judges.length, assignments.length])

  const weekChartData = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => {
        const w = i + 1
        const base = projects.length * 18 + judges.length * 24
        const count = Math.max(
          40,
          Math.round(110 + base * 0.18 + Math.sin(w * 0.7) * 85 + (w % 4) * 32)
        )
        return { week: `Week ${w}`, count, fill: WEEK_COLORS[i % WEEK_COLORS.length] }
      }),
    [projects.length, judges.length]
  )

  const ageData = useMemo(() => {
    return Array.from({ length: 21 }, (_, i) => {
      const age = 15 + i
      let v = 20
      if (age >= 18 && age <= 22) v = 320 + (22 - Math.abs(age - 20)) * 40
      else if (age >= 16 && age <= 24) v = 120
      else v = Math.max(15, 180 - Math.abs(age - 20) * 35)
      return { age: String(age), n: Math.round(v + projects.length * 2) }
    })
  }, [projects.length])

  const pastPartData = [
    { name: 'Yes', value: 1410 + projects.length * 12 },
    { name: 'No', value: 1088 + judges.length * 8 },
  ]

  const motivationData = [
    { name: 'To build my portfolio', v: 2180 },
    { name: 'To connect and network', v: 2050 },
    { name: 'To solve real-world problems', v: 1640 },
    { name: 'Other', v: 420 },
  ]

  const fieldData = [
    { name: 'Computing & Information Tech', v: 1620 },
    { name: 'Engineering', v: 380 },
    { name: 'Business', v: 290 },
    { name: 'Natural Sciences', v: 210 },
    { name: 'Social Sciences', v: 185 },
    { name: 'Humanities', v: 120 },
    { name: 'Medicine / Health', v: 95 },
    { name: 'Law', v: 72 },
  ]

  const nationalityDemo = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of projects) {
      map.set(p.country, (map.get(p.country) ?? 0) + 86 + Math.floor(p.name.length * 2))
    }
    const defaults = ['Philippines', 'Indonesia', 'Malaysia', 'Singapore', 'Vietnam', 'Thailand']
    for (const c of defaults) {
      if (!map.has(c)) map.set(c, 120 + c.length * 15)
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [projects])

  const stackedTeamCountry = useMemo(() => {
    return nationalityDemo.slice(0, 8).map((row) => ({
      name: row.name.length > 10 ? `${row.name.slice(0, 9)}…` : row.name,
      full: row.name,
      team: Math.round(row.value * 0.62),
      solo: Math.round(row.value * 0.38),
      total: row.value,
    }))
  }, [nationalityDemo])

  const groupedAcademic = useMemo(() => {
    const m = new Map<string, Project[]>()
    for (const p of projects) {
      const arr = m.get(p.country) ?? []
      arr.push(p)
      m.set(p.country, arr)
    }
    const entries = [...m.entries()].sort((a, b) => b[1].length - a[1].length)
    const first = entries[0]
    if (!first) return null
    const [country, list] = first
    return { country, count: list.length, rows: list.slice(0, 12) }
  }, [projects])

  const sendReminders = async () => {
    if (judgesNeedingReminder.length === 0) return
    setReminding(true)
    try {
      const loginUrl = `${window.location.origin}/auth/login?role=judge`
      let sent = 0
      const failures: string[] = []
      for (const jp of judgesNeedingReminder) {
        const pendingCount = Math.max(0, jp.total - jp.done)
        const magic = await sendMagicLinkToEmail(jp.judge.email)
        if (magic.ok) {
          sent += 1
          continue
        }
        const res = await fetch('/api/email/reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: jp.judge.email,
            judgeName: jp.judge.name,
            competitionName,
            deadline: competitionDeadline,
            pendingCount,
            loginUrl,
          }),
        })
        const data = (await res.json()) as { ok?: boolean; error?: string }
        if (res.ok && data.ok) {
          sent += 1
        } else {
          failures.push(jp.judge.email)
        }
      }
      if (sent > 0) {
        toast.success(`Email sent to ${sent} judge(s) (magic link and/or backup reminder).`)
      }
      if (failures.length > 0) {
        toast.error(`Could not reach: ${failures.join(', ')}. Check Supabase SMTP and Vercel RESEND_* env.`)
      }
      if (sent === 0) {
        toast.error(
          'No emails were delivered. Configure Supabase Authentication → SMTP and/or RESEND_API_KEY + RESEND_FROM.'
        )
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send reminders.')
    } finally {
      setReminding(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Summary of Registrations</h1>
          <p className="mt-0.5 text-sm text-gray-500">{competitionName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DeadlineCountdown deadline={competitionDeadline} />
          {judgesNeedingReminder.length > 0 && (
            <Button
              size="sm"
              onClick={() => void sendReminders()}
              disabled={reminding}
              className="gap-1.5 bg-[#E8735A] text-xs text-white hover:bg-[#d4614a]"
            >
              <Mail size={12} />
              {reminding
                ? 'Sending…'
                : `Remind ${judgesNeedingReminder.length} Judge${judgesNeedingReminder.length > 1 ? 's' : ''}`}
            </Button>
          )}
        </div>
      </div>

      {/* AIRA-style summary row */}
      <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
        <div className="rounded-xl border border-amber-200/80 bg-[#FFF8DC] p-6 shadow-sm animate-fade-in-up lg:col-span-1">
          <p className="text-xs font-semibold text-[#1A2B3C]">Registrations</p>
          <p className="mt-4 text-4xl font-bold tracking-tight text-[#1A2B3C] sm:text-5xl">
            {registrationsTotal.toLocaleString()}
          </p>
          <p className="mt-2 text-[11px] text-gray-600">
            Demo aggregate tied to your projects, judges, and assignments (AIRA-style headline metric).
          </p>
        </div>
        <div className="lg:col-span-2">
          <p className="mb-2 text-xs font-semibold text-[#1A2B3C]">Team status</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: '40ms' }}>
              <p className="text-xs text-gray-500">Total of teams</p>
              <p className="mt-2 text-2xl font-bold text-[#1A2B3C]">{teamStatus.totalTeams.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-[#D0EFFF] p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: '80ms' }}>
              <p className="text-xs font-medium text-sky-950/80">Joining solo</p>
              <p className="mt-2 text-2xl font-bold text-sky-950">{teamStatus.solo.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-[#FFE5D4] p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: '120ms' }}>
              <p className="text-xs font-medium text-orange-950/80">In a fully formed team</p>
              <p className="mt-2 text-2xl font-bold text-orange-950">{teamStatus.fullTeam.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registrations by week */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B3C]">Registrations by week</h2>
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="min-h-[280px] flex-1">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weekChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6B7280' }} angle={-35} textAnchor="end" height={70} />
                <YAxis domain={[0, 450]} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out">
                  {weekChartData.map((entry, i) => (
                    <Cell key={entry.week} fill={entry.fill ?? WEEK_COLORS[i % WEEK_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full shrink-0 rounded-lg border border-gray-100 bg-gray-50/80 p-3 lg:w-44">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Registration week</p>
            <ul className="max-h-[240px] space-y-1.5 overflow-y-auto text-[10px] text-gray-700">
              {weekChartData.map((w, i) => (
                <li key={w.week} className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: w.fill }} />
                  <span>{w.week}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Academic institutions + Source of awareness */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-[#1A2B3C]">Academic institutions</h2>
          {groupedAcademic ? (
            <>
              <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <Badge className="border-0 bg-[#B45309] text-white">{groupedAcademic.country}</Badge>
                <span className="text-xs font-medium text-gray-600">{groupedAcademic.count}</span>
              </div>
              <div className="rounded-lg border border-gray-100">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs text-gray-500">#</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700">Team / project</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedAcademic.rows.map((p, idx) => (
                      <TableRow key={p.id} className="text-sm">
                        <TableCell className="text-xs text-gray-400">{idx + 1}</TableCell>
                        <TableCell className="font-medium text-[#1A2B3C]">{p.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-2 text-[11px] text-gray-400">{groupedAcademic.count.toLocaleString()} records (top country)</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Add projects to see a grouped list.</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-[#1A2B3C]">Source of awareness</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={AWARENESS_DATA} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} domain={[0, 1800]} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 9, fill: '#374151' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={800}>
                  {AWARENESS_DATA.map((_, i) => (
                    <Cell key={i} fill={AWARENESS_COLORS[i % AWARENESS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Country & regions */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-[#1A2B3C]">Country &amp; regions</h2>
        <p className="mb-4 text-xs text-gray-500">Nationality (demo intensities from your project countries)</p>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nationalityDemo} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} angle={-35} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={850}>
                {nationalityDemo.map((_, i) => (
                  <Cell key={i} fill={WEEK_COLORS[i % WEEK_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[#1A2B3C]">Team status per country</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedTeamCountry} margin={{ top: 24, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="team" stackId="a" fill="#7DD3FC" name="Fully-formed team" radius={[0, 0, 0, 0]} isAnimationActive animationDuration={700} />
              <Bar dataKey="solo" stackId="a" fill="#FBBF24" name="Joining solo" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Participants profile */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-[#1A2B3C]">Understanding hackathon participants</h2>
          <p className="text-xs text-gray-500">Participants&apos; profile (illustrative — connect your analytics source later)</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-2 text-xs font-semibold text-[#1A2B3C]">Gender distribution</p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={GENDER_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={1} isAnimationActive animationDuration={700}>
                    {GENDER_DATA.map((e) => (
                      <Cell key={e.name} fill={e.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${Number(v)}%`, '']} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-2 text-xs font-semibold text-[#1A2B3C]">Age</p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="age" tick={{ fontSize: 9, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <Tooltip />
                  <Bar dataKey="n" fill="#66BB6A" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={700} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-2">
            <p className="mb-1 text-xs font-semibold text-[#1A2B3C]">Past participation</p>
            <p className="mb-3 text-[10px] text-gray-500">
              Participants who have joined similar challenges before (demo).
            </p>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pastPartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={700}>
                {pastPartData.map((_, index) => (
                  <Cell key={index} fill={index === 0 ? '#A5D6A7' : '#FFAB91'} />
                ))}
              </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-2">
            <p className="mb-2 text-xs font-semibold text-[#1A2B3C]">Participant motivations</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={motivationData} margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 10, fill: '#374151' }} />
                  <Tooltip />
                  <Bar dataKey="v" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={700}>
                    {motivationData.map((_, i) => (
                      <Cell key={i} fill={AWARENESS_COLORS[i % AWARENESS_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-2">
            <p className="mb-2 text-xs font-semibold text-[#1A2B3C]">Field of study</p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={fieldData} margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 10, fill: '#374151' }} />
                  <Tooltip />
                  <Bar dataKey="v" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={700}>
                    {fieldData.map((_, i) => (
                      <Cell key={i} fill={WEEK_COLORS[(i + 3) % WEEK_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Judging operations */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1A2B3C]">Overall judging progress</h2>
          <span className="text-xs font-bold text-[#1D9E8B]">{overallPct.toFixed(0)}% complete</span>
        </div>
        <Progress value={overallPct} className="progress-teal mb-2 h-2.5" />
        <p className="text-xs text-gray-400">
          {submittedAssignments} of {totalAssignments} assignments submitted
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Projects', value: projects.length, icon: <FileText size={18} />, href: '/organiser/projects', strip: 'stat-strip-orange', iconBg: 'bg-orange-50', iconColor: 'text-[#E8501C]' },
          { label: 'Active Judges', value: judges.filter((j) => j.is_active).length, icon: <Users size={18} />, href: '/organiser/judges', strip: 'stat-strip-blue', iconBg: 'bg-blue-50', iconColor: 'text-[#3A7BD5]' },
          { label: 'Scores Submitted', value: submittedAssignments, icon: <CheckCheck size={18} />, href: '/organiser/results', strip: 'stat-strip-teal', iconBg: 'bg-[#E1F5EE]', iconColor: 'text-[#1D9E8B]' },
          { label: 'Pending', value: totalAssignments - submittedAssignments, icon: <Clock size={18} />, href: '/organiser/assignments', strip: 'stat-strip-amber', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
        ].map((stat, i) => (
          <Link key={stat.label} href={stat.href}>
            <div
              className={`${stat.strip} rounded-xl border border-gray-100 p-4 shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer animate-fade-in-up`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <span className={stat.iconColor}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-[#1A2B3C]">{stat.value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-[#1A2B3C]">Judge completion</h2>
            <Link href="/organiser/judges">
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-[#1D9E8B] hover:bg-[#E1F5EE]">
                View all <ArrowRight size={11} />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {judgeProgress.map(({ judge, total, done, pct, lastActive }, jIdx) => (
              <div key={judge.id} className="flex items-center gap-3 px-5 py-3.5 tr-animate" style={{ animationDelay: `${jIdx * 40}ms` }}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#9DCFC6] bg-[#D4EDE8] text-xs font-bold text-[#0F6E56]">
                  {judge.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="truncate text-sm font-medium text-[#1A2B3C]">{judge.name}</span>
                    <span
                      className={`ml-2 shrink-0 text-xs font-semibold ${
                        pct >= 80 ? 'text-[#1D9E8B]' : pct >= 40 ? 'text-amber-500' : 'text-red-500'
                      }`}
                    >
                      {done}/{total}
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Last active: {lastActive}</span>
                    <Badge
                      className={`text-[10px] ${
                        pct === 100
                          ? 'border border-[#B8DDD4] bg-[#E1F5EE] text-[#0F6E56]'
                          : pct >= 40
                            ? 'border border-amber-200 bg-amber-50 text-amber-700'
                            : 'border border-red-200 bg-red-50 text-red-600'
                      }`}
                    >
                      {pct === 100 ? '✓ Complete' : pct >= 40 ? 'In progress' : 'Behind'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-[#1A2B3C]">Top projects (preliminary)</h2>
            <Link href="/organiser/results">
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-[#1D9E8B] hover:bg-[#E1F5EE]">
                Full results <ArrowRight size={11} />
              </Button>
            </Link>
          </div>
          {topProjects.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400">
              <BarChart3 size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No completed scores yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topProjects.map(({ project, avg, scoredCount }, i) => (
                <div key={project.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0
                        ? 'bg-amber-100 text-amber-700'
                        : i === 1
                          ? 'bg-gray-100 text-gray-500'
                          : i === 2
                            ? 'bg-orange-50 text-orange-500'
                            : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1A2B3C]">{project.name}</p>
                    <p className="text-[10px] text-gray-400">
                      {project.country} · {scoredCount} judge{scoredCount !== 1 ? 's' : ''} scored
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-[#1D9E8B]">{avg?.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400">/ 85</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1A2B3C]">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/organiser/projects">
            <Button variant="outline" size="sm" className="gap-1.5 border-gray-200 text-xs">
              <FileText size={12} /> Submissions review
            </Button>
          </Link>
          <Link href="/organiser/consultations">
            <Button variant="outline" size="sm" className="gap-1.5 border-gray-200 text-xs">
              Consultation sessions
            </Button>
          </Link>
          <Link href="/organiser/judges">
            <Button variant="outline" size="sm" className="gap-1.5 border-gray-200 text-xs">
              <Users size={12} /> Judges
            </Button>
          </Link>
          <Link href="/organiser/assignments">
            <Button variant="outline" size="sm" className="gap-1.5 border-gray-200 text-xs">
              <CheckCheck size={12} /> Assignments
            </Button>
          </Link>
          <Link href="/organiser/results">
            <Button size="sm" className="gap-1.5 bg-[#1D9E8B] text-xs text-white hover:bg-[#0F6E56]">
              <BarChart3 size={12} /> Results
            </Button>
          </Link>
          {judgesNeedingReminder.length > 0 && (
            <Button
              size="sm"
              onClick={() => void sendReminders()}
              disabled={reminding}
              className="gap-1.5 bg-[#E8735A] text-xs text-white hover:bg-[#d4614a]"
            >
              <AlertTriangle size={12} /> {reminding ? 'Sending…' : `Reminders (${judgesNeedingReminder.length})`}
            </Button>
          )}
          <Link href="/vote" target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 border-pink-200 text-xs text-pink-600 hover:bg-pink-50">
              People&apos;s choice
            </Button>
          </Link>
          <Link href="/organiser/setup">
            <Button variant="outline" size="sm" className="gap-1.5 border-gray-200 text-xs">
              Setup
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
