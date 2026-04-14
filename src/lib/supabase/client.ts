import { createBrowserClient } from '@supabase/ssr'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export { isSupabaseConfigured } from '@/lib/supabase/config'

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables (Vercel Project → Settings → Environment Variables)."
    )
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
