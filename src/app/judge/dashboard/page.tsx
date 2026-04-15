'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CountryBadge } from '@/components/shared/CountryBadge'
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown'
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Video,
  ArrowUpDown,
  CheckCheck,
  Flag,
  AlertTriangle,
} from 'lucide-react'
import {
  DEMO_ASSIGNMENTS,
  DEMO_COMPETITION,
  DEMO_PROJECTS,
} from '@/lib/demo-data'
import { computeWeightedScore, JUDGING_CRITERIA, TOTAL_MAX_SCORE } from '@/lib/types'
import { useJudgeStore } from '@/store/judgeStore'
import { useSessionStore } from '@/store/sessionStore'

type SortMode = 'assigned' | 'score'
type FilterTab = 'all' | 'pending' | 'judged' | 'flagged'

export default function JudgeDashboardPage() {
  const store = useJudgeStore()
  const session = useSessionStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [sort, setSort] = useState<SortMode>('assigned')

  const judgeId = session.demo.judgeId ?? 'judge-001'
  const myAssignments = DEMO_ASSIGNMENTS.filter((a) => a.judge_id === judgeId)

  const rows = myAssignments.map((assignment) => {
    const project = DEMO_PROJECTS.find((p) => p.id === assignment.project_id)!
    const state = store.getAssignment(assignment.id)
    const scoredCount = Object.keys(state.scores).length
    const weightedTotal =
      scoredCount === JUDGING_CRITERIA.length
        ? computeWeightedScore(state.scores, JUDGING_CRITERIA)
        : null

    return {
      ...assignment,
      project,
      state,
      scoredCount,
      weightedTotal,
      status: state.isSubmitted
        ? 'judged'
        : state.conflictFlagged
        ? 'flagged'
        : scoredCount > 0
        ? 'in_progress'
        : 'pending',
    }
  })

  const judgedCount = rows.filter((r) => r.status === 'judged').length
  const pendingCount = rows.filter((r) => r.status === 'pending' || r.status === 'in_progress').length
  const flaggedCount = rows.filter((r) => r.state.conflictFlagged).length
  const completionPct = rows.length > 0 ? (judgedCount / rows.length) * 100 : 0

  const filtered = rows
    .filter((r) => {
      if (filter === 'pending') return r.status === 'pending' || r.status === 'in_progress'
      if (filter === 'judged') return r.status === 'judged'
      if (filter === 'flagged') return r.state.conflictFlagged
      return true
    })
    .filter((r) => {
      if (!search) return true
      const q = search.toLowerCase()
      return r.project.name.toLowerCase().includes(q) || r.project.country.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sort === 'score') return (b.weightedTotal ?? -1) - (a.weightedTotal ?? -1)
      return 0
    })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A2B3C]">My Assignments</h1>
          <p className="text-sm text-gray-500 mt-0.5">{DEMO_COMPETITION.name}</p>
        </div>
        <DeadlineCountdown deadline={DEMO_COMPETITION.deadline} />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Assigned', value: rows.length,
            icon: <FileText size={16} />, color: 'text-[#1D9E8B]',
          },
          {
            label: 'Judged', value: judgedCount,
            icon: <CheckCheck size={16} />,
            color: judgedCount === rows.length ? 'text-[#1D9E8B]' : 'text-amber-500',
          },
          {
            label: 'Remaining', value: pendingCount,
            icon: <Clock size={16} />,
            color: pendingCount > 0 ? 'text-amber-500' : 'text-[#1D9E8B]',
          },
          {
            label: 'Completion', value: `${completionPct.toFixed(0)}%`,
            icon: <CheckCircle2 size={16} />,
            color: completionPct === 100 ? 'text-[#1D9E8B]' : 'text-[#1A2B3C]',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
              <span className={stat.color}>{stat.icon}</span>
              {stat.label}
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Overall Progress</span>
          <div className="flex items-center gap-2">
            {flaggedCount > 0 && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <Flag size={11} /> {flaggedCount} flagged
              </span>
            )}
            <span className="text-xs font-bold text-[#1D9E8B]">{judgedCount}/{rows.length} judged</span>
          </div>
        </div>
        <Progress value={completionPct} className="h-2 progress-teal" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList className="bg-white border border-gray-100 h-9">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-[#1D9E8B] data-[state=active]:text-white">
              All ({rows.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="judged" className="text-xs data-[state=active]:bg-[#1D9E8B] data-[state=active]:text-white">
              Judged ({judgedCount})
            </TabsTrigger>
            {flaggedCount > 0 && (
              <TabsTrigger value="flagged" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Flag size={10} className="mr-1" />Flagged ({flaggedCount})
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <Input
            placeholder="Search by project or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm border-gray-200"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSort(sort === 'assigned' ? 'score' : 'assigned')}
          className="h-9 gap-1.5 text-xs border-gray-200"
        >
          <ArrowUpDown size={13} />
          {sort === 'assigned' ? 'Default order' : 'By score ↓'}
        </Button>
      </div>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Search size={32} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm text-gray-400">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((row) => (
            <div
              key={row.id}
              className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                row.status === 'judged'
                  ? 'border-[#9DCFC6]'
                  : row.state.conflictFlagged
                  ? 'border-amber-200'
                  : 'border-gray-100'
              }`}
            >
              {/* Top color bar */}
              <div className={`h-1 ${
                row.status === 'judged' ? 'bg-[#1D9E8B]' :
                row.state.conflictFlagged ? 'bg-amber-400' :
                row.status === 'in_progress' ? 'bg-amber-300' : 'bg-gray-100'
              }`} />

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A2B3C] text-sm truncate">{row.project.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <CountryBadge country={row.project.country} />
                      {row.state.conflictFlagged && (
                        <Badge className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 gap-1">
                          <Flag size={8} /> CoI
                        </Badge>
                      )}
                      {row.status === 'judged' ? (
                        <Badge className="text-[10px] bg-[#E1F5EE] text-[#0F6E56] border border-[#B8DDD4]">
                          <CheckCircle2 size={9} className="mr-1" />Judged
                        </Badge>
                      ) : row.status === 'in_progress' ? (
                        <Badge className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                          In Progress
                        </Badge>
                      ) : row.state.conflictFlagged ? (
                        <Badge className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                          <AlertTriangle size={9} className="mr-1" />Flagged
                        </Badge>
                      ) : (
                        <Badge className="text-[10px] bg-gray-50 text-gray-500 border-gray-200">
                          <Clock size={9} className="mr-1" />Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  {row.weightedTotal !== null && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-[#1D9E8B]">{row.weightedTotal.toFixed(1)}</p>
                      <p className="text-[10px] text-gray-400">/ {TOTAL_MAX_SCORE}</p>
                    </div>
                  )}
                </div>

                {/* Mini criteria dots */}
                <div className="flex gap-0.5 mb-2">
                  {JUDGING_CRITERIA.map((c) => (
                    <div
                      key={c.key}
                      className={`h-1 flex-1 rounded-full ${
                        row.state.scores[c.key] !== undefined ? 'bg-[#1D9E8B]' : 'bg-gray-100'
                      }`}
                      title={`${c.name}: ${row.state.scores[c.key] ?? '—'}`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mb-3">
                  {row.scoredCount}/{JUDGING_CRITERIA.length} criteria scored
                </p>

                {/* Links */}
                {(row.project.pdf_url || row.project.video_url) && (
                  <div className="flex items-center gap-2 mb-3">
                    {row.project.pdf_url && (
                      <a href={row.project.pdf_url} target="_blank" rel="noreferrer"
                        className="text-[10px] text-gray-400 hover:text-[#1D9E8B] flex items-center gap-1">
                        <FileText size={11} /> PDF
                      </a>
                    )}
                    {row.project.video_url && (
                      <a href={row.project.video_url} target="_blank" rel="noreferrer"
                        className="text-[10px] text-gray-400 hover:text-[#1D9E8B] flex items-center gap-1">
                        <Video size={11} /> Video
                      </a>
                    )}
                  </div>
                )}

                <Link href={`/judge/score/${row.id}`}>
                  <Button
                    size="sm"
                    className={`w-full gap-1.5 text-xs ${
                      row.status === 'judged'
                        ? 'bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#c8eee6]'
                        : 'bg-[#1D9E8B] hover:bg-[#0F6E56] text-white'
                    }`}
                  >
                    {row.status === 'judged'
                      ? 'Review / Amend'
                      : row.status === 'in_progress'
                      ? 'Continue Scoring'
                      : 'Start Scoring'}
                    <ArrowRight size={12} />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
