'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Upload,
  FileText,
  Video,
  Trash2,
  Edit,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { DEMO_ASSIGNMENTS, DEMO_PROJECTS, DEMO_SCORES } from '@/lib/demo-data'
import type { Country } from '@/lib/types'
import { JUDGING_CRITERIA } from '@/lib/types'

const ASEAN_COUNTRIES: Country[] = [
  'Brunei', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia',
  'Myanmar', 'Philippines', 'Singapore', 'Thailand', 'Timor-Leste', 'Vietnam',
]

export default function OrganiserProjectsPage() {
  const [projects, setProjects] = useState(DEMO_PROJECTS)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', country: '' as Country | '', video_url: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q)
  })

  const getAssignmentCount = (projectId: string) =>
    DEMO_ASSIGNMENTS.filter((a) => a.project_id === projectId).length

  const getSubmittedCount = (projectId: string) =>
    DEMO_ASSIGNMENTS.filter(
      (a) =>
        a.project_id === projectId &&
        DEMO_SCORES.some((s) => s.assignment_id === a.id && s.submitted_at)
    ).length

  const handleAddProject = () => {
    if (!newProject.name || !newProject.country) {
      toast.error('Project name and country are required.')
      return
    }
    const project = {
      id: `proj-${Date.now()}`,
      competition_id: 'comp-2026',
      name: newProject.name,
      country: newProject.country as Country,
      pdf_url: null,
      video_url: newProject.video_url || null,
      metadata: null,
      created_at: new Date().toISOString(),
    }
    setProjects([...projects, project])
    setNewProject({ name: '', country: '', video_url: '' })
    setAddOpen(false)
    toast.success(`"${project.name}" added successfully.`)
  }

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      const lines = text.split('\n').filter(Boolean)
      const header = lines[0].split(',').map((h) => h.trim().toLowerCase())

      const nameIdx = header.indexOf('project_name')
      const countryIdx = header.indexOf('country')
      const videoIdx = header.indexOf('video_url')

      if (nameIdx === -1 || countryIdx === -1) {
        toast.error('CSV must have "project_name" and "country" columns.')
        return
      }

      const imported = lines.slice(1).map((line) => {
        const cols = line.split(',').map((c) => c.trim())
        return {
          id: `proj-csv-${Date.now()}-${Math.random()}`,
          competition_id: 'comp-2026',
          name: cols[nameIdx],
          country: cols[countryIdx] as Country,
          pdf_url: null,
          video_url: videoIdx !== -1 ? (cols[videoIdx] || null) : null,
          metadata: null,
          created_at: new Date().toISOString(),
        }
      }).filter((p) => p.name)

      setProjects([...projects, ...imported])
      toast.success(`${imported.length} project(s) imported from CSV.`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Projects</h1>
          <p className="text-sm text-gray-500">{projects.length} projects loaded</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 text-xs border-gray-200"
          >
            <Upload size={13} /> Import CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-gray-200"
            onClick={() => {
              const csv = [
                'project_name,country,pdf_url,video_url',
                ...projects.map((p) => `"${p.name}","${p.country}","${p.pdf_url ?? ''}","${p.video_url ?? ''}"`)
              ].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'projects.csv'
              a.click()
            }}
          >
            <Download size={13} /> Export CSV
          </Button>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5 text-xs bg-[#1D9E8B] hover:bg-[#0F6E56] text-white">
              <Plus size={13} /> Add Project
            </Button>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-[#1A2B3C]">Add New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Project Name *</Label>
                  <Input
                    placeholder="e.g. AgriSense AI"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Country *</Label>
                  <Select
                    value={newProject.country}
                    onValueChange={(v) => setNewProject({ ...newProject, country: (v ?? '') as Country })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASEAN_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Video URL (optional)</Label>
                  <Input
                    placeholder="https://youtube.com/..."
                    value={newProject.video_url}
                    onChange={(e) => setNewProject({ ...newProject, video_url: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleAddProject} className="bg-[#1D9E8B] hover:bg-[#0F6E56] text-white">
                    Add Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* CSV template */}
      <div className="bg-[#E1F5EE] rounded-lg p-3 text-xs text-[#0F6E56]">
        <strong>CSV format:</strong> <code className="bg-white/60 px-1 py-0.5 rounded">project_name, country, pdf_url, video_url</code>
        {' '}— Headers required. Country must match an ASEAN member state name.
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 text-sm border-gray-200"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1A2B3C] hover:bg-[#1A2B3C]">
              <TableHead className="text-white text-xs font-semibold">#</TableHead>
              <TableHead className="text-white text-xs font-semibold">Project Name</TableHead>
              <TableHead className="text-white text-xs font-semibold">Country</TableHead>
              <TableHead className="text-white text-xs font-semibold">Materials</TableHead>
              <TableHead className="text-white text-xs font-semibold">Judges</TableHead>
              <TableHead className="text-white text-xs font-semibold">Judged</TableHead>
              <TableHead className="text-white text-xs font-semibold w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((project, i) => {
              const assignCount = getAssignmentCount(project.id)
              const subCount = getSubmittedCount(project.id)
              return (
                <TableRow key={project.id} className="hover:bg-gray-50 text-sm">
                  <TableCell className="text-gray-400 text-xs">{i + 1}</TableCell>
                  <TableCell className="font-medium text-[#1A2B3C]">{project.name}</TableCell>
                  <TableCell><CountryBadge country={project.country} /></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {project.pdf_url ? (
                        <a href={project.pdf_url} target="_blank" rel="noreferrer" className="text-[#1D9E8B] hover:underline flex items-center gap-1 text-xs">
                          <FileText size={11} /> PDF
                        </a>
                      ) : <span className="text-gray-300 text-xs">No PDF</span>}
                      {project.video_url ? (
                        <a href={project.video_url} target="_blank" rel="noreferrer" className="text-[#1D9E8B] hover:underline flex items-center gap-1 text-xs">
                          <Video size={11} /> Video
                        </a>
                      ) : <span className="text-gray-300 text-xs">No video</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="text-[10px] bg-gray-50 text-gray-600 border-gray-200">
                      {assignCount} assigned
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${
                      subCount === assignCount && assignCount > 0
                        ? 'bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E8B]/20'
                        : subCount > 0
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {subCount}/{assignCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1D9E8B]">
                        <Edit size={13} />
                      </button>
                      <button
                        className="w-7 h-7 rounded hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500"
                        onClick={() => {
                          setProjects(projects.filter((p) => p.id !== project.id))
                          toast.success(`"${project.name}" removed.`)
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
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
