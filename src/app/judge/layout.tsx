import { PortalChrome } from '@/components/shared/PortalChrome'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { hasJudgeProfile } from '@/lib/auth/judge-access'
import { DEMO_SESSION_COOKIE } from '@/lib/auth/demo-session'
import { DEMO_COMPETITION } from '@/lib/demo-data'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function JudgeLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  if (cookieStore.get(DEMO_SESSION_COOKIE)?.value === '1') {
    return (
      <PortalChrome role="judge" competitionName={DEMO_COMPETITION.name}>
        {children}
      </PortalChrome>
    )
  }

  if (process.env.NEXT_PUBLIC_ENABLE_UNAUTHENTICATED_DEMO === 'true') {
    return (
      <PortalChrome role="judge" competitionName={DEMO_COMPETITION.name}>
        {children}
      </PortalChrome>
    )
  }

  if (!isSupabaseConfigured()) {
    return (
      <PortalChrome role="judge" competitionName={DEMO_COMPETITION.name}>
        {children}
      </PortalChrome>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?role=judge')
  }

  const ok = await hasJudgeProfile(supabase, user.id)
  if (!ok) {
    redirect('/auth/login?role=judge&error=not_invited')
  }

  const displayName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    user.email?.split('@')[0] ||
    'Judge'

  return (
    <PortalChrome
      role="judge"
      userName={displayName}
      userEmail={user.email ?? ''}
      competitionName={DEMO_COMPETITION.name}
    >
      {children}
    </PortalChrome>
  )
}
