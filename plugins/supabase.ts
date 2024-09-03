import { Plugin } from '@nuxt/types'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabasePlugin: Plugin = ({ $config }, inject) => {
  const supabase: SupabaseClient = createClient(
    $config.SUPABASE_URL,
    $config.SUPABASE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  )

  inject('supabase', supabase)
}

export default supabasePlugin