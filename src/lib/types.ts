// =============================================================================
// CakeGen — Core Data Model Types
// Matches docs/outline.md Section 5 (Data model)
// =============================================================================

// --- Enums ---

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

export type BudgetRange = 'low' | 'medium' | 'high'

export type CakeStyle = 'buttercream' | 'fondant' | 'naked' | 'drip' | 'other'

export type RequestStatus =
  | 'draft'
  | 'generated'
  | 'shared'
  | 'approved'
  | 'rejected'

export type SharePermission = 'view' | 'comment'

export type StoreType = 'budget' | 'standard' | 'premium'

export type DietaryToggle =
  | 'gluten-free'
  | 'nut-free'
  | 'vegan'
  | 'lactose-free'

// --- Entities ---

export interface User {
  id: string
  displayName: string
  email?: string
  createdAt: string // ISO string
}

export interface CakeRequestConstraints {
  servings: number
  skillLevel: SkillLevel
  dietaryToggles: DietaryToggle[]
  dietaryNotes: string
  budgetRange: BudgetRange
  preferredStyle: CakeStyle
}

export interface CakeRequest {
  id: string
  createdAt: string
  createdByUserId: string
  customerPrompt: string
  constraints: CakeRequestConstraints
  numConcepts: number
  status: RequestStatus
}

export interface Ingredient {
  name: string
  quantity: string
  unit: string
  notes?: string
}

export interface RecipeStep {
  stepNumber: number
  instruction: string
}

export interface Recipe {
  ingredients: Ingredient[]
  steps: RecipeStep[]
  timeEstimateMinutes: number
  difficulty: SkillLevel
  equipment: string[]
}

export interface CakeImage {
  promptUsed: string
  imageUrl: string
}

export interface IngredientCost {
  ingredientName: string
  storeType: StoreType
  estimatedPrice: number
  currency: string
}

export interface StoreSuggestion {
  storeType: StoreType
  rationale: string
}

export interface ShoppingPlan {
  storeSuggestions: StoreSuggestion[]
  ingredientCosts: IngredientCost[]
  totalEstimatedCost: number
  currency: string
}

export interface ThemeAddon {
  itemName: string
  estimatedPrice: number
  currency: string
  storeSuggestion: StoreType
}

export interface CakeExtras {
  themeAddons: ThemeAddon[]
  addonsTotalEstimatedCost: number
  currency: string
}

export interface CakeConcept {
  id: string
  requestId: string
  title: string
  themeTags: string[]
  description: string
  recipe: Recipe
  image: CakeImage
  shoppingPlan: ShoppingPlan
  extras: CakeExtras
  notes: string
  savedToBank: boolean
}

export interface ThemeCategory {
  id: string
  name: string
  description: string
  cakeConceptIds: string[]
}

export interface ShareLink {
  id: string
  cakeConceptId: string
  token: string
  expiresAt?: string
  createdAt: string
  permission: SharePermission
}

export interface Comment {
  id: string
  shareLinkId?: string
  cakeConceptId: string
  authorName: string
  message: string
  createdAt: string
}

/** Day of week: 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

export type BonanzaPeriodStatus = 'active' | 'completed'

export interface BonanzaAssignment {
  weekStartDate: string
  userId: string
  cakeDay: DayOfWeek // default 5 (Friday), overridable per week
  cakeName?: string // optional theme/label for this week's cake
  themeCategoryId?: string
  cakeConceptId?: string
  rating?: number // 1–5 stars, undefined = not yet rated
}

export interface BonanzaSchedule {
  id: string
  teamName: string
  startDate: string
  endDate: string // end of period
  cadence: 'weekly'
  status: BonanzaPeriodStatus
  assignments: BonanzaAssignment[]
}

// --- App Database Shape ---

export interface AppDatabase {
  users: User[]
  cakeRequests: CakeRequest[]
  cakeConcepts: CakeConcept[]
  themeCategories: ThemeCategory[]
  shareLinks: ShareLink[]
  comments: Comment[]
  bonanzaSchedules: BonanzaSchedule[]
}
