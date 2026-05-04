import { PortalChrome } from '@/components/shared/PortalChrome'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { isOrganiserUser } from '@/lib/auth/organiser-access'
import { DEMO_SESSION_COOKIE } from '@/lib/auth/demo-session'
import { DEMO_COMPETITION } from '@/lib/demo-data'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function OrganiserLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  if (cookieStore.get(DEMO_SESSION_COOKIE)?.value === '1') {
    return (
      <PortalChrome
        role="organiser"
        userName="Organiser Admin"
        userEmail="admin@airayouthchallenge.ai"
        competitionName={DEMO_COMPETITION.name}
      >
        {children}
      </PortalChrome>
    )
  }

  if (process.env.NEXT_PUBLIC_ENABLE_UNAUTHENTICATED_DEMO === 'true') {
    return (
      <PortalChrome
        role="organiser"
        userName="Organiser Admin"
        userEmail="admin@airayouthchallenge.ai"
        competitionName={DEMO_COMPETITION.name}
      >
        {children}
      </PortalChrome>
    )
  }

  if (!isSupabaseConfigured()) {
    return (
      <PortalChrome
        role="organiser"
        userName="Organiser Admin"
        userEmail="admin@airayouthchallenge.ai"
        competitionName={DEMO_COMPETITION.name}
      >
        {children}
      </PortalChrome>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?role=organiser')
  }

  const allowed = await isOrganiserUser(supabase, user.id, user.email ?? undefined)
  if (!allowed) {
    redirect('/auth/login?role=organiser&error=forbidden')
  }

  const displayName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    user.email?.split('@')[0] ||
    'Organiser'

  return (
    <PortalChrome
      role="organiser"
      userName={displayName}
      userEmail={user.email ?? ''}
      competitionName={DEMO_COMPETITION.name}
    >
      {children}
    </PortalChrome>
  )
}
