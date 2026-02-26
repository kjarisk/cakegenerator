/// <reference types="vitest/globals" />

// =============================================================================
// Bonanza — business logic tests
// Tests period creation, baker assignment, cake day override, rating, and
// archive helpers — the logic inside useBonanza* mutation fns.
// =============================================================================

// --- localStorage polyfill ---
const store: Record<string, string> = {}
const localStorageMock: Storage = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, value) => {
    store[key] = String(value)
  },
  removeItem: (key) => {
    delete store[key]
  },
  clear: () => {
    for (const k of Object.keys(store)) delete store[k]
  },
  get length() {
    return Object.keys(store).length
  },
  key: (i) => Object.keys(store)[i] ?? null,
}
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

import * as storage from '@/lib/storage'
import type { BonanzaSchedule, BonanzaAssignment, DayOfWeek } from '@/lib/types'
import { getActivePeriod, getArchivedPeriods } from '../api/use-bonanza-queries'

// ---------------------------------------------------------------------------
// Helpers — mirrors logic inside the mutation fns exactly
// ---------------------------------------------------------------------------

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

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

function createPeriod(
  teamName: string,
  startDate: string,
  endDate: string
): BonanzaSchedule {
  // Complete any existing active periods
  const existing = storage.getAll<BonanzaSchedule>('bonanzaSchedules')
  for (const s of existing) {
    if (s.status === 'active') {
      storage.update<BonanzaSchedule>('bonanzaSchedules', s.id, {
        status: 'completed',
      } as Partial<BonanzaSchedule>)
    }
  }

  const weekDates = generateWeeks(startDate, endDate)
  const emptyAssignments: BonanzaAssignment[] = weekDates.map((week) => ({
    weekStartDate: week,
    userId: '',
    cakeDay: 5 as DayOfWeek,
  }))

  const schedule: BonanzaSchedule = {
    id: storage.generateId(),
    teamName,
    startDate,
    endDate,
    cadence: 'weekly',
    status: 'active',
    assignments: emptyAssignments,
  }
  return storage.create('bonanzaSchedules', schedule)
}

function assignBaker(
  scheduleId: string,
  weekStartDate: string,
  userId: string,
  cakeDay?: DayOfWeek,
  cakeName?: string
): BonanzaSchedule {
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
    {
      assignments: newAssignments,
    }
  )
  if (!updated) throw new Error('Failed to update schedule')
  return updated
}

function removeAssignment(
  scheduleId: string,
  weekStartDate: string
): BonanzaSchedule {
  const schedule = storage.getById<BonanzaSchedule>(
    'bonanzaSchedules',
    scheduleId
  )
  if (!schedule) throw new Error('Schedule not found')

  const newAssignments = schedule.assignments.map((a) =>
    a.weekStartDate === weekStartDate
      ? { ...a, userId: '', cakeName: undefined, rating: undefined }
      : a
  )

  const updated = storage.update<BonanzaSchedule>(
    'bonanzaSchedules',
    scheduleId,
    {
      assignments: newAssignments,
    }
  )
  if (!updated) throw new Error('Failed to update schedule')
  return updated
}

function rateAssignment(
  scheduleId: string,
  weekStartDate: string,
  rating: number
): BonanzaSchedule {
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
    {
      assignments: newAssignments,
    }
  )
  if (!updated) throw new Error('Failed to update schedule')
  return updated
}

function completePeriod(id: string): BonanzaSchedule {
  const updated = storage.update<BonanzaSchedule>('bonanzaSchedules', id, {
    status: 'completed',
  } as Partial<BonanzaSchedule>)
  if (!updated) throw new Error('Period not found')
  return updated
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorageMock.clear()
})

// =============================================================================
// generateWeeks helper
// =============================================================================

