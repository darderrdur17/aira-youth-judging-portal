import type { SupabaseClient } from '@supabase/supabase-js'

/** True if this user is linked to at least one judge row (after invite + magic link). */
export async function hasJudgeProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data: direct } = await supabase
    .from('judges')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (direct) return true

  await supabase.rpc('link_judge_to_user')

  const { data: linked } = await supabase
    .from('judges')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  return Boolean(linked)
}
