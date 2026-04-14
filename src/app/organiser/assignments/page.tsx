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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash2, CheckCircle2, Clock, Users } from 'lucide-react'
import { toast } from 'sonner'
import { DEMO_ASSIGNMENTS, DEMO_JUDGES, DEMO_PROJECTS, DEMO_SCORES } from '@/lib/demo-data'

export default function OrganiserAssignmentsPage() {
  const [assignments, setAssignments] = useState(DEMO_ASSIGNMENTS)
  const [addOpen, setAddOpen] = useState(false)
  const [newAssign, setNewAssign] = useState({ judgeId: '', projectId: '' })

  const isSubmitted = (assignmentId: string) =>
    DEMO_SCORES.some((s) => s.assignment_id === assignmentId && s.submitted_at)

  const judgeLoadMap = assignments.reduce<Record<string, number>>((acc, a) => {
    acc[a.judge_id] = (acc[a.judge_id] ?? 0) + 1
    return acc
  }, {})

  const handleAdd = () => {
    if (!newAssign.judgeId || !newAssign.projectId) {
      toast.error('Please select both a judge and a project.')
      return
    }
    const exists = assignments.some(
      (a) => a.judge_id === newAssign.judgeId && a.project_id === newAssign.projectId
    )
    if (exists) {
      toast.error('This judge is already assigned to that project.')
      return
    }
    const assign = {
      id: `assign-${Date.now()}`,
      judge_id: newAssign.judgeId,
      project_id: newAssign.projectId,
      assigned_at: new Date().toISOString(),
    }
    setAssignments([...assignments, assign])
    setNewAssign({ judgeId: '', projectId: '' })
    setAddOpen(false)
    const judge = DEMO_JUDGES.find((j) => j.id === newAssign.judgeId)
    const project = DEMO_PROJECTS.find((p) => p.id === newAssign.projectId)
    toast.success(`${judge?.name} assigned to "${project?.name}".`)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Assignments</h1>
          <p className="text-sm text-gray-500">{assignments.length} total assignments</p>
        </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5 text-xs bg-[#1D9E8B] hover:bg-[#0F6E56] text-white">
            <Plus size={13} /> Assign Project
          </Button>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#1A2B3C]">New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1A2B3C]">Judge</label>
                <Select value={newAssign.judgeId} onValueChange={(v) => setNewAssign({ ...newAssign, judgeId: v ?? '' })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select judge" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_JUDGES.filter((j) => j.is_active).map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.name} ({judgeLoadMap[j.id] ?? 0} assigned)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1A2B3C]">Project</label>
                <Select value={newAssign.projectId} onValueChange={(v) => setNewAssign({ ...newAssign, projectId: v ?? '' })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_PROJECTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAdd} className="bg-[#1D9E8B] hover:bg-[#0F6E56] text-white">
                  Assign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Load summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DEMO_JUDGES.map((judge) => {
          const load = judgeLoadMap[judge.id] ?? 0
          const submitted = assignments.filter(
            (a) => a.judge_id === judge.id && isSubmitted(a.id)
          ).length
          return (
            <div key={judge.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1D9E8B]/10 flex items-center justify-center text-[#1D9E8B] text-xs font-bold">
                {judge.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-[#1A2B3C] text-sm">{judge.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Users size={10} /> {load} assigned · {submitted} submitted
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1A2B3C] hover:bg-[#1A2B3C]">
              <TableHead className="text-white text-xs font-semibold">Judge</TableHead>
              <TableHead className="text-white text-xs font-semibold">Project</TableHead>
              <TableHead className="text-white text-xs font-semibold">Country</TableHead>
              <TableHead className="text-white text-xs font-semibold">Assigned</TableHead>
              <TableHead className="text-white text-xs font-semibold">Status</TableHead>
              <TableHead className="text-white text-xs font-semibold w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => {
              const judge = DEMO_JUDGES.find((j) => j.id === assignment.judge_id)
              const project = DEMO_PROJECTS.find((p) => p.id === assignment.project_id)
              const submitted = isSubmitted(assignment.id)
              return (
                <TableRow key={assignment.id} className="hover:bg-gray-50 text-sm">
                  <TableCell className="font-medium text-[#1A2B3C]">{judge?.name ?? '—'}</TableCell>
                  <TableCell className="text-gray-700">{project?.name ?? '—'}</TableCell>
                  <TableCell>{project && <CountryBadge country={project.country} />}</TableCell>
                  <TableCell className="text-gray-400 text-xs">
                    {new Date(assignment.assigned_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${
                      submitted
                        ? 'bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E8B]/20'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {submitted ? (
                        <><CheckCircle2 size={9} className="mr-1" />Submitted</>
                      ) : (
                        <><Clock size={9} className="mr-1" />Pending</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!submitted && (
                      <button
                        className="w-7 h-7 rounded hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500"
                        onClick={() => {
                          setAssignments(assignments.filter((a) => a.id !== assignment.id))
                          toast.success('Assignment removed.')
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
