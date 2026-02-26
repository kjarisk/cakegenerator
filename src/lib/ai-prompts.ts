// =============================================================================
// CakeGen — AI Prompt Templates
// System prompts and prompt builders for GPT-4o + DALL-E 3.
// Separated from API call logic for easy iteration.
// =============================================================================

import type { CakeRequest, CakeConcept } from '@/lib/types'

// --- System prompts ---

export const CAKE_CONCEPT_SYSTEM_PROMPT = `You are an expert cake designer and baker who creates detailed cake concepts for themed celebrations. You combine creativity with practical baking knowledge.

When given a theme and constraints, you produce structured JSON output with:
- Creative, evocative titles
- Rich descriptions that paint a picture of the cake
- Detailed, accurate recipes with real ingredients and realistic quantities
- Practical equipment lists
- Honest time and difficulty estimates
- Cost estimates for ingredients at different store tiers (budget, standard, premium)
- Theme-appropriate decoration extras (toppers, candles, plates, etc.)

Always respect dietary constraints. If a cake must be gluten-free or vegan, adjust ALL ingredients accordingly — do not just mention it, actually substitute the ingredients.

Prices should be realistic USD estimates. Store types are:
- "budget": discount/bulk stores
- "standard": regular grocery stores  
- "premium": specialty/organic stores

Keep theme tags lowercase and relevant. Include the main theme, cake style, and budget level.`

export const RECIPE_ONLY_SYSTEM_PROMPT = `You are an expert baker who creates detailed cake recipes. You will be given an existing cake concept and must generate a NEW recipe variation while keeping the same theme and style.

Produce a new set of ingredients, steps, time estimate, difficulty, and equipment. Also produce updated cost estimates for the new ingredients.

Respect all dietary constraints from the original request. Adjust ingredient quantities based on serving count.`

// --- Prompt builders ---

/**
 * Build the user prompt for generating N cake concepts.
 */
export function buildConceptGenerationPrompt(request: CakeRequest): string {
  const c = request.constraints
  const dietaryInfo =
    c.dietaryToggles.length > 0
      ? `Dietary requirements: ${c.dietaryToggles.join(', ')}${c.dietaryNotes ? `. Additional notes: ${c.dietaryNotes}` : ''}`
      : c.dietaryNotes
        ? `Dietary notes: ${c.dietaryNotes}`
        : 'No specific dietary requirements.'

  return `Generate ${request.numConcepts} unique cake concept(s) for the following request:

**Theme / Occasion:** ${request.customerPrompt}
**Servings:** ${c.servings}
**Skill Level:** ${c.skillLevel}
**Preferred Style:** ${c.preferredStyle}
**Budget Range:** ${c.budgetRange}
**${dietaryInfo}**

For EACH concept, provide:
1. A creative title incorporating the theme
2. A vivid description (2-3 sentences)
3. Theme tags (3-5 lowercase tags)
4. A complete recipe:
   - Ingredients with name, quantity, unit, and optional notes
   - Numbered step-by-step instructions (8-12 steps)
   - Time estimate in minutes
   - Difficulty level (beginner/intermediate/advanced)
   - Equipment list
5. A shopping plan:
   - Store suggestions for budget, standard, and premium tiers with rationale
   - Per-ingredient cost estimates for at least budget and standard store types
   - Total estimated cost (use the average of budget and standard)
6. Theme extras/addons:
   - 4-6 theme-appropriate decoration items (toppers, candles, plates, etc.)
   - Estimated price and store tier suggestion for each
   - Total addon cost

Scale ingredient quantities for ${c.servings} servings. Be realistic about prices and time estimates.`
}

/**
 * Build the user prompt for regenerating only a recipe.
 */
export function buildRecipeRegenerationPrompt(
  existing: CakeConcept,
  request: CakeRequest
): string {
  const c = request.constraints
  return `Generate a NEW recipe variation for this existing cake concept:

**Cake Title:** ${existing.title}
**Theme:** ${request.customerPrompt}
**Description:** ${existing.description}

**Constraints:**
- Servings: ${c.servings}
- Skill Level: ${c.skillLevel}
- Style: ${c.preferredStyle}
- Budget: ${c.budgetRange}
- Dietary: ${c.dietaryToggles.length > 0 ? c.dietaryToggles.join(', ') : 'none'}${c.dietaryNotes ? ` (${c.dietaryNotes})` : ''}

Create a different recipe from the original — different flavor combinations or techniques, but still matching the theme. Include full ingredients, steps, equipment, time estimate, difficulty, and updated shopping plan with cost estimates.`
}

/**
 * Build a DALL-E 3 image generation prompt for a cake concept.
 */
export function buildImagePrompt(
  theme: string,
  conceptTitle?: string,
  conceptDescription?: string
): string {
  const titlePart = conceptTitle ? ` called "${conceptTitle}"` : ''
  const descPart = conceptDescription
    ? ` Description: ${conceptDescription}`
    : ''

  return `A beautiful ${theme}-themed celebration cake${titlePart} in concept art / moodboard illustration style. Rich, vibrant colors with detailed decorations and professional presentation. The cake should look impressive and creative, suitable for a themed celebration.${descPart} Style: digital illustration, clean composition, warm lighting, slightly stylized rather than photorealistic.`
}
