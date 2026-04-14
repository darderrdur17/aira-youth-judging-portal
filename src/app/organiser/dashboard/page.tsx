'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown'
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
  DEMO_ASSIGNMENTS,
  DEMO_COMPETITION,
  DEMO_CRITERIA,
  DEMO_JUDGES,
  DEMO_PROJECTS,
  DEMO_SCORES,
} from '@/lib/demo-data'
import { JUDGING_CRITERIA, computeWeightedScore } from '@/lib/types'

function getJudgeProgress() {
  return DEMO_JUDGES.map((judge) => {
    const assignments = DEMO_ASSIGNMENTS.filter((a) => a.judge_id === judge.id)
    const submitted = assignments.filter((a) =>
      DEMO_SCORES.some((s) => s.assignment_id === a.id && s.submitted_at)
    )
    const pct = assignments.length > 0 ? (submitted.length / assignments.length) * 100 : 0
    return {
      judge,
      total: assignments.length,
      done: submitted.length,
      pct,
      lastActive: submitted.length > 0 ? '2 hours ago' : 'Never',
    }
  })
}

function getTopProjects() {
  return DEMO_PROJECTS.map((project) => {
    const projectAssignments = DEMO_ASSIGNMENTS.filter((a) => a.project_id === project.id)
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

    const avg = projectScores.length > 0
      ? projectScores.reduce((a, b) => a + b, 0) / projectScores.length
      : null

    return { project, avg, judgeCount: projectAssignments.length, scoredCount: projectScores.length }
  })
    .filter((r) => r.avg !== null)
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
    .slice(0, 5)
}

export default function OrganiserDashboardPage() {
  const judgeProgress = getJudgeProgress()
  const topProjects = getTopProjects()

  const totalAssignments = DEMO_ASSIGNMENTS.length
  const submittedAssignments = DEMO_ASSIGNMENTS.filter((a) =>
    DEMO_SCORES.some((s) => s.assignment_id === a.id && s.submitted_at)
  ).length
  const overallPct = totalAssignments > 0 ? (submittedAssignments / totalAssignments) * 100 : 0
  const judgesNeedingReminder = judgeProgress.filter((j) => j.pct < 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Organiser Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{DEMO_COMPETITION.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <DeadlineCountdown deadline={DEMO_COMPETITION.deadline} />
          {judgesNeedingReminder.length > 0 && (
            <Button size="sm" className="bg-[#E8735A] hover:bg-[#d4614a] text-white gap-1.5 text-xs">
              <Mail size={12} />
              Remind {judgesNeedingReminder.length} Judge{judgesNeedingReminder.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Projects', value: DEMO_PROJECTS.length, icon: <FileText size={16} />, href: '/organiser/projects' },
          { label: 'Active Judges', value: DEMO_JUDGES.filter((j) => j.is_active).length, icon: <Users size={16} />, href: '/organiser/judges' },
          { label: 'Scores Submitted', value: submittedAssignments, icon: <CheckCheck size={16} />, href: '/organiser/results' },
          { label: 'Pending', value: totalAssignments - submittedAssignments, icon: <Clock size={16} />, href: '/organiser/assignments' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                <span className="text-[#1D9E8B]">{stat.icon}</span>
                {stat.label}
              </div>
              <p className="text-2xl font-bold text-[#1A2B3C]">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-[#1A2B3C]">Overall Judging Progress</h2>
          <span className="text-xs font-bold text-[#1D9E8B]">{overallPct.toFixed(0)}% complete</span>
        </div>
        <Progress value={overallPct} className="h-2.5 progress-teal mb-2" />
        <p className="text-xs text-gray-400">{submittedAssignments} of {totalAssignments} assignments submitted</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Judge progress */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[#1A2B3C]">Judge Completion</h2>
            <Link href="/organiser/judges">
              <Button variant="ghost" size="sm" className="text-[#1D9E8B] text-xs gap-1 hover:bg-[#E1F5EE] h-7">
                View all <ArrowRight size={11} />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {judgeProgress.map(({ judge, total, done, pct, lastActive }) => (
              <div key={judge.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1D9E8B]/10 flex items-center justify-center text-[#1D9E8B] text-xs font-bold flex-shrink-0">
                  {judge.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#1A2B3C] truncate">{judge.name}</span>
                    <span className={`text-xs font-semibold ml-2 flex-shrink-0 ${
                      pct >= 80 ? 'text-[#1D9E8B]' : pct >= 40 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {done}/{total}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className="h-1.5"
                  />
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-gray-400">Last active: {lastActive}</span>
                    <Badge className={`text-[10px] ${
                      pct === 100
                        ? 'bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E8B]/20'
                        : pct >= 40
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {pct === 100 ? '✓ Complete' : pct >= 40 ? 'In Progress' : 'Behind'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top projects */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[#1A2B3C]">Top Projects (Preliminary)</h2>
            <Link href="/organiser/results">
              <Button variant="ghost" size="sm" className="text-[#1D9E8B] text-xs gap-1 hover:bg-[#E1F5EE] h-7">
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
                <div key={project.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A2B3C] truncate">{project.name}</p>
                    <p className="text-[10px] text-gray-400">{project.country} · {scoredCount} judge{scoredCount !== 1 ? 's' : ''} scored</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#1D9E8B]">{avg?.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400">/ 85</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-[#1A2B3C] mb-3">Quick Actions</h2>
        <p className="text-xs text-gray-400 mb-3">
          New here? Follow: <span className="text-[#1D9E8B] font-medium">Setup</span> → <span className="text-[#1D9E8B] font-medium">Projects</span> → <span className="text-[#1D9E8B] font-medium">Judges</span> → <span className="text-[#1D9E8B] font-medium">Assignments</span> → <span className="text-[#1D9E8B] font-medium">Monitor</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/organiser/projects">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-gray-200">
              <FileText size={12} /> Manage Projects
            </Button>
          </Link>
          <Link href="/organiser/judges">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-gray-200">
              <Users size={12} /> Manage Judges
            </Button>
          </Link>
          <Link href="/organiser/assignments">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-gray-200">
              <CheckCheck size={12} /> Manage Assignments
            </Button>
          </Link>
          <Link href="/organiser/results">
            <Button size="sm" className="gap-1.5 text-xs bg-[#1D9E8B] hover:bg-[#0F6E56] text-white">
              <BarChart3 size={12} /> View Full Results
            </Button>
          </Link>
          {judgesNeedingReminder.length > 0 && (
            <Button size="sm" className="gap-1.5 text-xs bg-[#E8735A] hover:bg-[#d4614a] text-white">
              <AlertTriangle size={12} /> Send Reminders ({judgesNeedingReminder.length})
            </Button>
          )}
          <Link href="/vote" target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-pink-200 text-pink-600 hover:bg-pink-50">
              ❤️ People&#39;s Choice Voting
            </Button>
          </Link>
          <Link href="/organiser/calibration">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-gray-200">
              <BarChart3 size={12} /> Score Calibration
            </Button>
          </Link>
          <Link href="/organiser/setup">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-gray-200">
              ⚙️ Competition Setup
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
