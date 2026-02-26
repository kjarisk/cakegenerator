// =============================================================================
// Bonanza — TanStack Query hooks
// BonanzaSchedule CRUD + assignment management
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { BonanzaSchedule, BonanzaAssignment, User } from '@/lib/types'
import type { CreateBonanzaScheduleInput } from '@/lib/schemas'
import * as storage from '@/lib/storage'

// --- Query keys ---

export const bonanzaKeys = {
  all: ['bonanzaSchedules'] as const,
  detail: (id: string) => ['bonanzaSchedules', id] as const,
}

export const userKeys = {
  all: ['users'] as const,
}

// --- Queries ---

export function useBonanzaSchedulesQuery() {
  return useQuery({
    queryKey: bonanzaKeys.all,
    queryFn: () => storage.getAll<BonanzaSchedule>('bonanzaSchedules'),
  })
}

export function useBonanzaScheduleQuery(id: string) {
  return useQuery({
    queryKey: bonanzaKeys.detail(id),
    queryFn: () => storage.getById<BonanzaSchedule>('bonanzaSchedules', id),
    enabled: !!id,
  })
}

export function useUsersQuery() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => storage.getAll<User>('users'),
  })
}

// --- Schedule Mutations ---

export function useCreateBonanzaScheduleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateBonanzaScheduleInput) => {
      const schedule: BonanzaSchedule = {
        id: storage.generateId(),
        teamName: input.teamName,
        startDate: input.startDate,
        cadence: input.cadence,
        assignments: [],
      }
      return storage.create('bonanzaSchedules', schedule)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bonanzaKeys.all })
    },
  })
}

export function useDeleteBonanzaScheduleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const removed = storage.remove('bonanzaSchedules', id)
      if (!removed) throw new Error('Schedule not found')
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bonanzaKeys.all })
    },
  })
}

// --- Assignment Mutations ---

export function useAddAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      scheduleId,
      assignment,
    }: {
      scheduleId: string
      assignment: BonanzaAssignment
    }) => {
      const schedule = storage.getById<BonanzaSchedule>(
        'bonanzaSchedules',
        scheduleId
      )
      if (!schedule) throw new Error('Schedule not found')

      // Replace existing assignment for same week, or add new
      const existing = schedule.assignments.findIndex(
        (a) => a.weekStartDate === assignment.weekStartDate
      )
      const newAssignments = [...schedule.assignments]
      if (existing >= 0) {
        newAssignments[existing] = assignment
      } else {
        newAssignments.push(assignment)
      }
      // Sort by date
      newAssignments.sort(
        (a, b) =>
          new Date(a.weekStartDate).getTime() -
          new Date(b.weekStartDate).getTime()
      )

      const updated = storage.update<BonanzaSchedule>(
        'bonanzaSchedules',
        scheduleId,
        { assignments: newAssignments }
      )
      if (!updated) throw new Error('Failed to update schedule')
      return updated
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bonanzaKeys.all })
      queryClient.invalidateQueries({
        queryKey: bonanzaKeys.detail(data.id),
      })
    },
  })
}

export function useRemoveAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      scheduleId,
      weekStartDate,
    }: {
      scheduleId: string
      weekStartDate: string
    }) => {
      const schedule = storage.getById<BonanzaSchedule>(
        'bonanzaSchedules',
        scheduleId
      )
      if (!schedule) throw new Error('Schedule not found')

      const updated = storage.update<BonanzaSchedule>(
        'bonanzaSchedules',
        scheduleId,
        {
          assignments: schedule.assignments.filter(
            (a) => a.weekStartDate !== weekStartDate
          ),
        }
      )
      if (!updated) throw new Error('Failed to update schedule')
      return updated
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bonanzaKeys.all })
      queryClient.invalidateQueries({
        queryKey: bonanzaKeys.detail(data.id),
      })
    },
  })
}

// --- User Mutations ---

export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ displayName }: { displayName: string }) => {
      const user: User = {
        id: storage.generateId(),
        displayName,
        createdAt: new Date().toISOString(),
      }
      return storage.create('users', user)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
