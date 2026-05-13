'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Briefcase, Gavel, Users, ChevronDown } from 'lucide-react'
import { useUserPreferencesStore } from '@/store/userPreferencesStore'
import type { UserPersona } from '@/store/userPreferencesStore'

const PERSONA_CONFIG = {
  judge: {
    label: 'Judge Portal',
    icon: Gavel,
    path: '/judge/dashboard',
    color: 'text-[#E85A14]',
  },
  organiser: {
    label: 'Organiser Portal',
    icon: Briefcase,
    path: '/organiser/dashboard',
    color: 'text-[#1A2B3C]',
  },
  voter: {
    label: 'Public Voting',
    icon: Users,
    path: '/vote',
    color: 'text-blue-600',
  },
}

export function PersonaSwitcher() {
  const router = useRouter()
  const {
    displayName,
    currentPersona,
    availablePersonas,
    setCurrentPersona,
    setDisplayName,
  } = useUserPreferencesStore()

  // Auto-detect persona from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      if (path.startsWith('/judge') && currentPersona !== 'judge') {
        setCurrentPersona('judge')
      } else if (path.startsWith('/organiser') && currentPersona !== 'organiser') {
        setCurrentPersona('organiser')
      } else if (path.startsWith('/vote') && currentPersona !== 'voter') {
        setCurrentPersona('voter')
      }
    }
  }, [currentPersona, setCurrentPersona])

  const switchPersona = (persona: UserPersona) => {
    if (!persona) return
    
    setCurrentPersona(persona)
    const config = PERSONA_CONFIG[persona]
    if (config) {
      router.push(config.path)
    }
  }

  if (!currentPersona) return null

  const CurrentIcon = PERSONA_CONFIG[currentPersona]?.icon || User
  const currentLabel = PERSONA_CONFIG[currentPersona]?.label || 'Portal'

  return (
    <div className="flex items-center gap-3">
      {displayName && (
        <span className="text-sm text-gray-600 hidden sm:inline">
          {displayName}
        </span>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 click-scale smooth-color">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 animate-slide-in-right">
          <DropdownMenuLabel className="text-xs text-gray-500">
            Switch Portal
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {Object.entries(PERSONA_CONFIG).map(([key, config]) => {
            const Icon = config.icon
            const isActive = currentPersona === key
            
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => switchPersona(key as UserPersona)}
                className={`cursor-pointer gap-2 ${isActive ? 'bg-[#FFF3EF]' : ''}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? config.color : 'text-gray-500'}`} />
                <span className={isActive ? 'font-medium' : ''}>{config.label}</span>
                {isActive && (
                  <span className="ml-auto text-xs text-[#E85A14]">Active</span>
                )}
              </DropdownMenuItem>
            )
          })}
          
          {availablePersonas.length > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-gray-500">
                Recently Used
              </DropdownMenuLabel>
              {availablePersonas
                .filter(p => p && p !== currentPersona)
                .slice(0, 2)
                .map((persona) => {
                  if (!persona) return null
                  const config = PERSONA_CONFIG[persona]
                  const Icon = config.icon
                  return (
                    <DropdownMenuItem
                      key={persona}
                      onClick={() => switchPersona(persona)}
                      className="cursor-pointer gap-2 text-xs"
                    >
                      <Icon className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{config.label}</span>
                    </DropdownMenuItem>
                  )
                })}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
