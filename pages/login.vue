<template>
  <div class="relative min-h-screen flex flex-col">
    <div
      class="bg-gray-100 flex-grow flex items-center py-16 dark:bg-neutral-800"
    >
      <main class="w-full max-w-md mx-auto p-6">
        <div
          class="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-neutral-900 dark:border-neutral-700"
        >
          <div class="p-4 sm:p-7">
            <div class="text-center">
              <h1
                class="block text-2xl font-bold text-gray-800 dark:text-white"
              >
                Realtime Chat
              </h1>
            </div>

            <div class="mt-5">
              <div class="grid gap-y-4">
                <div>
                  <label for="email" class="block text-sm mb-2 dark:text-white"
                    >Email</label
                  >
                  <div class="relative">
                    <input
                      v-model="email"
                      placeholder="Email"
                      name="email"
                      class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div class="flex justify-between items-center">
                    <label
                      for="password"
                      class="block text-sm mb-2 dark:text-white"
                      >Password</label
                    >
                  </div>
                  <div class="relative">
                    <input
                      v-model="password"
                      type="password"
                      placeholder="Password"
                      class="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                      required
                    />
                  </div>
                </div>

                <button
                  class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                  @click="signIn"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  useContext,
  useRouter,
} from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const { app } = useContext()
    const router = useRouter()
    const $supabase = app.$supabase
    const email = ref('')
    const password = ref('')

    const signIn = async () => {
      const { data, error } = await $supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) {
        console.error('ログインエラー:', error.message)
      } else {
        console.log('ログイン成功:', data)
        // ユーザー情報を保存
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/')
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

    return { email, password, signIn, signUp }
  },
})
</script>
