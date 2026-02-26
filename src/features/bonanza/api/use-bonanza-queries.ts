// =============================================================================
// Bonanza — TanStack Query hooks
// BonanzaSchedule (Period) CRUD + assignment management
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  BonanzaSchedule,
  BonanzaAssignment,
  User,
  DayOfWeek,
} from '@/lib/types'
import type { CreateBonanzaPeriodInput } from '@/lib/schemas'
import * as storage from '@/lib/storage'

// --- Query keys ---

export const bonanzaKeys = {
  all: ['bonanzaSchedules'] as const,
  detail: (id: string) => ['bonanzaSchedules', id] as const,
}

export const userKeys = {
  all: ['users'] as const,
}

// --- Helpers ---

/** Get the Monday (week start) on or before the given date. */
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Generate all Monday-start weeks between startDate and endDate (inclusive of partial weeks). */
function generateWeeks(startDate: string, endDate: string): string[] {
  const start = getMonday(new Date(startDate + 'T00:00:00'))
  const end = new Date(endDate + 'T00:00:00')
  const weeks: string[] = []

  const cursor = new Date(start)
  while (cursor <= end) {
    weeks.push(cursor.toISOString().split('T')[0])
    cursor.setDate(cursor.getDate() + 7)
  }
  return weeks
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

// --- Derived helpers (use with query data) ---

/** Get the active period (newest with status 'active'), or the most recent one. */
export function getActivePeriod(
  schedules: BonanzaSchedule[] | undefined
): BonanzaSchedule | undefined {
  if (!schedules?.length) return undefined
  // Prefer active
  const active = schedules.find((s) => s.status === 'active')
  if (active) return active
  // Fallback: newest by startDate
  return [...schedules].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )[0]
}

/** Get completed (archived) periods, sorted newest first. */
export function getArchivedPeriods(
  schedules: BonanzaSchedule[] | undefined
): BonanzaSchedule[] {
  if (!schedules?.length) return []
  return schedules
    .filter((s) => s.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
}

// --- Period (Schedule) Mutations ---

export function useCreateBonanzaPeriodMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateBonanzaPeriodInput) => {
      // Mark any existing active periods as completed
      const existing = storage.getAll<BonanzaSchedule>('bonanzaSchedules')
      for (const s of existing) {
        if (s.status === 'active') {
          storage.update<BonanzaSchedule>('bonanzaSchedules', s.id, {
            status: 'completed',
          } as Partial<BonanzaSchedule>)
        }
      }

      // Generate empty weeks (no bakers assigned yet)
      const weekDates = generateWeeks(input.startDate, input.endDate)
      const emptyAssignments: BonanzaAssignment[] = weekDates.map((week) => ({
        weekStartDate: week,
        userId: '', // unassigned
        cakeDay: 5 as DayOfWeek, // Friday default
      }))

      const schedule: BonanzaSchedule = {
        id: storage.generateId(),
        teamName: input.teamName,
        startDate: input.startDate,
        endDate: input.endDate,
        cadence: 'weekly',
        status: 'active',
        assignments: emptyAssignments,
      }
      return storage.create('bonanzaSchedules', schedule)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bonanzaKeys.all })
    },
  })
}

/** @deprecated Use useCreateBonanzaPeriodMutation instead */
export function useCreateBonanzaScheduleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      teamName: string
      startDate: string
      cadence: 'weekly'
    }) => {
      const schedule: BonanzaSchedule = {
        id: storage.generateId(),
        teamName: input.teamName,
        startDate: input.startDate,
        endDate: input.startDate, // legacy: same as start
        cadence: input.cadence,
        status: 'active',
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

export function useCompletePeriodMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const updated = storage.update<BonanzaSchedule>('bonanzaSchedules', id, {
        status: 'completed',
      } as Partial<BonanzaSchedule>)
      if (!updated) throw new Error('Period not found')
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bonanzaKeys.all })
    },
  })
}

// --- Assignment Mutations ---

export function useAssignBakerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      scheduleId,
      weekStartDate,
      userId,
      cakeDay,
      cakeName,
    }: {
      scheduleId: string
      weekStartDate: string
      userId: string
      cakeDay?: DayOfWeek
      cakeName?: string
    }) => {
      const schedule = storage.getById<BonanzaSchedule>(
        'bonanzaSchedules',
        scheduleId
      )
      if (!schedule) throw new Error('Schedule not found')

      const newAssignments = schedule.assignments.map((a) =>
        a.weekStartDate === weekStartDate
          ? {
              ...a,
              userId,
              cakeDay: cakeDay ?? a.cakeDay ?? (5 as DayOfWeek),
              cakeName: cakeName ?? a.cakeName,
            }
          : a
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

export function useUpdateCakeDayMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      scheduleId,
      weekStartDate,
      cakeDay,
    }: {
      scheduleId: string
      weekStartDate: string
      cakeDay: DayOfWeek
    }) => {
      const schedule = storage.getById<BonanzaSchedule>(
        'bonanzaSchedules',
        scheduleId
      )
      if (!schedule) throw new Error('Schedule not found')

      const newAssignments = schedule.assignments.map((a) =>
        a.weekStartDate === weekStartDate ? { ...a, cakeDay } : a
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

/** Legacy: add/replace full assignment (kept for backwards compat) */
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

      // Ensure cakeDay default
      const withDefaults: BonanzaAssignment = {
        ...assignment,
        cakeDay: assignment.cakeDay ?? (5 as DayOfWeek),
      }

      // Replace existing assignment for same week, or add new
      const existing = schedule.assignments.findIndex(
        (a) => a.weekStartDate === withDefaults.weekStartDate
      )
      const newAssignments = [...schedule.assignments]
      if (existing >= 0) {
        newAssignments[existing] = withDefaults
      } else {
        newAssignments.push(withDefaults)
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

      // Instead of removing the week entirely, unassign the baker
      const newAssignments = schedule.assignments.map((a) =>
        a.weekStartDate === weekStartDate
          ? { ...a, userId: '', cakeName: undefined, rating: undefined }
          : a
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

// --- Rating ---

export function useRateAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      scheduleId,
      weekStartDate,
      rating,
    }: {
      scheduleId: string
      weekStartDate: string
      rating: number // 1–5
    }) => {
      const schedule = storage.getById<BonanzaSchedule>(
        'bonanzaSchedules',
        scheduleId
      )
      if (!schedule) throw new Error('Schedule not found')

      const newAssignments = schedule.assignments.map((a) =>
        a.weekStartDate === weekStartDate ? { ...a, rating } : a
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

// --- User Mutations (create user) ---

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
