/// <reference types="vitest/globals" />

import { generateCakeConcepts } from '../mock-ai'
import type { CakeRequest } from '../types'

// Speed up tests by removing the artificial delay
vi.useFakeTimers()

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

afterEach(() => {
  vi.clearAllTimers()
})

afterAll(() => {
  vi.useRealTimers()
})

// Helper to resolve the delayed promise
async function runGeneration(request: CakeRequest) {
  const promise = generateCakeConcepts(request)
  // Advance past the max possible delay (1500 + 2000 = 3500ms)
  await vi.advanceTimersByTimeAsync(4000)
  return promise
}

// =============================================================================
// generateCakeConcepts
// =============================================================================

describe('generateCakeConcepts', () => {
  it('returns the requested number of concepts', async () => {
    const concepts = await runGeneration(createTestRequest({ numConcepts: 3 }))
    expect(concepts).toHaveLength(3)
  })

  it('returns 1 concept when numConcepts is 1', async () => {
    const concepts = await runGeneration(createTestRequest({ numConcepts: 1 }))
    expect(concepts).toHaveLength(1)
  })

  it('each concept has a unique id', async () => {
    const concepts = await runGeneration(createTestRequest({ numConcepts: 5 }))
    const ids = concepts.map((c) => c.id)
    expect(new Set(ids).size).toBe(5)
  })

  it('each concept references the request id', async () => {
    const concepts = await runGeneration(
      createTestRequest({ id: 'my-req', numConcepts: 2 })
    )
    for (const c of concepts) {
      expect(c.requestId).toBe('my-req')
    }
  })

  it('titles contain the theme from customerPrompt', async () => {
    const concepts = await runGeneration(
      createTestRequest({ customerPrompt: 'Dinosaur' })
    )
    for (const c of concepts) {
      expect(c.title).toContain('Dinosaur')
    }
  })

  it('descriptions contain the theme', async () => {
    const concepts = await runGeneration(
      createTestRequest({ customerPrompt: 'Ocean' })
    )
    for (const c of concepts) {
      expect(c.description).toContain('Ocean')
    }
  })

  it('concept has a complete recipe with ingredients and steps', async () => {
    const [concept] = await runGeneration(createTestRequest({ numConcepts: 1 }))
    expect(concept.recipe.ingredients.length).toBeGreaterThan(0)
    expect(concept.recipe.steps.length).toBeGreaterThan(0)
    expect(concept.recipe.equipment.length).toBeGreaterThan(0)
    expect(concept.recipe.timeEstimateMinutes).toBeGreaterThan(0)
    expect(['beginner', 'intermediate', 'advanced']).toContain(
      concept.recipe.difficulty
    )
  })

  it('ingredients scale with servings', async () => {
    const small = await runGeneration(
      createTestRequest({
        numConcepts: 1,
        constraints: {
          servings: 6,
          skillLevel: 'beginner',
          dietaryToggles: [],
          dietaryNotes: '',
          budgetRange: 'medium',
          preferredStyle: 'buttercream',
        },
      })
    )
    const large = await runGeneration(
      createTestRequest({
        numConcepts: 1,
        constraints: {
          servings: 48,
          skillLevel: 'beginner',
          dietaryToggles: [],
          dietaryNotes: '',
          budgetRange: 'medium',
          preferredStyle: 'buttercream',
        },
      })
    )
    // Flour amount should be larger for more servings
    const smallFlour = parseFloat(small[0].recipe.ingredients[0].quantity)
    const largeFlour = parseFloat(large[0].recipe.ingredients[0].quantity)
    expect(largeFlour).toBeGreaterThan(smallFlour)
  })

  it('concept has an image with SVG data URL', async () => {
    const [concept] = await runGeneration(createTestRequest({ numConcepts: 1 }))
    expect(concept.image.imageUrl).toContain('data:image/svg+xml,')
    expect(concept.image.promptUsed).toContain('Space')
  })

  it('concept has a shopping plan with costs', async () => {
    const [concept] = await runGeneration(createTestRequest({ numConcepts: 1 }))
    expect(concept.shoppingPlan.storeSuggestions.length).toBeGreaterThan(0)
    expect(concept.shoppingPlan.ingredientCosts.length).toBeGreaterThan(0)
    expect(concept.shoppingPlan.totalEstimatedCost).toBeGreaterThan(0)
    expect(concept.shoppingPlan.currency).toBe('USD')
  })

  it('shopping plan contains budget and standard store types', async () => {
    const [concept] = await runGeneration(createTestRequest({ numConcepts: 1 }))
    const storeTypes = concept.shoppingPlan.ingredientCosts.map(
      (c) => c.storeType
    )
    expect(storeTypes).toContain('budget')
    expect(storeTypes).toContain('standard')
  })

  it('concept has theme extras/addons', async () => {
    const [concept] = await runGeneration(
      createTestRequest({ numConcepts: 1, customerPrompt: 'Halloween' })
    )
    expect(concept.extras.themeAddons.length).toBeGreaterThan(0)
    expect(concept.extras.addonsTotalEstimatedCost).toBeGreaterThan(0)
    // Addons should reference the theme
    const addonNames = concept.extras.themeAddons.map((a) => a.itemName)
    expect(addonNames.some((n) => n.includes('Halloween'))).toBe(true)
  })

  it('concepts start with savedToBank false', async () => {
    const concepts = await runGeneration(createTestRequest({ numConcepts: 3 }))
    for (const c of concepts) {
      expect(c.savedToBank).toBe(false)
    }
  })

  it('theme tags include the theme, style, and budget', async () => {
    const [concept] = await runGeneration(
      createTestRequest({
        numConcepts: 1,
        customerPrompt: 'Retro',
        constraints: {
          servings: 12,
          skillLevel: 'beginner',
          dietaryToggles: [],
          dietaryNotes: '',
          budgetRange: 'high',
          preferredStyle: 'fondant',
        },
      })
    )
    expect(concept.themeTags).toContain('retro')
    expect(concept.themeTags).toContain('fondant')
    expect(concept.themeTags).toContain('high budget')
  })

  it('uses theme-specific colors for known themes', async () => {
    const [concept] = await runGeneration(
      createTestRequest({ numConcepts: 1, customerPrompt: 'Halloween party' })
    )
    // The URL-encoded SVG should contain halloween colors (#ff6600)
    const svg = decodeURIComponent(concept.image.imageUrl.split(',')[1])
    expect(svg).toContain('#ff6600')
  })
})
