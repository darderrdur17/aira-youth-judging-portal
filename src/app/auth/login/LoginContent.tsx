'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Mail, ArrowLeft, CheckCircle, Loader2, Users, AlertCircle, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { DEMO_JUDGES } from '@/lib/demo-data'
import { useSessionStore } from '@/store/sessionStore'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { sanitizeNextPath } from '@/lib/auth/sanitize-next'
import { mapOtpErrorMessage } from '@/lib/auth/otp-errors'

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: 'Could not verify the login link. Request a new magic link and try again.',
  no_code: 'Missing login code. Open the link from your email, or request a new magic link.',
  missing_env: 'Server is missing Supabase configuration. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.',
  not_invited:
    'No judge invitation found for this account. Ask the organiser to add your email under Judges, then try logging in again.',
  forbidden:
    'This account is not allowed to access the organiser portal. Set competitions.created_by to your user id, or add your email to ORGANISER_EMAILS in Vercel.',
}

export default function LoginContent() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') ?? 'judge'
  const session = useSessionStore()
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const isOrganiser = role === 'organiser'
  const errorCode = searchParams.get('error')
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] ?? `Something went wrong (${errorCode}).` : null

  const postLoginPath = sanitizeNextPath(
    isOrganiser ? '/organiser/dashboard' : '/judge/dashboard',
    '/judge/dashboard'
  )

  const startPortalDemo = async (role: 'judge' | 'organiser') => {
    const res = await fetch('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    })
    if (!res.ok) {
      throw new Error('Could not start demo session')
    }
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    try {
      if (isOrganiser) {
        await startPortalDemo('organiser')
        session.setDemoOrganiser()
        window.location.href = '/organiser/dashboard'
      } else {
        const j = DEMO_JUDGES[0]
        await startPortalDemo('judge')
        session.setDemoJudge({ id: j.id, name: j.name, email: j.email })
        window.location.href = '/judge/dashboard'
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Demo login failed')
      setDemoLoading(false)
    }
  }

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    if (!isSupabaseConfigured()) {
      toast.error(
        'Supabase is not configured in this environment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or use Demo login.'
      )
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(postLoginPath)}`

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        toast.error(mapOtpErrorMessage(error.message))
        setLoading(false)
        return
      }

      setSent(true)
      toast.success('Check your email for the magic link.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send magic link.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    if (!isSupabaseConfigured()) {
      toast.error(
        'Supabase is not configured. Add environment variables or use Demo login.'
      )
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('invalid login credentials')) {
          toast.error('Incorrect email or password. If you have not created a password yet, use Magic link or Sign up.')
        } else if (msg.includes('email not confirmed')) {
          toast.error('Confirm your email first (check your inbox), then try again.')
        } else {
          toast.error(error.message)
        }
        setLoading(false)
        return
      }

      try {
        await supabase.rpc('link_judge_to_user')
      } catch {
        // optional RPC
      }

      toast.success('Signed in. Redirecting…')
      window.location.href = postLoginPath
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed.')
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
            <div className="w-6 h-6 rounded bg-[#1D9E8B] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">AJ</span>
            </div>
            <span className="text-white text-sm font-semibold">AISG Judging Portal</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className={`px-6 py-5 border-b border-gray-100 ${isOrganiser ? 'bg-[#1A2B3C]' : 'bg-[#E1F5EE]'}`}>
              <Badge
                className={`mb-2 text-xs font-medium ${
                  isOrganiser
                    ? 'bg-[#2A3F52] text-white border border-[#3D5669]'
                    : 'bg-white text-[#0F6E56] border border-[#1D9E8B]'
                }`}
              >
                {isOrganiser ? 'Organiser Portal' : 'Judge Portal'}
              </Badge>
              <h1 className={`text-xl font-bold ${isOrganiser ? 'text-white' : 'text-[#1A2B3C]'}`}>
                {isOrganiser ? 'Organiser Login' : 'Judge Login'}
              </h1>
              <p className={`text-sm mt-1 ${isOrganiser ? 'text-gray-300' : 'text-[#0F6E56]'}`}>
                {isOrganiser
                  ? 'Sign in with a magic link or email and password. New here? Create an account first.'
                  : 'Magic link, password, or demo — your organiser must invite your email for full access.'}
              </p>
            </div>

            <div className="p-6">
              {errorMessage && (
                <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {!isSupabaseConfigured() && (
                <div className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <AlertCircle size={16} className="shrink-0 text-amber-600" />
                  <p>
                    Supabase environment variables are missing. Magic links are disabled until you add{' '}
                    <code className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-950 font-mono text-[11px]">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                    <code className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-950 font-mono text-[11px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (e.g. in Vercel).
                  </p>
                </div>
              )}

              {sent ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-[#1D9E8B]" size={28} />
                  </div>
                  <h3 className="font-semibold text-[#1A2B3C] mb-1">Check your email</h3>
                  <p className="text-gray-500 text-sm">
                    We sent a secure login link to <strong>{email}</strong>. The link expires in 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 w-full border-[#1D9E8B] text-[#1D9E8B] hover:bg-[#E1F5EE]"
                    onClick={() => setSent(false)}
                  >
                    Use a different email
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={loginMethod === 'otp' ? handleMagicLinkSubmit : handlePasswordLogin}
                  className="space-y-4"
                >
                  <div
                    className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1"
                    role="tablist"
                    aria-label="Sign-in method"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={loginMethod === 'otp'}
                      onClick={() => setLoginMethod('otp')}
                      className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
                        loginMethod === 'otp'
                          ? 'bg-white text-[#1A2B3C] shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Magic link
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={loginMethod === 'password'}
                      onClick={() => setLoginMethod('password')}
                      className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
                        loginMethod === 'password'
                          ? 'bg-white text-[#1A2B3C] shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Email &amp; password
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm text-[#1A2B3C] font-medium">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder={isOrganiser ? 'organiser@example.com' : 'judge@example.com'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 border-gray-200 focus-visible:ring-[#1D9E8B]"
                        required />
                    </div>
                  </div>

                  {loginMethod === 'password' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm text-[#1A2B3C] font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <Input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 border-gray-200 focus-visible:ring-[#1D9E8B]"
                          required={loginMethod === 'password'}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !email.trim() ||
                      !isSupabaseConfigured() ||
                      (loginMethod === 'password' && !password)
                    }
                    className="w-full bg-[#1D9E8B] hover:bg-[#0F6E56] text-white gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        {loginMethod === 'otp' ? 'Sending link...' : 'Signing in...'}
                      </>
                    ) : loginMethod === 'otp' ? (
                      <>
                        <Mail size={15} />
                        Send Magic Link
                      </>
                    ) : (
                      <>
                        <Lock size={15} />
                        Sign in
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-gray-500">
                    New user?{' '}
                    <Link
                      href={`/auth/sign-up?role=${isOrganiser ? 'organiser' : 'judge'}`}
                      className="text-[#1D9E8B] font-medium hover:underline"
                    >
                      Create an account
                    </Link>
                  </p>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-gray-400">or try demo</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={demoLoading}
                    onClick={() => void handleDemoLogin()}
                    className="w-full gap-2 border-dashed border-[#1D9E8B] text-[#1D9E8B] hover:bg-[#E1F5EE] text-sm"
                  >
                    {demoLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Starting demo…
                      </>
                    ) : (
                      <>Enter {isOrganiser ? 'Organiser' : 'Judge'} Demo (no login required)</>
                    )}
                  </Button>

                  {!isOrganiser && (
                    <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={14} className="text-[#1D9E8B]" />
                        <p className="text-xs font-semibold text-[#1A2B3C]">Demo judge accounts</p>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2">
                        For real login, the organiser must invite the same email in Supabase first. Demo picks set a
                        short-lived browser session so you can try the UI without magic link (no Supabase user).
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {DEMO_JUDGES.map((j) => (
                          <button
                            key={j.id}
                            type="button"
                            disabled={demoLoading}
                            onClick={() => {
                              void (async () => {
                                setDemoLoading(true)
                                try {
                                  await startPortalDemo('judge')
                                  session.setDemoJudge({ id: j.id, name: j.name, email: j.email })
                                  toast.success(`Switched demo judge: ${j.name}`)
                                  window.location.href = '/judge/dashboard'
                                } catch (e) {
                                  toast.error(e instanceof Error ? e.message : 'Demo login failed')
                                  setDemoLoading(false)
                                }
                              })()
                            }}
                            className="text-left bg-white border border-gray-200 rounded-md px-3 py-2 hover:border-[#1D9E8B] hover:bg-[#E1F5EE] transition-colors disabled:opacity-50"
                          >
                            <p className="text-xs font-semibold text-[#1A2B3C]">{j.name}</p>
                            <p className="text-[10px] text-gray-400">{j.email}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              )}

              <p className="text-center text-xs text-gray-400 mt-4">
                Powered by{' '}
                <span className="text-[#1D9E8B]">AI Singapore</span> ·{' '}
                <span className="text-[#1D9E8B]">ASEAN Foundation</span> ·{' '}
                <span className="text-[#1D9E8B]">Google.org</span>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            {isOrganiser ? (
              <>
                Are you a judge?{' '}
                <Link href="/auth/login?role=judge" className="text-[#1D9E8B] hover:underline">
                  Judge login →
                </Link>
              </>
            ) : (
              <>
                Are you an organiser?{' '}
                <Link href="/auth/login?role=organiser" className="text-[#1D9E8B] hover:underline">
                  Organiser login →
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
