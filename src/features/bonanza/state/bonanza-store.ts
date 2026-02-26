// =============================================================================
// Bonanza — UI State (Zustand)
// =============================================================================

import { create } from 'zustand'

type BonanzaViewMode = 'list' | 'calendar'

interface BonanzaUIState {
  // Active period (schedule)
  selectedScheduleId: string | null
  setSelectedScheduleId: (id: string | null) => void

  // Viewing an archived period?
  viewingArchiveId: string | null
  setViewingArchiveId: (id: string | null) => void

  // View mode toggle (list vs calendar)
  viewMode: BonanzaViewMode
  setViewMode: (mode: BonanzaViewMode) => void

  // Create period dialog
  isCreatePeriodOpen: boolean
  setCreatePeriodOpen: (open: boolean) => void

  // Assign baker dialog
  isAssignBakerOpen: boolean
  assignBakerWeek: string | null // weekStartDate to assign
  openAssignBaker: (weekStartDate: string) => void
  closeAssignBaker: () => void

  // Legacy compat
  isCreateScheduleOpen: boolean
  setCreateScheduleOpen: (open: boolean) => void
  isAddAssignmentOpen: boolean
  setAddAssignmentOpen: (open: boolean) => void
}

export const useBonanzaStore = create<BonanzaUIState>()((set) => ({
  selectedScheduleId: null,
  setSelectedScheduleId: (id) => set({ selectedScheduleId: id }),

  viewingArchiveId: null,
  setViewingArchiveId: (id) => set({ viewingArchiveId: id }),

  viewMode: 'calendar',
  setViewMode: (mode) => set({ viewMode: mode }),

  isCreatePeriodOpen: false,
  setCreatePeriodOpen: (open) => set({ isCreatePeriodOpen: open }),

  isAssignBakerOpen: false,
  assignBakerWeek: null,
  openAssignBaker: (weekStartDate) =>
    set({ isAssignBakerOpen: true, assignBakerWeek: weekStartDate }),
  closeAssignBaker: () =>
    set({ isAssignBakerOpen: false, assignBakerWeek: null }),

  // Legacy compat — map to new names
  isCreateScheduleOpen: false,
  setCreateScheduleOpen: (open) =>
    set({ isCreatePeriodOpen: open, isCreateScheduleOpen: open }),
  isAddAssignmentOpen: false,
  setAddAssignmentOpen: (open) => set({ isAddAssignmentOpen: open }),
}))
