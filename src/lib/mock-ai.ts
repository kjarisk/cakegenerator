// =============================================================================
// CakeGen — Mock AI Generation Service
// Returns realistic placeholder data for cake concepts.
// Will be replaced with real AI integration (OpenAI / Claude) later.
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
  ThemeAddon,
} from '@/lib/types'
import { generateId } from '@/lib/storage'

// --- Simulated delay ---

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// --- Mock data generators ---

const MOCK_TITLES = [
  'Enchanted {theme} Layer Cake',
  '{theme} Fantasy Dream Cake',
  'The Ultimate {theme} Celebration',
  '{theme} Showstopper Tower',
  'Whimsical {theme} Delight',
]

const MOCK_DESCRIPTIONS = [
  'A stunning multi-layered cake that captures the essence of {theme} with vibrant colors and intricate decorations. Perfect for celebrations that need that extra wow factor.',
  'This creative {theme}-inspired cake combines classic flavors with eye-catching design elements. The concept art style brings the theme to life in a way that will delight guests of all ages.',
  'An elegant interpretation of the {theme} theme featuring carefully crafted decorations and a harmonious flavor profile. Designed to be both visually impressive and delicious.',
]

function generateMockIngredients(servings: number): Ingredient[] {
  const multiplier = servings / 12 // base recipe is 12 servings
  return [
    {
      name: 'All-purpose flour',
      quantity: `${(3 * multiplier).toFixed(1)}`,
      unit: 'cups',
    },
    {
      name: 'Granulated sugar',
      quantity: `${(2 * multiplier).toFixed(1)}`,
      unit: 'cups',
    },
    {
      name: 'Butter (unsalted)',
      quantity: `${(1.5 * multiplier).toFixed(1)}`,
      unit: 'cups',
      notes: 'room temperature',
    },
    {
      name: 'Eggs',
      quantity: `${Math.ceil(4 * multiplier)}`,
      unit: 'large',
    },
    {
      name: 'Whole milk',
      quantity: `${(1.5 * multiplier).toFixed(1)}`,
      unit: 'cups',
    },
    {
      name: 'Vanilla extract',
      quantity: `${(2 * multiplier).toFixed(0)}`,
      unit: 'tsp',
    },
    {
      name: 'Baking powder',
      quantity: `${(2.5 * multiplier).toFixed(1)}`,
      unit: 'tsp',
    },
    { name: 'Salt', quantity: '1', unit: 'tsp' },
    {
      name: 'Powdered sugar',
      quantity: `${(4 * multiplier).toFixed(1)}`,
      unit: 'cups',
      notes: 'for frosting',
    },
    {
      name: 'Food coloring',
      quantity: 'as needed',
      unit: '',
      notes: 'theme-appropriate colors',
    },
    {
      name: 'Fondant or buttercream',
      quantity: `${(2 * multiplier).toFixed(1)}`,
      unit: 'lbs',
      notes: 'for decorations',
    },
  ]
}

function generateMockSteps(): RecipeStep[] {
  return [
    {
      stepNumber: 1,
      instruction:
        'Preheat oven to 350°F (175°C). Grease and flour two 9-inch round cake pans.',
    },
    {
      stepNumber: 2,
      instruction:
        'Whisk together flour, baking powder, and salt in a large bowl. Set aside.',
    },
    {
      stepNumber: 3,
      instruction:
        'Beat butter and sugar until light and fluffy (about 3-4 minutes). Add eggs one at a time, then vanilla.',
    },
    {
      stepNumber: 4,
      instruction:
        'Alternately add flour mixture and milk to the butter mixture, beginning and ending with flour. Mix until just combined.',
    },
    {
      stepNumber: 5,
      instruction:
        'Divide batter between prepared pans. Bake 25-30 minutes until a toothpick comes out clean.',
    },
    {
      stepNumber: 6,
      instruction:
        'Cool in pans for 10 minutes, then turn out onto wire racks to cool completely.',
    },
    {
      stepNumber: 7,
      instruction:
        'Prepare frosting: beat butter until creamy, then gradually add powdered sugar. Add milk and vanilla until desired consistency.',
    },
    {
      stepNumber: 8,
      instruction:
        'Level cake layers, apply crumb coat, refrigerate 30 minutes, then apply final frosting layer.',
    },
    {
      stepNumber: 9,
      instruction:
        'Add theme-specific decorations using fondant, piping, and edible decorations. Follow the concept image as a guide.',
    },
    {
      stepNumber: 10,
      instruction:
        'Refrigerate for at least 1 hour before serving. Allow to come to room temperature 30 minutes before cutting.',
    },
  ]
}

