import { Router, Request, Response } from 'express'
import { supabaseService } from '../supabase'

const router = Router()

// GET /api/deals
router.get('/', async (req: Request, res: Response) => {
  try {
    let query = supabaseService
      .from('supermarket_products')
      .select('*')
      .eq('is_on_sale', true)

    if (req.query.supermarket) {
      query = query.eq('supermarket_brand', req.query.supermarket as string)
    }
    if (req.query.category) {
      query = query.eq('category', req.query.category as string)
    }
    if (req.query.limit) {
      query = query.limit(parseInt(req.query.limit as string))
    }

    const { data, error } = await query
    if (error) throw error

    res.json({ success: true, data: { deals: data } })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch deals' })
  }
})

export default router
