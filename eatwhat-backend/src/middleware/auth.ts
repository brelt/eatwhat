import { Request, Response, NextFunction } from 'express'
import { supabaseService } from '../supabase'

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ success: false, error: 'Missing token' })
  }

  const { data, error } = await supabaseService.auth.getUser(token)
  if (error || !data.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  ;(req as any).user = data.user
  next()
}
