'use client'

import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { usePdfObjectUrl } from '@/hooks/usePdfObjectUrl'

type PdfOpenLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string | null | undefined
}

/**
 * Opens uploaded (data URL) or hosted PDFs in a new tab without about:blank for data: URLs.
 */
export function PdfOpenLink({ href, children, onClick, className, ...rest }: PdfOpenLinkProps) {
  const displayUrl = usePdfObjectUrl(href)

  if (!href?.trim()) return null

  return (
    <a
      href={displayUrl ?? '#'}
      target="_blank"
      rel="noreferrer"
      className={cn(className, !displayUrl && 'pointer-events-none opacity-60')}
      onClick={(e) => {
        if (!displayUrl) {
          e.preventDefault()
          return
        }
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
