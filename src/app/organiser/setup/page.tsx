'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Settings,
  FileText,
  Cpu,
  Code2,
  Trophy,
  Calendar,
  Globe,
  Users,
  Save,
  Info,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react'
import { JUDGING_CRITERIA } from '@/lib/types'
import { useOrganiserDemoStore } from '@/store/organiserDemoStore'

function isoToLocalDatetimeInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type CompetitionType = 'ideathon' | 'prize_based' | 'programming' | 'competition'

const COMPETITION_TYPES = [
  {
    id: 'ideathon' as CompetitionType,
    label: 'Ideathon',
    icon: <FileText size={20} />,
    color: 'border-[#1D9E8B] bg-[#E1F5EE]',
    iconColor: 'text-[#1D9E8B]',
    badge: 'bg-[#1D9E8B] text-white',
    description: 'Form-based manual review of PDF/video proposals. Best for open-ended AI for Good challenges.',
    taskType: 'One qualitative task',
    submission: 'Proposal PDF + 3-min video',
    scoring: 'Form-based manual review by judges',
    contestants: 'Negotiable',
    geo: 'Unrestricted',
    resources: 'Web + Storage hosting',
    lead: 'N/A',
    current: true,
  },
  {
    id: 'prize_based' as CompetitionType,
    label: 'Prize-Based Challenge',
    icon: <Trophy size={20} />,
    color: 'border-blue-300 bg-blue-50',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-500 text-white',
    description: 'Machine-scorable task with automated metrics. Self-registered participants.',
    taskType: 'One machine-scorable task',
    submission: 'Docker image',
    scoring: 'Automated task-specific metric',
    contestants: 'Self-registered users',
    geo: 'Unrestricted',
    resources: 'Web + Storage + GPU for scoring',
    lead: 'At least 1 month',
    current: false,
  },
  {
    id: 'programming' as CompetitionType,
    label: 'Programming Challenge',
    icon: <Code2 size={20} />,
    color: 'border-purple-300 bg-purple-50',
    iconColor: 'text-purple-600',
    badge: 'bg-purple-500 text-white',
    description: 'Multiple machine-scorable tasks via Jupyter Notebooks. Pre-selected users only.',
    taskType: 'Multiple machine-scorable tasks',
    submission: 'Jupyter Notebook',
    scoring: 'Automated task-specific metric',
    contestants: 'Pre-selected users',
    geo: 'On-site only',
    resources: 'Web + Storage + GPU for scoring',
    lead: 'At least 1 month + 0.5 months/task',
    current: false,
  },
  {
    id: 'competition' as CompetitionType,
    label: 'Competition Challenge',
    icon: <Cpu size={20} />,
    color: 'border-orange-300 bg-orange-50',
    iconColor: 'text-orange-600',
    badge: 'bg-orange-500 text-white',
    description: 'Full competition setup with GPU for contestants and scoring. Highest complexity.',
    taskType: 'Multiple machine-scorable tasks',
    submission: 'Jupyter Notebook',
    scoring: 'Automated task-specific metric',
    contestants: 'Pre-selected users',
    geo: 'On-site only',
    resources: 'Web + Storage + GPU for contestants & scoring',
    lead: 'At least 1 month + 0.5 months/task',
    current: false,
  },
]

const INFO_ROWS = [
  { key: 'taskType', label: 'Task Type', icon: <Settings size={12} /> },
  { key: 'submission', label: 'Submission', icon: <FileText size={12} /> },
  { key: 'scoring', label: 'Scoring', icon: <CheckCircle2 size={12} /> },
  { key: 'contestants', label: 'Contestants', icon: <Users size={12} /> },
  { key: 'geo', label: 'Geography', icon: <Globe size={12} /> },
  { key: 'resources', label: 'Resources', icon: <Cpu size={12} /> },
  { key: 'lead', label: 'AI Eng. Lead Time', icon: <Calendar size={12} /> },
]

