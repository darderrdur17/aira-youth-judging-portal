import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { DEMO_SESSION_COOKIE } from '@/lib/auth/demo-session'

export async function updateSession(request: NextRequest) {
  // Staging / walkthrough only: skip auth checks entirely (do NOT enable in production).
  if (process.env.NEXT_PUBLIC_ENABLE_UNAUTHENTICATED_DEMO === 'true') {
    return NextResponse.next({ request })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase env vars are missing (common on first Vercel deploy),
  // don't crash the entire app. Allow requests through (demo mode).
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  const { pathname: earlyPath } = request.nextUrl

  // Always allow the demo-session API and public assets through before any Supabase call
  if (earlyPath.startsWith('/api/auth/demo')) {
    return NextResponse.next({ request })
  }

  // Demo cookie fast-path: bypass Supabase entirely for /judge and /organiser
  const demoFast = request.cookies.get(DEMO_SESSION_COOKIE)?.value === '1'
  if (demoFast && (earlyPath.startsWith('/judge') || earlyPath.startsWith('/organiser'))) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes that don't require auth
  const publicRoutes = ['/', '/auth/login', '/auth/callback', '/vote']
  const isPublic =
    publicRoutes.some((r) => pathname === r || pathname.startsWith('/auth/')) ||
    pathname.startsWith('/vote')

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    if (pathname.startsWith('/organiser')) {
      url.searchParams.set('role', 'organiser')
    } else {
      url.searchParams.set('role', 'judge')
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
