import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'

type Body = {
  email?: string
  name?: string
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
    const name = (body.name ?? '').trim()
    const nextPath = (body.nextPath ?? '/judge/dashboard').trim() || '/judge/dashboard'

    if (!email || !name) {
      return NextResponse.json({ ok: false, error: 'Missing name or email' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Create (or update) a judge invitation row so the app recognises this account after login.
    // We keep competition_id null here because this repo currently runs organiser/judge/project data in demo stores.
    // When you fully wire organiser flows to Supabase, set competition_id to the active competition UUID.
    const { error: upsertErr } = await admin
      .from('judges')
      .upsert(
        {
          email,
          name,
          is_active: true,
          user_id: null,
          competition_id: null,
        },
        { onConflict: 'email' }
      )

    if (upsertErr) {
      return NextResponse.json({ ok: false, error: upsertErr.message }, { status: 500 })
    }

    // Generate a Supabase magic link and send it via Resend (works even when Supabase has no SMTP UI).
    const origin = originFromRequest(request)
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo },
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    const actionLink = data?.properties?.action_link
    if (!actionLink) {
      return NextResponse.json({ ok: false, error: 'No action link generated' }, { status: 500 })
    }

    const subject = 'Your judge login link — AISG Judging Portal'
    const text =
      `Hi ${name},\n\n` +
      `Click to sign in:\n${actionLink}\n\n` +
      `If you did not request this email, you can ignore it.`
    const html =
      `<p>Hi ${escapeHtml(name)},</p>` +
      `<p><a href="${escapeAttr(actionLink)}">Click here to sign in</a></p>` +
      `<p style="color:#6b7280;font-size:12px">If you did not request this email, you can ignore it.</p>`

    await sendEmail({ to: email, subject, text, html })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function escapeAttr(input: string): string {
  return escapeHtml(input)
}

