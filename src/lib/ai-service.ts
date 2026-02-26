// =============================================================================
// CakeGen — AI Service Dispatcher
// Single import point for AI generation throughout the app.
// Routes to real OpenAI or mock based on environment configuration.
// =============================================================================

import { isAIEnabled } from '@/lib/env'
import type { CakeConcept, CakeRequest } from '@/lib/types'
import * as mockAI from '@/lib/mock-ai'
import * as openaiAI from '@/lib/openai-ai'

// Re-export the shared type
export type { RegenerateMode } from '@/lib/mock-ai'

/**
 * Whether the app is using real AI (OpenAI) or mock generation.
 */
export const aiMode: 'live' | 'mock' = isAIEnabled ? 'live' : 'mock'

/**
 * Generate cake concepts from a request.
 * Uses OpenAI GPT-4o + DALL-E 3 when API key is configured,
 * otherwise falls back to mock data.
 */
export async function generateCakeConcepts(
  request: CakeRequest
): Promise<CakeConcept[]> {
  if (isAIEnabled) {
    return openaiAI.generateCakeConcepts(request)
  }
  return mockAI.generateCakeConcepts(request)
}

/**
 * Regenerate parts of an existing concept.
 * Uses OpenAI when available, otherwise mock.
 */
export async function regenerateConcept(
  existing: CakeConcept,
  request: CakeRequest,
  mode: mockAI.RegenerateMode
): Promise<Partial<CakeConcept>> {
  if (isAIEnabled) {
    return openaiAI.regenerateConcept(existing, request, mode)
  }
  return mockAI.regenerateConcept(existing, request, mode)
}
