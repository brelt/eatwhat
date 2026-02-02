import Fuse from 'fuse.js'
import { supabaseService } from '../supabase'
import { SupermarketProductRow, ShoppingListItem, ShoppingListResponse } from '../types'

interface AggregatedIngredient {
  name: string
  name_en: string | null
  quantity: number
  unit: string
}

export async function generateShoppingList(mealPlanId: string): Promise<ShoppingListResponse> {
  const empty: ShoppingListResponse = {
    items_by_supermarket: { Woolworths: [], Coles: [], ALDI: [] },
    unmatched: [],
    total_cost: 0,
  }

  // 1. Get meal plan items
  const { data: items } = await supabaseService
    .from('meal_plan_items')
    .select('*')
    .eq('meal_plan_id', mealPlanId)

  if (!items || items.length === 0) return empty

  // 2. Fetch ingredients for all recipes in the plan
  const recipeIds = [...new Set(items.map((item: any) => item.recipe_id))]
  const { data: ingredients } = await supabaseService
    .from('recipe_ingredients')
    .select('*')
    .in('recipe_id', recipeIds)

  if (!ingredients || ingredients.length === 0) return empty

  // 3. Aggregate ingredients by normalized key (name + unit)
  const aggregated = new Map<string, AggregatedIngredient>()

  for (const item of items) {
    const recipeIngredients = ingredients.filter((ing: any) => ing.recipe_id === item.recipe_id)
    for (const ing of recipeIngredients) {
      const key = `${((ing as any).name_en || (ing as any).name).toLowerCase()}|${(ing as any).unit}`
      const existing = aggregated.get(key)
      if (existing) {
        existing.quantity += (ing as any).quantity
      } else {
        aggregated.set(key, {
          name: (ing as any).name,
          name_en: (ing as any).name_en,
          quantity: (ing as any).quantity,
          unit: (ing as any).unit,
        })
      }
    }
  }

  // 4. Fetch all supermarket products for fuzzy matching
  const { data: products } = await supabaseService
    .from('supermarket_products')
    .select('*')

  const allProducts = (products || []) as SupermarketProductRow[]

  // 5. Fuzzy match each aggregated ingredient
  const fuse = new Fuse(allProducts, {
    keys: ['name'],
    threshold: 0.4,
    includeScore: true,
  })

  const matched: ShoppingListItem[] = []

  for (const [, ingredient] of aggregated) {
    const searchTerm = ingredient.name_en || ingredient.name
    const results = fuse.search(searchTerm)
    const bestMatch = results.length > 0 ? results[0] : null

    matched.push({
      ingredient_name: ingredient.name,
      ingredient_name_en: ingredient.name_en,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      matched_product: bestMatch ? bestMatch.item : null,
      match_score: bestMatch ? parseFloat((1 - (bestMatch.score || 1)).toFixed(2)) : 0,
    })
  }

  // 6. Group by supermarket
  const grouped: ShoppingListResponse['items_by_supermarket'] = {
    Woolworths: [],
    Coles: [],
    ALDI: [],
  }
  const unmatched: ShoppingListItem[] = []

  for (const item of matched) {
    if (!item.matched_product) {
      unmatched.push(item)
    } else {
      const brand = item.matched_product.supermarket_brand as keyof typeof grouped
      if (grouped[brand]) {
        grouped[brand].push(item)
      } else {
        unmatched.push(item)
      }
    }
  }

  // 7. Calculate total cost
  const totalCost = matched.reduce((sum, item) => {
    return sum + (item.matched_product ? item.matched_product.current_price : 0)
  }, 0)

  return {
    items_by_supermarket: grouped,
    unmatched,
    total_cost: parseFloat(totalCost.toFixed(2)),
  }
}