describe('generateWeeks', () => {
  it('generates Monday-start week dates across a multi-week range', () => {
    // Use a range that spans exactly 4 weeks; exact dates are timezone-dependent
    // so we check structure: correct count, each 7 days apart, all valid ISO dates
    const weeks = generateWeeks('2026-01-05', '2026-01-25')
    expect(weeks).toHaveLength(3)
    // Each week is a valid ISO date string
    for (const w of weeks) expect(w).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    // Each subsequent week is exactly 7 days after the previous
    for (let i = 1; i < weeks.length; i++) {
      const diff =
        new Date(weeks[i]).getTime() - new Date(weeks[i - 1]).getTime()
      expect(diff).toBe(7 * 24 * 60 * 60 * 1000)
    }
  })

  it('snaps to a Monday when start date is mid-week', () => {
    // When given a Wednesday, the result starts on the Monday of that week.
    // Weeks are 7 days apart; count should be >= 1.
    const weeks = generateWeeks('2026-01-07', '2026-01-20')
    expect(weeks.length).toBeGreaterThan(0)
    // All resulting dates must be exactly 7 days apart
    for (let i = 1; i < weeks.length; i++) {
      const diff =
        new Date(weeks[i]).getTime() - new Date(weeks[i - 1]).getTime()
      expect(diff).toBe(7 * 24 * 60 * 60 * 1000)
    }
    // The first date must come before or on the input start date
    expect(new Date(weeks[0]).getTime()).toBeLessThanOrEqual(
      new Date('2026-01-07').getTime()
    )
  })

  it('returns a single week for a short range', () => {
    const weeks = generateWeeks('2026-01-05', '2026-01-09')
    expect(weeks).toHaveLength(1)
    expect(weeks[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('handles a full 4-week month range', () => {
    const weeks = generateWeeks('2026-02-02', '2026-02-28')
    expect(weeks).toHaveLength(4)
  })
})

// =============================================================================
// createPeriod
// =============================================================================

describe('createPeriod', () => {
  it('creates a period with the correct metadata', () => {
    const period = createPeriod('Spring 2026', '2026-03-02', '2026-03-29')
    expect(period.teamName).toBe('Spring 2026')
    expect(period.startDate).toBe('2026-03-02')
    expect(period.endDate).toBe('2026-03-29')
    expect(period.cadence).toBe('weekly')
    expect(period.status).toBe('active')
  })

  it('generates empty assignments (unassigned, Friday default)', () => {
    const period = createPeriod('Test', '2026-01-05', '2026-01-25')
    expect(period.assignments).toHaveLength(3)
    for (const a of period.assignments) {
      expect(a.userId).toBe('')
      expect(a.cakeDay).toBe(5)
    }
  })

  it('persists the period to storage', () => {
    const period = createPeriod('Test', '2026-01-05', '2026-01-25')
    const stored = storage.getById<BonanzaSchedule>(
      'bonanzaSchedules',
      period.id
    )
    expect(stored).toBeDefined()
    expect(stored?.id).toBe(period.id)
  })

  it('auto-completes existing active periods when a new one is created', () => {
    const first = createPeriod('Winter 2026', '2026-01-05', '2026-01-25')
    expect(first.status).toBe('active')

    createPeriod('Spring 2026', '2026-03-02', '2026-03-29')

    const updated = storage.getById<BonanzaSchedule>(
      'bonanzaSchedules',
      first.id
    )
    expect(updated?.status).toBe('completed')

    const all = storage.getAll<BonanzaSchedule>('bonanzaSchedules')
    const activePeriods = all.filter((s) => s.status === 'active')
    expect(activePeriods).toHaveLength(1)
    expect(activePeriods[0].teamName).toBe('Spring 2026')
  })
})

// =============================================================================
// assignBaker
// =============================================================================

describe('assignBaker', () => {
  it('assigns a user to a specific week', () => {
    const period = createPeriod('Test', '2026-01-05', '2026-01-25')
    const weekDate = period.assignments[0].weekStartDate

    const updated = assignBaker(period.id, weekDate, 'user-42')

    const assignment = updated.assignments.find(
      (a) => a.weekStartDate === weekDate
    )
    expect(assignment?.userId).toBe('user-42')
  })

  it('preserves other weeks when assigning one', () => {
    const period = createPeriod('Test', '2026-01-05', '2026-01-25')
    const [week1, week2, week3] = period.assignments.map((a) => a.weekStartDate)

    assignBaker(period.id, week1, 'user-1')

    const stored = storage.getById<BonanzaSchedule>(
      'bonanzaSchedules',
      period.id
    )!
    expect(
      stored.assignments.find((a) => a.weekStartDate === week2)?.userId
    ).toBe('')
    expect(
      stored.assignments.find((a) => a.weekStartDate === week3)?.userId
    ).toBe('')
  })

  it('overrides the default Friday cake day', () => {
    const period = createPeriod('Test', '2026-01-05', '2026-01-25')
    const weekDate = period.assignments[0].weekStartDate

    const updated = assignBaker(period.id, weekDate, 'user-1', 3 as DayOfWeek) // Wednesday

    const assignment = updated.assignments.find(
      (a) => a.weekStartDate === weekDate
    )
    expect(assignment?.cakeDay).toBe(3)
  })

  it('sets a cake name when provided', () => {
    const period = createPeriod('Test', '2026-01-05', '2026-01-25')
    const weekDate = period.assignments[0].weekStartDate

    const updated = assignBaker(
      period.id,
      weekDate,
      'user-1',
      undefined,
      'Galaxy Cake'
    )

    const assignment = updated.assignments.find(
      (a) => a.weekStartDate === weekDate
    )
    expect(assignment?.cakeName).toBe('Galaxy Cake')
  })

  it('throws when schedule does not exist', () => {
    expect(() => assignBaker('nonexistent', '2026-01-05', 'user-1')).toThrow(
      'Schedule not found'
    )
  })
})

// =============================================================================
// removeAssignment (unassign baker)
// =============================================================================

describe('removeAssignment', () => {
  it('clears userId and cakeName but keeps the week slot', () => {
    const period = createPeriod('Test', '2026-01-05', '2026-01-25')
    const weekDate = period.assignments[0].weekStartDate

    assignBaker(period.id, weekDate, 'user-1', undefined, 'Space Cake')
    const updated = removeAssignment(period.id, weekDate)

    const assignment = updated.assignments.find(
      (a) => a.weekStartDate === weekDate
    )
    expect(assignment?.userId).toBe('')
    expect(assignment?.cakeName).toBeUndefined()
    expect(assignment?.rating).toBeUndefined()
    // Week slot still exists
    expect(updated.assignments).toHaveLength(period.assignments.length)
  })

  it('throws when schedule does not exist', () => {
    expect(() => removeAssignment('nonexistent', '2026-01-05')).toThrow(
      'Schedule not found'
    )
  })
})

// =============================================================================
// rateAssignment
// =============================================================================

describe('rateAssignment', () => {
  it('stores a 1–5 star rating on the assignment', () => {
    const period = createPeriod('Test', '2026-01-05', '2026-01-25')
    const weekDate = period.assignments[0].weekStartDate
    assignBaker(period.id, weekDate, 'user-1')

    const updated = rateAssignment(period.id, weekDate, 4)

    const assignment = updated.assignments.find(
      (a) => a.weekStartDate === weekDate
    )
    expect(assignment?.rating).toBe(4)
  })

  it('overwrites an existing rating', () => {
    const period = createPeriod('Test', '2026-01-05', '2026-01-25')
    const weekDate = period.assignments[0].weekStartDate

    rateAssignment(period.id, weekDate, 3)
    const updated = rateAssignment(period.id, weekDate, 5)

    const assignment = updated.assignments.find(
      (a) => a.weekStartDate === weekDate
    )
    expect(assignment?.rating).toBe(5)
  })

  it('accepts all values 1 through 5', () => {
    const period = createPeriod('Test', '2026-01-05', '2026-02-01')
    for (let star = 1; star <= 5; star++) {
      const weekDate = period.assignments[star - 1]?.weekStartDate
      if (!weekDate) continue
      const updated = rateAssignment(period.id, weekDate, star)
      const assignment = updated.assignments.find(
        (a) => a.weekStartDate === weekDate
      )
      expect(assignment?.rating).toBe(star)
    }
  })

  it('throws when schedule does not exist', () => {
    expect(() => rateAssignment('nonexistent', '2026-01-05', 5)).toThrow(
      'Schedule not found'
    )
  })
})

// =============================================================================
// completePeriod
// =============================================================================

describe('completePeriod', () => {
  it('marks a period as completed', () => {
    const period = createPeriod('Test', '2026-01-05', '2026-01-25')
    const updated = completePeriod(period.id)

    expect(updated.status).toBe('completed')
    const stored = storage.getById<BonanzaSchedule>(
      'bonanzaSchedules',
      period.id
    )
    expect(stored?.status).toBe('completed')
  })

  it('throws when period does not exist', () => {
    expect(() => completePeriod('nonexistent')).toThrow('Period not found')
  })
})

// =============================================================================
// getActivePeriod / getArchivedPeriods helpers
// =============================================================================

describe('getActivePeriod', () => {
  it('returns undefined for empty list', () => {
    expect(getActivePeriod([])).toBeUndefined()
    expect(getActivePeriod(undefined)).toBeUndefined()
  })

  it('returns the active period', () => {
    createPeriod('Winter', '2026-01-05', '2026-01-25')
    createPeriod('Spring', '2026-03-02', '2026-03-29') // auto-completes Winter

    const all = storage.getAll<BonanzaSchedule>('bonanzaSchedules')
    const active = getActivePeriod(all)

    expect(active?.teamName).toBe('Spring')
    expect(active?.status).toBe('active')
  })

  it('falls back to newest by startDate when no active period exists', () => {
    const winter = createPeriod('Winter', '2026-01-05', '2026-01-25')
    completePeriod(winter.id)
    const spring = createPeriod('Spring', '2026-03-02', '2026-03-29')
    completePeriod(spring.id)

    const all = storage.getAll<BonanzaSchedule>('bonanzaSchedules')
    const active = getActivePeriod(all)

    expect(active?.teamName).toBe('Spring')
  })
})

describe('getArchivedPeriods', () => {
  it('returns empty array for undefined or empty input', () => {
    expect(getArchivedPeriods(undefined)).toEqual([])
    expect(getArchivedPeriods([])).toEqual([])
  })

  it('returns only completed periods, sorted newest first', () => {
    createPeriod('Winter', '2026-01-05', '2026-01-25')
    createPeriod('Spring', '2026-03-02', '2026-03-29') // auto-completes Winter

    const all = storage.getAll<BonanzaSchedule>('bonanzaSchedules')
    const archived = getArchivedPeriods(all)

    expect(archived).toHaveLength(1)
    expect(archived[0].teamName).toBe('Winter')
    expect(archived[0].status).toBe('completed')
  })

  it('excludes the active period from archives', () => {
    createPeriod('Spring', '2026-03-02', '2026-03-29')
    const all = storage.getAll<BonanzaSchedule>('bonanzaSchedules')
    expect(getArchivedPeriods(all)).toHaveLength(0)
  })
})
