// =============================================================================
// CakeGen — Zod Validation Schemas
// Used for form validation (react-hook-form) and data integrity
// =============================================================================

import { z } from 'zod'

// --- Enum schemas ---

export const skillLevelSchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const budgetRangeSchema = z.enum(['low', 'medium', 'high'])

export const cakeStyleSchema = z.enum([
  'buttercream',
  'fondant',
  'naked',
  'drip',
  'other',
])

export const dietaryToggleSchema = z.enum([
  'gluten-free',
  'nut-free',
  'vegan',
  'lactose-free',
])

export const requestStatusSchema = z.enum([
  'draft',
  'generated',
  'shared',
  'approved',
  'rejected',
])

// --- Cake Request Form Schema ---

export const cakeRequestConstraintsSchema = z.object({
  servings: z
    .number()
    .min(1, 'At least 1 serving')
    .max(200, 'Max 200 servings'),
  skillLevel: skillLevelSchema,
  dietaryToggles: z.array(dietaryToggleSchema),
  dietaryNotes: z.string().max(500, 'Max 500 characters'),
  budgetRange: budgetRangeSchema,
  preferredStyle: cakeStyleSchema,
})

export const createCakeRequestSchema = z.object({
  customerPrompt: z
    .string()
    .min(3, 'Describe your theme in at least 3 characters')
    .max(1000, 'Max 1000 characters'),
  constraints: cakeRequestConstraintsSchema,
  numConcepts: z
    .number()
    .min(1, 'Generate at least 1 concept')
    .max(5, 'Max 5 concepts at a time'),
})

export type CreateCakeRequestInput = z.infer<typeof createCakeRequestSchema>

// --- Comment Schema ---

export const createCommentSchema = z.object({
  authorName: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Max 100 characters'),
  message: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Max 2000 characters'),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>

// --- Theme Category Schema ---

export const createThemeCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  description: z.string().max(500, 'Max 500 characters'),
})

export type CreateThemeCategoryInput = z.infer<typeof createThemeCategorySchema>

// --- Bonanza Assignment Schema ---

export const createBonanzaScheduleSchema = z.object({
  teamName: z
    .string()
    .min(1, 'Team name is required')
    .max(100, 'Max 100 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  cadence: z.literal('weekly'),
})

export type CreateBonanzaScheduleInput = z.infer<
  typeof createBonanzaScheduleSchema
>
