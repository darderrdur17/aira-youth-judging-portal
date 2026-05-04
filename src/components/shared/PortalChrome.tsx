'use client'

import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Link2,
  BarChart3,
  SlidersHorizontal,
  ScrollText,
  Settings,
  ChevronDown,
  LogOut,
  Bell,
  Share2,
  PanelLeftClose,
  PanelLeft,
  Menu,
  LayoutList,
  Heart,
  Home,
} from 'lucide-react'
import { toast } from 'sonner'

const STORAGE_KEY = 'aira-sidebar-collapsed'

function NavLink({
  href,
  active,
  icon: Icon,
  children,
  collapsed,
}: {
  href: string
  active: boolean
  icon: ComponentType<{ className?: string; size?: number }>
  children: ReactNode
  collapsed: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-white text-[#C2410C] shadow-sm'
          : 'text-white hover:bg-white/15',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? String(children) : undefined}
    >
      <Icon className={cn('shrink-0', active ? 'text-[#E85A14]' : 'text-white/95')} size={20} />
      {!collapsed && <span className="truncate">{children}</span>}
    </Link>
  )
}

export type PortalChromeProps = {
  role: 'judge' | 'organiser'
  children: React.ReactNode
  userName?: string
  userEmail?: string
  competitionName?: string
}

