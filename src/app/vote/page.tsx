'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CountryBadge } from '@/components/shared/CountryBadge'
import { Progress } from '@/components/ui/progress'
import { Heart, Search, CheckCircle2, Video, FileText, Trophy, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useOrganiserDemoStore } from '@/store/organiserDemoStore'
import { PdfOpenLink } from '@/components/shared/PdfOpenLink'

const VOTE_CLOSE = '2026-04-15T04:00:00Z'

// Simulated vote counts
const INITIAL_VOTES: Record<string, number> = {
  'proj-001': 347,
  'proj-002': 219,
  'proj-003': 486,
  'proj-004': 132,
  'proj-005': 278,
  'proj-006': 195,
  'proj-007': 88,
  'proj-008': 154,
}

export default function PeoplesChoicePage() {
  const demoProjects = useOrganiserDemoStore((s) => s.projects)
  const [votes, setVotes] = useState(INITIAL_VOTES)
  const [myVotes, setMyVotes] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const stored = localStorage.getItem('aisg-my-votes')
    return stored ? new Set(JSON.parse(stored)) : new Set()
  })
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [votingClosed] = useState(new Date(VOTE_CLOSE) < new Date())

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)

  const countries = [...new Set(demoProjects.map((p) => p.country))].sort()

  const sorted = [...demoProjects]
    .filter((p) => {
      if (filter !== 'all' && p.country !== filter) return false
      if (search) return p.name.toLowerCase().includes(search.toLowerCase()) || p.country.toLowerCase().includes(search.toLowerCase())
      return true
    })
    .sort((a, b) => (votes[b.id] ?? 0) - (votes[a.id] ?? 0))

  const maxVotes = Math.max(...Object.values(votes))

  const handleVote = (projectId: string) => {
    if (votingClosed) {
      toast.error('Public voting has closed.')
      return
    }
    const newMyVotes = new Set(myVotes)
    if (myVotes.has(projectId)) {
      newMyVotes.delete(projectId)
      setVotes((v) => ({ ...v, [projectId]: Math.max(0, (v[projectId] ?? 0) - 1) }))
      toast.info('Vote removed.')
    } else {
      newMyVotes.add(projectId)
      setVotes((v) => ({ ...v, [projectId]: (v[projectId] ?? 0) + 1 }))
      toast.success('Vote counted! Thank you for supporting AI innovation.')
    }
    setMyVotes(newMyVotes)
    if (typeof window !== 'undefined') {
      localStorage.setItem('aisg-my-votes', JSON.stringify([...newMyVotes]))
    }
  }

  const ranked = [...demoProjects].sort((a, b) => (votes[b.id] ?? 0) - (votes[a.id] ?? 0))

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-8">
      {/* Hero — AIRA-style solid cards (no navy band) */}
      <div className="aira-card animate-fade-in-up overflow-hidden border-gray-200 p-6 shadow-md">
        <Badge className="mb-3 border-0 bg-[#FFF1E6] text-[#C2410C] text-xs font-semibold">
          <Heart size={11} className="mr-1.5" /> Public voting — 20% of final score
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A2B3C] sm:text-3xl">Vote for your favourite project</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
          Community votes count for <strong className="text-[#1A2B3C]">20%</strong> of the final score. You may vote for up
          to <strong className="text-[#1A2B3C]">3 projects</strong>. Use the sidebar to return home or explore other areas.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Heart size={12} className="text-[#E85A14]" /> {totalVotes.toLocaleString()} total votes
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-[#1D9E8B]" /> {demoProjects.length} projects
          </span>
          {!votingClosed && <span className="font-medium text-[#C2410C]">Closes 15 Apr 2026</span>}
        </div>
      </div>

      {/* Rules banner — brand orange */}
      <div className="flex items-start gap-2 rounded-xl border border-orange-200 bg-[#E85A14] px-4 py-3 text-xs text-white shadow-sm animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <Info size={15} className="mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Each person can vote for up to 3 projects. Votes are stored in this demo in your browser. One toggle per project.
        </p>
      </div>

      <div className="space-y-5">
        {/* Top 3 podium */}
        <div className="aira-card p-5 shadow-md">
          <h2 className="text-sm font-semibold text-[#1A2B3C] mb-4 flex items-center gap-2">
            <Trophy size={15} className="text-[#E85A14]" /> Current leaderboard
          </h2>
          <div className="flex items-end gap-3 justify-center">
            {[ranked[1], ranked[0], ranked[2]].map((project, i) => {
              const podiumIdx = [1, 0, 2][i]
              const heights = ['h-20', 'h-28', 'h-16']
              const colors = ['bg-gray-100 text-gray-600', 'bg-amber-100 text-amber-700', 'bg-orange-50 text-orange-600']
              const medals = ['🥈', '🥇', '🥉']
              if (!project) return <div key={i} className="flex-1" />
              return (
                <div key={project.id} className="flex-1 text-center animate-pop-in" style={{ animationDelay: `${[100, 0, 200][i]}ms` }}>
                  <p className="text-xs font-semibold text-[#1A2B3C] mb-1 truncate">{project.name}</p>
                  <CountryBadge country={project.country} className="mb-1" />
                  <div className={`${heights[i]} ${colors[podiumIdx]} rounded-t-lg flex flex-col items-center justify-end pb-2 pt-3 transition-all`}>
                    <span className="text-xl mb-1">{medals[podiumIdx]}</span>
                    <span className="font-bold text-sm">{votes[project.id] ?? 0}</span>
                    <span className="text-[10px] text-gray-600">votes</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* My votes summary */}
        {myVotes.size > 0 && (
          <div className="bg-[#E1F5EE] border border-[#1D9E8B] rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <CheckCircle2 size={18} className="text-[#1D9E8B] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0F6E56]">You&apos;ve voted for {myVotes.size}/3 project(s)</p>
              <p className="text-xs text-[#0F6E56] mt-0.5">
                {demoProjects.filter((p) => myVotes.has(p.id)).map((p) => p.name).join(', ')}
              </p>
            </div>
            {myVotes.size >= 3 && (
              <Badge className="bg-[#1D9E8B] text-white border-none text-xs flex-shrink-0">Max votes used</Badge>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm border-gray-200 bg-white"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['all', ...countries].map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  filter === c
                    ? 'bg-[#E85A14] text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-[#E85A14] hover:text-[#C2410C]'
                }`}
              >
                {c === 'all' ? 'All Countries' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Project cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map((project, cardIdx) => {
            const projectVotes = votes[project.id] ?? 0
            const isVoted = myVotes.has(project.id)
            const pct = maxVotes > 0 ? (projectVotes / maxVotes) * 100 : 0
            const rank = ranked.findIndex((p) => p.id === project.id) + 1
            const canVote = myVotes.size < 3 || isVoted

            return (
              <div
                key={project.id}
                className={`bg-white rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden animate-fade-in-up ${
                  isVoted ? 'border-[#1D9E8B]' : 'border-gray-100'
                }`}
                style={{ animationDelay: `${cardIdx * 55}ms` }}
              >
                {isVoted && <div className="h-1.5 bg-[#1D9E8B]" />}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      rank === 1 ? 'bg-amber-100 text-amber-700' :
                      rank === 2 ? 'bg-gray-100 text-gray-600' :
                      rank === 3 ? 'bg-orange-50 text-orange-600' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1A2B3C] text-sm truncate">{project.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <CountryBadge country={project.country} />
                        {project.video_url && (
                          <a href={project.video_url} target="_blank" rel="noreferrer"
                            className="text-[10px] text-gray-400 hover:text-[#1D9E8B] flex items-center gap-0.5">
                            <Video size={10} /> Pitch
                          </a>
                        )}
                        {project.pdf_url && (
                          <PdfOpenLink
                            href={project.pdf_url}
                            className="text-[10px] text-gray-400 hover:text-[#1D9E8B] flex items-center gap-0.5 no-underline"
                          >
                            <FileText size={10} /> PDF
                          </PdfOpenLink>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vote bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{projectVotes.toLocaleString()} votes</span>
                      <span className={`font-medium ${isVoted ? 'text-[#1D9E8B]' : 'text-gray-400'}`}>{pct.toFixed(0)}%</span>
                    </div>
                    <Progress value={pct} className={`h-2 ${isVoted ? 'progress-orange' : ''}`} />
                  </div>

                  <Button
                    size="sm"
                    disabled={(!canVote && !isVoted) || votingClosed}
                    onClick={() => handleVote(project.id)}
                    className={`w-full gap-2 text-xs transition-all ${
                      isVoted
                        ? 'bg-[#E85A14] hover:bg-red-600 text-white'
                        : canVote && !votingClosed
                        ? 'bg-white border-2 border-[#E85A14] text-[#C2410C] hover:bg-[#E85A14] hover:text-white'
                        : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                    }`}
                  >
                    <Heart size={13} className={isVoted ? 'fill-current' : ''} />
                    {isVoted ? 'Voted ✓ (click to remove)' : votingClosed ? 'Voting Closed' : canVote ? 'Vote for this project' : 'Max 3 votes reached'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-xs text-gray-400">
          <p>People&apos;s Choice Award — USD $100 per country · Most popular video submission</p>
          <p className="mt-1">Organised by IMDA · AI Singapore · ASEAN Foundation · Google.org</p>
        </div>
      </div>
    </div>
  )
}
