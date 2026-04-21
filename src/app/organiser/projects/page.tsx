'use client'

import { useState, useRef, useCallback } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
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
  DialogDescription,
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
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { DEMO_SCORES } from '@/lib/demo-data'
import type { Country, Project } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useOrganiserDemoStore } from '@/store/organiserDemoStore'
import { parseCsvText } from '@/lib/csv'

const MAX_PDF_BYTES = 20 * 1024 * 1024 // 20 MB — typical cap for browser demo; use cloud storage in production

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

const ASEAN_COUNTRIES: Country[] = [
  'Brunei', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia',
  'Myanmar', 'Philippines', 'Singapore', 'Thailand', 'Timor-Leste', 'Vietnam',
]

function normalizeHeaderCell(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, '_')
}

function importProjectsFromMatrix(
  matrix: string[][],
  addProject: (p: Project) => void
): { imported: number; skipped: number } {
  if (matrix.length < 2) return { imported: 0, skipped: 0 }
  const header = matrix[0].map(normalizeHeaderCell)
  const nameIdx = header.findIndex(
    (h) => h === 'project_name' || h === 'name' || h === 'team' || h === 'project'
  )
  const countryIdx = header.indexOf('country')
  const pdfIdx = header.indexOf('pdf_url')
  const videoIdx = header.indexOf('video_url')

  if (nameIdx === -1 || countryIdx === -1) {
    toast.error('File must include project_name (or name) and country columns.')
    return { imported: 0, skipped: 0 }
  }

  let imported = 0
  let skipped = 0

  for (let r = 1; r < matrix.length; r++) {
    const cols = [...matrix[r]]
    while (cols.length < header.length) cols.push('')
    const nameVal = cols[nameIdx]?.trim()
    const rawCountry = cols[countryIdx]?.trim()
    if (!nameVal) {
      skipped++
      continue
    }
    if (!ASEAN_COUNTRIES.includes(rawCountry as Country)) {
      skipped++
      continue
    }
    const countryVal = rawCountry as Country
    const pdfCell = pdfIdx !== -1 ? cols[pdfIdx]?.trim() : ''
    const videoCell = videoIdx !== -1 ? cols[videoIdx]?.trim() : ''

    addProject({
      id: `proj-import-${Date.now()}-${r}-${Math.random().toString(36).slice(2, 7)}`,
      competition_id: 'comp-2026',
      name: nameVal,
      country: countryVal,
      pdf_url: pdfCell || null,
      video_url: videoCell || null,
      metadata: null,
      created_at: new Date().toISOString(),
    })
    imported++
  }

  return { imported, skipped }
}

