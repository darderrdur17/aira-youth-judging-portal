import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'
import { createAdminClient } from '@/lib/supabase/admin'

type Body = {
  email?: string
  nextPath?: string
}

function originFromRequest(req: Request): string {
  const url = new URL(req.url)
  return url.origin
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const email = (body.email ?? '').trim().toLowerCase()
    const nextPath = (body.nextPath ?? '/judge/dashboard').trim() || '/judge/dashboard'
    if (!email) return NextResponse.json({ ok: false, error: 'Missing email' }, { status: 400 })

    const origin = originFromRequest(request)
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`

    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo,
      },
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    const actionLink = data?.properties?.action_link
    if (!actionLink) {
      return NextResponse.json({ ok: false, error: 'No action link generated' }, { status: 500 })
    }

    const subject = 'Your magic login link — AISG Judging Portal'
    const text =
      `Click to sign in:\n${actionLink}\n\n` +
      `If you did not request this email, you can ignore it.`
    const html =
      `<p>Click to sign in:</p>` +
      `<p><a href="${escapeAttr(actionLink)}">Sign in to AISG Judging Portal</a></p>` +
      `<p style="color:#6b7280;font-size:12px">If you did not request this email, you can ignore it.</p>`

    await sendEmail({ to: email, subject, text, html })

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

function escapeAttr(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

