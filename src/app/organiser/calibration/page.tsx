'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CountryBadge } from '@/components/shared/CountryBadge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  Cell,
  ReferenceLine,
} from 'recharts'
import { AlertTriangle, TrendingUp, BarChart2 } from 'lucide-react'
import { DEMO_CRITERIA, DEMO_SCORES } from '@/lib/demo-data'
import type { Assignment, Judge, Project } from '@/lib/types'
import { computeWeightedScore, JUDGING_CRITERIA, TOTAL_MAX_SCORE } from '@/lib/types'
import { useOrganiserDemoStore } from '@/store/organiserDemoStore'

// Build per-judge scoring profiles
function buildCalibrationData(assignments: Assignment[], judges: Judge[], projects: Project[]) {
  const judgeProfiles = judges.map((judge) => {
    const judgeAssignments = assignments.filter((a) => a.judge_id === judge.id)
    const allScores: number[] = []
    const criterionAverages: Record<string, number[]> = {}

    judgeAssignments.forEach((assignment) => {
      const scores = DEMO_SCORES.filter((s) => s.assignment_id === assignment.id && s.submitted_at)
      scores.forEach((s) => {
        allScores.push(s.score)
        const crit = DEMO_CRITERIA.find((c) => c.id === s.criterion_id)
        if (crit) {
          criterionAverages[crit.key] = criterionAverages[crit.key] ?? []
          criterionAverages[crit.key].push(s.score)
        }
      })
    })

    const avg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0
    const variance = allScores.length > 1
      ? allScores.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / allScores.length
      : 0

    const criteriaAvg = Object.fromEntries(
      Object.entries(criterionAverages).map(([key, vals]) => [
        key,
        vals.reduce((a, b) => a + b, 0) / vals.length,
      ])
    )

    return { judge, avg, variance, stdDev: Math.sqrt(variance), allScores, criteriaAvg }
  })

  // Per-project cross-judge comparison
  const projectComparisons = projects.map((project) => {
    const projectAssignments = assignments.filter((a) => a.project_id === project.id)
    const judgeScores: { judgeName: string; total: number }[] = []

    projectAssignments.forEach((a) => {
      const scores = DEMO_SCORES.filter((s) => s.assignment_id === a.id && s.submitted_at)
      if (scores.length === JUDGING_CRITERIA.length) {
        const map: Record<string, number> = {}
        scores.forEach((s) => {
          const c = DEMO_CRITERIA.find((cr) => cr.id === s.criterion_id)
          if (c) map[c.key] = s.score
        })
        const judge = judges.find((j) => j.id === a.judge_id)
        judgeScores.push({ judgeName: judge?.name ?? '?', total: computeWeightedScore(map, JUDGING_CRITERIA) })
      }
    })

    const avg = judgeScores.length > 0
      ? judgeScores.reduce((s, j) => s + j.total, 0) / judgeScores.length
      : 0
    const spread = judgeScores.length > 1
      ? Math.max(...judgeScores.map((j) => j.total)) - Math.min(...judgeScores.map((j) => j.total))
      : 0

    return { project, judgeScores, avg, spread }
  }).filter((r) => r.judgeScores.length > 0)

  return { judgeProfiles, projectComparisons }
}

const JUDGE_COLORS = ['#1D9E8B', '#3A7BD5', '#7C5CBF', '#E8735A', '#F5A623']