export default function OrganiserProjectsPage() {
  const projects = useOrganiserDemoStore((s) => s.projects)
  const assignments = useOrganiserDemoStore((s) => s.assignments)
  const addProject = useOrganiserDemoStore((s) => s.addProject)
  const updateProject = useOrganiserDemoStore((s) => s.updateProject)
  const deleteProject = useOrganiserDemoStore((s) => s.deleteProject)

  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [newProject, setNewProject] = useState({ name: '', country: '' as Country | '', video_url: '' })
  const [editForm, setEditForm] = useState({ name: '', country: '' as Country | '', video_url: '' })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null)
  const [pdfDragging, setPdfDragging] = useState(false)
  const [editPdfDragging, setEditPdfDragging] = useState(false)
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const xlsxInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const editPdfInputRef = useRef<HTMLInputElement>(null)

  const resetAddForm = useCallback(() => {
    setNewProject({ name: '', country: '', video_url: '' })
    setPdfFile(null)
    setPdfDragging(false)
    setAddSubmitting(false)
  }, [])

  const validateAndSetPdf = useCallback((file: File) => {
    const looksPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!looksPdf) {
      toast.error('Please choose a PDF file (ends in .pdf).')
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error(`PDF is too large. Maximum size is ${MAX_PDF_BYTES / (1024 * 1024)} MB. Try compressing the file or use CSV import with a hosted link.`)
      return
    }
    setPdfFile(file)
    toast.success(`“${file.name}” is ready to attach.`)
  }, [])

  const validateAndSetEditPdf = useCallback((file: File) => {
    const looksPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!looksPdf) {
      toast.error('Please choose a PDF file (ends in .pdf).')
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error(`PDF is too large. Maximum size is ${MAX_PDF_BYTES / (1024 * 1024)} MB.`)
      return
    }
    setEditPdfFile(file)
    toast.success(`“${file.name}” will replace the saved PDF when you save changes.`)
  }, [])

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q)
  })

  const getAssignmentCount = (projectId: string) =>
    assignments.filter((a) => a.project_id === projectId).length

  const getSubmittedCount = (projectId: string) =>
    assignments.filter(
      (a) =>
        a.project_id === projectId &&
        DEMO_SCORES.some((s) => s.assignment_id === a.id && s.submitted_at)
    ).length

  const handleAddProject = async () => {
    if (!newProject.name.trim() || !newProject.country) {
      toast.error('Please enter a project name and choose a country.')
      return
    }
    const hadPdf = !!pdfFile
    setAddSubmitting(true)
    let pdf_url: string | null = null
    if (pdfFile) {
      try {
        pdf_url = await readFileAsDataURL(pdfFile)
      } catch {
        setAddSubmitting(false)
        toast.error('Could not read the PDF. Try another file or add the project without a PDF first.')
        return
      }
    }
    const project = {
      id: `proj-${Date.now()}`,
      competition_id: 'comp-2026',
      name: newProject.name.trim(),
      country: newProject.country as Country,
      pdf_url,
      video_url: newProject.video_url.trim() || null,
      metadata: null,
      created_at: new Date().toISOString(),
    }
    addProject(project)
    resetAddForm()
    setAddOpen(false)
    setAddSubmitting(false)
    toast.success(`“${project.name}” was added${hadPdf ? ' with your PDF' : ''}.`)
  }

  const openEdit = (projectId: string) => {
    const p = projects.find((x) => x.id === projectId)
    if (!p) return
    setEditId(p.id)
    setEditForm({
      name: p.name,
      country: p.country,
      video_url: p.video_url ?? '',
    })
    setEditPdfFile(null)
    setEditPdfDragging(false)
    setEditOpen(true)
  }

  const resetEditForm = () => {
    setEditId(null)
    setEditForm({ name: '', country: '', video_url: '' })
    setEditPdfFile(null)
    setEditPdfDragging(false)
    setEditSubmitting(false)
  }

  const handleSaveEdit = async () => {
    if (!editId || !editForm.name.trim() || !editForm.country) {
      toast.error('Please enter a project name and choose a country.')
      return
    }
    setEditSubmitting(true)
    let pdf_url: string | null | undefined = undefined
    if (editPdfFile) {
      try {
        pdf_url = await readFileAsDataURL(editPdfFile)
      } catch {
        setEditSubmitting(false)
        toast.error('Could not read the PDF.')
        return
      }
    }
    const patch = {
      name: editForm.name.trim(),
      country: editForm.country as Country,
      video_url: editForm.video_url.trim() || null,
      ...(pdf_url !== undefined ? { pdf_url } : {}),
    }
    updateProject(editId, patch)
    setEditOpen(false)
    resetEditForm()
    setEditSubmitting(false)
    toast.success('Project updated.')
  }

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      const matrix = parseCsvText(text)
      const { imported, skipped } = importProjectsFromMatrix(matrix, addProject)
      if (imported === 0) {
        toast.error('No valid rows imported. Check column names and ASEAN country names.')
      } else {
        toast.success(`${imported} project(s) imported from CSV.`)
        if (skipped > 0) {
          toast.message(`${skipped} row(s) skipped (empty name or invalid country).`)
        }
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const buf = evt.target?.result as ArrayBuffer
        const XLSX = await import('xlsx')
        const wb = XLSX.read(buf, { type: 'array' })
        const sheetName = wb.SheetNames[0]
        if (!sheetName) {
          toast.error('The workbook has no sheets.')
          return
        }
        const ws = wb.Sheets[sheetName]
        const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
        const matrix: string[][] = raw.map((row) =>
          (Array.isArray(row) ? row : []).map((cell) => String(cell ?? '').trim())
        )
        const { imported, skipped } = importProjectsFromMatrix(matrix, addProject)
        if (imported === 0) {
          toast.error('No valid rows imported. Use row 1 for headers: project_name, country, pdf_url, video_url.')
        } else {
          toast.success(`${imported} project(s) imported from Excel.`)
          if (skipped > 0) {
            toast.message(`${skipped} row(s) skipped (empty name or invalid country).`)
          }
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not read Excel file.')
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Projects</h1>
          <p className="text-sm text-gray-500">
            {projects.length} team{projects.length !== 1 ? 's' : ''} in this competition. Add one with the form (upload a PDF from your computer) or import a spreadsheet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 text-xs border-gray-200"
          >
            <Upload size={13} /> Import CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSVImport} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => xlsxInputRef.current?.click()}
            className="gap-1.5 text-xs border-gray-200"
          >
            <Upload size={13} /> Import Excel
          </Button>
          <input
            ref={xlsxInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleExcelImport}
          />

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

          <Dialog
            open={addOpen}
            onOpenChange={(open) => {
              setAddOpen(open)
              if (!open) resetAddForm()
            }}
          >
            <Button
              size="sm"
              onClick={() => {
                resetAddForm()
                setAddOpen(true)
              }}
              className="gap-1.5 text-xs bg-[#1D9E8B] hover:bg-[#0F6E56] text-white"
            >
              <Plus size={13} /> Add Project
            </Button>
            <DialogContent className="max-w-lg gap-0 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-[#1A2B3C] text-lg">Add a new team project</DialogTitle>
                <DialogDescription className="text-gray-600 text-sm leading-relaxed">
                  Fill in the team name and country (required). Upload their written proposal as a PDF, or skip if you will add a link later via CSV. Judges use these materials when scoring.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4 max-h-[min(70vh,32rem)] overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <Label htmlFor="project-name" className="text-sm font-medium text-[#1A2B3C]">
                    Team / project name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="project-name"
                    placeholder="e.g. AgriSense AI"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="text-sm h-10"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="project-country" className="text-sm font-medium text-[#1A2B3C]">
                    Country <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={newProject.country || undefined}
                    onValueChange={(v) => setNewProject({ ...newProject, country: (v ?? '') as Country })}
                  >
                    <SelectTrigger id="project-country" className="text-sm h-10 w-full">
                      <SelectValue placeholder="Tap to choose country" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASEAN_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Must match one of the ASEAN countries in the list.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1A2B3C]">Written proposal (PDF)</Label>
                  <p className="text-xs text-gray-500 -mt-1">
                    Optional but recommended. PDF only, up to {MAX_PDF_BYTES / (1024 * 1024)} MB. Drag the file here or click to browse.
                  </p>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    aria-label="Choose PDF file"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) validateAndSetPdf(f)
                      e.target.value = ''
                    }}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Drop PDF here or click to upload"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        pdfInputRef.current?.click()
                      }
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      setPdfDragging(true)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setPdfDragging(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) setPdfDragging(false)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      setPdfDragging(false)
                      const f = e.dataTransfer.files?.[0]
                      if (f) validateAndSetPdf(f)
                    }}
                    onClick={() => pdfInputRef.current?.click()}
                    className={cn(
                      'rounded-lg border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors min-h-[7rem] flex flex-col items-center justify-center gap-2',
                      pdfDragging
                        ? 'border-[#1D9E8B] bg-[#E1F5EE] shadow-[inset_0_0_0_2px_rgba(29,158,139,0.15)]'
                        : 'border-gray-300 bg-[#F4F6F8] hover:border-[#1D9E8B] hover:bg-[#E8F5F2]'
                    )}
                  >
                    {pdfFile ? (
                      <>
                        <FileText className="text-[#1D9E8B]" size={28} aria-hidden />
                        <p className="text-sm font-medium text-[#1A2B3C] break-all max-w-full px-2">{pdfFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {pdfFile.size >= 1024 * 1024
                            ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB`
                            : `${(pdfFile.size / 1024).toFixed(1)} KB`}
                          {' '}— will attach when you add the project
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-1 gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPdfFile(null)
                          }}
                        >
                          <X size={14} /> Remove file
                        </Button>
                      </>
                    ) : (
                      <>
                        <Upload className="text-gray-400" size={28} aria-hidden />
                        <p className="text-sm text-[#1A2B3C] font-medium">Drop PDF here or click to choose file</p>
                        <p className="text-xs text-gray-500">Your file stays in this browser until you click Add Project</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="video-url" className="text-sm font-medium text-[#1A2B3C]">
                    Video link <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="video-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://… (YouTube, Google Drive, etc.)"
                    value={newProject.video_url}
                    onChange={(e) => setNewProject({ ...newProject, video_url: e.target.value })}
                    className="text-sm h-10"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500">Paste a full web address if the team has a demo video online.</p>
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10"
                    disabled={addSubmitting}
                    onClick={() => setAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-10 bg-[#1D9E8B] hover:bg-[#0F6E56] text-white min-w-[8rem]"
                    disabled={addSubmitting}
                    onClick={() => void handleAddProject()}
                  >
                    {addSubmitting ? 'Saving…' : 'Add project'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open)
              if (!open) resetEditForm()
            }}
          >
            <DialogContent className="max-w-lg gap-0 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-[#1A2B3C] text-lg">Edit project</DialogTitle>
                <DialogDescription className="text-gray-600 text-sm leading-relaxed">
                  Update team details, video link, or replace the PDF. Changes apply everywhere judges and results use this project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4 max-h-[min(70vh,32rem)] overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-project-name" className="text-sm font-medium text-[#1A2B3C]">
                    Team / project name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="edit-project-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-sm h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-project-country" className="text-sm font-medium text-[#1A2B3C]">
                    Country <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={editForm.country || undefined}
                    onValueChange={(v) => setEditForm({ ...editForm, country: (v ?? '') as Country })}
                  >
                    <SelectTrigger id="edit-project-country" className="text-sm h-10 w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASEAN_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#1A2B3C]">Written proposal (PDF)</Label>
                  <p className="text-xs text-gray-500 -mt-1">
                    {editId && projects.find((p) => p.id === editId)?.pdf_url && !editPdfFile
                      ? 'A PDF is already attached. Upload a new file below to replace it.'
                      : 'Optional. Upload to attach or replace the PDF.'}
                  </p>
                  <input
                    ref={editPdfInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    aria-label="Replace PDF file"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) validateAndSetEditPdf(f)
                      e.target.value = ''
                    }}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Drop PDF to replace"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        editPdfInputRef.current?.click()
                      }
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      setEditPdfDragging(true)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setEditPdfDragging(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) setEditPdfDragging(false)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      setEditPdfDragging(false)
                      const f = e.dataTransfer.files?.[0]
                      if (f) validateAndSetEditPdf(f)
                    }}
                    onClick={() => editPdfInputRef.current?.click()}
                    className={cn(
                      'rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors min-h-[5rem] flex flex-col items-center justify-center gap-2',
                      editPdfDragging
                        ? 'border-[#1D9E8B] bg-[#E1F5EE] shadow-[inset_0_0_0_2px_rgba(29,158,139,0.15)]'
                        : 'border-gray-300 bg-[#F4F6F8] hover:border-[#1D9E8B] hover:bg-[#E8F5F2]'
                    )}
                  >
                    {editPdfFile ? (
                      <>
                        <FileText className="text-[#1D9E8B]" size={24} aria-hidden />
                        <p className="text-sm font-medium text-[#1A2B3C] break-all max-w-full px-2">{editPdfFile.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-1 gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditPdfFile(null)
                          }}
                        >
                          <X size={14} /> Keep existing PDF
                        </Button>
                      </>
                    ) : (
                      <>
                        <Upload className="text-gray-400" size={24} aria-hidden />
                        <p className="text-sm text-[#1A2B3C]">Drop or click to replace PDF</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-video-url" className="text-sm font-medium text-[#1A2B3C]">
                    Video link <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="edit-video-url"
                    type="url"
                    value={editForm.video_url}
                    onChange={(e) => setEditForm({ ...editForm, video_url: e.target.value })}
                    className="text-sm h-10"
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-gray-100">
                  <Button variant="outline" size="sm" className="h-10" disabled={editSubmitting} onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-10 bg-[#1D9E8B] hover:bg-[#0F6E56] text-white min-w-[8rem]"
                    disabled={editSubmitting}
                    onClick={() => void handleSaveEdit()}
                  >
                    {editSubmitting ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Import help + sample files */}
      <div className="bg-[#E1F5EE] rounded-lg p-4 text-sm text-[#0F6E56] space-y-2">
        <p>
          <strong>Bulk import:</strong> use columns{' '}
          <code className="bg-white px-1.5 py-0.5 rounded text-xs font-mono border border-[#B8DDD4] shadow-sm">
            project_name, country, pdf_url, video_url
          </code>
          . Country must match the ASEAN list (e.g. Singapore). Row 1 in Excel should be the header row.
        </p>
        <p className="text-xs text-[#0B5C4A]">
          For <code className="bg-white px-1 rounded border border-[#B8DDD4]">pdf_url</code>, use a public link or a path under{' '}
          <code className="bg-white px-1 rounded border border-[#B8DDD4]">/samples/projects/</code> (see generated demo PDFs) so judges can open files on the same site.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href="/samples/organiser-projects-import.csv"
            download
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'h-8 border-[#B8DDD4] bg-white text-xs no-underline'
            )}
          >
            <Download size={12} className="mr-1.5" /> Sample CSV
          </a>
          <a
            href="/samples/organiser-projects-import.xlsx"
            download
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'h-8 border-[#B8DDD4] bg-white text-xs no-underline'
            )}
          >
            <Download size={12} className="mr-1.5" /> Sample Excel
          </a>
          <a
            href="/samples/projects/proj-001.pdf"
            download
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'h-8 border-[#B8DDD4] bg-white text-xs no-underline'
            )}
          >
            <FileText size={12} className="mr-1.5" /> Sample PDF (proj-001)
          </a>
        </div>
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
                        ? 'bg-[#E1F5EE] text-[#0F6E56] border border-[#B8DDD4]'
                        : subCount > 0
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {subCount}/{assignCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        title="Edit project"
                        className="w-7 h-7 rounded hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1D9E8B]"
                        onClick={() => openEdit(project.id)}
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        type="button"
                        title="Remove project"
                        className="w-7 h-7 rounded hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500"
                        onClick={() => {
                          deleteProject(project.id)
                          toast.success(`“${project.name}” removed.`)
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