function generateMockRecipe(servings: number): Recipe {
  return {
    ingredients: generateMockIngredients(servings),
    steps: generateMockSteps(),
    timeEstimateMinutes: servings <= 12 ? 180 : servings <= 24 ? 240 : 300,
    difficulty: servings <= 12 ? 'intermediate' : 'advanced',
    equipment: [
      '2x 9-inch round cake pans',
      'Stand mixer or hand mixer',
      'Wire cooling racks',
      'Offset spatula',
      'Piping bags and tips',
      'Cake turntable',
      'Fondant rolling pin',
      'Food coloring',
    ],
  }
}

function generateMockIngredientCosts(
  ingredients: Ingredient[]
): IngredientCost[] {
  const prices: Record<string, Record<string, number>> = {
    'All-purpose flour': { budget: 2.5, standard: 3.5, premium: 5.0 },
    'Granulated sugar': { budget: 2.0, standard: 3.0, premium: 4.5 },
    'Butter (unsalted)': { budget: 4.0, standard: 5.5, premium: 8.0 },
    Eggs: { budget: 3.0, standard: 4.5, premium: 7.0 },
    'Whole milk': { budget: 2.0, standard: 3.0, premium: 5.0 },
    'Vanilla extract': { budget: 3.0, standard: 6.0, premium: 12.0 },
    'Baking powder': { budget: 2.0, standard: 3.0, premium: 4.0 },
    Salt: { budget: 1.0, standard: 2.0, premium: 3.5 },
    'Powdered sugar': { budget: 2.5, standard: 3.5, premium: 5.0 },
    'Food coloring': { budget: 3.0, standard: 5.0, premium: 8.0 },
    'Fondant or buttercream': { budget: 6.0, standard: 10.0, premium: 18.0 },
  }

  return ingredients.flatMap((ingredient) => {
    const p = prices[ingredient.name] || {
      budget: 3.0,
      standard: 5.0,
      premium: 8.0,
    }
    return [
      {
        ingredientName: ingredient.name,
        storeType: 'budget' as const,
        estimatedPrice: p.budget,
        currency: 'USD',
      },
      {
        ingredientName: ingredient.name,
        storeType: 'standard' as const,
        estimatedPrice: p.standard,
        currency: 'USD',
      },
    ]
  })
}

function generateMockShoppingPlan(ingredients: Ingredient[]): ShoppingPlan {
  const costs = generateMockIngredientCosts(ingredients)
  const budgetTotal = costs
    .filter((c) => c.storeType === 'budget')
    .reduce((sum, c) => sum + c.estimatedPrice, 0)

  return {
    storeSuggestions: [
      {
        storeType: 'budget',
        rationale: 'Best value for basic baking ingredients',
      },
      {
        storeType: 'standard',
        rationale: 'Good balance of quality and price for most items',
      },
      {
        storeType: 'premium',
        rationale:
          'Best quality for specialty ingredients like vanilla and butter',
      },
    ],
    ingredientCosts: costs,
    totalEstimatedCost: Math.round(budgetTotal * 1.15 * 100) / 100, // average estimate
    currency: 'USD',
  }
}

function generateMockExtras(theme: string): CakeExtras {
  const addons: ThemeAddon[] = [
    {
      itemName: `${theme} cake topper`,
      estimatedPrice: 8.99,
      currency: 'USD',
      storeSuggestion: 'standard',
    },
    {
      itemName: 'Themed candles (set of 10)',
      estimatedPrice: 4.99,
      currency: 'USD',
      storeSuggestion: 'budget',
    },
    {
      itemName: 'Decorative cake board',
      estimatedPrice: 6.99,
      currency: 'USD',
      storeSuggestion: 'standard',
    },
    {
      itemName: `${theme} themed plates (pack of 20)`,
      estimatedPrice: 7.99,
      currency: 'USD',
      storeSuggestion: 'budget',
    },
    {
      itemName: 'Matching napkins (pack of 30)',
      estimatedPrice: 4.49,
      currency: 'USD',
      storeSuggestion: 'budget',
    },
    {
      itemName: 'Confetti / table scatter',
      estimatedPrice: 3.99,
      currency: 'USD',
      storeSuggestion: 'budget',
    },
  ]

  const total = addons.reduce((sum, a) => sum + a.estimatedPrice, 0)

  return {
    themeAddons: addons,
    addonsTotalEstimatedCost: Math.round(total * 100) / 100,
    currency: 'USD',
  }
}

// Placeholder gradient images for different themes
const THEME_COLORS: Record<string, [string, string]> = {
  space: ['#1a0533', '#4a00e0'],
  tropical: ['#0f9b0f', '#ffdd00'],
  halloween: ['#ff6600', '#1a1a2e'],
  christmas: ['#c41e3a', '#00563f'],
  retro: ['#ff6ec7', '#7873f5'],
  golf: ['#2d5016', '#90ee90'],
  ocean: ['#006994', '#00d4ff'],
  default: ['#6b21a8', '#ec4899'],
}

