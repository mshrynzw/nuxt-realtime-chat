import { Middleware } from '@nuxt/types'

const authMiddleware: Middleware = async ({ app, redirect }) => {
  const { data: { session } } = await app.$supabase.auth.getSession()
  if (!session) {
    return redirect('/login')
  }
}

export default authMiddleware