export function PortalChrome({
  role,
  children,
  userName = 'User',
  userEmail = '',
  competitionName = '2026: AIRA Youth Challenge',
}: PortalChromeProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isOrganiser = role === 'organiser'
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      if (v === '1') setCollapsed(true)
    } catch {
      // ignore
    }
  }, [])

  const persistCollapse = (next: boolean) => {
    setCollapsed(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    } catch {
      // ignore
    }
  }

  const organiserLinks: { href: string; label: string; icon: ComponentType<{ className?: string; size?: number }> }[] = [
    { href: '/organiser/dashboard', label: 'Summary of Registrations', icon: LayoutDashboard },
    { href: '/organiser/judges', label: 'Judges', icon: Users },
    { href: '/organiser/assignments', label: 'Assignments', icon: Link2 },
    { href: '/organiser/projects', label: 'Submissions Review', icon: FolderKanban },
    { href: '/organiser/results', label: 'Results', icon: BarChart3 },
    { href: '/organiser/calibration', label: 'Score Calibration', icon: SlidersHorizontal },
    { href: '/organiser/audit', label: 'Audit Log', icon: ScrollText },
    { href: '/organiser/setup', label: 'Setup', icon: Settings },
  ]

  const judgeLinks: { href: string; label: string; icon: ComponentType<{ className?: string; size?: number }> }[] = [
    { href: '/judge/dashboard', label: 'My Assignments', icon: LayoutList },
  ]

  const links = isOrganiser ? organiserLinks : judgeLinks

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard.')
    } catch {
      toast.error('Could not copy link.')
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/auth/demo', { method: 'DELETE', credentials: 'include' })
    } catch {
      // ignore
    }
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
      } catch {
        // ignore
      }
    }
    window.location.href = '/'
  }

  const SidebarInner = ({ mode }: { mode: 'desktop' | 'mobile' }) => (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'border-b border-white/20 px-3 py-4',
          collapsed && mode === 'desktop' && 'px-2'
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-white transition-colors outline-none hover:bg-white/10',
              collapsed && mode === 'desktop' && 'justify-center px-0'
            )}
          >
            {!collapsed || mode === 'mobile' ? (
              <>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">
                  {competitionName}
                </span>
                <ChevronDown className="shrink-0 opacity-80" size={16} />
              </>
            ) : (
              <span className="text-xs font-bold">A</span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" side="bottom">
            <DropdownMenuItem onSelect={() => router.push('/')}>Home</DropdownMenuItem>
            {isOrganiser && (
              <DropdownMenuItem onSelect={() => router.push('/organiser/setup')}>Competition settings</DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={() => {
                window.open('/vote', '_blank', 'noopener,noreferrer')
              }}
            >
              People&apos;s choice (new tab)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (!isOrganiser && link.href === '/judge/dashboard' && pathname.startsWith('/judge/score'))
          return (
            <NavLink
              key={link.href}
              href={link.href}
              active={active}
              icon={link.icon}
              collapsed={mode === 'desktop' && collapsed}
            >
              {link.label}
            </NavLink>
          )
        })}
      </nav>

      <div
        className={cn(
          'mt-auto space-y-2 border-t border-white/20 p-3',
          collapsed && mode === 'desktop' && 'px-2'
        )}
      >
        <div className={cn('flex items-center gap-2', collapsed && mode === 'desktop' && 'flex-col')}>
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-white transition-colors outline-none hover:bg-white/10',
                collapsed && mode === 'desktop' && 'justify-center'
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#C2410C]">
                {userName.charAt(0).toUpperCase()}
              </div>
              {(!collapsed || mode === 'mobile') && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{userName}</p>
                  {userEmail && <p className="truncate text-[10px] text-white/70">{userEmail}</p>}
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-gray-800">{userName}</p>
                {userEmail && <p className="text-xs text-gray-500 truncate">{userEmail}</p>}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2 text-red-600" onClick={() => void signOut()}>
                <LogOut size={14} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className={cn(
            'flex items-center gap-1',
            collapsed && mode === 'desktop' && 'flex-col',
            !collapsed && 'justify-between'
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/15"
            onClick={() => handleShare()}
            aria-label="Share"
          >
            <Share2 size={18} />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="text-white hover:bg-white/15" aria-label="Notifications">
            <Bell size={18} />
          </Button>
          {mode === 'desktop' && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden text-white hover:bg-white/15 lg:flex"
              onClick={() => persistCollapse(!collapsed)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--aira-canvas)]">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-black/10 bg-[#E85A14] px-3 text-white shadow-sm lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white outline-none hover:bg-white/15"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 bg-[#E85A14] p-0 text-white">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <SidebarInner mode="mobile" />
            </SheetContent>
          </Sheet>
          <span className="truncate text-sm font-semibold">{competitionName}</span>
        </div>
        <Badge className="border-0 bg-white/20 text-[10px] text-white">{isOrganiser ? 'Organiser' : 'Judge'}</Badge>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'aira-sidebar hidden min-h-0 shrink-0 flex-col border-r border-black/10 transition-[width] duration-300 ease-out lg:flex lg:min-h-screen',
            collapsed ? 'w-[72px]' : 'w-64'
          )}
        >
          <SidebarInner mode="desktop" />
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <main key={pathname} className="aira-main-animate mx-auto flex-1 px-4 py-6 sm:px-6 lg:max-w-[1600px] lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

/** Public vote + marketing-style pages: orange sidebar + light content */
export function PublicPortalChrome({
  children,
  title = 'People\'s choice',
}: {
  children: React.ReactNode
  title?: string
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const pubLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/vote', label: 'Vote', icon: Heart },
  ]

  const Nav = ({ mobile }: { mobile: boolean }) => (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {pubLinks.map((link) => {
        const active = pathname === link.href
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => mobile && setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              active ? 'bg-white text-[#C2410C] shadow-sm' : 'text-white hover:bg-white/15'
            )}
          >
            <Icon size={20} className={cn(active ? 'text-[#E85A14]' : 'text-white/95')} />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-[var(--aira-canvas)]">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b border-black/10 bg-[#E85A14] px-3 text-white lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white outline-none hover:bg-white/15"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-0 bg-[#E85A14] p-0 text-white">
            <div className="border-b border-white/20 px-4 py-4">
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-white/80">AIRA Youth Challenge</p>
            </div>
            <Nav mobile />
          </SheetContent>
        </Sheet>
        <span className="truncate text-sm font-semibold">{title}</span>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-black/10 bg-[#E85A14] text-white lg:flex">
          <div className="border-b border-white/20 px-4 py-5">
            <p className="text-sm font-semibold leading-snug">{title}</p>
            <p className="mt-1 text-xs text-white/85">AIRA Youth Challenge</p>
          </div>
          <Nav mobile={false} />
          <div className="mt-auto border-t border-white/20 p-4">
            <Link href="/auth/login?role=judge" className="text-xs text-white/90 underline-offset-2 hover:underline">
              Judge login
            </Link>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <main key={pathname} className="aira-main-animate min-h-full px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
