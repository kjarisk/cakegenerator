/// <reference types="vitest/globals" />

// Test the AI service dispatcher — verify it routes to mock or real based on env

// We mock the env module to control isAIEnabled
vi.mock('@/lib/env', () => ({
  OPENAI_API_KEY: '',
  isAIEnabled: false,
}))

// We mock both AI implementations to track which one gets called
vi.mock('@/lib/mock-ai', () => ({
  generateCakeConcepts: vi
    .fn()
    .mockResolvedValue([{ id: 'mock-1', title: 'Mock Cake' }]),
  regenerateConcept: vi.fn().mockResolvedValue({ title: 'Mock Regen' }),
}))

vi.mock('@/lib/openai-ai', () => ({
  generateCakeConcepts: vi
    .fn()
    .mockResolvedValue([{ id: 'openai-1', title: 'OpenAI Cake' }]),
  regenerateConcept: vi.fn().mockResolvedValue({ title: 'OpenAI Regen' }),
}))

import type { CakeRequest, CakeConcept } from '../types'

function createTestRequest(): CakeRequest {
  return {
    id: 'req-1',
    createdAt: '2026-02-26T00:00:00Z',
    createdByUserId: 'user-1',
    customerPrompt: 'Space',
    constraints: {
      servings: 12,
      skillLevel: 'beginner',
      dietaryToggles: [],
      dietaryNotes: '',
      budgetRange: 'medium',
      preferredStyle: 'buttercream',
    },
    numConcepts: 1,
    status: 'draft',
  }
}

function createTestConcept(): CakeConcept {
  return {
    id: 'concept-1',
    requestId: 'req-1',
    title: 'Test Cake',
    themeTags: ['space'],
    description: 'A test cake',
    recipe: {
      ingredients: [],
      steps: [],
      timeEstimateMinutes: 60,
      difficulty: 'beginner',
      equipment: [],
    },
    image: { promptUsed: '', imageUrl: '' },
    shoppingPlan: {
      storeSuggestions: [],
      ingredientCosts: [],
      totalEstimatedCost: 0,
      currency: 'USD',
    },
    extras: { themeAddons: [], addonsTotalEstimatedCost: 0, currency: 'USD' },
    notes: '',
    savedToBank: false,
  }
}

describe('ai-service dispatcher (mock mode)', () => {
  it('routes generateCakeConcepts to mock-ai when AI is disabled', async () => {
    // Dynamic import after mocks are set up
    const { generateCakeConcepts } = await import('../ai-service')
    const mockAI = await import('../mock-ai')

    const result = await generateCakeConcepts(createTestRequest())
    expect(mockAI.generateCakeConcepts).toHaveBeenCalled()
    expect(result[0].id).toBe('mock-1')
  })

  it('routes regenerateConcept to mock-ai when AI is disabled', async () => {
    const { regenerateConcept } = await import('../ai-service')
    const mockAI = await import('../mock-ai')

    const result = await regenerateConcept(
      createTestConcept(),
      createTestRequest(),
      'full'
    )
    expect(mockAI.regenerateConcept).toHaveBeenCalled()
    expect(result.title).toBe('Mock Regen')
  })

  it('exports aiMode as "mock" when AI is disabled', async () => {
    const { aiMode } = await import('../ai-service')
    expect(aiMode).toBe('mock')
  })
})
