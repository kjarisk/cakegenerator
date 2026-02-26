/// <reference types="vitest/globals" />

import {
  createCakeRequestSchema,
  createCommentSchema,
  createThemeCategorySchema,
  createBonanzaScheduleSchema,
  skillLevelSchema,
  budgetRangeSchema,
  cakeStyleSchema,
  dietaryToggleSchema,
  requestStatusSchema,
} from '../schemas'

// =============================================================================
// Enum schemas
// =============================================================================

describe('enum schemas', () => {
  it('skillLevelSchema accepts valid values', () => {
    expect(skillLevelSchema.parse('beginner')).toBe('beginner')
    expect(skillLevelSchema.parse('intermediate')).toBe('intermediate')
    expect(skillLevelSchema.parse('advanced')).toBe('advanced')
  })

  it('skillLevelSchema rejects invalid values', () => {
    expect(() => skillLevelSchema.parse('expert')).toThrow()
  })

  it('budgetRangeSchema accepts valid values', () => {
    expect(budgetRangeSchema.parse('low')).toBe('low')
    expect(budgetRangeSchema.parse('medium')).toBe('medium')
    expect(budgetRangeSchema.parse('high')).toBe('high')
  })

  it('budgetRangeSchema rejects invalid values', () => {
    expect(() => budgetRangeSchema.parse('mega')).toThrow()
  })

  it('cakeStyleSchema accepts all valid styles', () => {
    for (const style of ['buttercream', 'fondant', 'naked', 'drip', 'other']) {
      expect(cakeStyleSchema.parse(style)).toBe(style)
    }
  })

  it('dietaryToggleSchema accepts all valid toggles', () => {
    for (const toggle of ['gluten-free', 'nut-free', 'vegan', 'lactose-free']) {
      expect(dietaryToggleSchema.parse(toggle)).toBe(toggle)
    }
  })

  it('requestStatusSchema accepts all valid statuses', () => {
    for (const status of [
      'draft',
      'generated',
      'shared',
      'approved',
      'rejected',
    ]) {
      expect(requestStatusSchema.parse(status)).toBe(status)
    }
  })
})

// =============================================================================
// createCakeRequestSchema
// =============================================================================

describe('createCakeRequestSchema', () => {
  const validInput = {
    customerPrompt: 'Space theme birthday cake',
    constraints: {
      servings: 12,
      skillLevel: 'beginner' as const,
      dietaryToggles: ['gluten-free' as const],
      dietaryNotes: '',
      budgetRange: 'medium' as const,
      preferredStyle: 'buttercream' as const,
    },
    numConcepts: 2,
  }

  it('accepts valid input', () => {
    const result = createCakeRequestSchema.parse(validInput)
    expect(result).toEqual(validInput)
  })

  it('rejects empty customerPrompt', () => {
    expect(() =>
      createCakeRequestSchema.parse({ ...validInput, customerPrompt: '' })
    ).toThrow()
  })

  it('rejects customerPrompt shorter than 3 characters', () => {
    expect(() =>
      createCakeRequestSchema.parse({ ...validInput, customerPrompt: 'ab' })
    ).toThrow()
  })

  it('rejects customerPrompt longer than 1000 characters', () => {
    expect(() =>
      createCakeRequestSchema.parse({
        ...validInput,
        customerPrompt: 'a'.repeat(1001),
      })
    ).toThrow()
  })

  it('rejects servings below 1', () => {
    expect(() =>
      createCakeRequestSchema.parse({
        ...validInput,
        constraints: { ...validInput.constraints, servings: 0 },
      })
    ).toThrow()
  })

  it('rejects servings above 200', () => {
    expect(() =>
      createCakeRequestSchema.parse({
        ...validInput,
        constraints: { ...validInput.constraints, servings: 201 },
      })
    ).toThrow()
  })

  it('rejects numConcepts below 1', () => {
    expect(() =>
      createCakeRequestSchema.parse({ ...validInput, numConcepts: 0 })
    ).toThrow()
  })

  it('rejects numConcepts above 5', () => {
    expect(() =>
      createCakeRequestSchema.parse({ ...validInput, numConcepts: 6 })
    ).toThrow()
  })

  it('accepts empty dietaryToggles array', () => {
    const input = {
      ...validInput,
      constraints: { ...validInput.constraints, dietaryToggles: [] },
    }
    expect(
      createCakeRequestSchema.parse(input).constraints.dietaryToggles
    ).toEqual([])
  })

  it('accepts multiple dietary toggles', () => {
    const input = {
      ...validInput,
      constraints: {
        ...validInput.constraints,
        dietaryToggles: ['gluten-free', 'vegan', 'lactose-free'] as const,
      },
    }
    expect(
      createCakeRequestSchema.parse(input).constraints.dietaryToggles
    ).toHaveLength(3)
  })

  it('rejects invalid dietary toggle', () => {
    expect(() =>
      createCakeRequestSchema.parse({
        ...validInput,
        constraints: {
          ...validInput.constraints,
          dietaryToggles: ['keto'],
        },
      })
    ).toThrow()
  })

  it('rejects dietaryNotes longer than 500 characters', () => {
    expect(() =>
      createCakeRequestSchema.parse({
        ...validInput,
        constraints: {
          ...validInput.constraints,
          dietaryNotes: 'a'.repeat(501),
        },
      })
    ).toThrow()
  })
})

