import { Router, Request, Response } from 'express'
import { verifyToken } from '../middleware/auth'
import { supabaseService } from '../supabase'
import { UpdatePreferencesRequest } from '../types'

const router = Router()

const DEFAULT_PREFERENCES = {
  household_size: 1,
  weekly_budget: 100,
  cuisine_preferences: [] as string[],
  dietary_restrictions: [] as string[],
  cooking_skill_level: 'medium',
  max_cooking_time: 60,
  location_suburb: null,
}

// GET /api/user/preferences
router.get('/preferences', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { data } = await supabaseService
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    res.json({ success: true, data: data || DEFAULT_PREFERENCES })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch preferences' })
  }
})

// PUT /api/user/preferences
router.put('/preferences', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const body = req.body as UpdatePreferencesRequest

    const { error } = await supabaseService
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          ...body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) throw error

    const { data } = await supabaseService
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update preferences' })
  }
})

export default router
