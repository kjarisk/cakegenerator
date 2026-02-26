// =============================================================================
// CakeGen — OpenAI Client
// Single shared instance, only created when API key is available.
// =============================================================================

import OpenAI from 'openai'
import { OPENAI_API_KEY, isAIEnabled } from '@/lib/env'

/**
 * Shared OpenAI client instance.
 * Only use this after checking `isAIEnabled`.
 * Throws if called without a valid API key.
 */
let _client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!isAIEnabled) {
    throw new Error(
      'OpenAI API key is not configured. Set VITE_OPENAI_API_KEY in .env.local'
    )
  }
  if (!_client) {
    _client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Required for client-side usage (local dev only)
    })
  }
  return _client
}
