'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExternalLink, FileText } from 'lucide-react'
import { usePdfObjectUrl } from '@/hooks/usePdfObjectUrl'

type PdfViewerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pdfUrl: string | null
  projectName?: string
}

export function PdfViewerDialog({ open, onOpenChange, pdfUrl, projectName }: PdfViewerDialogProps) {
  const displayUrl = usePdfObjectUrl(pdfUrl)

  if (!pdfUrl?.trim()) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[min(100vw-1.5rem,56rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[56rem]">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-4 py-3 text-left">
          <DialogTitle className="flex items-center gap-2 text-base text-[#1A2B3C]">
            <FileText size={18} className="text-[#E85A14]" />
            Team submission
            {projectName ? <span className="font-normal text-gray-500">· {projectName}</span> : null}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Uploaded PDFs open via a temporary preview URL so your browser can display them reliably.
          </DialogDescription>
          <div className="pt-2">
            {displayUrl ? (
              <a
                href={displayUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'inline-flex h-8 gap-1.5 border-gray-200 text-xs no-underline'
                )}
              >
                <ExternalLink size={14} />
                Open PDF in new tab
              </a>
            ) : (
              <span className="text-xs text-gray-400">Preparing PDF…</span>
            )}
          </div>
        </DialogHeader>
        {displayUrl ? (
          <iframe
            key={displayUrl}
            title="Project PDF"
            src={displayUrl}
            className="min-h-[60vh] w-full flex-1 border-0 bg-gray-100"
          />
        ) : (
          <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
            Loading PDF preview…
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
