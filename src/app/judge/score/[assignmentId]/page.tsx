'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { CountryBadge } from '@/components/shared/CountryBadge'
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown'
import { ConflictFlagModal } from '@/components/judge/ConflictFlagModal'
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  FileText,
  Video,
  Info,
  Lock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Keyboard,
  Flag,
  FlagOff,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DEMO_CRITERIA,
  DEMO_FEEDBACK,
  DEMO_SCORES,
} from '@/lib/demo-data'
import { computeWeightedScore, JUDGING_CRITERIA, TOTAL_MAX_SCORE } from '@/lib/types'
import { useJudgeStore } from '@/store/judgeStore'
import { useSessionStore } from '@/store/sessionStore'
import { useOrganiserDemoStore } from '@/store/organiserDemoStore'
import { PdfViewerDialog } from '@/components/judge/PdfViewerDialog'
import { PdfOpenLink } from '@/components/shared/PdfOpenLink'
import { PdfPreviewIframe } from '@/components/shared/PdfPreviewIframe'
import { cn } from '@/lib/utils'

const SCORE_LABELS: Record<number, string> = {
  1: 'Very Poor', 2: 'Poor', 3: 'Below Average', 4: 'Adequate',
  5: 'Average', 6: 'Above Average', 7: 'Good', 8: 'Very Good',
  9: 'Excellent', 10: 'Outstanding',
}

const SCORE_COLORS: Record<number, string> = {
  1: 'bg-red-500', 2: 'bg-red-400', 3: 'bg-orange-400',
  4: 'bg-amber-400', 5: 'bg-yellow-400', 6: 'bg-lime-400',
  7: 'bg-[#FDBA74]', 8: 'bg-[#FB923C]', 9: 'bg-[#E85A14]', 10: 'bg-[#C2410C]',
}

