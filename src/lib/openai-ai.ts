// =============================================================================
// CakeGen — Real OpenAI AI Service
// Uses GPT-4o for text/recipes and DALL-E 3 for images.
// Same interface as mock-ai.ts — drop-in replacement.
// =============================================================================

import type {
  CakeConcept,
  CakeRequest,
  Recipe,
  ShoppingPlan,
  CakeExtras,
  CakeImage,
  Ingredient,
  RecipeStep,
  IngredientCost,
  StoreSuggestion,
  ThemeAddon,
  SkillLevel,
  StoreType,
} from '@/lib/types'
import { generateId } from '@/lib/storage'
import { getOpenAIClient } from '@/lib/openai-client'
import {
  CAKE_CONCEPT_SYSTEM_PROMPT,
  RECIPE_ONLY_SYSTEM_PROMPT,
  buildConceptGenerationPrompt,
  buildRecipeRegenerationPrompt,
  buildImagePrompt,
} from '@/lib/ai-prompts'

// --- Response type shapes (for parsing GPT-4o JSON output) ---

interface AIIngredient {
  name: string
  quantity: string
  unit: string
  notes?: string
}

interface AIRecipeStep {
  stepNumber: number
  instruction: string
}

interface AIIngredientCost {
  ingredientName: string
  storeType: string
  estimatedPrice: number
  currency?: string
}

interface AIStoreSuggestion {
  storeType: string
  rationale: string
}

interface AIThemeAddon {
  itemName: string
  estimatedPrice: number
  currency?: string
  storeSuggestion?: string
}

interface AIConcept {
  title: string
  description: string
  themeTags: string[]
  recipe: {
    ingredients: AIIngredient[]
    steps: AIRecipeStep[]
    timeEstimateMinutes: number
    difficulty: string
    equipment: string[]
  }
  shoppingPlan: {
    storeSuggestions: AIStoreSuggestion[]
    ingredientCosts: AIIngredientCost[]
    totalEstimatedCost: number
    currency?: string
  }
  extras: {
    themeAddons: AIThemeAddon[]
    addonsTotalEstimatedCost: number
    currency?: string
  }
}

interface AIConceptsResponse {
  concepts: AIConcept[]
}

interface AIRecipeResponse {
  recipe: {
    ingredients: AIIngredient[]
    steps: AIRecipeStep[]
    timeEstimateMinutes: number
    difficulty: string
    equipment: string[]
  }
  shoppingPlan: {
    storeSuggestions: AIStoreSuggestion[]
    ingredientCosts: AIIngredientCost[]
    totalEstimatedCost: number
    currency?: string
  }
}

// --- Validation / coercion helpers ---

function toSkillLevel(s: string): SkillLevel {
  if (['beginner', 'intermediate', 'advanced'].includes(s))
    return s as SkillLevel
  return 'intermediate'
}

function toStoreType(s: string): StoreType {
  if (['budget', 'standard', 'premium'].includes(s)) return s as StoreType
  return 'standard'
}

function normalizeIngredients(raw: AIIngredient[]): Ingredient[] {
  return raw.map((i) => ({
    name: i.name,
    quantity: String(i.quantity),
    unit: i.unit,
    ...(i.notes ? { notes: i.notes } : {}),
  }))
}

function normalizeSteps(raw: AIRecipeStep[]): RecipeStep[] {
  return raw.map((s, idx) => ({
    stepNumber: s.stepNumber ?? idx + 1,
    instruction: s.instruction,
  }))
}

function normalizeRecipe(raw: AIConcept['recipe']): Recipe {
  return {
    ingredients: normalizeIngredients(raw.ingredients),
    steps: normalizeSteps(raw.steps),
    timeEstimateMinutes: raw.timeEstimateMinutes ?? 180,
    difficulty: toSkillLevel(raw.difficulty),
    equipment: raw.equipment ?? [],
  }
}

