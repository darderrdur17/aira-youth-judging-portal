import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const samplesDir = join(__dirname, '../public/samples')
mkdirSync(samplesDir, { recursive: true })

const rows = [
  {
    project_name: 'Sample Import — Team Alpha',
    country: 'Singapore',
    pdf_url: '/samples/projects/proj-001.pdf',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    project_name: 'Sample Import — Team Beta',
    country: 'Malaysia',
    pdf_url: '/samples/projects/proj-002.pdf',
    video_url: '',
  },
]

const csv =
  'project_name,country,pdf_url,video_url\n' +
  rows
    .map((r) =>
      [r.project_name, r.country, r.pdf_url, r.video_url]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n')

writeFileSync(join(samplesDir, 'organiser-projects-import.csv'), csv, 'utf8')

const ws = XLSX.utils.json_to_sheet(rows)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Projects')
XLSX.writeFile(wb, join(samplesDir, 'organiser-projects-import.xlsx'))

console.log('Wrote organiser-projects-import.csv and organiser-projects-import.xlsx')
