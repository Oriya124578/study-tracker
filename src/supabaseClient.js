import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'הדבק_כאן_את_המפתח_שלך') {
  // Fail fast with a clear message instead of silently creating a broken client
  // that only errors on the first API call.
  throw new Error(
    'Supabase URL or Anon Key is missing/invalid. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
