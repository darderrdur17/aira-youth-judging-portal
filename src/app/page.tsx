import Link from 'next/link'
import { Users, BarChart3, Heart, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--aira-canvas)] lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-[#E85A14] px-6 py-10 text-white sm:px-12 sm:py-14 lg:min-h-screen">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">AIRA / AI Ready ASEAN</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">2026: AIRA Youth Challenge</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90">
            Judging portal — manage registrations-style workflows, assign judges, review submissions, and run the
            People&apos;s Choice vote. Built for organisers, judges, and the public.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/90">
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">1</span>
              Organisers — projects, judges, assignments, results
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">2</span>
              Judges — score criteria per assignment
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">3</span>
              Public — up to 3 votes for People&apos;s Choice
            </li>
          </ul>
        </div>
        <p className="mt-10 text-xs text-white/70 lg:mt-0">IMDA · AI Singapore · ASEAN Foundation · Google.org</p>
      </div>

      <div className="flex flex-col justify-center px-4 py-10 sm:px-10 lg:py-14">
        <div className="mx-auto w-full max-w-md space-y-4 animate-fade-in-up">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-[#1A2B3C]">Choose a portal</h2>
            <p className="text-sm text-gray-500">Same look as the AIRA admin dashboards — solid colours, clear hierarchy.</p>
          </div>

          <Link href="/auth/login?role=judge" className="block">
            <div className="aira-card group hover-lift flex items-center gap-4 p-4 shadow-md transition-all">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8F7F4] text-[#1D9E8B]">
                <Users size={24} />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-semibold text-[#1A2B3C]">Judge portal</p>
                <p className="text-xs text-gray-500">Score assigned projects</p>
              </div>
              <ChevronRight className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5" size={18} />
            </div>
          </Link>

          <Link href="/auth/login?role=organiser" className="block">
            <div className="aira-card group hover-lift flex items-center gap-4 p-4 shadow-md transition-all">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF1E6] text-[#E85A14]">
                <BarChart3 size={24} />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-semibold text-[#1A2B3C]">Organiser portal</p>
                <p className="text-xs text-gray-500">Projects, judges, assignments, results</p>
              </div>
              <ChevronRight className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5" size={18} />
            </div>
          </Link>

          <Link href="/vote" className="block">
            <div className="aira-card group hover-lift flex items-center gap-4 border-pink-100 bg-white p-4 shadow-md transition-all">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                <Heart size={24} />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-semibold text-[#1A2B3C]">People&apos;s choice vote</p>
                <p className="text-xs text-gray-500">Public voting — no login</p>
              </div>
              <ChevronRight className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5" size={18} />
            </div>
          </Link>

          <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-gray-500">
            <span>Have an account?</span>
            <Link href="/auth/login?role=judge" className="font-medium text-[#E85A14] hover:underline">
              Judge login
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/auth/login?role=organiser" className="font-medium text-[#E85A14] hover:underline">
              Organiser login
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/auth/sign-up?role=judge" className="font-medium text-gray-600 hover:underline">
              Sign up
            </Link>
          </div>

          <p className="text-[11px] text-gray-400">
            Try the UI without email: use <strong className="text-gray-600">Demo login</strong> on the login page.
          </p>
        </div>
      </div>
    </div>
  )
}
