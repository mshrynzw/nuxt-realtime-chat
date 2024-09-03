import { Middleware } from '@nuxt/types'

const authMiddleware: Middleware = async ({ app, redirect }) => {
  const { data, error } = await app.$supabase.auth.getSession()
  if (error || !data.session) {
    return redirect('/login')
  }
}

export default authMiddleware