export default function ScoringPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.assignmentId as string

  const assignments = useOrganiserDemoStore((s) => s.assignments)
  const projects = useOrganiserDemoStore((s) => s.projects)
  const competitionDeadline = useOrganiserDemoStore((s) => s.competitionDeadline)

  const assignment = assignments.find((a) => a.id === assignmentId)
  const project = assignment ? projects.find((p) => p.id === assignment.project_id) : null

  // Seed initial state from demo data
  const store = useJudgeStore()
  const session = useSessionStore()
  const state = store.getAssignment(assignmentId)
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showKeyboardHint, setShowKeyboardHint] = useState(false)
  const [activeCriterionIdx, setActiveCriterionIdx] = useState(0)
  const [conflictOpen, setConflictOpen] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [showPdfInline, setShowPdfInline] = useState(false)
  const criterionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Hydrate once with demo data if empty
  useEffect(() => {
    if (hydrated) return
    setHydrated(true)

    const existing = store.getAssignment(assignmentId)
    if (Object.keys(existing.scores).length === 0) {
      const existingScores = DEMO_SCORES.filter((s) => s.assignment_id === assignmentId)
      const map: Record<string, number> = {}
      existingScores.forEach((s) => {
        const crit = DEMO_CRITERIA.find((c) => c.id === s.criterion_id)
        if (crit) map[crit.key] = s.score
      })
      if (Object.keys(map).length > 0) {
        store.setScores(assignmentId, map)
      }

      const fb = DEMO_FEEDBACK.find((f) => f.assignment_id === assignmentId)
      if (fb) {
        store.setPersonalNotes(assignmentId, fb.personal_notes)
        store.setTeamFeedback(assignmentId, fb.team_feedback)
        if (DEMO_SCORES.some((s) => s.assignment_id === assignmentId && s.submitted_at)) {
          store.setSubmitted(assignmentId, true)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId])

  // Keyboard shortcuts: 1-9, 0=10, Tab/Shift+Tab to navigate, Enter to confirm
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (isDeadlinePassed) return

      const key = e.key
      if (key >= '1' && key <= '9') {
        store.setScore(assignmentId, JUDGING_CRITERIA[activeCriterionIdx].key, parseInt(key))
      } else if (key === '0') {
        store.setScore(assignmentId, JUDGING_CRITERIA[activeCriterionIdx].key, 10)
      } else if (key === 'Tab') {
        e.preventDefault()
        const next = e.shiftKey
          ? Math.max(0, activeCriterionIdx - 1)
          : Math.min(JUDGING_CRITERIA.length - 1, activeCriterionIdx + 1)
        setActiveCriterionIdx(next)
        criterionRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCriterionIdx, assignmentId])

  const isDeadlinePassed = new Date(competitionDeadline) < new Date()
  const allScored = JUDGING_CRITERIA.every((c) => state.scores[c.key] !== undefined)
  const weightedTotal = computeWeightedScore(state.scores, JUDGING_CRITERIA)
  const scoredCount = Object.keys(state.scores).length

  const handleSave = async (submit = false) => {
    if (submit && !allScored) {
      toast.error('Please score all 8 criteria before submitting.')
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    store.saveProgress(assignmentId)
    if (submit) {
      store.setSubmitted(assignmentId, true)
      toast.success('All scores submitted! Returning to dashboard...')
      setTimeout(() => router.push('/judge/dashboard'), 900)
    } else {
      toast.success('Progress saved.')
    }
  }

  if (!assignment || !project) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="mx-auto mb-3 text-red-400" size={32} />
        <p className="text-gray-500">Assignment not found.</p>
        <Link href="/judge/dashboard">
          <Button variant="outline" size="sm" className="mt-3">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  const judgeId = session.demo.judgeId ?? 'judge-001'
  const allAssignmentIds = assignments
    .filter((a) => a.judge_id === judgeId)
    .map((a) => a.id)
  const currentIdx = allAssignmentIds.indexOf(assignmentId)
  const prevId = currentIdx > 0 ? allAssignmentIds[currentIdx - 1] : null
  const nextId = currentIdx < allAssignmentIds.length - 1 ? allAssignmentIds[currentIdx + 1] : null

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <PdfViewerDialog
        open={pdfOpen}
        onOpenChange={setPdfOpen}
        pdfUrl={project.pdf_url}
        projectName={project.name}
      />
      {/* Breadcrumb + nav */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/judge/dashboard" className="hover:text-[#E85A14] flex items-center gap-1 transition-colors">
            <ArrowLeft size={12} />
            Dashboard
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-600 truncate max-w-[180px]">{project.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">
            {currentIdx + 1} of {allAssignmentIds.length}
          </span>
          <div className="flex gap-1">
            {prevId && (
              <Link href={`/judge/score/${prevId}`}>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-gray-200">
                  <ChevronLeft size={13} />
                </Button>
              </Link>
            )}
            {nextId && (
              <Link href={`/judge/score/${nextId}`}>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-gray-200">
                  <ChevronRightIcon size={13} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: scoring form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Project header card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-[#1A2B3C] mb-1.5">{project.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <CountryBadge country={project.country} />
                  {state.conflictFlagged && (
                    <Badge className="bg-red-50 text-red-600 border-red-200 text-[10px] gap-1">
                      <Flag size={9} /> Conflict Flagged
                    </Badge>
                  )}
                  {isDeadlinePassed ? (
                    <Badge className="bg-red-50 text-red-600 border-red-200 text-[10px] gap-1">
                      <Lock size={9} /> Read-only
                    </Badge>
                  ) : state.isSubmitted ? (
                    <Badge className="bg-[#FFF3EF] text-[#C2410C] border border-orange-200 text-[10px] gap-1">
                      <CheckCircle2 size={9} /> Submitted
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <DeadlineCountdown deadline={competitionDeadline} />
                {!isDeadlinePassed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => state.conflictFlagged ? store.unflagConflict(assignmentId) : setConflictOpen(true)}
                    className={`h-7 px-2 text-[10px] gap-1 ${
                      state.conflictFlagged
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600'
                    }`}
                    title="Flag conflict of interest"
                  >
                    {state.conflictFlagged ? <><FlagOff size={11} /> Remove Flag</> : <><Flag size={11} /> Flag CoI</>}
                  </Button>
                )}
              </div>
            </div>

            {/* Project materials */}
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                {project.pdf_url ? (
                  <>
                    <PdfOpenLink
                      href={project.pdf_url}
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'h-8 gap-1.5 border-orange-200 bg-[#FFF3EF] text-xs text-[#C2410C] no-underline hover:bg-[#FFE8DC]'
                      )}
                    >
                      <FileText size={14} /> Open PDF (new tab)
                    </PdfOpenLink>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs border-gray-200"
                      onClick={() => setPdfOpen(true)}
                    >
                      <BookOpen size={14} /> Read PDF (window)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs border-gray-200"
                      onClick={() => setShowPdfInline((v) => !v)}
                    >
                      {showPdfInline ? 'Hide inline PDF' : 'Show inline PDF'}
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-md px-2.5 py-1.5">
                    No PDF for this team yet. Written proposals and video links are optional — the organiser can add them under Projects when available.
                  </p>
                )}
                {project.video_url && (
                  <a
                    href={project.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'h-8 gap-1.5 border-orange-200 bg-[#FFF3EF] text-xs text-[#C2410C] no-underline hover:bg-[#FFE8DC]'
                    )}
                  >
                    <Video size={14} /> Watch pitch
                  </a>
                )}
              </div>
              {project.pdf_url && showPdfInline && (
                <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 h-[min(50vh,28rem)]">
                  <PdfPreviewIframe
                    pdfUrl={project.pdf_url}
                    title="Proposal PDF"
                    className="w-full h-full min-h-[16rem] border-0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notices */}
          {state.conflictFlagged && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <Flag size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-700">Conflict of Interest Flagged</p>
                {state.conflictReason && (
                  <p className="text-xs text-red-600 mt-0.5">{state.conflictReason}</p>
                )}
                <p className="text-xs text-red-500 mt-1">The organiser has been notified. You may still score if instructed to do so.</p>
              </div>
            </div>
          )}
          {isDeadlinePassed && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <Lock size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">The judging deadline has passed. This form is now read-only.</p>
            </div>
          )}

          {/* Keyboard shortcut hint */}
          {!isDeadlinePassed && (
            <div className="bg-[#1A2B3C] rounded-lg px-3 py-2 flex items-center gap-2">
              <Keyboard size={13} className="text-[#E85A14] flex-shrink-0" />
              <p className="text-[11px] text-gray-400 flex-1">
                <span className="text-gray-300">Keyboard shortcuts:</span>{' '}
                Press <kbd className="bg-[#2A3F52] border border-[#3D5669] px-1.5 py-0.5 rounded text-white text-[10px] font-mono shadow-sm">1</kbd>–<kbd className="bg-[#2A3F52] border border-[#3D5669] px-1.5 py-0.5 rounded text-white text-[10px] font-mono shadow-sm">9</kbd> / <kbd className="bg-[#2A3F52] border border-[#3D5669] px-1.5 py-0.5 rounded text-white text-[10px] font-mono shadow-sm">0</kbd>=10 to score ·{' '}
                <kbd className="bg-[#2A3F52] border border-[#3D5669] px-1.5 py-0.5 rounded text-white text-[10px] font-mono shadow-sm">Tab</kbd> next criterion ·{' '}
                <kbd className="bg-[#2A3F52] border border-[#3D5669] px-1.5 py-0.5 rounded text-white text-[10px] font-mono shadow-sm">Shift+Tab</kbd> prev
              </p>
              <button onClick={() => setShowKeyboardHint(!showKeyboardHint)} className="text-gray-500 hover:text-gray-300 text-[10px]">
                {showKeyboardHint ? 'Hide' : 'More'}
              </button>
            </div>
          )}

          {/* Scoring criteria */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1A2B3C]">
                Scoring Criteria
                <span className="text-gray-400 font-normal ml-2 text-xs">{scoredCount}/{JUDGING_CRITERIA.length} scored</span>
              </h2>
              <div className="flex gap-1">
                {JUDGING_CRITERIA.map((c, i) => (
                  <button
                    key={c.key}
                    onClick={() => {
                      setActiveCriterionIdx(i)
                      criterionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      state.scores[c.key] !== undefined
                        ? 'bg-[#E85A14]'
                        : activeCriterionIdx === i
                        ? 'bg-[#1A2B3C]'
                        : 'bg-gray-200'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {JUDGING_CRITERIA.map((criterion, idx) => {
              const currentScore = state.scores[criterion.key]
              const isActive = activeCriterionIdx === idx
              return (
                <div
                  key={criterion.key}
                  ref={(el) => { criterionRefs.current[idx] = el }}
                  onClick={() => setActiveCriterionIdx(idx)}
                  className={`bg-white rounded-xl border-2 shadow-sm p-4 cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'border-[#E85A14] shadow-[0_0_0_3px_rgba(232,90,20,0.2)]'
                      : currentScore !== undefined
                      ? 'border-[#FDBA74]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {/* Number indicator */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                      isActive ? 'bg-[#E85A14] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm text-[#C2410C]">{criterion.name}</span>
                        <Badge className="text-[10px] bg-[#E85A14] text-white border-none px-1.5 py-0">
                          {criterion.weight}%
                        </Badge>
                        {currentScore !== undefined && (
                          <div className="ml-auto flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${SCORE_COLORS[currentScore]}`} />
                            <span className="text-[11px] font-semibold text-gray-700">
                              {currentScore}/10 — {SCORE_LABELS[currentScore]}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{criterion.description}</p>
                    </div>
                  </div>

                  {/* Score buttons 1-10 */}
                  <div className="flex flex-wrap gap-1.5 ml-9">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        disabled={isDeadlinePassed}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isDeadlinePassed) {
                            store.setScore(assignmentId, criterion.key, n)
                            setActiveCriterionIdx(idx)
                          }
                        }}
                        className={`score-btn ${
                          currentScore === n ? 'score-btn-active' : ''
                        } ${isDeadlinePassed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={`${n} — ${SCORE_LABELS[n]}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  {/* Score bar */}
                  {currentScore !== undefined && (
                    <div className="mt-2.5 ml-9 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${SCORE_COLORS[currentScore]}`}
                          style={{ width: `${(currentScore / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#C2410C] font-medium w-20 text-right flex-shrink-0">
                        +{((currentScore / 10) * criterion.weight).toFixed(1)} pts
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Feedback section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#1A2B3C]">Feedback & Notes</h2>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-medium text-[#1A2B3C]">Personal Notes</label>
                <Badge className="text-[10px] bg-gray-100 text-gray-500 border-gray-200">
                  Private — only visible to you and the organiser
                </Badge>
              </div>
              <Textarea
                placeholder="Your private observations, scoring rationale, concerns..."
                value={state.personalNotes}
                onChange={(e) => !isDeadlinePassed && store.setPersonalNotes(assignmentId, e.target.value)}
                disabled={isDeadlinePassed}
                  className="text-sm resize-none border-gray-200 focus-visible:ring-[#E85A14]"
                rows={3}
              />
            </div>

            <Separator />

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-medium text-[#1A2B3C]">Team Feedback</label>
                <Badge className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                  Shared with team after judging closes
                </Badge>
              </div>
              <div className="bg-[#FFF3EF] border border-orange-200 rounded-lg p-3 mb-2">
                <div className="flex items-start gap-2">
                  <Info size={13} className="text-[#E85A14] mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-[#8B4513] leading-relaxed">
                    Suggested structure: <strong>Strengths</strong> (what they did well) →{' '}
                    <strong>Areas to improve</strong> (specific, actionable) →{' '}
                    <strong>Key pointers</strong> (top 1–2 recommendations for next iteration)
                  </p>
                </div>
              </div>
              <Textarea
                placeholder="Strengths: ... | Areas to improve: ... | Key pointer: ..."
                value={state.teamFeedback}
                onChange={(e) => !isDeadlinePassed && store.setTeamFeedback(assignmentId, e.target.value)}
                disabled={isDeadlinePassed}
                  className="text-sm resize-none border-gray-200 focus-visible:ring-[#E85A14]"
                rows={4}
              />
              <p className="text-[10px] text-gray-400 text-right">
                {state.teamFeedback.length} chars
              </p>
            </div>
          </div>

          {/* Save bar */}
          {!isDeadlinePassed && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sticky bottom-4 z-10">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={saving || scoredCount === 0}
                  className="w-full sm:w-auto gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Save size={14} />
                  Save Progress
                </Button>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={saving || !allScored}
                  className="w-full sm:w-auto gap-2 bg-[#E85A14] hover:bg-[#C2410C] text-white transition-transform active:scale-[0.98]"
                >
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      {state.isSubmitted ? 'Re-submit Scores' : 'Submit All Scores'}
                    </>
                  )}
                </Button>
                {state.lastSaved && (
                  <p className="text-[11px] text-gray-400 sm:ml-auto">
                    Saved {new Date(state.lastSaved).toLocaleTimeString()}
                  </p>
                )}
              </div>
              {!allScored && (
                <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {JUDGING_CRITERIA.length - scoredCount} criterion still unscored. Score all 8 to submit.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: live score summary (sticky) */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#1A2B3C] mb-4">Live Score Summary</h3>

            {/* Total */}
            <div className="bg-[#1A2B3C] rounded-xl p-4 text-center mb-4">
              <p className="text-xs text-gray-400 mb-1">Weighted Total</p>
              <p className="text-4xl font-bold text-[#E85A14]">
                {scoredCount > 0 ? weightedTotal.toFixed(2) : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-1">/ {TOTAL_MAX_SCORE} pts</p>
              {scoredCount > 0 && (
                <>
                  <Progress value={(weightedTotal / TOTAL_MAX_SCORE) * 100} className="h-1.5 mt-3 progress-brand" />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {((weightedTotal / TOTAL_MAX_SCORE) * 100).toFixed(0)}% of max
                  </p>
                </>
              )}
            </div>

            {/* Per-criterion bar chart */}
            <div className="space-y-2.5">
              {JUDGING_CRITERIA.map((c, i) => {
                const s = state.scores[c.key]
                const contribution = s !== undefined ? (s / 10) * c.weight : 0
                const isActive = activeCriterionIdx === i
                return (
                  <button
                    key={c.key}
                    onClick={() => {
                      setActiveCriterionIdx(i)
                      criterionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }}
                    className={`w-full text-left transition-all ${isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[11px] truncate flex-1 ${isActive ? 'text-[#C2410C] font-semibold' : 'text-gray-600'}`}>
                        {c.name}
                      </span>
                      <span className={`text-[11px] font-semibold ml-2 flex-shrink-0 ${
                        s !== undefined ? 'text-[#E85A14]' : 'text-gray-300'
                      }`}>
                        {s !== undefined ? `${contribution.toFixed(1)}` : '—'}
                      </span>
                    </div>
                    <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                          s !== undefined ? (SCORE_COLORS[s] || 'bg-[#E85A14]') : 'bg-gray-200'
                        }`}
                        style={{ width: s !== undefined ? `${(s / 10) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[9px] text-gray-400">{c.weight}%</span>
                      {s !== undefined && <span className="text-[9px] text-gray-500">{s}/10</span>}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Progress */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Criteria scored</span>
                <span className="text-xs font-semibold text-[#E85A14]">{scoredCount}/{JUDGING_CRITERIA.length}</span>
              </div>
              <Progress value={(scoredCount / JUDGING_CRITERIA.length) * 100} className="h-1.5 progress-brand" />
            </div>
          </div>

          {/* Score guide */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-[#1A2B3C] mb-2.5">Score Guide</h3>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(SCORE_LABELS).map(([n, label]) => (
                <div key={n} className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 text-white ${SCORE_COLORS[parseInt(n)]}`}>
                    {n}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation shortcuts */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-[#1A2B3C] mb-2">Quick Navigation</h3>
            <div className="space-y-1">
              {JUDGING_CRITERIA.map((c, i) => (
                <button
                  key={c.key}
                  onClick={() => {
                    setActiveCriterionIdx(i)
                    criterionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors ${
                    activeCriterionIdx === i ? 'bg-[#FFF3EF] text-[#C2410C]' : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0 ${
                    state.scores[c.key] !== undefined ? 'bg-[#E85A14] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {state.scores[c.key] ?? i + 1}
                  </span>
                  <span className="text-[11px] truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conflict of Interest modal */}
      <ConflictFlagModal
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        onConfirm={(reason) => {
          store.flagConflict(assignmentId, reason)
          setConflictOpen(false)
          toast.warning('Conflict of interest flagged. Organiser notified.')
        }}
      />
    </div>
  )
}
