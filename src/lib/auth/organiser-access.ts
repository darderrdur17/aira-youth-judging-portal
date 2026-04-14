import type { SupabaseClient } from '@supabase/supabase-js'

const DEFAULT_COMPETITION_SLUG = 'airayc-2026'

function organiserAllowlist(): string[] {
  const raw = process.env.ORGANISER_EMAILS ?? ''
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export async function isOrganiserUser(
  supabase: SupabaseClient,
  userId: string,
  email: string | undefined
): Promise<boolean> {
  if (email && organiserAllowlist().includes(email.toLowerCase())) {
    return true
  }

  const { data } = await supabase
    .from('competitions')
    .select('id')
    .eq('slug', DEFAULT_COMPETITION_SLUG)
    .eq('created_by', userId)
    .maybeSingle()

  return Boolean(data)
}
