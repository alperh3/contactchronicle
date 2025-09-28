import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Connection {
  id?: number
  first_name: string
  last_name: string
  url?: string | null
  email_address?: string | null
  company?: string | null
  position?: string | null
  connected_on?: string | null
  location?: string | null
  latitude?: number | null
  longitude?: number | null
  created_at?: string
  updated_at?: string
}
