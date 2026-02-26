// =============================================================================
// Bonanza — UI State (Zustand)
// =============================================================================

import { create } from 'zustand'

type BonanzaViewMode = 'list' | 'calendar'

interface BonanzaUIState {
  // Active schedule
  selectedScheduleId: string | null
  setSelectedScheduleId: (id: string | null) => void

  // View mode toggle (list vs calendar)
  viewMode: BonanzaViewMode
  setViewMode: (mode: BonanzaViewMode) => void

  // Create schedule dialog
  isCreateScheduleOpen: boolean
  setCreateScheduleOpen: (open: boolean) => void

  // Add assignment dialog
  isAddAssignmentOpen: boolean
  setAddAssignmentOpen: (open: boolean) => void
}

export const useBonanzaStore = create<BonanzaUIState>()((set) => ({
  selectedScheduleId: null,
  setSelectedScheduleId: (id) => set({ selectedScheduleId: id }),

  viewMode: 'calendar',
  setViewMode: (mode) => set({ viewMode: mode }),

  isCreateScheduleOpen: false,
  setCreateScheduleOpen: (open) => set({ isCreateScheduleOpen: open }),

  isAddAssignmentOpen: false,
  setAddAssignmentOpen: (open) => set({ isAddAssignmentOpen: open }),
}))
