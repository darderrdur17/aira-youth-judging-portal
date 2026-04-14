import { TopNav } from '@/components/shared/TopNav'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { isOrganiserUser } from '@/lib/auth/organiser-access'
import { redirect } from 'next/navigation'

export default async function OrganiserLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_ENABLE_UNAUTHENTICATED_DEMO === 'true') {
    return (
      <div className="min-h-screen bg-[#F7F8FA]">
        <TopNav
          role="organiser"
          userName="Organiser Admin"
          userEmail="admin@airayouthchallenge.ai"
        />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </div>
    )
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-[#F7F8FA]">
        <TopNav
          role="organiser"
          userName="Organiser Admin"
          userEmail="admin@airayouthchallenge.ai"
        />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </div>
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
    <div className="min-h-screen bg-[#F7F8FA]">
      <TopNav role="organiser" userName={displayName} userEmail={user.email ?? ''} />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