function normalizeIngredientCosts(raw: AIIngredientCost[]): IngredientCost[] {
  return raw.map((c) => ({
    ingredientName: c.ingredientName,
    storeType: toStoreType(c.storeType),
    estimatedPrice: c.estimatedPrice,
    currency: c.currency ?? 'USD',
  }))
}

function normalizeStoreSuggestions(
  raw: AIStoreSuggestion[]
): StoreSuggestion[] {
  return raw.map((s) => ({
    storeType: toStoreType(s.storeType),
    rationale: s.rationale,
  }))
}

function normalizeShoppingPlan(raw: AIConcept['shoppingPlan']): ShoppingPlan {
  return {
    storeSuggestions: normalizeStoreSuggestions(raw.storeSuggestions ?? []),
    ingredientCosts: normalizeIngredientCosts(raw.ingredientCosts ?? []),
    totalEstimatedCost: raw.totalEstimatedCost ?? 0,
    currency: raw.currency ?? 'USD',
  }
}

function normalizeExtras(raw: AIConcept['extras']): CakeExtras {
  return {
    themeAddons: (raw.themeAddons ?? []).map(
      (a): ThemeAddon => ({
        itemName: a.itemName,
        estimatedPrice: a.estimatedPrice,
        currency: a.currency ?? 'USD',
        storeSuggestion: toStoreType(a.storeSuggestion ?? 'standard'),
      })
    ),
    addonsTotalEstimatedCost: raw.addonsTotalEstimatedCost ?? 0,
    currency: raw.currency ?? 'USD',
  }
}

// --- Error helpers ---

function friendlyError(err: unknown): Error {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    if (msg.includes('401') || msg.includes('invalid api key')) {
      return new Error(
        'Invalid OpenAI API key. Check VITE_OPENAI_API_KEY in your .env.local file.'
      )
    }
    if (msg.includes('429') || msg.includes('rate limit')) {
      return new Error(
        'OpenAI rate limit reached. Please wait a moment and try again.'
      )
    }
    if (msg.includes('insufficient_quota') || msg.includes('quota')) {
      return new Error(
        'OpenAI API quota exceeded. Check your billing at platform.openai.com.'
      )
    }
    if (msg.includes('timeout') || msg.includes('timed out')) {
      return new Error(
        'OpenAI request timed out. The AI is taking too long — try again or reduce the number of concepts.'
      )
    }
    return new Error(`AI generation failed: ${err.message}`)
  }
  return new Error('AI generation failed unexpectedly.')
}

// --- GPT-4o text generation ---

async function generateConceptsText(
  request: CakeRequest
): Promise<AIConcept[]> {
  const client = getOpenAIClient()

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: CAKE_CONCEPT_SYSTEM_PROMPT },
      { role: 'user', content: buildConceptGenerationPrompt(request) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
    max_tokens: 4096 * request.numConcepts, // Scale tokens with concept count
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('GPT-4o returned an empty response.')
  }

  const parsed: AIConceptsResponse = JSON.parse(content)
  if (!parsed.concepts || !Array.isArray(parsed.concepts)) {
    // Some models might return a single concept not wrapped in array
    // Try to extract from the top-level object
    const raw = parsed as unknown as Record<string, unknown>
    const keys = Object.keys(raw)
    const arrayKey = keys.find((k) => Array.isArray(raw[k]))
    if (arrayKey) {
      return raw[arrayKey] as AIConcept[]
    }
    throw new Error('Unexpected response format from GPT-4o.')
  }

  return parsed.concepts
}

async function regenerateRecipeText(
  existing: CakeConcept,
  request: CakeRequest
): Promise<AIRecipeResponse> {
  const client = getOpenAIClient()

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: RECIPE_ONLY_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildRecipeRegenerationPrompt(existing, request),
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
    max_tokens: 4096,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('GPT-4o returned an empty response.')
  }

  return JSON.parse(content) as AIRecipeResponse
}

// --- DALL-E 3 image generation ---

