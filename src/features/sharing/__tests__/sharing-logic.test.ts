/// <reference types="vitest/globals" />

// =============================================================================
// Sharing — business logic tests
// Tests the token flow, comment flow, and approval state changes that the
// useCreateShareLinkMutation / useCreateCommentMutation / useUpdateApprovalMutation
// hooks implement against the storage layer.
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
import type {
  CakeRequest,
  CakeConcept,
  ShareLink,
  Comment,
  Recipe,
  ShoppingPlan,
  CakeExtras,
} from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers — mirrors the logic inside the mutation fns exactly
// ---------------------------------------------------------------------------

function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

function createShareLink(
  conceptId: string,
  permission: 'view' | 'comment' = 'comment'
): ShareLink {
  const token = generateShareToken()
  const shareLink: ShareLink = {
    id: storage.generateId(),
    cakeConceptId: conceptId,
    token,
    createdAt: new Date().toISOString(),
    permission,
  }
  storage.create('shareLinks', shareLink)

  // Side-effect: mark request as 'shared'
  const concept = storage.getById<CakeConcept>('cakeConcepts', conceptId)
  if (concept) {
    storage.update<CakeRequest>('cakeRequests', concept.requestId, {
      status: 'shared',
    })
  }

  return shareLink
}

function resolveSharedConcept(token: string) {
  const shareLink = storage.findOneWhere<ShareLink>(
    'shareLinks',
    (sl) => sl.token === token
  )
  if (!shareLink) return null
  if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date())
    return null

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
}

function createComment(
  conceptId: string,
  shareLinkId: string | undefined,
  authorName: string,
  message: string
): Comment {
  const comment: Comment = {
    id: storage.generateId(),
    cakeConceptId: conceptId,
    shareLinkId,
    authorName,
    message,
    createdAt: new Date().toISOString(),
  }
  return storage.create('comments', comment)
}

function updateApproval(conceptId: string, status: 'approved' | 'rejected') {
  const concept = storage.getById<CakeConcept>('cakeConcepts', conceptId)
  if (!concept) throw new Error('Concept not found')
  const updated = storage.update<CakeRequest>(
    'cakeRequests',
    concept.requestId,
    { status }
  )
  if (!updated) throw new Error('Request not found')
  return updated
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeRequest(id = 'req-1'): CakeRequest {
  return {
    id,
    createdAt: '2026-01-01T00:00:00Z',
    createdByUserId: 'user-1',
    customerPrompt: 'Space theme birthday cake',
    constraints: {
      servings: 10,
      skillLevel: 'intermediate',
      dietaryToggles: [],
      dietaryNotes: '',
      budgetRange: 'medium',
      preferredStyle: 'buttercream',
    },
    numConcepts: 1,
    status: 'generated',
  }
}

const dummyRecipe: Recipe = {
  ingredients: [],
  steps: [],
  timeEstimateMinutes: 60,
  difficulty: 'intermediate',
  equipment: [],
}

const dummyShoppingPlan: ShoppingPlan = {
  storeSuggestions: [],
  ingredientCosts: [],
  totalEstimatedCost: 0,
  currency: 'USD',
}

const dummyExtras: CakeExtras = {
  themeAddons: [],
  addonsTotalEstimatedCost: 0,
  currency: 'USD',
}

function makeConcept(id = 'concept-1', requestId = 'req-1'): CakeConcept {
  return {
    id,
    requestId,
    title: 'Galaxy Swirl Cake',
    themeTags: ['space', 'galaxy'],
    description: 'A beautiful galaxy-inspired cake',
    recipe: dummyRecipe,
    image: {
      promptUsed: 'galaxy cake',
      imageUrl: 'https://example.com/img.png',
    },
    shoppingPlan: dummyShoppingPlan,
    extras: dummyExtras,
    notes: '',
    savedToBank: false,
  }
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorageMock.clear()
})

// =============================================================================
// generateShareToken
// =============================================================================

describe('generateShareToken', () => {
  it('returns a 12-character alphanumeric string', () => {
    const token = generateShareToken()
    expect(token).toHaveLength(12)
    expect(token).toMatch(/^[A-Za-z0-9]{12}$/)
  })

  it('generates unique tokens', () => {
    const tokens = new Set(Array.from({ length: 200 }, generateShareToken))
    expect(tokens.size).toBe(200)
  })
})

// =============================================================================
// createShareLink — token flow
// =============================================================================

