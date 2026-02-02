import { Router, Request, Response } from 'express'
import { getRecipes, getRecipeById } from '../services/recipeService'
import { verifyToken } from '../middleware/auth'
import { supabaseService } from '../supabase'

const router = Router()

// GET /api/recipes
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await getRecipes({
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      cuisine_type: req.query.cuisine_type as string,
      difficulty: req.query.difficulty as string,
      max_time: req.query.max_time ? parseInt(req.query.max_time as string) : undefined,
      max_cost: req.query.max_cost ? parseFloat(req.query.max_cost as string) : undefined,
    })
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch recipes' })
  }
})

// GET /api/recipes/favorites — declared BEFORE /:id so Express doesn't capture "favorites" as an id
router.get('/favorites', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { data: favorites } = await supabaseService
      .from('user_favorites')
      .select('recipe_id')
      .eq('user_id', userId)

    const recipeIds = (favorites || []).map((f: any) => f.recipe_id)
    if (recipeIds.length === 0) {
      return res.json({ success: true, data: { recipes: [] } })
    }

    const { data: recipes } = await supabaseService
      .from('recipes')
      .select('*')
      .in('id', recipeIds)
      .eq('is_active', true)

    res.json({ success: true, data: { recipes } })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch favorites' })
  }
})

// GET /api/recipes/recommended — auto-applies user preferences as filters
router.get('/recommended', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const { data: prefs } = await supabaseService
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    let query = supabaseService
      .from('recipes')
      .select('*')
      .eq('is_active', true)

    if (prefs) {
      if (Array.isArray(prefs.cuisine_preferences) && prefs.cuisine_preferences.length > 0) {
        query = query.in('cuisine_type', prefs.cuisine_preferences)
      }
      if (prefs.max_cooking_time) {
        query = query.lte('cooking_time', prefs.max_cooking_time)
      }
      if (prefs.weekly_budget) {
        query = query.lte('estimated_cost', prefs.weekly_budget / 14)
      }
    }

    const { data: recipes, error } = await query.limit(20)
    if (error) throw error

    res.json({ success: true, data: { recipes: recipes || [] } })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch recommended recipes' })
  }
})

// GET /api/recipes/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const recipe = await getRecipeById(req.params.id)
    if (!recipe) {
      return res.status(404).json({ success: false, error: 'Recipe not found' })
    }
    res.json({ success: true, data: recipe })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch recipe' })
  }
})

// POST /api/recipes/:id/favorite
router.post('/:id/favorite', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await supabaseService.from('user_favorites').insert({
      user_id: userId,
      recipe_id: req.params.id,
    })
    res.status(201).json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add favorite' })
  }
})

// DELETE /api/recipes/:id/favorite
router.delete('/:id/favorite', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await supabaseService
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to remove favorite' })
  }
})

export default router
