import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, BarChart3, Heart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <header className="border-b border-gray-200 bg-white shadow-[0_1px_0_rgba(26,43,60,0.06)]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#E85A14] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">AJ</span>
            </div>
            <span className="font-semibold text-[#1A2B3C] text-sm truncate">AISG Judging Portal</span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5 text-[11px] sm:text-xs">
            <Link href="/auth/login?role=judge" className="text-[#E85A14] font-medium hover:underline px-1">
              Judge login
            </Link>
            <span className="text-gray-300 hidden sm:inline">·</span>
            <Link href="/auth/login?role=organiser" className="text-[#E85A14] font-medium hover:underline px-1">
              Organiser login
            </Link>
            <span className="text-gray-300 hidden sm:inline">·</span>
            <Link href="/auth/sign-up?role=judge" className="text-gray-500 hover:text-[#E85A14] px-1">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6 text-center animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2B3C]">Choose a portal</h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Judge scoring, organiser administration, or public voting.
            </p>
          </div>

          <div className="grid gap-3">
            <Link href="/auth/login?role=judge" className="block">
              <Button
                size="lg"
                className="w-full h-auto py-4 gap-3 bg-[#E85A14] hover:bg-[#C2410C] text-white justify-center shadow-sm"
              >
                <Users size={22} className="shrink-0" />
                <span className="text-left">
                  <span className="block font-semibold">Judge portal</span>
                  <span className="block text-xs font-normal text-[#D2F7EF] opacity-95">
                    Log in to score assigned projects
                  </span>
                </span>
              </Button>
            </Link>

            <Link href="/auth/login?role=organiser" className="block">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-auto py-4 gap-3 border-gray-200 bg-white text-[#1A2B3C] hover:bg-orange-50 hover:border-[#E85A14] justify-center shadow-sm"
              >
                <BarChart3 size={22} className="shrink-0 text-[#E85A14]" />
                <span className="text-left">
                  <span className="block font-semibold">Organiser portal</span>
                  <span className="block text-xs font-normal text-gray-500">
                    Projects, judges, assignments, results
                  </span>
                </span>
              </Button>
            </Link>

            <Link href="/vote" className="block">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-auto py-4 gap-3 border-pink-200 bg-white text-pink-700 hover:bg-pink-50 justify-center shadow-sm"
              >
                <Heart size={22} className="shrink-0" />
                <span className="text-left">
                  <span className="block font-semibold">People&apos;s choice vote</span>
                  <span className="block text-xs font-normal text-pink-600/90">
                    Public voting (no login)
                  </span>
                </span>
              </Button>
            </Link>
          </div>

          <p className="text-[11px] text-gray-400">
            Try the UI without email: use <strong className="text-gray-600">Demo login</strong> on the login page.
          </p>
        </div>
      </main>
    </div>
  )
}
