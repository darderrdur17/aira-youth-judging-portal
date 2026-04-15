import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { to?: string }
    const to = (body.to ?? '').trim()
    if (!to) {
      return NextResponse.json({ ok: false, error: 'Missing "to"' }, { status: 400 })
    }

    const result = await sendEmail({
      to,
      subject: 'Test email — AISG Judging Portal',
      text:
        'This is a test email from the AISG Judging Portal.\n\n' +
        'If you received this, your Resend configuration is working.',
      html:
        '<p>This is a <strong>test email</strong> from the AISG Judging Portal.</p>' +
        '<p>If you received this, your Resend configuration is working.</p>',
    })

    return NextResponse.json({ ok: true, result })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

