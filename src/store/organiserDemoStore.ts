'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Assignment, Judge, Project } from '@/lib/types'
import {
  DEMO_ASSIGNMENTS,
  DEMO_COMPETITION,
  DEMO_JUDGES,
  DEMO_PROJECTS,
} from '@/lib/demo-data'

export interface OrganiserDemoSnapshot {
  projects: Project[]
  judges: Judge[]
  assignments: Assignment[]
  competitionName: string
  competitionDeadline: string
}

function initialSnapshot(): OrganiserDemoSnapshot {
  return {
    projects: DEMO_PROJECTS.map((p) => ({ ...p })),
    judges: DEMO_JUDGES.map((j) => ({ ...j })),
    assignments: DEMO_ASSIGNMENTS.map((a) => ({ ...a })),
    competitionName: DEMO_COMPETITION.name,
    competitionDeadline: DEMO_COMPETITION.deadline,
  }
}

type OrganiserDemoStore = OrganiserDemoSnapshot & {
  resetOrganiserDemo: () => void
  setCompetitionMeta: (patch: Partial<Pick<OrganiserDemoSnapshot, 'competitionName' | 'competitionDeadline'>>) => void
  addProject: (project: Project) => void
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  addJudge: (judge: Judge) => void
  updateJudge: (id: string, patch: Partial<Judge>) => void
  addAssignment: (assignment: Assignment) => void
  updateAssignment: (id: string, patch: Partial<Pick<Assignment, 'judge_id' | 'project_id'>>) => void
  deleteAssignment: (id: string) => void
}

export const useOrganiserDemoStore = create<OrganiserDemoStore>()(
  persist(
    (set) => ({
      ...initialSnapshot(),

      resetOrganiserDemo: () => set(initialSnapshot()),

      setCompetitionMeta: (patch) =>
        set((s) => ({
          ...s,
          ...patch,
        })),

      addProject: (project) =>
        set((s) => ({
          projects: [...s.projects, project],
        })),

      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          assignments: s.assignments.filter((a) => a.project_id !== id),
        })),

      addJudge: (judge) =>
        set((s) => ({
          judges: [...s.judges, judge],
        })),

      updateJudge: (id, patch) =>
        set((s) => ({
          judges: s.judges.map((j) => (j.id === id ? { ...j, ...patch } : j)),
        })),

      addAssignment: (assignment) =>
        set((s) => ({
          assignments: [...s.assignments, assignment],
        })),

      updateAssignment: (id, patch) =>
        set((s) => ({
          assignments: s.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      deleteAssignment: (id) =>
        set((s) => ({
          assignments: s.assignments.filter((a) => a.id !== id),
        })),
    }),
    {
      name: 'aisg-organiser-demo',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        projects: s.projects,
        judges: s.judges,
        assignments: s.assignments,
        competitionName: s.competitionName,
        competitionDeadline: s.competitionDeadline,
      }),
    }
  )
)
