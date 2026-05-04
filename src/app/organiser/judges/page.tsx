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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Mail, UserX, Send, CheckCircle2, Clock, AlertTriangle, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { DEMO_SCORES } from '@/lib/demo-data'
import { useOrganiserDemoStore } from '@/store/organiserDemoStore'
import { sendMagicLinkToEmail } from '@/lib/auth/send-magic-link'

export default function OrganiserJudgesPage() {
  const judges = useOrganiserDemoStore((s) => s.judges)
  const assignments = useOrganiserDemoStore((s) => s.assignments)
  const addJudge = useOrganiserDemoStore((s) => s.addJudge)
  const updateJudge = useOrganiserDemoStore((s) => s.updateJudge)

  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [newJudge, setNewJudge] = useState({ name: '', email: '' })
  const [editJudge, setEditJudge] = useState({ name: '', email: '' })
  const [sending, setSending] = useState<string | null>(null)
  const [inviteBusy, setInviteBusy] = useState(false)

  const getJudgeStats = (judgeId: string) => {
    const assigns = assignments.filter((a) => a.judge_id === judgeId)
    const submitted = assigns.filter((a) =>
      DEMO_SCORES.some((s) => s.assignment_id === a.id && s.submitted_at)
    )
    const pct = assigns.length > 0 ? (submitted.length / assigns.length) * 100 : 0
    return { total: assigns.length, done: submitted.length, pct }
  }

  const filtered = judges.filter((j) => {
    const q = search.toLowerCase()
    return j.name.toLowerCase().includes(q) || j.email.toLowerCase().includes(q)
  })

  const handleInvite = async () => {
    if (!newJudge.name || !newJudge.email) {
      toast.error('Name and email are required.')
      return
    }
    const judge = {
      id: `judge-${Date.now()}`,
      user_id: `user-${Date.now()}`,
      competition_id: 'comp-2026',
      name: newJudge.name.trim(),
      email: newJudge.email.trim().toLowerCase(),
      is_active: true,
      created_at: new Date().toISOString(),
    }
    setInviteBusy(true)
    try {
      addJudge(judge)
      setNewJudge({ name: '', email: '' })
      setAddOpen(false)

      // Preferred: create a Supabase judge invitation row, then email a Supabase magic link via Resend.
      // This avoids the "not invited" block after the user clicks the link.
      try {
        const res = await fetch('/api/organiser/invite-judge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: judge.email, name: judge.name, nextPath: '/judge/dashboard' }),
        })
        const data = (await res.json()) as { ok?: boolean; error?: string }
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Invite endpoint failed')
        }
        toast.success(`Invitation email sent to ${judge.email}.`)
      } catch (e) {
        // Fallback: try the client OTP flow (may still fail in projects with no SMTP options).
        const sent = await sendMagicLinkToEmail(judge.email)
        if (sent.ok) {
          toast.success(
            `Magic link sent to ${judge.email}. If login shows “not invited”, add this judge in Supabase (judges table) or enable the service-role invite endpoint.`
          )
        } else {
          toast.error(
            `Judge was added to your list, but the email was not sent: ${
              e instanceof Error ? e.message : sent.message
            }`
          )
        }
      }
    } finally {
      setInviteBusy(false)
    }
  }

  const openEditJudge = (id: string) => {
    const j = judges.find((x) => x.id === id)
    if (!j) return
    setEditId(id)
    setEditJudge({ name: j.name, email: j.email })
    setEditOpen(true)
  }

  const handleSaveJudgeEdit = () => {
    if (!editId || !editJudge.name.trim() || !editJudge.email.trim()) {
      toast.error('Name and email are required.')
      return
    }
    updateJudge(editId, { name: editJudge.name.trim(), email: editJudge.email.trim().toLowerCase() })
    setEditOpen(false)
    setEditId(null)
    toast.success('Judge details updated.')
  }

  const handleSendReminder = async (judgeId: string, judgeName: string) => {
    const judge = judges.find((j) => j.id === judgeId)
    if (!judge) return
    const stats = getJudgeStats(judgeId)

    setSending(judgeId)
    try {
      const magic = await sendMagicLinkToEmail(judge.email)
      if (magic.ok) {
        toast.success(`Magic login link sent to ${judgeName}.`)
        return
      }

      const res = await fetch('/api/email/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: judge.email,
          judgeName: judge.name,
          competitionName: useOrganiserDemoStore.getState().competitionName,
          deadline: useOrganiserDemoStore.getState().competitionDeadline,
          pendingCount: Math.max(0, stats.total - stats.done),
          loginUrl: `${window.location.origin}/auth/login?role=judge`,
        }),
      })

      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(
          [magic.message, data.error].filter(Boolean).join(' ') ||
            'Could not send magic link or reminder. Check Supabase SMTP and/or RESEND_API_KEY on the server.'
        )
      }

      toast.success(`Backup reminder sent to ${judgeName} (includes a link to the judge login page).`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send email.')
    } finally {
      setSending(null)
    }
  }

  const handleDeactivate = (judgeId: string, judgeName: string) => {
    const judge = judges.find((j) => j.id === judgeId)
    if (!judge) return
    updateJudge(judgeId, { is_active: !judge.is_active })
    toast.success(`${judgeName} ${judge.is_active ? 'deactivated' : 'reactivated'}.`)
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
                try {
                  const compName = useOrganiserDemoStore.getState().competitionName
                  const deadline = useOrganiserDemoStore.getState().competitionDeadline
                  const loginUrl = `${window.location.origin}/auth/login?role=judge`

                  let sentCount = 0
                  const failures: string[] = []
                  for (const j of needingReminder) {
                    const stats = getJudgeStats(j.id)
                    const magic = await sendMagicLinkToEmail(j.email)
                    if (magic.ok) {
                      sentCount += 1
                      continue
                    }
                    const res = await fetch('/api/email/reminder', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        to: j.email,
                        judgeName: j.name,
                        competitionName: compName,
                        deadline,
                        pendingCount: Math.max(0, stats.total - stats.done),
                        loginUrl,
                      }),
                    })
                    const data = (await res.json()) as { ok?: boolean; error?: string }
                    if (res.ok && data.ok) {
                      sentCount += 1
                    } else {
                      failures.push(j.email)
                    }
                  }

                  if (sentCount > 0) {
                    toast.success(`Email sent to ${sentCount} judge(s) (magic link and/or backup reminder).`)
                  }
                  if (failures.length > 0) {
                    toast.error(
                      `Could not email: ${failures.join(', ')}. Set up Supabase Authentication → SMTP (magic link) and/or Vercel RESEND_API_KEY + RESEND_FROM (backup reminder).`
                    )
                  }
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Failed to send reminders.')
                } finally {
                  setSending(null)
                }
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
                <DialogDescription className="text-gray-600 text-sm">
                  Adds the judge to your list and sends a real Supabase magic link to this address (same as Judge login → Magic link).
                  Requires Supabase SMTP; check Authentication → Logs if delivery fails.
                </DialogDescription>
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
                  <Button variant="outline" size="sm" onClick={() => setAddOpen(false)} disabled={inviteBusy}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void handleInvite()}
                    disabled={inviteBusy}
                    className="bg-[#1D9E8B] hover:bg-[#0F6E56] text-white gap-1.5"
                  >
                    <Send size={12} /> {inviteBusy ? 'Sending…' : 'Send Invitation'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditId(null) }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-[#1A2B3C]">Edit judge</DialogTitle>
                <DialogDescription className="text-gray-600 text-sm">
                  Update the name or email on file. Assignments and scores stay linked to this judge.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Full name</Label>
                  <Input
                    value={editJudge.name}
                    onChange={(e) => setEditJudge({ ...editJudge, name: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email</Label>
                  <Input
                    type="email"
                    value={editJudge.email}
                    onChange={(e) => setEditJudge({ ...editJudge, email: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveJudgeEdit} className="bg-[#1D9E8B] hover:bg-[#0F6E56] text-white">
                    Save changes
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
        <Table className="table-row-hover">
          <TableHeader>
            <TableRow className="bg-[#E85A14] hover:bg-[#E85A14]">
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
                    <div className="flex gap-1.5 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditJudge(judge.id)}
                        className="h-7 px-2 text-[10px] border-gray-200 gap-1"
                      >
                        <Pencil size={11} />
                        Edit
                      </Button>
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