export default function CalibrationPage() {
  const projects = useOrganiserDemoStore((s) => s.projects)
  const judges = useOrganiserDemoStore((s) => s.judges)
  const assignments = useOrganiserDemoStore((s) => s.assignments)
  const { judgeProfiles, projectComparisons } = useMemo(
    () => buildCalibrationData(assignments, judges, projects),
    [assignments, judges, projects]
  )

  const globalAvg = judgeProfiles.reduce((s, j) => s + j.avg, 0) / judgeProfiles.length

  // Data for cross-criterion heatmap
  const criteriaComparisonData = JUDGING_CRITERIA.map((c) => {
    const entry: Record<string, string | number> = { name: c.name.split(' ')[0] }
    judgeProfiles.forEach((jp) => {
      entry[jp.judge.name.split(' ')[1]] = parseFloat((jp.criteriaAvg[c.key] ?? 0).toFixed(2))
    })
    return entry
  })

  // Outlier detection: flag judge-project pairs where spread > 15 pts
  const outliers = projectComparisons
    .filter((r) => r.spread > 15)
    .sort((a, b) => b.spread - a.spread)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A2B3C]">Score Calibration</h1>
        <p className="text-sm text-gray-500">
          Detect scoring inconsistencies, judge bias, and inter-rater agreement across all submitted scores.
        </p>
      </div>

      {/* Judge profile cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {judgeProfiles.map((jp, i) => (
          <div key={jp.judge.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: JUDGE_COLORS[i % JUDGE_COLORS.length] }}
              >
                {jp.judge.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-[#1A2B3C] text-sm">{jp.judge.name}</p>
                <p className="text-[10px] text-gray-400">{jp.allScores.length} scores submitted</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Avg score</span>
                <span className={`font-semibold ${
                  jp.avg > globalAvg + 1 ? 'text-amber-600' :
                  jp.avg < globalAvg - 1 ? 'text-blue-600' : 'text-[#1D9E8B]'
                }`}>
                  {jp.avg.toFixed(2)}/10
                  {jp.avg > globalAvg + 1 && <span className="ml-1 text-[9px]">↑ High</span>}
                  {jp.avg < globalAvg - 1 && <span className="ml-1 text-[9px]">↓ Low</span>}
                </span>
              </div>
              <Progress value={(jp.avg / 10) * 100} className="h-1.5 progress-teal" />
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Std deviation</span>
                <span className={`font-semibold ${jp.stdDev > 2.5 ? 'text-amber-600' : 'text-gray-600'}`}>
                  ±{jp.stdDev.toFixed(2)}
                  {jp.stdDev > 2.5 && <span className="ml-1 text-[9px]">⚠ Variable</span>}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">vs. global avg</span>
                <span className={`font-semibold ${
                  jp.avg - globalAvg > 0.5 ? 'text-amber-600' :
                  jp.avg - globalAvg < -0.5 ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {jp.avg - globalAvg > 0 ? '+' : ''}{(jp.avg - globalAvg).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Outlier alerts */}
      {outliers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-800">Inter-Rater Spread Alerts</h2>
            <Badge className="text-[10px] bg-amber-200 text-amber-800 border-none">
              {outliers.length} project{outliers.length > 1 ? 's' : ''} flagged
            </Badge>
          </div>
          <p className="text-xs text-amber-700 mb-3">
            The following projects have a score spread &gt;15 pts between judges. Review these before finalising results.
          </p>
          <div className="space-y-2">
            {outliers.map((r) => (
              <div key={r.project.id} className="bg-white rounded-lg border border-amber-200 p-3 flex items-center gap-3">
                <CountryBadge country={r.project.country} />
                <span className="font-medium text-sm text-[#1A2B3C] flex-1">{r.project.name}</span>
                <div className="flex gap-2 items-center">
                  {r.judgeScores.map((js) => (
                    <Badge key={js.judgeName} className="text-[10px] bg-gray-50 text-gray-600 border-gray-200">
                      {js.judgeName.split(' ').pop()}: {js.total.toFixed(1)}
                    </Badge>
                  ))}
                  <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 font-bold">
                    Δ {r.spread.toFixed(1)} pts
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Criterion comparison chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={15} className="text-[#1D9E8B]" />
          <h2 className="text-sm font-semibold text-[#1A2B3C]">Average Score per Criterion by Judge</h2>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={criteriaComparisonData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#6B7280' }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E6EA' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={globalAvg} stroke="#F5A623" strokeDasharray="4 2" label={{ value: 'Global avg', fontSize: 10, fill: '#F5A623' }} />
            {judgeProfiles.map((jp, i) => (
              <Bar
                key={jp.judge.id}
                dataKey={jp.judge.name.split(' ')[1]}
                fill={JUDGE_COLORS[i % JUDGE_COLORS.length]}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Project spread scatter */}
      {projectComparisons.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-[#1D9E8B]" />
            <h2 className="text-sm font-semibold text-[#1A2B3C]">Project Score Distribution (Judge 1 vs Judge 2)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-500 font-medium pb-2 pr-3">Project</th>
                  <th className="text-left text-gray-500 font-medium pb-2">Country</th>
                  {judgeProfiles.map((jp) => (
                    <th key={jp.judge.id} className="text-center text-gray-500 font-medium pb-2 px-2">
                      {jp.judge.name.split(' ').pop()}
                    </th>
                  ))}
                  <th className="text-center text-gray-500 font-medium pb-2">Avg</th>
                  <th className="text-center text-gray-500 font-medium pb-2">Spread</th>
                </tr>
              </thead>
              <tbody>
                {projectComparisons.map((r) => (
                  <tr key={r.project.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-3 font-medium text-[#1A2B3C]">{r.project.name}</td>
                    <td className="py-2"><CountryBadge country={r.project.country} /></td>
                    {judgeProfiles.map((jp) => {
                      const jScore = r.judgeScores.find((js) => js.judgeName === jp.judge.name)
                      return (
                        <td key={jp.judge.id} className="py-2 px-2 text-center">
                          {jScore ? (
                            <span className={`font-semibold ${
                              jScore.total >= 70 ? 'text-[#1D9E8B]' :
                              jScore.total >= 55 ? 'text-amber-600' : 'text-red-500'
                            }`}>{jScore.total.toFixed(1)}</span>
                          ) : <span className="text-gray-200">—</span>}
                        </td>
                      )
                    })}
                    <td className="py-2 text-center font-bold text-[#1D9E8B]">{r.avg.toFixed(1)}</td>
                    <td className="py-2 text-center">
                      <Badge className={`text-[10px] ${
                        r.spread > 15 ? 'bg-red-50 text-red-600 border-red-200' :
                        r.spread > 8 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-[#E1F5EE] text-[#0F6E56] border border-[#B8DDD4]'
                      }`}>
                        Δ{r.spread.toFixed(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
