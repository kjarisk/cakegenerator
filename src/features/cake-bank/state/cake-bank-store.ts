// =============================================================================
// Cake Bank — UI State (Zustand)
// Search, filter, and category selection state
// =============================================================================

import { create } from 'zustand'

interface CakeBankUIState {
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Filter by category
  selectedCategoryId: string | null
  setSelectedCategoryId: (id: string | null) => void

  // Create category dialog
  isCreateCategoryOpen: boolean
  setCreateCategoryOpen: (open: boolean) => void
}

export const useCakeBankStore = create<CakeBankUIState>()((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

  isCreateCategoryOpen: false,
  setCreateCategoryOpen: (open) => set({ isCreateCategoryOpen: open }),
}))
