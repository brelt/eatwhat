import { createClient } from '@supabase/supabase-js'
import { config } from './config'

export const supabaseAnon = createClient(config.supabaseUrl, config.supabaseAnonKey)
export const supabaseService = createClient(config.supabaseUrl, config.supabaseServiceKey)
