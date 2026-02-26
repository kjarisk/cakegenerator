/// <reference types="vitest/globals" />

import {
  buildConceptGenerationPrompt,
  buildRecipeRegenerationPrompt,
  buildImagePrompt,
  CAKE_CONCEPT_SYSTEM_PROMPT,
  RECIPE_ONLY_SYSTEM_PROMPT,
} from '../ai-prompts'
import type { CakeRequest, CakeConcept } from '../types'

function createTestRequest(overrides?: Partial<CakeRequest>): CakeRequest {
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
    numConcepts: 2,
    status: 'draft',
    ...overrides,
  }
}

function createTestConcept(overrides?: Partial<CakeConcept>): CakeConcept {
  return {
    id: 'concept-1',
    requestId: 'req-1',
    title: 'Space Dream Cake',
    themeTags: ['space', 'buttercream'],
    description: 'A stellar cake for space lovers.',
    recipe: {
      ingredients: [{ name: 'Flour', quantity: '3', unit: 'cups' }],
      steps: [{ stepNumber: 1, instruction: 'Mix everything.' }],
      timeEstimateMinutes: 180,
      difficulty: 'beginner',
      equipment: ['Mixer'],
    },
    image: {
      promptUsed: 'A space cake',
      imageUrl: 'data:image/svg+xml,...',
    },
    shoppingPlan: {
      storeSuggestions: [{ storeType: 'budget', rationale: 'Cheap' }],
      ingredientCosts: [
        {
          ingredientName: 'Flour',
          storeType: 'budget',
          estimatedPrice: 3,
          currency: 'USD',
        },
      ],
      totalEstimatedCost: 30,
      currency: 'USD',
    },
    extras: {
      themeAddons: [
        {
          itemName: 'Star topper',
          estimatedPrice: 5,
          currency: 'USD',
          storeSuggestion: 'standard',
        },
      ],
      addonsTotalEstimatedCost: 5,
      currency: 'USD',
    },
    notes: '',
    savedToBank: false,
    ...overrides,
  }
}

describe('ai-prompts', () => {
  describe('system prompts', () => {
    it('CAKE_CONCEPT_SYSTEM_PROMPT is a non-empty string', () => {
      expect(typeof CAKE_CONCEPT_SYSTEM_PROMPT).toBe('string')
      expect(CAKE_CONCEPT_SYSTEM_PROMPT.length).toBeGreaterThan(100)
    })

    it('RECIPE_ONLY_SYSTEM_PROMPT is a non-empty string', () => {
      expect(typeof RECIPE_ONLY_SYSTEM_PROMPT).toBe('string')
      expect(RECIPE_ONLY_SYSTEM_PROMPT.length).toBeGreaterThan(50)
    })
  })

  describe('buildConceptGenerationPrompt', () => {
    it('includes the theme from customerPrompt', () => {
      const request = createTestRequest({ customerPrompt: 'Dinosaur' })
      const prompt = buildConceptGenerationPrompt(request)
      expect(prompt).toContain('Dinosaur')
    })

    it('includes the number of concepts', () => {
      const request = createTestRequest({ numConcepts: 3 })
      const prompt = buildConceptGenerationPrompt(request)
      expect(prompt).toContain('3')
    })

    it('includes servings count', () => {
      const request = createTestRequest({
        constraints: {
          servings: 24,
          skillLevel: 'advanced',
          dietaryToggles: [],
          dietaryNotes: '',
          budgetRange: 'high',
          preferredStyle: 'fondant',
        },
      })
      const prompt = buildConceptGenerationPrompt(request)
      expect(prompt).toContain('24')
    })

    it('includes dietary toggles when present', () => {
      const request = createTestRequest({
        constraints: {
          servings: 12,
          skillLevel: 'beginner',
          dietaryToggles: ['gluten-free', 'vegan'],
          dietaryNotes: 'Also no soy',
          budgetRange: 'low',
          preferredStyle: 'naked',
        },
      })
      const prompt = buildConceptGenerationPrompt(request)
      expect(prompt).toContain('gluten-free')
      expect(prompt).toContain('vegan')
      expect(prompt).toContain('Also no soy')
    })

    it('handles no dietary constraints gracefully', () => {
      const request = createTestRequest()
      const prompt = buildConceptGenerationPrompt(request)
      expect(prompt).toContain('No specific dietary requirements')
    })

    it('includes skill level and preferred style', () => {
      const request = createTestRequest()
      const prompt = buildConceptGenerationPrompt(request)
      expect(prompt).toContain('beginner')
      expect(prompt).toContain('buttercream')
    })
  })

  describe('buildRecipeRegenerationPrompt', () => {
    it('includes the existing concept title', () => {
      const concept = createTestConcept({ title: 'Galactic Cake' })
      const request = createTestRequest()
      const prompt = buildRecipeRegenerationPrompt(concept, request)
      expect(prompt).toContain('Galactic Cake')
    })

    it('includes the theme and constraints', () => {
      const concept = createTestConcept()
      const request = createTestRequest({ customerPrompt: 'Ocean' })
      const prompt = buildRecipeRegenerationPrompt(concept, request)
      expect(prompt).toContain('Ocean')
      expect(prompt).toContain('beginner')
    })
  })

  describe('buildImagePrompt', () => {
    it('includes the theme', () => {
      const prompt = buildImagePrompt('Space')
      expect(prompt).toContain('Space-themed')
    })

    it('includes concept title when provided', () => {
      const prompt = buildImagePrompt('Space', 'Galactic Dream Cake')
      expect(prompt).toContain('Galactic Dream Cake')
    })

    it('includes description when provided', () => {
      const prompt = buildImagePrompt('Space', undefined, 'A cake with stars')
      expect(prompt).toContain('A cake with stars')
    })

    it('works with just theme', () => {
      const prompt = buildImagePrompt('Halloween')
      expect(prompt).toContain('Halloween')
      expect(prompt).toContain('concept art')
    })
  })
})
