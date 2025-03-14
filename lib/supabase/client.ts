import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create a single instance that can be reused
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export const createClient = () => {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Anon Key is missing. Check your environment variables.")
  }

  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseInstance
}

