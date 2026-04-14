/** HttpOnly cookie: user clicked “Enter demo” — bypasses Supabase session for /judge and /organiser only. Cleared on real login / sign-out. */
export const DEMO_SESSION_COOKIE = 'aisg_portal_demo'
export const DEMO_ROLE_COOKIE = 'aisg_portal_demo_role'

export function demoCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  }
}
