/**
 * User Preferences Store
 * 
 * Manages user account settings and persona switching
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserPersona = 'judge' | 'organiser' | 'voter' | null

interface UserPreferences {
  // Account information
  displayName: string
  email: string
  currentPersona: UserPersona
  
  // Persona history (for quick switching)
  availablePersonas: UserPersona[]
  
  // UI preferences
  preferredTheme: 'light' | 'dark' | 'system'
  animationsEnabled: boolean
  
  // Actions
  setDisplayName: (name: string) => void
  setEmail: (email: string) => void
  setCurrentPersona: (persona: UserPersona) => void
  addPersona: (persona: UserPersona) => void
  setAnimationsEnabled: (enabled: boolean) => void
  clearPreferences: () => void
}

const initialState = {
  displayName: '',
  email: '',
  currentPersona: null as UserPersona,
  availablePersonas: [] as UserPersona[],
  preferredTheme: 'light' as const,
  animationsEnabled: true,
}

export const useUserPreferencesStore = create<UserPreferences>()(
  persist(
    (set) => ({
      ...initialState,
      
      setDisplayName: (name: string) =>
        set({ displayName: name }),
      
      setEmail: (email: string) =>
        set({ email: email.toLowerCase() }),
      
      setCurrentPersona: (persona: UserPersona) =>
        set((state) => ({
          currentPersona: persona,
          availablePersonas: persona && !state.availablePersonas.includes(persona)
            ? [...state.availablePersonas, persona]
            : state.availablePersonas,
        })),
      
      addPersona: (persona: UserPersona) =>
        set((state) => ({
          availablePersonas: persona && !state.availablePersonas.includes(persona)
            ? [...state.availablePersonas, persona]
            : state.availablePersonas,
        })),
      
      setAnimationsEnabled: (enabled: boolean) =>
        set({ animationsEnabled: enabled }),
      
      clearPreferences: () =>
        set(initialState),
    }),
    {
      name: 'user-preferences',
    }
  )
)
