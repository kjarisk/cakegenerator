// =============================================================================
// Cake Bank — TanStack Query hooks
// ThemeCategory CRUD + saved concepts queries
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ThemeCategory, CakeConcept } from '@/lib/types'
import type { CreateThemeCategoryInput } from '@/lib/schemas'
import * as storage from '@/lib/storage'
import { cakeConceptKeys } from '@/features/cake-request/api/use-cake-request-queries'

// --- Query keys ---

export const themeCategoryKeys = {
  all: ['themeCategories'] as const,
  detail: (id: string) => ['themeCategories', id] as const,
}

export const savedConceptKeys = {
  all: ['savedConcepts'] as const,
  byCategory: (categoryId: string) => ['savedConcepts', categoryId] as const,
}

// --- Theme Category Queries ---

export function useThemeCategoriesQuery() {
  return useQuery({
    queryKey: themeCategoryKeys.all,
    queryFn: () => storage.getAll<ThemeCategory>('themeCategories'),
  })
}

export function useThemeCategoryQuery(id: string) {
  return useQuery({
    queryKey: themeCategoryKeys.detail(id),
    queryFn: () => storage.getById<ThemeCategory>('themeCategories', id),
    enabled: !!id,
  })
}

// --- Saved Concepts Queries ---

export function useSavedConceptsQuery() {
  return useQuery({
    queryKey: savedConceptKeys.all,
    queryFn: () =>
      storage.findWhere<CakeConcept>(
        'cakeConcepts',
        (c) => c.savedToBank === true
      ),
  })
}

export function useConceptsByCategoryQuery(categoryId: string) {
  return useQuery({
    queryKey: savedConceptKeys.byCategory(categoryId),
    queryFn: () => {
      const category = storage.getById<ThemeCategory>(
        'themeCategories',
        categoryId
      )
      if (!category) return []
      return category.cakeConceptIds
        .map((id) => storage.getById<CakeConcept>('cakeConcepts', id))
        .filter((c): c is CakeConcept => c !== undefined)
    },
    enabled: !!categoryId,
  })
}

// --- Theme Category Mutations ---

export function useCreateThemeCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateThemeCategoryInput) => {
      const category: ThemeCategory = {
        id: storage.generateId(),
        name: input.name,
        description: input.description,
        cakeConceptIds: [],
      }
      return storage.create('themeCategories', category)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeCategoryKeys.all })
    },
  })
}

export function useUpdateThemeCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<ThemeCategory>
    }) => {
      const updated = storage.update<ThemeCategory>(
        'themeCategories',
        id,
        updates
      )
      if (!updated) throw new Error('Theme category not found')
      return updated
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: themeCategoryKeys.all })
      queryClient.invalidateQueries({
        queryKey: themeCategoryKeys.detail(data.id),
      })
    },
  })
}

export function useDeleteThemeCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const removed = storage.remove('themeCategories', id)
      if (!removed) throw new Error('Theme category not found')
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeCategoryKeys.all })
    },
  })
}

// --- Save / Remove from Bank ---

export function useSaveConceptToBankMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conceptId,
      categoryId,
      tags,
      notes,
    }: {
      conceptId: string
      categoryId: string
      tags?: string[]
      notes?: string
    }) => {
      // Update the concept
      const updates: Partial<CakeConcept> = { savedToBank: true }
      if (tags) updates.themeTags = tags
      if (notes !== undefined) updates.notes = notes

      const updated = storage.update<CakeConcept>(
        'cakeConcepts',
        conceptId,
        updates
      )
      if (!updated) throw new Error('Concept not found')

      // Add concept to category
      const category = storage.getById<ThemeCategory>(
        'themeCategories',
        categoryId
      )
      if (category && !category.cakeConceptIds.includes(conceptId)) {
        storage.update<ThemeCategory>('themeCategories', categoryId, {
          cakeConceptIds: [...category.cakeConceptIds, conceptId],
        })
      }

      return updated
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cakeConceptKeys.all })
      queryClient.invalidateQueries({
        queryKey: cakeConceptKeys.detail(data.id),
      })
      queryClient.invalidateQueries({ queryKey: savedConceptKeys.all })
      queryClient.invalidateQueries({ queryKey: themeCategoryKeys.all })
    },
  })
}

export function useRemoveConceptFromBankMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conceptId: string) => {
      // Unset savedToBank
      const updated = storage.update<CakeConcept>('cakeConcepts', conceptId, {
        savedToBank: false,
      })
      if (!updated) throw new Error('Concept not found')

      // Remove from all categories
      const categories = storage.getAll<ThemeCategory>('themeCategories')
      for (const cat of categories) {
        if (cat.cakeConceptIds.includes(conceptId)) {
          storage.update<ThemeCategory>('themeCategories', cat.id, {
            cakeConceptIds: cat.cakeConceptIds.filter((id) => id !== conceptId),
          })
        }
      }

      return updated
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cakeConceptKeys.all })
      queryClient.invalidateQueries({
        queryKey: cakeConceptKeys.detail(data.id),
      })
      queryClient.invalidateQueries({ queryKey: savedConceptKeys.all })
      queryClient.invalidateQueries({ queryKey: themeCategoryKeys.all })
    },
  })
}
