import express from 'express'
import { config } from './config'
import recipesRouter from './routes/recipes'
import dealsRouter from './routes/deals'
import userRouter from './routes/user'
import mealPlanRouter from './routes/mealPlan'
import shoppingListRouter from './routes/shoppingList'
import supermarketsRouter from './routes/supermarkets'

const app = express()

app.use(express.json())

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', config.frontendUrl)
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(204).end()
  next()
})

// Routes
app.use('/api/recipes', recipesRouter)
app.use('/api/deals', dealsRouter)
app.use('/api/user', userRouter)
app.use('/api/meal-plan', mealPlanRouter)
app.use('/api/shopping-list', shoppingListRouter)
app.use('/api/supermarkets', supermarketsRouter)

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ success: false, error: 'Internal server error' })
})

export default app
