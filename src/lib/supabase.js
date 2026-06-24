import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Give every visitor a silent anonymous identity
supabase.auth.getSession().then(({ data: { session } }) => {
  if (!session) supabase.auth.signInAnonymously()
})