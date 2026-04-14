import { NextResponse } from 'next/server'
import {
  DEMO_SESSION_COOKIE,
  DEMO_ROLE_COOKIE,
  demoCookieOptions,
} from '@/lib/auth/demo-session'

const WEEK = 60 * 60 * 24 * 7

/** Start UI demo session (cookie). Does not create a Supabase user. */
export async function POST(request: Request) {
  let role: 'judge' | 'organiser' = 'judge'
  try {
    const body = (await request.json()) as { role?: string }
    if (body.role === 'organiser') role = 'organiser'
  } catch {
    // default judge
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(DEMO_SESSION_COOKIE, '1', demoCookieOptions(WEEK))
  res.cookies.set(DEMO_ROLE_COOKIE, role, demoCookieOptions(WEEK))
  return res
}

/** Clear demo session (call on sign-out or when switching to real auth). */
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  const expired = demoCookieOptions(0)
  res.cookies.set(DEMO_SESSION_COOKIE, '', expired)
  res.cookies.set(DEMO_ROLE_COOKIE, '', expired)
  return res
}
