import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Connection {
  id?: number
  first_name: string
  last_name: string
  url?: string
  email_address?: string
  company?: string
  position?: string
  connected_on?: string
  location?: string
  latitude?: number
  longitude?: number
  created_at?: string
  updated_at?: string
}
