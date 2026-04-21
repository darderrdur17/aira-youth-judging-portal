/**
 * Generates one small PDF per demo project under public/samples/projects/{id}.pdf
 * Run: node scripts/generate-project-sample-pdfs.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/samples/projects')

/** Must stay in sync with DEMO_PROJECTS in src/lib/demo-data.ts */
const PROJECTS = [
  { id: 'proj-001', name: 'AgriSense AI', country: 'Philippines' },
  { id: 'proj-002', name: 'MedBot SEA', country: 'Indonesia' },
  { id: 'proj-003', name: 'EduPath Lite', country: 'Singapore' },
  { id: 'proj-004', name: 'FloodAlert MY', country: 'Malaysia' },
  { id: 'proj-005', name: 'LinguaBridge TH', country: 'Thailand' },
  { id: 'proj-006', name: 'CropDoc VN', country: 'Vietnam' },
  { id: 'proj-007', name: 'SafeSchool KH', country: 'Cambodia' },
  { id: 'proj-008', name: 'WasteWise MM', country: 'Myanmar' },
]

mkdirSync(outDir, { recursive: true })

for (const p of PROJECTS) {
  const doc = await PDFDocument.create()
  const page = doc.addPage([612, 792])
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  const navy = rgb(0.1, 0.17, 0.24)
  const teal = rgb(0.11, 0.62, 0.55)
  const gray = rgb(0.35, 0.38, 0.42)

  page.drawText('AISG Judging Portal', { x: 50, y: 745, size: 11, font: bold, color: teal })
  page.drawText('Sample team submission (demo)', { x: 50, y: 720, size: 14, font: bold, color: navy })

  page.drawText(`Project: ${p.name}`, { x: 50, y: 680, size: 20, font: bold, color: navy })
  page.drawText(`Project ID: ${p.id}`, { x: 50, y: 650, size: 12, font: regular, color: gray })
  page.drawText(`Country: ${p.country}`, { x: 50, y: 630, size: 12, font: regular, color: gray })

  const blurb =
    'This PDF is generated for local and staging tests. Judges should open it from the ' +
    'dashboard or scoring page to confirm PDF links work. Replace with real submissions in production.'
  const words = blurb.split(' ')
  let line = ''
  let y = 580
  const maxW = 500
  const size = 11
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    const width = regular.widthOfTextAtSize(test, size)
    if (width > maxW && line) {
      page.drawText(line, { x: 50, y, size, font: regular, color: gray })
      y -= size + 4
      line = w
    } else {
      line = test
    }
  }
  if (line) page.drawText(line, { x: 50, y, size, font: regular, color: gray })

  page.drawText(`File: /samples/projects/${p.id}.pdf`, { x: 50, y: 120, size: 10, font: regular, color: rgb(0.5, 0.52, 0.55) })

  const bytes = await doc.save()
  const path = join(outDir, `${p.id}.pdf`)
  writeFileSync(path, bytes)
  console.log('Wrote', path)
}

console.log(`Done: ${PROJECTS.length} project PDFs`)
