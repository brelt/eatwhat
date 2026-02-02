import { Router, Request, Response } from 'express'
import { verifyToken } from '../middleware/auth'
import { generateMealPlan, getMealPlan, replaceMeal } from '../services/mealPlanService'
import { GenerateMealPlanRequest, ReplaceMealRequest } from '../types'

const router = Router()

// POST /api/meal-plan/generate
router.post('/generate', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const body = req.body as GenerateMealPlanRequest
    const result = await generateMealPlan(userId, body)
    res.status(201).json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to generate meal plan' })
  }
})

// GET /api/meal-plan/:id
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const result = await getMealPlan(req.params.id, userId)
    if (!result) {
      return res.status(404).json({ success: false, error: 'Meal plan not found' })
    }
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch meal plan' })
  }
})

// PUT /api/meal-plan/:id/replace
router.put('/:id/replace', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const body = req.body as ReplaceMealRequest
    const result = await replaceMeal(req.params.id, body.meal_plan_item_id, userId)
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to replace meal' })
  }
})

export default router
