// =============================================================================
// Cake Request — TanStack Query hooks
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CakeRequest, CakeConcept } from '@/lib/types'
import type { CreateCakeRequestInput } from '@/lib/schemas'
import * as storage from '@/lib/storage'
import { generateCakeConcepts } from '@/lib/mock-ai'

// --- Query keys ---

export const cakeRequestKeys = {
  all: ['cakeRequests'] as const,
  detail: (id: string) => ['cakeRequests', id] as const,
  concepts: (requestId: string) =>
    ['cakeRequests', requestId, 'concepts'] as const,
}

export const cakeConceptKeys = {
  all: ['cakeConcepts'] as const,
  detail: (id: string) => ['cakeConcepts', id] as const,
}

// --- Queries ---

export function useCakeRequestsQuery() {
  return useQuery({
    queryKey: cakeRequestKeys.all,
    queryFn: () => storage.getAll<CakeRequest>('cakeRequests'),
  })
}

export function useCakeRequestQuery(id: string) {
  return useQuery({
    queryKey: cakeRequestKeys.detail(id),
    queryFn: () => storage.getById<CakeRequest>('cakeRequests', id),
    enabled: !!id,
  })
}

export function useCakeConceptsQuery() {
  return useQuery({
    queryKey: cakeConceptKeys.all,
    queryFn: () => storage.getAll<CakeConcept>('cakeConcepts'),
  })
}

export function useCakeConceptQuery(id: string) {
  return useQuery({
    queryKey: cakeConceptKeys.detail(id),
    queryFn: () => storage.getById<CakeConcept>('cakeConcepts', id),
    enabled: !!id,
  })
}

export function useConceptsByRequestQuery(requestId: string) {
  return useQuery({
    queryKey: cakeRequestKeys.concepts(requestId),
    queryFn: () =>
      storage.findWhere<CakeConcept>(
        'cakeConcepts',
        (c) => c.requestId === requestId
      ),
    enabled: !!requestId,
  })
}

// --- Mutations ---

export function useCreateCakeRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCakeRequestInput) => {
      // Create the request
      const request: CakeRequest = {
        id: storage.generateId(),
        createdAt: new Date().toISOString(),
        createdByUserId: 'default-user', // TODO: real user system
        customerPrompt: input.customerPrompt,
        constraints: input.constraints,
        numConcepts: input.numConcepts,
        status: 'draft',
      }
      storage.create('cakeRequests', request)

      // Generate concepts using mock AI
      const concepts = await generateCakeConcepts(request)
      storage.createMany('cakeConcepts', concepts)

      // Update request status
      storage.update<CakeRequest>('cakeRequests', request.id, {
        status: 'generated',
      })

      return { request: { ...request, status: 'generated' as const }, concepts }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cakeRequestKeys.all })
      queryClient.invalidateQueries({ queryKey: cakeConceptKeys.all })
    },
  })
}

export function useUpdateConceptMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<CakeConcept>
    }) => {
      const updated = storage.update<CakeConcept>('cakeConcepts', id, updates)
      if (!updated) throw new Error('Concept not found')
      return updated
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cakeConceptKeys.all })
      queryClient.invalidateQueries({
        queryKey: cakeConceptKeys.detail(data.id),
      })
    },
  })
}
