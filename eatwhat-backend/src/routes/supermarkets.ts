import { Router, Request, Response } from 'express'
import { supabaseService } from '../supabase'

const router = Router()

// GET /api/supermarkets/nearby
// MVP: returns all supermarkets that have product data, with counts.
// Geo-based filtering is deferred — for now this returns every supermarket in the DB.
router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseService
      .from('supermarket_products')
      .select('supermarket_brand, is_on_sale')

    if (error) throw error

    const stats: Record<string, { total: number; on_sale: number }> = {}
    for (const row of (data || [])) {
      const brand = (row as any).supermarket_brand
      if (!stats[brand]) stats[brand] = { total: 0, on_sale: 0 }
      stats[brand].total++
      if ((row as any).is_on_sale) stats[brand].on_sale++
    }

    const supermarkets = Object.keys(stats).sort().map(name => ({
      name,
      total_products: stats[name].total,
      on_sale_count: stats[name].on_sale,
    }))

    res.json({ success: true, data: { supermarkets } })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch supermarkets' })
  }
})

export default router
