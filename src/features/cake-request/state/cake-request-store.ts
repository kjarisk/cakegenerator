// =============================================================================
// Cake Request — UI State (Zustand)
// Tracks generation progress and active concept selection
// =============================================================================

import { create } from 'zustand'

interface CakeRequestUIState {
  // Generation tracking
  isGenerating: boolean
  generationProgress: string
  setGenerating: (isGenerating: boolean, progress?: string) => void

  // Active concept (for detail view)
  activeConceptId: string | null
  setActiveConceptId: (id: string | null) => void

  // Last created request (for navigation after create)
  lastCreatedRequestId: string | null
  setLastCreatedRequestId: (id: string | null) => void
}

export const useCakeRequestStore = create<CakeRequestUIState>()((set) => ({
  isGenerating: false,
  generationProgress: '',
  setGenerating: (isGenerating, progress = '') =>
    set({ isGenerating, generationProgress: progress }),

  activeConceptId: null,
  setActiveConceptId: (id) => set({ activeConceptId: id }),

  lastCreatedRequestId: null,
  setLastCreatedRequestId: (id) => set({ lastCreatedRequestId: id }),
}))
