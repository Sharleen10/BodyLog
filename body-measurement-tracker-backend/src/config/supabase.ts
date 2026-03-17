import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Regular client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role for privileged operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// Helper to verify JWT from Supabase
export const verifySupabaseToken = async (token: string) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) throw error
    return user
  } catch (error) {
    return null
  }
}