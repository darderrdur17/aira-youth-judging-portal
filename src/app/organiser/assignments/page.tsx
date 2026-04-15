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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash2, CheckCircle2, Clock, Users, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { DEMO_SCORES } from '@/lib/demo-data'
import { useOrganiserDemoStore } from '@/store/organiserDemoStore'

export default function OrganiserAssignmentsPage() {
  const judges = useOrganiserDemoStore((s) => s.judges)
  const projects = useOrganiserDemoStore((s) => s.projects)
  const assignments = useOrganiserDemoStore((s) => s.assignments)
  const addAssignment = useOrganiserDemoStore((s) => s.addAssignment)
  const updateAssignment = useOrganiserDemoStore((s) => s.updateAssignment)
  const deleteAssignment = useOrganiserDemoStore((s) => s.deleteAssignment)

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editAssignId, setEditAssignId] = useState<string | null>(null)
  const [newAssign, setNewAssign] = useState({ judgeId: '', projectId: '' })
  const [editAssign, setEditAssign] = useState({ judgeId: '', projectId: '' })

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
    const judgeId = newAssign.judgeId
    const projectId = newAssign.projectId
    const assign = {
      id: `assign-${Date.now()}`,
      judge_id: judgeId,
      project_id: projectId,
      assigned_at: new Date().toISOString(),
    }
    addAssignment(assign)
    setNewAssign({ judgeId: '', projectId: '' })
    setAddOpen(false)
    const judge = judges.find((j) => j.id === judgeId)
    const project = projects.find((p) => p.id === projectId)
    toast.success(`${judge?.name} assigned to "${project?.name}".`)
  }

  const openEditAssignment = (assignmentId: string) => {
    const a = assignments.find((x) => x.id === assignmentId)
    if (!a) return
    setEditAssignId(assignmentId)
    setEditAssign({ judgeId: a.judge_id, projectId: a.project_id })
    setEditOpen(true)
  }

  const handleSaveEditAssignment = () => {
    if (!editAssignId || !editAssign.judgeId || !editAssign.projectId) {
      toast.error('Select both judge and project.')
      return
    }
    const dup = assignments.some(
      (a) =>
        a.id !== editAssignId &&
        a.judge_id === editAssign.judgeId &&
        a.project_id === editAssign.projectId
    )
    if (dup) {
      toast.error('This judge is already assigned to that project.')
      return
    }
    updateAssignment(editAssignId, { judge_id: editAssign.judgeId, project_id: editAssign.projectId })
    setEditOpen(false)
    setEditAssignId(null)
    toast.success('Assignment updated.')
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
              <DialogDescription className="text-sm text-gray-600">
                Pair an active judge with a project. You can change pending assignments later from the table.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1A2B3C]">Judge</label>
                <Select value={newAssign.judgeId} onValueChange={(v) => setNewAssign({ ...newAssign, judgeId: v ?? '' })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select judge" />
                  </SelectTrigger>
                  <SelectContent>
                    {judges.filter((j) => j.is_active).map((j) => (
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
                    {projects.map((p) => (
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

        <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditAssignId(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#1A2B3C]">Edit assignment</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Reassign judge or project for this row. Submitted scores cannot be edited here—remove the assignment only if allowed by your process.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1A2B3C]">Judge</label>
                <Select value={editAssign.judgeId} onValueChange={(v) => setEditAssign({ ...editAssign, judgeId: v ?? '' })}>
                  <SelectTrigger className="text-sm w-full">
                    <SelectValue placeholder="Select judge" />
                  </SelectTrigger>
                  <SelectContent>
                    {judges.filter((j) => j.is_active).map((j) => (
                      <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1A2B3C]">Project</label>
                <Select value={editAssign.projectId} onValueChange={(v) => setEditAssign({ ...editAssign, projectId: v ?? '' })}>
                  <SelectTrigger className="text-sm w-full">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSaveEditAssignment} className="bg-[#1D9E8B] hover:bg-[#0F6E56] text-white">
                  Save changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Load summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {judges.map((judge) => {
          const load = judgeLoadMap[judge.id] ?? 0
          const submitted = assignments.filter(
            (a) => a.judge_id === judge.id && isSubmitted(a.id)
          ).length
          return (
            <div key={judge.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D4EDE8] border border-[#9DCFC6] flex items-center justify-center text-[#0F6E56] text-xs font-bold">
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
              const judge = judges.find((j) => j.id === assignment.judge_id)
              const project = projects.find((p) => p.id === assignment.project_id)
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
                        ? 'bg-[#E1F5EE] text-[#0F6E56] border border-[#B8DDD4]'
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
                    <div className="flex gap-1">
                      {!submitted && (
                        <>
                          <button
                            type="button"
                            title="Edit assignment"
                            className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1D9E8B]"
                            onClick={() => openEditAssignment(assignment.id)}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            title="Remove assignment"
                            className="w-7 h-7 rounded hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500"
                            onClick={() => {
                              deleteAssignment(assignment.id)
                              toast.success('Assignment removed.')
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
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