export default function CompetitionSetupPage() {
  const setCompetitionMeta = useOrganiserDemoStore((s) => s.setCompetitionMeta)

  const [selectedType, setSelectedType] = useState<CompetitionType>('ideathon')
  const [competitionName, setCompetitionName] = useState(() => useOrganiserDemoStore.getState().competitionName)
  const [slug, setSlug] = useState('airayc-2026')
  const [deadline, setDeadline] = useState(() =>
    isoToLocalDatetimeInput(useOrganiserDemoStore.getState().competitionDeadline)
  )
  const [criteria, setCriteria] = useState(JUDGING_CRITERIA.map((c) => ({ ...c })))
  const [saved, setSaved] = useState(false)

  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)

  const handleSave = async () => {
    if (totalWeight !== 85) {
      toast.error(`Criterion weights must sum to 85 (currently ${totalWeight}).`)
      return
    }
    await new Promise((r) => setTimeout(r, 600))
    setCompetitionMeta({
      competitionName: competitionName.trim(),
      competitionDeadline: new Date(deadline).toISOString(),
    })
    setSaved(true)
    toast.success('Competition settings saved. Dashboard and countdown use the new name and deadline.')
  }

  const updateWeight = (idx: number, val: number) => {
    const updated = [...criteria]
    updated[idx] = { ...updated[idx], weight: val }
    setCriteria(updated)
  }

  const addCriterion = () => {
    setCriteria([...criteria, {
      key: `custom_${criteria.length}`,
      name: 'New Criterion',
      weight: 5,
      description: 'Describe this criterion...',
      sort_order: criteria.length + 1,
    }])
  }

  const removeCriterion = (idx: number) => {
    setCriteria(criteria.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Competition Setup</h1>
          <p className="text-sm text-gray-500">Configure your competition type, metadata, and judging criteria.</p>
        </div>
        <Button onClick={handleSave} className="bg-[#1D9E8B] hover:bg-[#0F6E56] text-white gap-2">
          <Save size={14} />
          {saved ? 'Saved ✓' : 'Save Settings'}
        </Button>
      </div>

      {/* Competition type selector */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={15} className="text-[#1D9E8B]" />
          <h2 className="text-sm font-semibold text-[#1A2B3C]">Competition Type</h2>
          <Badge className="text-[10px] bg-[#E1F5EE] text-[#0F6E56] border border-[#B8DDD4] ml-1">
            Based on AI Singapore Platform
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {COMPETITION_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`relative text-left rounded-xl border-2 p-4 transition-all ${
                selectedType === type.id
                  ? type.color + ' shadow-sm'
                  : 'border-gray-100 bg-gray-50 hover:border-gray-200'
              }`}
            >
              {type.current && (
                <span className="absolute top-2 right-2 text-[9px] bg-[#1D9E8B] text-white px-1.5 py-0.5 rounded-full">
                  CURRENT
                </span>
              )}
              <div className={`mb-2 ${selectedType === type.id ? type.iconColor : 'text-gray-400'}`}>
                {type.icon}
              </div>
              <p className={`text-xs font-semibold mb-1 ${selectedType === type.id ? 'text-[#1A2B3C]' : 'text-gray-600'}`}>
                {type.label}
              </p>
              <p className="text-[10px] text-gray-500 leading-relaxed">{type.description}</p>
            </button>
          ))}
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-gray-500 font-medium py-2 pr-4 w-32">Feature</th>
                {COMPETITION_TYPES.map((t) => (
                  <th key={t.id} className={`text-center py-2 px-2 font-semibold ${
                    selectedType === t.id ? 'text-[#1D9E8B]' : 'text-gray-400'
                  }`}>
                    {t.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INFO_ROWS.map((row) => (
                <tr key={row.key} className="border-t border-gray-50">
                  <td className="py-2 pr-4 text-gray-500 flex items-center gap-1.5">
                    <span className="text-gray-400">{row.icon}</span>
                    {row.label}
                  </td>
                  {COMPETITION_TYPES.map((t) => (
                    <td key={t.id} className={`py-2 px-2 text-center text-[10px] leading-tight ${
                      selectedType === t.id ? 'text-[#1A2B3C] font-medium' : 'text-gray-400'
                    }`}>
                      {t[row.key as keyof typeof t] as string}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedType !== 'ideathon' && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Note:</strong> The current AIRC 2026 challenge uses the <strong>Ideathon</strong> format — PDF proposals + video pitches with form-based judging. Switching to another type would require infrastructure changes (GPU, Docker, etc.).
            </p>
          </div>
        )}
      </div>

      {/* Basic settings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-[#1A2B3C] mb-4">Competition Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Competition Name</Label>
            <Input value={competitionName} onChange={(e) => setCompetitionName(e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">URL Slug</Label>
            <div className="flex">
              <span className="px-2.5 py-1.5 border border-r-0 rounded-l-md text-xs text-gray-400 bg-gray-50 border-gray-200">
                /c/
              </span>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                className="text-sm rounded-l-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Judging Deadline (SGT)</Label>
            <Input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max Score</Label>
            <div className="h-9 px-3 border rounded-md text-sm flex items-center text-gray-500 bg-gray-50 border-gray-200">
              {totalWeight} pts (auto-calculated)
            </div>
          </div>
        </div>
      </div>

      {/* Criteria builder */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#1A2B3C]">Judging Criteria</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Weights must sum to 85 (Public Engagement 20% is tracked separately via votes).
              Currently: <span className={`font-semibold ${totalWeight === 85 ? 'text-[#1D9E8B]' : 'text-red-500'}`}>{totalWeight}/85</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addCriterion} className="gap-1.5 text-xs border-gray-200">
            <Plus size={12} /> Add Criterion
          </Button>
        </div>

        <div className="space-y-2">
          {criteria.map((c, idx) => (
            <div key={c.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50">
              <GripVertical size={14} className="text-gray-300 flex-shrink-0 cursor-grab" />
              <div className="flex-1 min-w-0">
                <Input
                  value={c.name}
                  onChange={(e) => {
                    const updated = [...criteria]
                    updated[idx] = { ...updated[idx], name: e.target.value }
                    setCriteria(updated)
                  }}
                  className="text-xs h-7 border-none bg-transparent p-0 font-medium text-[#1A2B3C] focus-visible:ring-0"
                />
                <Input
                  value={c.description}
                  onChange={(e) => {
                    const updated = [...criteria]
                    updated[idx] = { ...updated[idx], description: e.target.value }
                    setCriteria(updated)
                  }}
                  className="text-[10px] h-6 border-none bg-transparent p-0 text-gray-400 focus-visible:ring-0 mt-0.5"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={c.weight}
                  onChange={(e) => updateWeight(idx, parseInt(e.target.value) || 0)}
                  className="w-14 h-7 text-center text-xs border-gray-200"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
              <button
                onClick={() => removeCriterion(idx)}
                className="w-7 h-7 rounded hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 flex-shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <span className="font-semibold text-[#1A2B3C]">{criteria.length}</span> criteria ·{' '}
            <span className={`font-semibold ${totalWeight === 85 ? 'text-[#1D9E8B]' : 'text-red-500'}`}>
              {totalWeight}% judge-scored
            </span>{' '}
            + <span className="font-semibold text-blue-600">20% public votes</span> = 100% total
          </div>
          {totalWeight !== 85 && (
            <Badge className="text-[10px] bg-red-50 text-red-600 border-red-200">
              ⚠ Weights should sum to 85
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
