'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type DemoRole = 'judge' | 'organiser'

export interface DemoSession {
  role: DemoRole
  judgeId: string | null
  judgeName: string | null
  judgeEmail: string | null
}

interface SessionStore {
  demo: DemoSession
  setDemoJudge: (judge: { id: string; name: string; email: string }) => void
  setDemoOrganiser: () => void
  clearDemo: () => void
}

const DEFAULT_DEMO: DemoSession = {
  role: 'judge',
  judgeId: 'judge-001',
  judgeName: 'Dr. Sarah Chen',
  judgeEmail: 'sarah.chen@example.com',
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      demo: DEFAULT_DEMO,
      setDemoJudge: (judge) =>
        set({
          demo: {
            role: 'judge',
            judgeId: judge.id,
            judgeName: judge.name,
            judgeEmail: judge.email,
          },
        }),
      setDemoOrganiser: () =>
        set({
          demo: {
            role: 'organiser',
            judgeId: null,
            judgeName: 'Organiser Admin',
            judgeEmail: 'admin@airayouthchallenge.ai',
          },
        }),
      clearDemo: () => set({ demo: DEFAULT_DEMO }),
    }),
    {
      name: 'aisg-demo-session',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

