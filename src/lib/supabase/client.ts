import { createClient } from '@supabase/supabase-js'

// IMPORTANT: These are placeholder variables.
// You will need to create a .env.local file in the root of your project
// and add your Supabase URL and Anon Key to it.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
