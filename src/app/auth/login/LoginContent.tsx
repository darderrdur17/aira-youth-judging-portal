'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = searchParams.get('role') ?? 'judge'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const isOrganiser = role === 'organiser'

  const handleDemoLogin = () => {
    if (isOrganiser) {
      router.push('/organiser/dashboard')
    } else {
      router.push('/judge/dashboard')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
    toast.success('Magic link sent! Check your inbox.')
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
                className={`mb-2 text-xs ${
                  isOrganiser
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-[#1D9E8B]/20 text-[#0F6E56] border-[#1D9E8B]/30'
                }`}
              >
                {isOrganiser ? 'Organiser Portal' : 'Judge Portal'}
              </Badge>
              <h1 className={`text-xl font-bold ${isOrganiser ? 'text-white' : 'text-[#1A2B3C]'}`}>
                {isOrganiser ? 'Organiser Login' : 'Judge Login'}
              </h1>
              <p className={`text-sm mt-1 ${isOrganiser ? 'text-gray-300' : 'text-[#0F6E56]'}`}>
                {isOrganiser
                  ? 'Access competition management, progress tracking, and results export.'
                  : 'Enter your email to receive a secure magic link.'}
              </p>
            </div>

            <div className="p-6">
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm text-[#1A2B3C] font-medium">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <Input
                        id="email"
                        type="email"
                        placeholder={isOrganiser ? 'organiser@example.com' : 'judge@example.com'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 border-gray-200 focus-visible:ring-[#1D9E8B]"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full bg-[#1D9E8B] hover:bg-[#0F6E56] text-white gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      <>
                        <Mail size={15} />
                        Send Magic Link
                      </>
                    )}
                  </Button>

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
                    onClick={handleDemoLogin}
                    className="w-full border-dashed border-[#1D9E8B] text-[#1D9E8B] hover:bg-[#E1F5EE] text-sm"
                  >
                    Enter {isOrganiser ? 'Organiser' : 'Judge'} Demo (no login required)
                  </Button>
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
