// =============================================================================
// CakeGen — Environment helpers
// Reads VITE_OPENAI_API_KEY and exposes a flag for AI availability.
// =============================================================================

/**
 * The OpenAI API key from .env.local (VITE_OPENAI_API_KEY).
 * Empty string if not configured.
 */
export const OPENAI_API_KEY: string =
  import.meta.env.VITE_OPENAI_API_KEY?.trim() ?? ''

/**
 * True when a real OpenAI API key is available.
 * When false, the app falls back to mock AI generation.
 */
export const isAIEnabled: boolean =
  OPENAI_API_KEY.length > 0 && OPENAI_API_KEY !== 'your-key-here'
