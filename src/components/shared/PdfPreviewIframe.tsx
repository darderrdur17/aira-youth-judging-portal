'use client'

import { usePdfObjectUrl } from '@/hooks/usePdfObjectUrl'

type PdfPreviewIframeProps = {
  pdfUrl: string | null | undefined
  title: string
  className?: string
}

/**
 * Embeds a PDF without using raw data: URLs in src (avoids about:blank in many browsers).
 */
export function PdfPreviewIframe({ pdfUrl, title, className }: PdfPreviewIframeProps) {
  const src = usePdfObjectUrl(pdfUrl)

  if (!pdfUrl?.trim()) return null

  if (!src) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
        Loading PDF preview…
      </div>
    )
  }

  return <iframe key={`${pdfUrl.length}-${src}`} title={title} src={src} className={className} />
}
