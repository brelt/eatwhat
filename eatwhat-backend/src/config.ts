import dotenv from 'dotenv'

dotenv.config()

const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY']
for (const v of requiredVars) {
  if (!process.env[v]) {
    console.error(`Missing required env var: ${v}`)
    process.exit(1)
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY!,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
}
