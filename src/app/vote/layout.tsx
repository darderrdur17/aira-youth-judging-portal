import type { ReactNode } from 'react'
import { PublicPortalChrome } from '@/components/shared/PortalChrome'

export default function VoteLayout({ children }: { children: ReactNode }) {
  return <PublicPortalChrome title="People's choice">{children}</PublicPortalChrome>
}
