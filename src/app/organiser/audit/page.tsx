'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Download, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { DEMO_ASSIGNMENTS, DEMO_CRITERIA, DEMO_JUDGES, DEMO_PROJECTS, DEMO_SCORES } from '@/lib/demo-data'

// Build a synthetic audit log from scores
function buildAuditLog() {
  return DEMO_SCORES.filter((s) => s.submitted_at).map((score) => {
    const assignment = DEMO_ASSIGNMENTS.find((a) => a.id === score.assignment_id)
    const judge = DEMO_JUDGES.find((j) => j.id === assignment?.judge_id)
    const project = DEMO_PROJECTS.find((p) => p.id === assignment?.project_id)
    const criterion = DEMO_CRITERIA.find((c) => c.id === score.criterion_id)
    return {
      id: score.id,
      judge: judge?.name ?? 'Unknown',
      project: project?.name ?? 'Unknown',
      criterion: criterion?.name ?? 'Unknown',
      score: score.score,
      action: 'SCORE_SAVED',
      timestamp: score.saved_at,
      submittedAt: score.submitted_at,
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export default function OrganiserAuditPage() {
  const log = buildAuditLog()
  const [search, setSearch] = useState('')

  const filtered = log.filter((entry) => {
    const q = search.toLowerCase()
    return (
      entry.judge.toLowerCase().includes(q) ||
      entry.project.toLowerCase().includes(q) ||
      entry.criterion.toLowerCase().includes(q)
    )
  })

  const handleExport = () => {
    const csv = [
      'Timestamp,Judge,Project,Criterion,Score,Action,Submitted At',
      ...filtered.map((e) =>
        [
          e.timestamp,
          `"${e.judge}"`,
          `"${e.project}"`,
          `"${e.criterion}"`,
          e.score,
          e.action,
          e.submittedAt ?? '',
        ].join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Audit log exported.')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Audit Log</h1>
          <p className="text-sm text-gray-500">{log.length} score events recorded</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-1.5 text-xs border-gray-200"
        >
          <Download size={13} /> Export Log
        </Button>
      </div>

      <div className="bg-[#E1F5EE] rounded-lg p-3 flex items-start gap-2">
        <ShieldCheck size={14} className="text-[#1D9E8B] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#0F6E56] leading-relaxed">
          This immutable audit trail records every score save event. It can be exported for dispute resolution.
          All timestamps are in UTC.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <Input
          placeholder="Filter by judge, project, or criterion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 text-sm border-gray-200"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1A2B3C] hover:bg-[#1A2B3C]">
              <TableHead className="text-white text-xs font-semibold">Timestamp</TableHead>
              <TableHead className="text-white text-xs font-semibold">Judge</TableHead>
              <TableHead className="text-white text-xs font-semibold">Project</TableHead>
              <TableHead className="text-white text-xs font-semibold">Criterion</TableHead>
              <TableHead className="text-white text-xs font-semibold">Score</TableHead>
              <TableHead className="text-white text-xs font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                  No audit entries found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-gray-50 text-sm">
                  <TableCell className="text-gray-400 text-xs font-mono">
                    {new Date(entry.timestamp).toLocaleString('en-SG', {
                      timeZone: 'Asia/Singapore',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} SGT
                  </TableCell>
                  <TableCell className="font-medium text-[#1A2B3C]">{entry.judge}</TableCell>
                  <TableCell className="text-gray-700">{entry.project}</TableCell>
                  <TableCell className="text-gray-500 text-xs">{entry.criterion}</TableCell>
                  <TableCell>
                    <span className={`font-bold text-sm ${
                      entry.score >= 8 ? 'text-[#1D9E8B]' :
                      entry.score >= 6 ? 'text-amber-600' : 'text-red-500'
                    }`}>
                      {entry.score}/10
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className="text-[10px] bg-[#E1F5EE] text-[#0F6E56] border border-[#B8DDD4]">
                      {entry.action}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