describe('createShareLink', () => {
  it('creates a share link and persists it to storage', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)

    const link = createShareLink(concept.id)

    expect(link.cakeConceptId).toBe(concept.id)
    expect(link.token).toHaveLength(12)
    expect(link.permission).toBe('comment')

    const stored = storage.getById<ShareLink>('shareLinks', link.id)
    expect(stored).toBeDefined()
    expect(stored?.token).toBe(link.token)
  })

  it('creates a view-only share link when permission is "view"', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)

    const link = createShareLink(concept.id, 'view')
    expect(link.permission).toBe('view')
  })

  it('marks the parent request status as "shared"', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)

    createShareLink(concept.id)

    const updatedRequest = storage.getById<CakeRequest>(
      'cakeRequests',
      request.id
    )
    expect(updatedRequest?.status).toBe('shared')
  })

  it('can create multiple share links for the same concept', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)

    const link1 = createShareLink(concept.id)
    const link2 = createShareLink(concept.id)

    expect(link1.token).not.toBe(link2.token)
    const all = storage.findWhere<ShareLink>(
      'shareLinks',
      (sl) => sl.cakeConceptId === concept.id
    )
    expect(all).toHaveLength(2)
  })
})

// =============================================================================
// resolveSharedConcept — token lookup
// =============================================================================

describe('resolveSharedConcept', () => {
  it('returns null for an unknown token', () => {
    expect(resolveSharedConcept('nonexistent')).toBeNull()
  })

  it('resolves a valid token to concept + request', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)
    const link = createShareLink(concept.id)

    const result = resolveSharedConcept(link.token)

    expect(result).not.toBeNull()
    expect(result!.shareLink.id).toBe(link.id)
    expect(result!.concept.id).toBe(concept.id)
    expect(result!.request?.id).toBe(request.id)
  })

  it('returns null for an expired token', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)

    // Create an already-expired share link directly
    const expiredLink: ShareLink = {
      id: storage.generateId(),
      cakeConceptId: concept.id,
      token: 'expiredtoken1',
      expiresAt: '2000-01-01T00:00:00Z', // in the past
      createdAt: '2000-01-01T00:00:00Z',
      permission: 'comment',
    }
    storage.create('shareLinks', expiredLink)

    expect(resolveSharedConcept('expiredtoken1')).toBeNull()
  })

  it('resolves a non-expired token correctly', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)

    const futureLink: ShareLink = {
      id: storage.generateId(),
      cakeConceptId: concept.id,
      token: 'futuretoken12',
      expiresAt: '2099-01-01T00:00:00Z',
      createdAt: new Date().toISOString(),
      permission: 'comment',
    }
    storage.create('shareLinks', futureLink)

    const result = resolveSharedConcept('futuretoken12')
    expect(result).not.toBeNull()
    expect(result!.concept.id).toBe(concept.id)
  })
})

// =============================================================================
// createComment — comment flow
// =============================================================================

describe('createComment', () => {
  it('persists a comment linked to concept and share link', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)
    const link = createShareLink(concept.id)

    const comment = createComment(
      concept.id,
      link.id,
      'Alice',
      'Looks amazing!'
    )

    expect(comment.cakeConceptId).toBe(concept.id)
    expect(comment.shareLinkId).toBe(link.id)
    expect(comment.authorName).toBe('Alice')
    expect(comment.message).toBe('Looks amazing!')

    const stored = storage.getById<Comment>('comments', comment.id)
    expect(stored).toBeDefined()
  })

  it('multiple comments accumulate for a concept', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)

    createComment(concept.id, undefined, 'Alice', 'Love it!')
    createComment(concept.id, undefined, 'Bob', 'Can we change the colour?')
    createComment(concept.id, undefined, 'Charlie', 'Perfect!')

    const all = storage.findWhere<Comment>(
      'comments',
      (c) => c.cakeConceptId === concept.id
    )
    expect(all).toHaveLength(3)
    expect(all.map((c) => c.authorName)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('comment can be left without a shareLinkId', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)

    const comment = createComment(concept.id, undefined, 'Reviewer', 'Nice!')
    expect(comment.shareLinkId).toBeUndefined()
  })
})

// =============================================================================
// updateApproval — approval state changes
// =============================================================================

describe('updateApproval', () => {
  it('sets request status to "approved"', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)

    const updated = updateApproval(concept.id, 'approved')
    expect(updated.status).toBe('approved')

    const persisted = storage.getById<CakeRequest>('cakeRequests', request.id)
    expect(persisted?.status).toBe('approved')
  })

  it('sets request status to "rejected"', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)

    const updated = updateApproval(concept.id, 'rejected')
    expect(updated.status).toBe('rejected')
  })

  it('throws when the concept does not exist', () => {
    expect(() => updateApproval('nonexistent-concept', 'approved')).toThrow(
      'Concept not found'
    )
  })

  it('can transition approval from shared → approved → rejected', () => {
    const request = makeRequest()
    const concept = makeConcept()
    storage.create('cakeRequests', request)
    storage.create('cakeConcepts', concept)
    createShareLink(concept.id) // sets to 'shared'

    expect(
      storage.getById<CakeRequest>('cakeRequests', request.id)?.status
    ).toBe('shared')

    updateApproval(concept.id, 'approved')
    expect(
      storage.getById<CakeRequest>('cakeRequests', request.id)?.status
    ).toBe('approved')

    updateApproval(concept.id, 'rejected')
    expect(
      storage.getById<CakeRequest>('cakeRequests', request.id)?.status
    ).toBe('rejected')
  })
})
