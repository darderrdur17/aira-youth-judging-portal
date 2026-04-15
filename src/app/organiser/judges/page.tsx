'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Mail, UserX, Send, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { DEMO_ASSIGNMENTS, DEMO_JUDGES, DEMO_SCORES } from '@/lib/demo-data'

export default function OrganiserJudgesPage() {
  const [judges, setJudges] = useState(DEMO_JUDGES)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [newJudge, setNewJudge] = useState({ name: '', email: '' })
  const [sending, setSending] = useState<string | null>(null)

  const getJudgeStats = (judgeId: string) => {
    const assignments = DEMO_ASSIGNMENTS.filter((a) => a.judge_id === judgeId)
    const submitted = assignments.filter((a) =>
      DEMO_SCORES.some((s) => s.assignment_id === a.id && s.submitted_at)
    )
    const pct = assignments.length > 0 ? (submitted.length / assignments.length) * 100 : 0
    return { total: assignments.length, done: submitted.length, pct }
  }

  const filtered = judges.filter((j) => {
    const q = search.toLowerCase()
    return j.name.toLowerCase().includes(q) || j.email.toLowerCase().includes(q)
  })

  const handleInvite = () => {
    if (!newJudge.name || !newJudge.email) {
      toast.error('Name and email are required.')
      return
    }
    const judge = {
      id: `judge-${Date.now()}`,
      user_id: `user-${Date.now()}`,
      competition_id: 'comp-2026',
      name: newJudge.name,
      email: newJudge.email,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    setJudges([...judges, judge])
    setNewJudge({ name: '', email: '' })
    setAddOpen(false)
    toast.success(`Magic link invitation sent to ${judge.email}.`)
  }

  const handleSendReminder = async (judgeId: string, judgeName: string) => {
    setSending(judgeId)
    await new Promise((r) => setTimeout(r, 1000))
    setSending(null)
    toast.success(`Reminder sent to ${judgeName}.`)
  }

  const handleDeactivate = (judgeId: string, judgeName: string) => {
    setJudges(judges.map((j) => j.id === judgeId ? { ...j, is_active: !j.is_active } : j))
    const judge = judges.find((j) => j.id === judgeId)
    toast.success(`${judgeName} ${judge?.is_active ? 'deactivated' : 'reactivated'}.`)
  }

  const needingReminder = judges.filter((j) => {
    const stats = getJudgeStats(j.id)
    return j.is_active && stats.pct < 100
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Judges</h1>
          <p className="text-sm text-gray-500">{judges.filter((j) => j.is_active).length} active judges</p>
        </div>
        <div className="flex gap-2">
          {needingReminder.length > 0 && (
            <Button
              size="sm"
              onClick={async () => {
                setSending('all')
                await new Promise((r) => setTimeout(r, 1200))
                setSending(null)
                toast.success(`Reminder sent to ${needingReminder.length} judge(s).`)
              }}
              disabled={sending === 'all'}
              className="gap-1.5 text-xs bg-[#E8735A] hover:bg-[#d4614a] text-white"
            >
              <Send size={12} />
              {sending === 'all' ? 'Sending...' : `Remind All (${needingReminder.length})`}
            </Button>
          )}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5 text-xs bg-[#1D9E8B] hover:bg-[#0F6E56] text-white">
              <Plus size={13} /> Invite Judge
            </Button>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-[#1A2B3C]">Invite Judge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Full Name *</Label>
                  <Input
                    placeholder="e.g. Dr. Sarah Chen"
                    value={newJudge.name}
                    onChange={(e) => setNewJudge({ ...newJudge, name: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="judge@example.com"
                    value={newJudge.email}
                    onChange={(e) => setNewJudge({ ...newJudge, email: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="bg-[#E1F5EE] rounded-lg p-3 text-xs text-[#0F6E56]">
                  A magic link will be emailed to this address. The judge can click it to log in directly — no password required.
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleInvite} className="bg-[#1D9E8B] hover:bg-[#0F6E56] text-white gap-1.5">
                    <Send size={12} /> Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <Input
          placeholder="Search judges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 text-sm border-gray-200"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1A2B3C] hover:bg-[#1A2B3C]">
              <TableHead className="text-white text-xs font-semibold">Judge</TableHead>
              <TableHead className="text-white text-xs font-semibold">Email</TableHead>
              <TableHead className="text-white text-xs font-semibold">Progress</TableHead>
              <TableHead className="text-white text-xs font-semibold">Status</TableHead>
              <TableHead className="text-white text-xs font-semibold w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((judge) => {
              const stats = getJudgeStats(judge.id)
              return (
                <TableRow key={judge.id} className={`hover:bg-gray-50 text-sm ${!judge.is_active ? 'opacity-50' : ''}`}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#D4EDE8] border border-[#9DCFC6] flex items-center justify-center text-[#0F6E56] text-xs font-bold">
                        {judge.name.charAt(0)}
                      </div>
                      <span className="font-medium text-[#1A2B3C]">{judge.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">{judge.email}</TableCell>
                  <TableCell className="min-w-[160px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">{stats.done}/{stats.total}</span>
                        <span className={`font-semibold ${
                          stats.pct >= 80 ? 'text-[#1D9E8B]' : stats.pct >= 40 ? 'text-amber-500' : 'text-red-500'
                        }`}>{stats.pct.toFixed(0)}%</span>
                      </div>
                      <Progress value={stats.pct} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${
                      !judge.is_active
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : stats.pct === 100
                        ? 'bg-[#E1F5EE] text-[#0F6E56] border border-[#B8DDD4]'
                        : stats.pct >= 40
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {!judge.is_active ? (
                        <><UserX size={9} className="mr-1" />Inactive</>
                      ) : stats.pct === 100 ? (
                        <><CheckCircle2 size={9} className="mr-1" />Complete</>
                      ) : stats.pct >= 40 ? (
                        <><Clock size={9} className="mr-1" />In Progress</>
                      ) : (
                        <><AlertTriangle size={9} className="mr-1" />Behind</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      {judge.is_active && stats.pct < 100 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendReminder(judge.id, judge.name)}
                          disabled={sending === judge.id}
                          className="h-7 px-2 text-[10px] border-gray-200 gap-1"
                        >
                          <Mail size={11} />
                          {sending === judge.id ? '...' : 'Remind'}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivate(judge.id, judge.name)}
                        className="h-7 px-2 text-[10px] border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
                      >
                        <UserX size={11} />
                      </Button>
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
