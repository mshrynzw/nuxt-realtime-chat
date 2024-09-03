<template>
  <div>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="signIn">Login</button>
    <button @click="signUp">Sign Up</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useContext, onMounted } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const { app } = useContext()
    const $supabase = app.$supabase
    const router = app.router
    const email = ref('')
    const password = ref('')

    const signIn = async () => {
      const { data, error } = await $supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) {
        console.error('Error signing in:', error.message)
      } else {
        console.log('Sign in successful:', data)
        router?.push('/')
      }
    }

    const signUp = async () => {
      const { data, error } = await $supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (error) {
        console.error('Error signing up:', error.message)
      } else {
        console.log('Sign up successful:', data)
        // ここでユーザーにメールを確認するよう指示するメッセージを表示するとよいでしょう
      }
    }

    onMounted(async () => {
      const { data, error } = await $supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error.message)
      } else {
        console.log('Current session:', data)
      }
    })

    return { email, password, signIn, signUp }
  }
})
</script>
