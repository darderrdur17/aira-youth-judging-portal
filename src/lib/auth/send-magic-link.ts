'use client'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { sanitizeNextPath } from '@/lib/auth/sanitize-next'
import { mapOtpErrorMessage } from '@/lib/auth/otp-errors'

/**
 * Sends a Supabase magic link to the address (creates the user if needed).
 * The email is delivered by Supabase using your project SMTP settings.
 */
export async function sendMagicLinkToEmail(
  email: string,
  nextPath: string = '/judge/dashboard'
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        'Supabase is not configured in this deployment (missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY). Add them in Vercel to send real magic links.',
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  if (!origin) {
    return { ok: false, message: 'Cannot send email from this context.' }
  }

  const supabase = createClient()
  const safeNext = sanitizeNextPath(nextPath, '/judge/dashboard')
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,
      emailRedirectTo,
    },
  })

  if (error) {
    return { ok: false, message: mapOtpErrorMessage(error.message) }
  }

  return { ok: true }
}
