import { supabaseService } from '../supabase'
import { RecipeRow, RecipeIngredientRow, RecipeStepRow } from '../types'

export interface RecipeFilters {
  limit?: number
  offset?: number
  cuisine_type?: string
  difficulty?: string
  max_time?: number
  max_cost?: number
}

export async function getRecipes(filters: RecipeFilters) {
  let query = supabaseService
    .from('recipes')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (filters.cuisine_type) query = query.eq('cuisine_type', filters.cuisine_type)
  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty)
  if (filters.max_time) query = query.lte('cooking_time', filters.max_time)
  if (filters.max_cost) query = query.lte('estimated_cost', filters.max_cost)

  const offset = filters.offset || 0
  const limit = filters.limit || 20

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) throw error

  return { recipes: data as RecipeRow[], total: count || 0, offset, limit }
}

export async function getRecipeById(id: string) {
  const [recipeRes, ingredientsRes, stepsRes] = await Promise.all([
    supabaseService.from('recipes').select('*').eq('id', id).single(),
    supabaseService.from('recipe_ingredients').select('*').eq('recipe_id', id),
    supabaseService.from('recipe_steps').select('*').eq('recipe_id', id).order('step_number'),
  ])

  if (recipeRes.error || !recipeRes.data) return null

  return {
    ...(recipeRes.data as RecipeRow),
    ingredients: ingredientsRes.data as RecipeIngredientRow[],
    steps: stepsRes.data as RecipeStepRow[],
  }
}
