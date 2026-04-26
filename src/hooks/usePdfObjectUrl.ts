'use client'

import { useLayoutEffect, useMemo, useState } from 'react'

function dataUrlToBlobUrl(dataUrl: string): string {
  const comma = dataUrl.indexOf(',')
  if (comma === -1) throw new Error('Invalid data URL')
  const meta = dataUrl.slice(0, comma)
  const payload = dataUrl.slice(comma + 1)
  const isBase64 = /;base64/i.test(meta)

  let bytes: Uint8Array
  if (isBase64) {
    const binary = atob(payload.replace(/\s/g, ''))
    bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  } else {
    bytes = new TextEncoder().encode(decodeURIComponent(payload))
  }

  const mimeMatch = meta.match(/^data:([^;,]+)/)
  const mime = mimeMatch?.[1] || 'application/pdf'
  return URL.createObjectURL(new Blob([Uint8Array.from(bytes)], { type: mime }))
}

/**
 * Hosted paths and http(s) URLs are returned as-is (SSR-safe).
 * `data:application/pdf;base64,...` is converted to a blob: URL on the client so
 * iframes and new tabs render reliably instead of about:blank.
 */
export function usePdfObjectUrl(pdfUrl: string | null | undefined): string | null {
  const staticUrl = useMemo(() => {
    if (!pdfUrl?.trim()) return null
    const u = pdfUrl.trim()
    if (u.startsWith('data:')) return null
    return u
  }, [pdfUrl])

  const [dataBlobUrl, setDataBlobUrl] = useState<string | null>(null)

  useLayoutEffect(() => {
    if (!pdfUrl?.trim()) {
      setDataBlobUrl(null)
      return
    }
    const u = pdfUrl.trim()
    if (!u.startsWith('data:')) {
      setDataBlobUrl(null)
      return
    }

    let blobUrl: string
    try {
      blobUrl = dataUrlToBlobUrl(u)
    } catch {
      setDataBlobUrl(null)
      return
    }

    setDataBlobUrl(blobUrl)
    return () => URL.revokeObjectURL(blobUrl)
  }, [pdfUrl])

  return staticUrl ?? dataBlobUrl
}
