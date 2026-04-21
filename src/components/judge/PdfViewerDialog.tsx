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

type PdfViewerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pdfUrl: string | null
  projectName?: string
}

export function PdfViewerDialog({ open, onOpenChange, pdfUrl, projectName }: PdfViewerDialogProps) {
  if (!pdfUrl) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[min(100vw-1.5rem,56rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[56rem]">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-4 py-3 text-left">
          <DialogTitle className="flex items-center gap-2 text-base text-[#1A2B3C]">
            <FileText size={18} className="text-[#1D9E8B]" />
            Team submission
            {projectName ? <span className="font-normal text-gray-500">· {projectName}</span> : null}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Read the PDF below or open it in a new tab if your browser blocks the preview.
          </DialogDescription>
          <div className="pt-2">
            <a
              href={pdfUrl}
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
          </div>
        </DialogHeader>
        <iframe
          title="Project PDF"
          src={pdfUrl}
          className="min-h-[60vh] w-full flex-1 border-0 bg-gray-100"
        />
      </DialogContent>
    </Dialog>
  )
}
