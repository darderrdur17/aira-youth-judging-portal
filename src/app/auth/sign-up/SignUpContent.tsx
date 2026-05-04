'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle, Lock, User } from 'lucide-react'
import { toast } from 'sonner'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { sanitizeNextPath } from '@/lib/auth/sanitize-next'

function mapSignUpError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'This email already has an account. Use login with password or magic link instead.'
  }
  if (
    m.includes('error sending confirmation email') ||
    (m.includes('confirmation') && m.includes('email') && (m.includes('smtp') || m.includes('send')))
  ) {
    return (
      'Supabase could not send the confirmation email. In Supabase open Authentication → SMTP and configure an email provider ' +
      '(e.g. Resend SMTP), ensure your sender domain/address is verified, and confirm the Site URL / redirect URLs. ' +
      'Then check Authentication → Logs for the detailed error.'
    )
  }
  if (m.includes('password')) {
    return 'Password does not meet requirements. Use at least 8 characters.'
  }
  if (m.includes('email') && m.includes('invalid')) {
    return 'Enter a valid email address.'
  }
  return message
}

export default function SignUpContent() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') ?? 'judge'
  const isOrganiser = role === 'organiser'

  const postLoginPath = sanitizeNextPath(
    isOrganiser ? '/organiser/dashboard' : '/judge/dashboard',
    '/judge/dashboard'
  )

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    if (!isSupabaseConfigured()) {
      toast.error(
        'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or use Demo login from the login page.'
      )
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const origin = window.location.origin
      const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(postLoginPath)}`

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: displayName.trim() || undefined,
            app_role_hint: isOrganiser ? 'organiser' : 'judge',
          },
        },
      })

      if (error) {
        toast.error(mapSignUpError(error.message))
        setLoading(false)
        return
      }

      // If email confirmation is off, Supabase returns a session immediately
      if (data.session) {
        try {
          await supabase.rpc('link_judge_to_user')
        } catch {
          // RPC optional until migration applied
        }
        toast.success('Account created. Redirecting…')
        window.location.href = postLoginPath
        return
      }

      setSent(true)
      toast.success('Check your email to confirm your account.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <div className="bg-[#1A2B3C] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm">
            <ArrowLeft size={14} />
            Back
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#E85A14] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">AJ</span>
            </div>
            <span className="text-white text-sm font-semibold">AISG Judging Portal</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="auth-shell-animate bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className={`px-6 py-5 border-b border-gray-100 ${isOrganiser ? 'bg-[#1A2B3C]' : 'bg-[#FFF3EF]'}`}>
              <Badge
                className={`mb-2 text-xs font-medium ${
                  isOrganiser
                    ? 'bg-[#2A3F52] text-white border border-[#3D5669]'
                    : 'bg-white text-[#C2410C] border border-[#E85A14]'
                }`}
              >
                Create account · {isOrganiser ? 'Organiser' : 'Judge'}
              </Badge>
              <h1 className={`text-xl font-bold ${isOrganiser ? 'text-white' : 'text-[#1A2B3C]'}`}>
                Sign up
              </h1>
              <p className={`text-sm mt-1 ${isOrganiser ? 'text-gray-300' : 'text-gray-600'}`}>
                {isOrganiser
                  ? 'Create your login. You also need organiser access (allowlisted email or competition owner) to open the organiser portal.'
                  : 'Create your login with email and password. Your organiser must add this same email under Judges so you can score after you confirm your email.'}
              </p>
            </div>

            <div className="p-6">
              {!isSupabaseConfigured() && (
                <div className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <AlertCircle size={16} className="shrink-0 text-amber-600" />
                  <p>
                    Supabase environment variables are missing. Configure the project to enable real sign-up, or use{' '}
                    <Link href={`/auth/login?role=${role}`} className="font-medium text-amber-950 underline">
                      Demo login
                    </Link>
                    .
                  </p>
                </div>
              )}

              {sent ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-[#FFF3EF] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-[#E85A14]" size={28} />
                  </div>
                  <h3 className="font-semibold text-[#1A2B3C] mb-1">Confirm your email</h3>
                  <p className="text-gray-500 text-sm">
                    We sent a link to <strong>{email}</strong>. Open it to activate your account, then you can sign in
                    with your password or request a magic link.
                  </p>
                  <Link
                    href={`/auth/login?role=${role}`}
                    className="mt-4 flex w-full items-center justify-center rounded-lg border border-[#E85A14] bg-white px-4 py-2 text-sm font-medium text-[#E85A14] hover:bg-[#FFF3EF]"
                  >
                    Back to login
                  </Link>
                </div>
              ) : (
                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="su-name" className="text-sm text-[#1A2B3C] font-medium">
                      Display name <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <Input
                        id="su-name"
                        type="text"
                        autoComplete="name"
                        placeholder="e.g. Dr. Sarah Chen"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-9 border-gray-200 focus-visible:ring-[#E85A14]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="su-email" className="text-sm text-[#1A2B3C] font-medium">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <Input
                        id="su-email"
                        type="email"
                        autoComplete="email"
                        placeholder={isOrganiser ? 'organiser@example.com' : 'judge@example.com'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 border-gray-200 focus-visible:ring-[#E85A14]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="su-password" className="text-sm text-[#1A2B3C] font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <Input
                        id="su-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 border-gray-200 focus-visible:ring-[#E85A14]"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="su-confirm" className="text-sm text-[#1A2B3C] font-medium">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <Input
                        id="su-confirm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-9 border-gray-200 focus-visible:ring-[#E85A14]"
                        required minLength={8}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !isSupabaseConfigured()}
                    className="w-full bg-[#E85A14] hover:bg-[#C2410C] text-white gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      <>Create account</>
                    )}
                  </Button>
                </form>
              )}

              <p className="text-center text-xs text-gray-500 mt-4">
                Already have an account?{' '}
                <Link href={`/auth/login?role=${role}`} className="text-[#E85A14] hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
