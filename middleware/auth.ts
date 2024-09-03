import { Middleware } from '@nuxt/types'

const authMiddleware: Middleware = ({ store, redirect, route }) => {
  const { event, session } = store.state.authState

  console.log('Auth middleware:', { event, session, path: route.fullPath })

  if ((event === 'SIGNED_OUT' || !session) && route.fullPath !== '/login') {
    return redirect('/login')
  }

  if (session && route.fullPath === '/login') {
    return redirect('/')
  }
}

export default authMiddleware