async function generateImage(
  theme: string,
  title?: string,
  description?: string
): Promise<CakeImage> {
  const client = getOpenAIClient()
  const prompt = buildImagePrompt(theme, title, description)

  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid',
  })

  const imageUrl = response.data?.[0]?.url
  if (!imageUrl) {
    throw new Error('DALL-E 3 did not return an image URL.')
  }

  return {
    promptUsed: prompt,
    imageUrl,
  }
}

// --- Main public API (same signatures as mock-ai.ts) ---

export async function generateCakeConcepts(
  request: CakeRequest
): Promise<CakeConcept[]> {
  try {
    // Step 1: Generate text content for all concepts via GPT-4o
    const aiConcepts = await generateConceptsText(request)

    // Step 2: Generate images for each concept via DALL-E 3 (in parallel)
    const theme = request.customerPrompt
    const imagePromises = aiConcepts.map((c) =>
      generateImage(theme, c.title, c.description).catch((err) => {
        console.warn('Image generation failed, using fallback:', err)
        return fallbackImage(theme)
      })
    )
    const images = await Promise.all(imagePromises)

    // Step 3: Assemble CakeConcept objects
    return aiConcepts.map((aiConcept, i) => ({
      id: generateId(),
      requestId: request.id,
      title: aiConcept.title,
      themeTags: aiConcept.themeTags ?? [theme.toLowerCase()],
      description: aiConcept.description,
      recipe: normalizeRecipe(aiConcept.recipe),
      image: images[i],
      shoppingPlan: normalizeShoppingPlan(aiConcept.shoppingPlan),
      extras: normalizeExtras(aiConcept.extras),
      notes: '',
      savedToBank: false,
    }))
  } catch (err) {
    throw friendlyError(err)
  }
}

export type RegenerateMode = 'full' | 'recipe' | 'image'

export async function regenerateConcept(
  existing: CakeConcept,
  request: CakeRequest,
  mode: RegenerateMode
): Promise<Partial<CakeConcept>> {
  try {
    switch (mode) {
      case 'full': {
        // Generate new text + new image
        const aiConcepts = await generateConceptsText({
          ...request,
          numConcepts: 1,
        })
        const aiConcept = aiConcepts[0]
        if (!aiConcept) throw new Error('No concept returned.')

        const theme = request.customerPrompt
        const image = await generateImage(
          theme,
          aiConcept.title,
          aiConcept.description
        ).catch((err) => {
          console.warn('Image generation failed, using fallback:', err)
          return fallbackImage(theme)
        })

        return {
          title: aiConcept.title,
          description: aiConcept.description,
          themeTags: aiConcept.themeTags ?? [theme.toLowerCase()],
          recipe: normalizeRecipe(aiConcept.recipe),
          image,
          shoppingPlan: normalizeShoppingPlan(aiConcept.shoppingPlan),
          extras: normalizeExtras(aiConcept.extras),
        }
      }

      case 'recipe': {
        const recipeResp = await regenerateRecipeText(existing, request)
        return {
          recipe: normalizeRecipe(recipeResp.recipe),
          shoppingPlan: normalizeShoppingPlan(recipeResp.shoppingPlan),
        }
      }

      case 'image': {
        const theme = request.customerPrompt
        const image = await generateImage(
          theme,
          existing.title,
          existing.description
        )
        return { image }
      }
    }
  } catch (err) {
    throw friendlyError(err)
  }
}

// --- Fallback SVG image (same as mock, used when DALL-E fails) ---

function fallbackImage(theme: string): CakeImage {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6b21a8"/>
        <stop offset="100%" style="stop-color:#ec4899"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#bg)" rx="24"/>
    <text x="256" y="200" text-anchor="middle" fill="white" font-size="64" font-family="sans-serif">🎂</text>
    <text x="256" y="300" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif" opacity="0.9">Image generation failed</text>
    <text x="256" y="340" text-anchor="middle" fill="white" font-size="16" font-family="sans-serif" opacity="0.6">${theme}</text>
  </svg>`

  return {
    promptUsed: `Fallback — DALL-E 3 generation failed for theme: ${theme}`,
    imageUrl: `data:image/svg+xml,${encodeURIComponent(svg)}`,
  }
}
