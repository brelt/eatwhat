import { supabaseService } from '../supabase'
import { RecipeRow, MealPlanRow, GenerateMealPlanRequest } from '../types'

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export async function generateMealPlan(userId: string, request: GenerateMealPlanRequest) {
  const { preferences, week_start_date } = request
  const budgetPerMeal = preferences.weekly_budget / 14

  // 1. Fetch candidate recipes
  let query = supabaseService.from('recipes').select('*').eq('is_active', true)

  if (preferences.cuisine_preferences.length > 0) {
    query = query.in('cuisine_type', preferences.cuisine_preferences)
  }
  if (preferences.max_cooking_time) {
    query = query.lte('cooking_time', preferences.max_cooking_time)
  }
  query = query.lte('estimated_cost', budgetPerMeal * preferences.household_size)

  const { data: candidates, error } = await query
  if (error) throw error
  if (!candidates || candidates.length === 0) {
    throw new Error('No recipes match the given preferences')
  }

  const recipes = candidates as RecipeRow[]

  // 2. Generate 14 meals (7 days x lunch + dinner)
  //    After exhausting unique recipes, reset and allow repeats
  const mealSlots: { day: number; type: string }[] = []
  for (let day = 0; day < 7; day++) {
    mealSlots.push({ day, type: 'lunch' })
    mealSlots.push({ day, type: 'dinner' })
  }

  let pool = fisherYatesShuffle(recipes)
  const meals: { day_of_week: number; meal_type: string; recipe: RecipeRow; estimated_cost: number }[] = []

  for (const slot of mealSlots) {
    if (pool.length === 0) {
      pool = fisherYatesShuffle(recipes)
    }
    const recipe = pool.shift()!
    const costPerMeal = ((recipe.estimated_cost || 0) / recipe.servings) * preferences.household_size

    meals.push({
      day_of_week: slot.day,
      meal_type: slot.type,
      recipe,
      estimated_cost: costPerMeal,
    })
  }

  const totalCost = meals.reduce((sum, m) => sum + m.estimated_cost, 0)

  // 3. Insert meal plan
  const { data: mealPlan, error: planErr } = await supabaseService
    .from('meal_plans')
    .insert({
      user_id: userId,
      week_start_date,
      total_budget: preferences.weekly_budget,
      preferences,
    })
    .select()
    .single()

  if (planErr) throw planErr

  // 4. Insert meal plan items
  const items = meals.map((m) => {
    const date = new Date(week_start_date)
    date.setDate(date.getDate() + m.day_of_week)
    return {
      meal_plan_id: (mealPlan as MealPlanRow).id,
      recipe_id: m.recipe.id,
      day_of_week: m.day_of_week,
      meal_type: m.meal_type,
      servings: preferences.household_size,
      estimated_cost: m.estimated_cost,
      meal_date: date.toISOString().split('T')[0],
    }
  })

  await supabaseService.from('meal_plan_items').insert(items)

  // 5. Return full plan
  return {
    meal_plan_id: (mealPlan as MealPlanRow).id,
    week_start_date,
    total_cost: parseFloat(totalCost.toFixed(2)),
    meals: meals.map((m) => ({
      day_of_week: m.day_of_week,
      meal_type: m.meal_type,
      recipe: {
        id: m.recipe.id,
        name: m.recipe.name,
        name_en: m.recipe.name_en,
        estimated_cost: m.recipe.estimated_cost,
        cooking_time: m.recipe.cooking_time,
        difficulty: m.recipe.difficulty,
      },
      estimated_cost: m.estimated_cost,
    })),
  }
}

export async function getMealPlan(mealPlanId: string, userId: string) {
  const { data: plan, error: planErr } = await supabaseService
    .from('meal_plans')
    .select('*')
    .eq('id', mealPlanId)
    .eq('user_id', userId)
    .single()

  if (planErr || !plan) return null

  const { data: items } = await supabaseService
    .from('meal_plan_items')
    .select('*')
    .eq('meal_plan_id', mealPlanId)
    .order('day_of_week')
    .order('meal_type')

  const recipeIds = (items || []).map((item: any) => item.recipe_id)
  const { data: recipes } = await supabaseService
    .from('recipes')
    .select('*')
    .in('id', recipeIds)

  const recipeMap = new Map((recipes || []).map((r: any) => [r.id, r]))

  return {
    ...(plan as MealPlanRow),
    meals: (items || []).map((item: any) => ({
      ...item,
      recipe: recipeMap.get(item.recipe_id) || null,
    })),
  }
}

export async function replaceMeal(mealPlanId: string, mealPlanItemId: string, userId: string) {
  // Verify plan belongs to user
  const { data: plan } = await supabaseService
    .from('meal_plans')
    .select('*')
    .eq('id', mealPlanId)
    .eq('user_id', userId)
    .single()

  if (!plan) throw new Error('Meal plan not found')

  // Get current item
  const { data: currentItem } = await supabaseService
    .from('meal_plan_items')
    .select('*')
    .eq('id', mealPlanItemId)
    .eq('meal_plan_id', mealPlanId)
    .single()

  if (!currentItem) throw new Error('Meal plan item not found')

  // Fetch candidates using stored preferences
  const prefs = (plan as MealPlanRow).preferences || {}
  const householdSize = (prefs as any).household_size || 2

  let query = supabaseService.from('recipes').select('*').eq('is_active', true)
  if ((prefs as any).cuisine_preferences?.length > 0) {
    query = query.in('cuisine_type', (prefs as any).cuisine_preferences)
  }
  const { data: candidates } = await query
  if (!candidates || candidates.length === 0) throw new Error('No recipes available')

  // Pick a random recipe different from current
  const available = candidates.filter((r: any) => r.id !== (currentItem as any).recipe_id)
  const pool = available.length > 0 ? available : candidates
  const newRecipe = pool[Math.floor(Math.random() * pool.length)] as RecipeRow
  const newCost = ((newRecipe.estimated_cost || 0) / newRecipe.servings) * householdSize

  // Update the item
  await supabaseService
    .from('meal_plan_items')
    .update({ recipe_id: newRecipe.id, estimated_cost: newCost })
    .eq('id', mealPlanItemId)

  // Recalculate total cost
  const { data: allItems } = await supabaseService
    .from('meal_plan_items')
    .select('estimated_cost')
    .eq('meal_plan_id', mealPlanId)

  const newTotal = (allItems || []).reduce((sum: number, item: any) => sum + (item.estimated_cost || 0), 0)

  await supabaseService
    .from('meal_plans')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', mealPlanId)

  return {
    recipe: newRecipe,
    estimated_cost: parseFloat(newCost.toFixed(2)),
    total_cost: parseFloat(newTotal.toFixed(2)),
  }
}
