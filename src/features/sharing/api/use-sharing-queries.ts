// =============================================================================
// Sharing — TanStack Query hooks
// ShareLink CRUD + Comment CRUD + approval status
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ShareLink, Comment, CakeConcept, CakeRequest } from '@/lib/types'
import type { CreateCommentInput } from '@/lib/schemas'
import * as storage from '@/lib/storage'
import { cakeConceptKeys } from '@/features/cake-request/api/use-cake-request-queries'

// --- Query keys ---

export const shareLinkKeys = {
  all: ['shareLinks'] as const,
  detail: (id: string) => ['shareLinks', id] as const,
  byToken: (token: string) => ['shareLinks', 'token', token] as const,
  byConcept: (conceptId: string) =>
    ['shareLinks', 'concept', conceptId] as const,
}

export const commentKeys = {
  all: ['comments'] as const,
  byConcept: (conceptId: string) => ['comments', 'concept', conceptId] as const,
}

// --- Share Link Queries ---

export function useShareLinkByTokenQuery(token: string) {
  return useQuery({
    queryKey: shareLinkKeys.byToken(token),
    queryFn: () =>
      storage.findOneWhere<ShareLink>('shareLinks', (sl) => sl.token === token),
    enabled: !!token,
  })
}

export function useShareLinksByConceptQuery(conceptId: string) {
  return useQuery({
    queryKey: shareLinkKeys.byConcept(conceptId),
    queryFn: () =>
      storage.findWhere<ShareLink>(
        'shareLinks',
        (sl) => sl.cakeConceptId === conceptId
      ),
    enabled: !!conceptId,
  })
}

// --- Shared Concept Query (fetches concept via share token) ---

export function useSharedConceptQuery(token: string) {
  return useQuery({
    queryKey: ['sharedConcept', token],
    queryFn: () => {
      const shareLink = storage.findOneWhere<ShareLink>(
        'shareLinks',
        (sl) => sl.token === token
      )
      if (!shareLink) return null

      // Check expiration
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return null
      }

      const concept = storage.getById<CakeConcept>(
        'cakeConcepts',
        shareLink.cakeConceptId
      )
      if (!concept) return null

      const request = storage.getById<CakeRequest>(
        'cakeRequests',
        concept.requestId
      )

      return { shareLink, concept, request }
    },
    enabled: !!token,
  })
}

// --- Comment Queries ---

export function useCommentsByConceptQuery(conceptId: string) {
  return useQuery({
    queryKey: commentKeys.byConcept(conceptId),
    queryFn: () =>
      storage.findWhere<Comment>(
        'comments',
        (c) => c.cakeConceptId === conceptId
      ),
    enabled: !!conceptId,
  })
}

// --- Share Link Mutations ---

export function useCreateShareLinkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conceptId,
      permission = 'comment',
    }: {
      conceptId: string
      permission?: 'view' | 'comment'
    }) => {
      const token = generateShareToken()
      const shareLink: ShareLink = {
        id: storage.generateId(),
        cakeConceptId: conceptId,
        token,
        createdAt: new Date().toISOString(),
        permission,
      }
      storage.create('shareLinks', shareLink)

      // Update request status to 'shared'
      const concept = storage.getById<CakeConcept>('cakeConcepts', conceptId)
      if (concept) {
        storage.update<CakeRequest>('cakeRequests', concept.requestId, {
          status: 'shared',
        })
      }

      return shareLink
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: shareLinkKeys.all })
      queryClient.invalidateQueries({
        queryKey: shareLinkKeys.byConcept(data.cakeConceptId),
      })
    },
  })
}

// --- Comment Mutations ---

export function useCreateCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conceptId,
      shareLinkId,
      input,
    }: {
      conceptId: string
      shareLinkId?: string
      input: CreateCommentInput
    }) => {
      const comment: Comment = {
        id: storage.generateId(),
        cakeConceptId: conceptId,
        shareLinkId,
        authorName: input.authorName,
        message: input.message,
        createdAt: new Date().toISOString(),
      }
      return storage.create('comments', comment)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.byConcept(data.cakeConceptId),
      })
    },
  })
}

// --- Approval Mutations ---

export function useUpdateApprovalMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conceptId,
      status,
    }: {
      conceptId: string
      status: 'approved' | 'rejected'
    }) => {
      const concept = storage.getById<CakeConcept>('cakeConcepts', conceptId)
      if (!concept) throw new Error('Concept not found')

      const updated = storage.update<CakeRequest>(
        'cakeRequests',
        concept.requestId,
        { status }
      )
      if (!updated) throw new Error('Request not found')
      return updated
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sharedConcept'] })
      queryClient.invalidateQueries({
        queryKey: cakeConceptKeys.detail(data.id),
      })
    },
  })
}

// --- Helpers ---

function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
