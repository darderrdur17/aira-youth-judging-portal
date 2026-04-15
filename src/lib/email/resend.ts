import { Resend } from 'resend'

export type SendEmailArgs = {
  to: string
  subject: string
  text: string
  html?: string
}

function getResendFrom(): string {
  const from = process.env.RESEND_FROM
  if (!from) {
    throw new Error('Missing RESEND_FROM (e.g. "AISG Judging Portal <no-reply@yourdomain.com>")')
  }
  return from
}

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    throw new Error('Missing RESEND_API_KEY')
  }
  return new Resend(key)
}

export async function sendEmail(args: SendEmailArgs) {
  const resend = getResendClient()
  const from = getResendFrom()

  return await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    text: args.text,
    ...(args.html ? { html: args.html } : null),
  })
}

