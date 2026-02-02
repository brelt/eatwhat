// ── DB Row Types ────────────────────────────────────────────

export interface UserPreferenceRow {
  id: string
  user_id: string
  household_size: number
  weekly_budget: number | null
  cuisine_preferences: string[]
  dietary_restrictions: string[]
  cooking_skill_level: 'easy' | 'medium' | 'hard'
  max_cooking_time: number
  location_suburb: string | null
  created_at: string
  updated_at: string
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sodium?: number
}

export interface RecipeRow {
  id: string
  name: string
  name_en: string | null
  description: string | null
  cuisine_type: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  cooking_time: number
  servings: number
  image_url: string | null
  estimated_cost: number | null
  nutrition_info: NutritionInfo | null
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RecipeIngredientRow {
  id: string
  recipe_id: string
  name: string
  name_en: string | null
  quantity: number
  unit: string
  category: string | null
  notes: string | null
}

export interface RecipeStepRow {
  id: string
  recipe_id: string
  step_number: number
  instruction: string
  image_url: string | null
  duration: number | null
}

export interface SupermarketProductRow {
  id: string
  supermarket_brand: string
  product_id: string
  name: string
  category: string | null
  brand: string | null
  size: string | null
  image_url: string | null
  current_price: number
  original_price: number | null
  is_on_sale: boolean
  discount_percentage: number | null
  sale_end_date: string | null
  scraped_at: string
  created_at: string
  updated_at: string
}

export interface MealPlanRow {
  id: string
  user_id: string
  week_start_date: string
  total_budget: number | null
  preferences: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface MealPlanItemRow {
  id: string
  meal_plan_id: string
  recipe_id: string
  day_of_week: number
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  servings: number
  estimated_cost: number | null
  meal_date: string | null
}

export interface UserFavoriteRow {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
}

// ── API Request Types ───────────────────────────────────────

export interface UpdatePreferencesRequest {
  household_size?: number
  weekly_budget?: number
  cuisine_preferences?: string[]
  dietary_restrictions?: string[]
  cooking_skill_level?: 'easy' | 'medium' | 'hard'
  max_cooking_time?: number
  location_suburb?: string
}

export interface GenerateMealPlanRequest {
  week_start_date: string
  preferences: {
    household_size: number
    weekly_budget: number
    cuisine_preferences: string[]
    dietary_restrictions: string[]
    max_cooking_time: number
  }
}

export interface ReplaceMealRequest {
  meal_plan_item_id: string
}

// ── API Response Types ──────────────────────────────────────

export interface ShoppingListItem {
  ingredient_name: string
  ingredient_name_en: string | null
  quantity: number
  unit: string
  matched_product: SupermarketProductRow | null
  match_score: number
}

export interface ShoppingListResponse {
  items_by_supermarket: {
    Woolworths: ShoppingListItem[]
    Coles: ShoppingListItem[]
    ALDI: ShoppingListItem[]
  }
  unmatched: ShoppingListItem[]
  total_cost: number
}
