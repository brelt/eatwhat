import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

// Parse .env
const envContent = fs.readFileSync(path.resolve(__dirname, '..', '.env'), 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const i = line.indexOf('=')
  if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
})

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

interface SeedIngredient {
  name: string
  name_en: string
  quantity: number
  unit: string
  category: string
}

interface SeedStep {
  step_number: number
  instruction: string
  duration?: number
}

interface SeedRecipe {
  name: string
  name_en: string
  cuisine_type: string
  difficulty: string
  cooking_time: number
  servings: number
  image_url?: string
  estimated_cost: number
  nutrition_info: Record<string, number>
  tags: string[]
  ingredients: SeedIngredient[]
  steps: SeedStep[]
}

async function main() {
  const seedData: SeedRecipe[] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'seed-recipes.json'), 'utf-8')
  )

  console.log(`Importing ${seedData.length} recipes...`)

  for (const recipe of seedData) {
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        name: recipe.name,
        name_en: recipe.name_en,
        cuisine_type: recipe.cuisine_type,
        difficulty: recipe.difficulty,
        cooking_time: recipe.cooking_time,
        servings: recipe.servings,
        image_url: recipe.image_url || null,
        estimated_cost: recipe.estimated_cost,
        nutrition_info: recipe.nutrition_info,
        tags: recipe.tags,
        is_active: true,
      })
      .select('id')
      .single()

    if (error) {
      console.error(`Failed to insert recipe "${recipe.name}":`, error.message)
      continue
    }

    const recipeId = data.id

    // Insert ingredients
    if (recipe.ingredients.length > 0) {
      const { error: ingErr } = await supabase
        .from('recipe_ingredients')
        .insert(
          recipe.ingredients.map(ing => ({
            recipe_id: recipeId,
            name: ing.name,
            name_en: ing.name_en,
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category,
          }))
        )
      if (ingErr) console.error(`  Failed ingredients for "${recipe.name}":`, ingErr.message)
    }

    // Insert steps
    if (recipe.steps.length > 0) {
      const { error: stepErr } = await supabase
        .from('recipe_steps')
        .insert(
          recipe.steps.map(step => ({
            recipe_id: recipeId,
            step_number: step.step_number,
            instruction: step.instruction,
            duration: step.duration || null,
          }))
        )
      if (stepErr) console.error(`  Failed steps for "${recipe.name}":`, stepErr.message)
    }

    console.log(`  Imported: ${recipe.name} (${recipe.name_en})`)
  }

  console.log('Done.')
}

main()