function generateMockImage(theme: string): CakeImage {
  // Use a placeholder SVG data URL with theme-appropriate colors
  const themeKey =
    Object.keys(THEME_COLORS).find((k) => theme.toLowerCase().includes(k)) ||
    'default'
  const [color1, color2] = THEME_COLORS[themeKey]

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1}"/>
        <stop offset="100%" style="stop-color:${color2}"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#bg)" rx="24"/>
    <text x="256" y="200" text-anchor="middle" fill="white" font-size="64" font-family="sans-serif">🎂</text>
    <text x="256" y="300" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif" opacity="0.9">Concept Art</text>
    <text x="256" y="340" text-anchor="middle" fill="white" font-size="16" font-family="sans-serif" opacity="0.6">${theme}</text>
  </svg>`

  const imageUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`

  return {
    promptUsed: `A beautiful ${theme}-themed celebration cake in concept art / moodboard illustration style. Rich colors, detailed decorations, professional presentation.`,
    imageUrl,
  }
}

// --- Main generation function ---

export async function generateCakeConcepts(
  request: CakeRequest
): Promise<CakeConcept[]> {
  // Simulate AI processing time
  await delay(1500 + Math.random() * 2000)

  const theme = request.customerPrompt
  const concepts: CakeConcept[] = []

  for (let i = 0; i < request.numConcepts; i++) {
    const titleTemplate = MOCK_TITLES[i % MOCK_TITLES.length]
    const descTemplate = MOCK_DESCRIPTIONS[i % MOCK_DESCRIPTIONS.length]
    const recipe = generateMockRecipe(request.constraints.servings)

    concepts.push({
      id: generateId(),
      requestId: request.id,
      title: titleTemplate.replace('{theme}', theme),
      themeTags: [
        theme.toLowerCase(),
        request.constraints.preferredStyle,
        request.constraints.budgetRange + ' budget',
      ],
      description: descTemplate.replace(/{theme}/g, theme),
      recipe,
      image: generateMockImage(theme),
      shoppingPlan: generateMockShoppingPlan(recipe.ingredients),
      extras: generateMockExtras(theme),
      notes: '',
      savedToBank: false,
    })
  }

  return concepts
}

// --- Regeneration types ---

export type RegenerateMode = 'full' | 'recipe' | 'image'

// --- Regeneration functions ---

/**
 * Regenerate an entire concept (new recipe, image, shopping plan, extras).
 * Keeps the same id, requestId, savedToBank, and notes.
 */
export async function regenerateFullConcept(
  _existing: CakeConcept,
  request: CakeRequest
): Promise<Partial<CakeConcept>> {
  await delay(1500 + Math.random() * 2000)

  const theme = request.customerPrompt
  const titleTemplate =
    MOCK_TITLES[Math.floor(Math.random() * MOCK_TITLES.length)]
  const descTemplate =
    MOCK_DESCRIPTIONS[Math.floor(Math.random() * MOCK_DESCRIPTIONS.length)]
  const recipe = generateMockRecipe(request.constraints.servings)

  return {
    title: titleTemplate.replace('{theme}', theme),
    description: descTemplate.replace(/{theme}/g, theme),
    themeTags: [
      theme.toLowerCase(),
      request.constraints.preferredStyle,
      request.constraints.budgetRange + ' budget',
    ],
    recipe,
    image: generateMockImage(theme),
    shoppingPlan: generateMockShoppingPlan(recipe.ingredients),
    extras: generateMockExtras(theme),
  }
}

/**
 * Regenerate only the recipe (ingredients, steps, time, difficulty, equipment)
 * and update shopping plan to match the new ingredients.
 */
export async function regenerateRecipeOnly(
  _existing: CakeConcept,
  request: CakeRequest
): Promise<Partial<CakeConcept>> {
  await delay(1000 + Math.random() * 1500)

  const recipe = generateMockRecipe(request.constraints.servings)

  return {
    recipe,
    shoppingPlan: generateMockShoppingPlan(recipe.ingredients),
  }
}

/**
 * Regenerate only the concept image.
 */
export async function regenerateImageOnly(
  _existing: CakeConcept,
  request: CakeRequest
): Promise<Partial<CakeConcept>> {
  await delay(800 + Math.random() * 1200)

  const theme = request.customerPrompt
  return {
    image: generateMockImage(theme),
  }
}

/**
 * Dispatcher: regenerate a concept based on mode.
 */
export async function regenerateConcept(
  existing: CakeConcept,
  request: CakeRequest,
  mode: RegenerateMode
): Promise<Partial<CakeConcept>> {
  switch (mode) {
    case 'full':
      return regenerateFullConcept(existing, request)
    case 'recipe':
      return regenerateRecipeOnly(existing, request)
    case 'image':
      return regenerateImageOnly(existing, request)
  }
}
