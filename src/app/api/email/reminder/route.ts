import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

type ReminderRequestBody = {
  to?: string
  judgeName?: string
  competitionName?: string
  deadline?: string | null
  pendingCount?: number
  loginUrl?: string
}

function formatDeadline(deadline?: string | null): string | null {
  if (!deadline) return null
  const d = new Date(deadline)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReminderRequestBody
    const to = (body.to ?? '').trim()
    if (!to) return NextResponse.json({ ok: false, error: 'Missing "to"' }, { status: 400 })

    const judgeName = (body.judgeName ?? 'Judge').trim() || 'Judge'
    const competitionName = (body.competitionName ?? 'AISG Judging Portal').trim() || 'AISG Judging Portal'
    const pendingCount = Number.isFinite(body.pendingCount) ? Math.max(0, Number(body.pendingCount)) : null
    const deadlineText = formatDeadline(body.deadline)
    const loginUrl = (body.loginUrl ?? '').trim()

    const subject = pendingCount === null
      ? `Reminder: judging pending for ${competitionName}`
      : `Reminder: ${pendingCount} judging task${pendingCount === 1 ? '' : 's'} pending (${competitionName})`

    const lines: string[] = []
    lines.push(`Hi ${judgeName},`)
    lines.push('')
    lines.push(`This is a gentle reminder to complete your judging for ${competitionName}.`)
    if (pendingCount !== null) lines.push(`Pending assignments: ${pendingCount}`)
    if (deadlineText) lines.push(`Deadline: ${deadlineText}`)
    if (loginUrl) {
      lines.push('')
      lines.push(`Login: ${loginUrl}`)
    }
    lines.push('')
    lines.push('Thank you!')

    const text = lines.join('\n')
    const html = [
      `<p>Hi ${escapeHtml(judgeName)},</p>`,
      `<p>This is a gentle reminder to complete your judging for <strong>${escapeHtml(competitionName)}</strong>.</p>`,
      pendingCount !== null ? `<p><strong>Pending assignments:</strong> ${pendingCount}</p>` : '',
      deadlineText ? `<p><strong>Deadline:</strong> ${escapeHtml(deadlineText)}</p>` : '',
      loginUrl
        ? `<p><a href="${escapeAttr(loginUrl)}">Open the judging portal</a></p>`
        : '',
      '<p>Thank you!</p>',
    ].filter(Boolean).join('')

    const result = await sendEmail({ to, subject, text, html })
    return NextResponse.json({ ok: true, result })
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