// =============================================================================
// createCommentSchema
// =============================================================================

describe('createCommentSchema', () => {
  it('accepts valid comment', () => {
    const result = createCommentSchema.parse({
      authorName: 'Alice',
      message: 'Looks great!',
    })
    expect(result.authorName).toBe('Alice')
    expect(result.message).toBe('Looks great!')
  })

  it('rejects empty authorName', () => {
    expect(() =>
      createCommentSchema.parse({ authorName: '', message: 'text' })
    ).toThrow()
  })

  it('rejects empty message', () => {
    expect(() =>
      createCommentSchema.parse({ authorName: 'Alice', message: '' })
    ).toThrow()
  })

  it('rejects authorName longer than 100 characters', () => {
    expect(() =>
      createCommentSchema.parse({
        authorName: 'a'.repeat(101),
        message: 'text',
      })
    ).toThrow()
  })

  it('rejects message longer than 2000 characters', () => {
    expect(() =>
      createCommentSchema.parse({
        authorName: 'Alice',
        message: 'a'.repeat(2001),
      })
    ).toThrow()
  })
})

// =============================================================================
// createThemeCategorySchema
// =============================================================================

describe('createThemeCategorySchema', () => {
  it('accepts valid category', () => {
    const result = createThemeCategorySchema.parse({
      name: 'Space',
      description: 'Galactic cakes',
    })
    expect(result.name).toBe('Space')
  })

  it('rejects empty name', () => {
    expect(() =>
      createThemeCategorySchema.parse({ name: '', description: '' })
    ).toThrow()
  })

  it('rejects name longer than 100 characters', () => {
    expect(() =>
      createThemeCategorySchema.parse({
        name: 'a'.repeat(101),
        description: '',
      })
    ).toThrow()
  })

  it('rejects description longer than 500 characters', () => {
    expect(() =>
      createThemeCategorySchema.parse({
        name: 'Space',
        description: 'a'.repeat(501),
      })
    ).toThrow()
  })
})

// =============================================================================
// createBonanzaScheduleSchema
// =============================================================================

describe('createBonanzaScheduleSchema', () => {
  it('accepts valid schedule', () => {
    const result = createBonanzaScheduleSchema.parse({
      teamName: 'Design Team',
      startDate: '2026-03-01',
      cadence: 'weekly',
    })
    expect(result.teamName).toBe('Design Team')
    expect(result.cadence).toBe('weekly')
  })

  it('rejects empty teamName', () => {
    expect(() =>
      createBonanzaScheduleSchema.parse({
        teamName: '',
        startDate: '2026-03-01',
        cadence: 'weekly',
      })
    ).toThrow()
  })

  it('rejects empty startDate', () => {
    expect(() =>
      createBonanzaScheduleSchema.parse({
        teamName: 'Team',
        startDate: '',
        cadence: 'weekly',
      })
    ).toThrow()
  })

  it('only accepts weekly cadence', () => {
    expect(() =>
      createBonanzaScheduleSchema.parse({
        teamName: 'Team',
        startDate: '2026-03-01',
        cadence: 'monthly',
      })
    ).toThrow()
  })
})
