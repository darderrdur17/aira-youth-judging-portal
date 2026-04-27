/** Maps Supabase Auth OTP / magic-link errors to clearer setup guidance. */
export function mapOtpErrorMessage(message: string): string {
  const m = message.toLowerCase()
  if (
    m.includes('confirmation email') ||
    m.includes('error sending') ||
    m.includes('email rate limit')
  ) {
    return (
      'Could not send the login email. In the Supabase Dashboard open Authentication → SMTP (add a provider such as Resend) ' +
      'and confirm Site URL / redirect URLs; then check Authentication → Logs for the exact error.'
    )
  }
  return message
}
