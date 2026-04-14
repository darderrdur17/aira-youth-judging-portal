'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CountryBadge } from '@/components/shared/CountryBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Download, ChevronDown, ChevronRight, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import {
  DEMO_ASSIGNMENTS,
  DEMO_COMPETITION,
  DEMO_CRITERIA,
  DEMO_FEEDBACK,
  DEMO_JUDGES,
  DEMO_PROJECTS,
  DEMO_SCORES,
} from '@/lib/demo-data'
import { JUDGING_CRITERIA, TOTAL_MAX_SCORE, computeWeightedScore } from '@/lib/types'

function buildResults() {
  return DEMO_PROJECTS.map((project) => {
    const projectAssignments = DEMO_ASSIGNMENTS.filter((a) => a.project_id === project.id)
    const judgeBreakdown: { judgeId: string; judgeName: string; score: number; scoreMap: Record<string, number> }[] = []

    projectAssignments.forEach((assignment) => {
      const scores = DEMO_SCORES.filter((s) => s.assignment_id === assignment.id && s.submitted_at)
      if (scores.length === JUDGING_CRITERIA.length) {
        const map: Record<string, number> = {}
        scores.forEach((s) => {
          const crit = DEMO_CRITERIA.find((c) => c.id === s.criterion_id)
          if (crit) map[crit.key] = s.score
        })
        const judge = DEMO_JUDGES.find((j) => j.id === assignment.judge_id)
        judgeBreakdown.push({
          judgeId: assignment.judge_id,
          judgeName: judge?.name ?? 'Unknown',
          score: computeWeightedScore(map, JUDGING_CRITERIA),
          scoreMap: map,
        })
      }
    })

    const avg = judgeBreakdown.length > 0
      ? judgeBreakdown.reduce((a, b) => a + b.score, 0) / judgeBreakdown.length
      : null
    const min = judgeBreakdown.length > 0 ? Math.min(...judgeBreakdown.map((j) => j.score)) : null
    const max = judgeBreakdown.length > 0 ? Math.max(...judgeBreakdown.map((j) => j.score)) : null

    const allFeedback = projectAssignments
      .map((a) => DEMO_FEEDBACK.find((f) => f.assignment_id === a.id)?.team_feedback)
      .filter(Boolean)

    return {
      project,
      avg,
      min,
      max,
      judgeCount: projectAssignments.length,
      scoredCount: judgeBreakdown.length,
      judgeBreakdown,
      allFeedback,
    }
  })
    .sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1))
    .map((r, i) => ({ ...r, rank: r.avg !== null ? i + 1 : null }))
}

