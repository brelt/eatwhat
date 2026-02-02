import { Router, Request, Response } from 'express'
import { verifyToken } from '../middleware/auth'
import { supabaseService } from '../supabase'
import { generateShoppingList } from '../services/shoppingListService'

const router = Router()

// GET /api/shopping-list/:meal_plan_id
router.get('/:meal_plan_id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    // Verify meal plan belongs to user
    const { data: plan } = await supabaseService
      .from('meal_plans')
      .select('id')
      .eq('id', req.params.meal_plan_id)
      .eq('user_id', userId)
      .single()

    if (!plan) {
      return res.status(404).json({ success: false, error: 'Meal plan not found' })
    }

    const result = await generateShoppingList(req.params.meal_plan_id)
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate shopping list' })
  }
})

export default router
