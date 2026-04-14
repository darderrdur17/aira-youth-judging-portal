'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, Bell, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'


interface TopNavProps {
  role: 'judge' | 'organiser'
  userName?: string
  userEmail?: string
  competitionName?: string
}

export function TopNav({
  role,
  userName = 'Dr. Sarah Chen',
  userEmail = 'sarah.chen@example.com',
  competitionName = 'AI Ready ASEAN Youth Challenge 2026',
}: TopNavProps) {
  const pathname = usePathname()
  const isOrganiser = role === 'organiser'

  const judgeLinks = [
    { label: 'Dashboard', href: '/judge/dashboard' },
  ]
  const organiserLinks = [
    { label: 'Dashboard', href: '/organiser/dashboard' },
    { label: 'Projects', href: '/organiser/projects' },
    { label: 'Judges', href: '/organiser/judges' },
    { label: 'Assignments', href: '/organiser/assignments' },
    { label: 'Results', href: '/organiser/results' },
    { label: 'Calibration', href: '/organiser/calibration' },
    { label: 'Audit', href: '/organiser/audit' },
    { label: 'Setup', href: '/organiser/setup' },
  ]
  const links = isOrganiser ? organiserLinks : judgeLinks

  return (
    <header className="bg-[#1A2B3C] border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-4">
          {/* Logo */}
          <Link href={isOrganiser ? '/organiser/dashboard' : '/judge/dashboard'} className="flex items-center gap-2 mr-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-md bg-[#1D9E8B] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">AJ</span>
            </div>
            <span className="text-white text-sm font-semibold hidden sm:block">Judging Portal</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-hide">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className="hidden sm:flex bg-[#1D9E8B]/20 text-[#6DDFD0] border-[#1D9E8B]/30 text-[10px]">
              {isOrganiser ? 'ORGANISER' : 'JUDGE'}
            </Badge>

            <button className="w-8 h-8 rounded-md text-gray-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors">
              <Bell size={15} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-xs">
                <div className="w-7 h-7 rounded-full bg-[#1D9E8B] flex items-center justify-center text-white text-[10px] font-bold">
                  {userName.charAt(0)}
                </div>
                <span className="hidden sm:block max-w-24 truncate">{userName.split(' ')[0]}</span>
                <ChevronDown size={12} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-gray-600">
                  {competitionName}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 text-xs gap-2 cursor-pointer" onClick={() => { window.location.href = '/' }}>
                  <LogOut size={13} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
