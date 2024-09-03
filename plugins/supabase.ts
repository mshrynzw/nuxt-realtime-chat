import { Plugin } from '@nuxt/types'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabasePlugin: Plugin = async ({ $config, store }, inject) => {
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

  // 初期状態を設定
  const { data: { session } } = await supabase.auth.getSession()
  store.commit('setAuthState', { 
    event: session ? 'SIGNED_IN' : 'SIGNED_OUT', 
    session 
  })

  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session)
    store.commit('setAuthState', { event, session })
  })

  inject('supabase', supabase)
}

export default supabasePlugin