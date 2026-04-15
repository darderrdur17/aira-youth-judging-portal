import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { sanitizeNextPath } from '@/lib/auth/sanitize-next'
import {
  DEMO_SESSION_COOKIE,
  DEMO_ROLE_COOKIE,
  demoCookieOptions,
} from '@/lib/auth/demo-session'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/auth/login?error=missing_env', request.url))
  }

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const nextRaw = requestUrl.searchParams.get('next')
  const nextPath = sanitizeNextPath(nextRaw, '/judge/dashboard')

  const redirectTarget = new URL(nextPath, requestUrl.origin)

  const response = NextResponse.redirect(redirectTarget)

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url))
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url))
  }

  // Link invited judges (rows with matching email, user_id null) to this auth user
  const { error: linkError } = await supabase.rpc('link_judge_to_user')
  if (linkError) {
    // RPC may not exist until SQL migration is applied — login still succeeds
    console.warn('link_judge_to_user:', linkError.message)
  }

  // Real session replaces demo cookie
  response.cookies.set(DEMO_SESSION_COOKIE, '', demoCookieOptions(0))
  response.cookies.set(DEMO_ROLE_COOKIE, '', demoCookieOptions(0))

  return response
}
