/**
 * Minimal RFC-style CSV parser (quoted fields, escaped quotes).
 * Normalizes CRLF / CR to LF.
 */
export function parseCsvText(text: string): string[][] {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const rows: string[][] = []
  let row: string[] = []
  let cur = ''
  let inQuotes = false

  const pushCell = () => {
    row.push(cur)
    cur = ''
  }

  const pushRow = () => {
    if (row.every((c) => c === '')) {
      row = []
      return
    }
    rows.push(row.map((c) => c.trim()))
    row = []
  }

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i]
    if (inQuotes) {
      if (ch === '"') {
        if (normalized[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ',') {
      pushCell()
      continue
    }
    if (ch === '\n') {
      pushCell()
      pushRow()
      continue
    }
    cur += ch
  }

  pushCell()
  pushRow()

  return rows
}
