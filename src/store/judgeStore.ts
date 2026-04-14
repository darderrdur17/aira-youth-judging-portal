'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Feedback } from '@/lib/types'

export interface AssignmentScoreState {
  scores: Record<string, number>          // criterion_key → score 1-10
  personalNotes: string
  teamFeedback: string
  isSubmitted: boolean
  lastSaved: string | null
  conflictFlagged: boolean
  conflictReason: string
}

interface JudgeStore {
  // Map of assignmentId → state
  assignments: Record<string, AssignmentScoreState>

  setScores: (assignmentId: string, scores: Record<string, number>) => void
  setScore: (assignmentId: string, criterionKey: string, value: number) => void
  setPersonalNotes: (assignmentId: string, notes: string) => void
  setTeamFeedback: (assignmentId: string, feedback: string) => void
  setSubmitted: (assignmentId: string, submitted: boolean) => void
  saveProgress: (assignmentId: string) => void
  flagConflict: (assignmentId: string, reason: string) => void
  unflagConflict: (assignmentId: string) => void
  getAssignment: (assignmentId: string) => AssignmentScoreState
  resetAssignment: (assignmentId: string) => void
}

const DEFAULT_STATE: AssignmentScoreState = {
  scores: {},
  personalNotes: '',
  teamFeedback: '',
  isSubmitted: false,
  lastSaved: null,
  conflictFlagged: false,
  conflictReason: '',
}

export const useJudgeStore = create<JudgeStore>()(
  persist(
    (set, get) => ({
      assignments: {},

      getAssignment: (assignmentId) => {
        return get().assignments[assignmentId] ?? { ...DEFAULT_STATE }
      },

      setScore: (assignmentId, criterionKey, value) => {
        const current = get().getAssignment(assignmentId)
        set((state) => ({
          assignments: {
            ...state.assignments,
            [assignmentId]: {
              ...current,
              scores: { ...current.scores, [criterionKey]: value },
            },
          },
        }))
      },

      setScores: (assignmentId, scores) => {
        const current = get().getAssignment(assignmentId)
        set((state) => ({
          assignments: {
            ...state.assignments,
            [assignmentId]: { ...current, scores },
          },
        }))
      },

      setPersonalNotes: (assignmentId, personalNotes) => {
        const current = get().getAssignment(assignmentId)
        set((state) => ({
          assignments: {
            ...state.assignments,
            [assignmentId]: { ...current, personalNotes },
          },
        }))
      },

      setTeamFeedback: (assignmentId, teamFeedback) => {
        const current = get().getAssignment(assignmentId)
        set((state) => ({
          assignments: {
            ...state.assignments,
            [assignmentId]: { ...current, teamFeedback },
          },
        }))
      },

      setSubmitted: (assignmentId, isSubmitted) => {
        const current = get().getAssignment(assignmentId)
        set((state) => ({
          assignments: {
            ...state.assignments,
            [assignmentId]: {
              ...current,
              isSubmitted,
              lastSaved: new Date().toISOString(),
            },
          },
        }))
      },

      saveProgress: (assignmentId) => {
        const current = get().getAssignment(assignmentId)
        set((state) => ({
          assignments: {
            ...state.assignments,
            [assignmentId]: {
              ...current,
              lastSaved: new Date().toISOString(),
            },
          },
        }))
      },

      flagConflict: (assignmentId, conflictReason) => {
        const current = get().getAssignment(assignmentId)
        set((state) => ({
          assignments: {
            ...state.assignments,
            [assignmentId]: { ...current, conflictFlagged: true, conflictReason },
          },
        }))
      },

      unflagConflict: (assignmentId) => {
        const current = get().getAssignment(assignmentId)
        set((state) => ({
          assignments: {
            ...state.assignments,
            [assignmentId]: { ...current, conflictFlagged: false, conflictReason: '' },
          },
        }))
      },

      resetAssignment: (assignmentId) => {
        set((state) => ({
          assignments: {
            ...state.assignments,
            [assignmentId]: { ...DEFAULT_STATE },
          },
        }))
      },
    }),
    {
      name: 'aisg-judge-scores',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