export default function OrganiserResultsPage() {
  const results = buildResults()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const s = new Set(expanded)
    s.has(id) ? s.delete(id) : s.add(id)
    setExpanded(s)
  }

  const handleExportCSV = () => {
    const header = [
      'Rank', 'Project', 'Country', 'Judge Count', 'Avg Score', 'Min', 'Max',
      ...JUDGING_CRITERIA.map((c) => c.name),
    ]

    const rows = results.map((r) => {
      const avgCriteria = JUDGING_CRITERIA.map((c) => {
        if (r.judgeBreakdown.length === 0) return ''
        const avg = r.judgeBreakdown.reduce((sum, jb) => sum + (jb.scoreMap[c.key] ?? 0), 0) / r.judgeBreakdown.length
        return avg.toFixed(2)
      })
      return [
        r.rank ?? 'N/A',
        `"${r.project.name}"`,
        r.project.country,
        r.scoredCount,
        r.avg?.toFixed(2) ?? 'N/A',
        r.min?.toFixed(2) ?? 'N/A',
        r.max?.toFixed(2) ?? 'N/A',
        ...avgCriteria,
      ]
    })

    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${DEMO_COMPETITION.slug}-results-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('CSV exported.')
  }

  const chartData = results
    .filter((r) => r.avg !== null)
    .slice(0, 10)
    .map((r) => ({
      name: r.project.name.length > 14 ? r.project.name.slice(0, 14) + '…' : r.project.name,
      score: parseFloat((r.avg ?? 0).toFixed(2)),
      country: r.project.country,
    }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Results</h1>
          <p className="text-sm text-gray-500">
            {results.filter((r) => r.avg !== null).length} of {results.length} projects fully scored
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs border-gray-200"
          >
            <Download size={13} /> Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => toast.info('PDF export coming soon — connect Supabase Edge Functions.')}
            className="gap-1.5 text-xs bg-[#1D9E8B] hover:bg-[#0F6E56] text-white"
          >
            <Download size={13} /> Export PDF
          </Button>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#1A2B3C] mb-4">Top Projects by Average Score</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                angle={-30}
                textAnchor="end"
              />
              <YAxis domain={[0, TOTAL_MAX_SCORE]} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                formatter={(v) => [`${v ?? 0} / ${TOTAL_MAX_SCORE}`, 'Avg Score']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E6EA' }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#F5A623' : '#1D9E8B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Results table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1A2B3C] hover:bg-[#1A2B3C]">
              <TableHead className="text-white text-xs font-semibold w-10">Rank</TableHead>
              <TableHead className="text-white text-xs font-semibold">Project</TableHead>
              <TableHead className="text-white text-xs font-semibold">Country</TableHead>
              <TableHead className="text-white text-xs font-semibold">Judges</TableHead>
              <TableHead className="text-white text-xs font-semibold">Avg Score</TableHead>
              <TableHead className="text-white text-xs font-semibold">Min</TableHead>
              <TableHead className="text-white text-xs font-semibold">Max</TableHead>
              <TableHead className="text-white text-xs font-semibold w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r) => {
              const isExp = expanded.has(r.project.id)
              return (
                <>
                  <TableRow
                    key={r.project.id}
                    className={`hover:bg-gray-50 text-sm cursor-pointer ${r.avg === null ? 'opacity-50' : ''}`}
                    onClick={() => r.avg !== null && toggleExpand(r.project.id)}
                  >
                    <TableCell>
                      {r.rank !== null ? (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          r.rank === 1 ? 'bg-amber-100 text-amber-700' :
                          r.rank === 2 ? 'bg-gray-100 text-gray-600' :
                          r.rank === 3 ? 'bg-orange-50 text-orange-600' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {r.rank <= 3 ? <Trophy size={12} /> : r.rank}
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="font-medium text-[#1A2B3C]">{r.project.name}</TableCell>
                    <TableCell><CountryBadge country={r.project.country} /></TableCell>
                    <TableCell>
                      <Badge className="text-[10px] bg-gray-50 text-gray-600 border-gray-200">
                        {r.scoredCount}/{r.judgeCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.avg !== null ? (
                        <span className="font-bold text-[#1D9E8B]">{r.avg.toFixed(2)}</span>
                      ) : <span className="text-gray-300">—</span>}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {r.min?.toFixed(2) ?? '—'}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {r.max?.toFixed(2) ?? '—'}
                    </TableCell>
                    <TableCell>
                      {r.avg !== null && (
                        isExp ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Expanded breakdown */}
                  {isExp && (
                    <TableRow key={`${r.project.id}-expanded`} className="bg-[#E1F5EE]/30">
                      <TableCell colSpan={8} className="py-3 px-5">
                        <div className="space-y-4">
                          {/* Per-judge scores */}
                          <div>
                            <h4 className="text-xs font-semibold text-[#1A2B3C] mb-2">Per-Judge Breakdown</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-gray-500">
                                    <th className="text-left pb-1.5 pr-4">Judge</th>
                                    {JUDGING_CRITERIA.map((c) => (
                                      <th key={c.key} className="text-center pb-1.5 px-1 min-w-[50px]">
                                        {c.name.split(' ')[0]}
                                      </th>
                                    ))}
                                    <th className="text-right pb-1.5 pl-4">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {r.judgeBreakdown.map((jb) => (
                                    <tr key={jb.judgeId} className="border-t border-gray-100">
                                      <td className="py-1.5 pr-4 font-medium text-[#1A2B3C]">{jb.judgeName}</td>
                                      {JUDGING_CRITERIA.map((c) => (
                                        <td key={c.key} className="text-center py-1.5 px-1">
                                          <span className={`font-semibold ${
                                            (jb.scoreMap[c.key] ?? 0) >= 8 ? 'text-[#1D9E8B]' :
                                            (jb.scoreMap[c.key] ?? 0) >= 6 ? 'text-amber-600' : 'text-red-500'
                                          }`}>
                                            {jb.scoreMap[c.key] ?? '—'}
                                          </span>
                                        </td>
                                      ))}
                                      <td className="text-right py-1.5 pl-4 font-bold text-[#1D9E8B]">
                                        {jb.score.toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Team feedback */}
                          {r.allFeedback.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-[#1A2B3C] mb-2">Team Feedback</h4>
                              <div className="space-y-2">
                                {r.allFeedback.map((fb, i) => (
                                  <div key={i} className="bg-white border border-gray-100 rounded-lg p-3 text-xs text-gray-600 leading-relaxed">
                                    {fb}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
