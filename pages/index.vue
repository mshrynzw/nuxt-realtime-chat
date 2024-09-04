<template>
  <div class="relative min-h-screen flex flex-col">
    <div
      class="bg-gray-100 flex-grow flex items-center py-16 dark:bg-neutral-800"
    >
      <main class="w-full mx-auto p-6">
        <div
          class="mt-7 sbg-white border border-gray-200 rounded-xl shadow-sm dark:bg-neutral-900 dark:border-neutral-700"
        >
          <div class="p-4 sm:p-7">
            <div class="text-center">
              <h1
                class="mb-3 text-4xl sm:text-6xl font-bold text-gray-800 dark:text-neutral-200"
              >
                Realtime Chat
              </h1>

              <div v-if="user">
                <div
                  class="relative z-10 p-3 bg-white border rounded-lg shadow-lg shadow-gray-100 dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-gray-900/20"
                >
                  <input
                    v-model="newMessage"
                    placeholder="Type a message"
                    class="py-2.5 px-4 block w-full border-transparent rounded-lg focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-transparent dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                    @keyup.enter="sendMessage"
                  />
                </div>
                <div class="w-full flex justify-center space-x-2 mt-2">
                  <button
                    class="w-full text-center justify-center m-1 py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    @click="sendMessage"
                  >
                    Send
                  </button>
                  <button
                    class="w-full text-center justify-center m-1 py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    @click="logout"
                  >
                    Logout
                  </button>
                </div>
                <p class="mt-3 text-gray-600 dark:text-neutral-400">
                  Total messages: {{ messages.length }}
                </p>
                <div
                  v-for="message in messages"
                  :key="message.id"
                  class="text-left mt-3 text-gray-800 dark:text-neutral-200"
                >
                  <p>
                    <span>{{ formatDate(message.created_at) }}</span>
                    :
                    <span class="font-bold">{{ message.content }}</span>
                  </p>
                </div>
              </div>
              <div v-else>
                <p>
                  Please
                  <nuxt-link to="/login">log in</nuxt-link>
                  to join the chat.
                </p>
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
  useRoute,
} from '@nuxtjs/composition-api'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { onMounted, onUnmounted } from 'vue'

export default defineComponent({
  setup() {
    const { app, store } = useContext()
    const router = useRouter()
    const route = useRoute()
    const $supabase = app.$supabase
    const user = ref<any>(null)
    const messages = ref<any[]>([])
    const newMessage = ref('')
    let subscription: any = null

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }
      return new Intl.DateTimeFormat('ja-JP', options).format(date)
    }

    const fetchUser = async () => {
      const {
        data: { user: currentUser },
      } = await $supabase.auth.getUser()
      if (currentUser) {
        user.value = currentUser
      } else {
        router.push('/login')
      }
    }

    const fetchMessages = async () => {
      const { data, error } = await $supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching messages:', error.message)
      else {
        messages.value = data || []
        console.log('Initial messages:', messages.value)
      }
    }

    const sendMessage = async () => {
      if (!user.value || !newMessage.value.trim()) return
      const { data, error } = await $supabase
        .from('messages')
        .insert([{ content: newMessage.value, user_id: user.value.id }])
        .select()

      if (error) console.error('Error sending message:', error.message)
      else {
        console.log('Message sent:', data)
        newMessage.value = ''
        // リアルタイムイベントで処理されるため、ここでmessages.valueを更新しない
      }
    }

    const logout = async () => {
      const { error } = await $supabase.auth.signOut()
      if (error) {
        console.error('ログアウトエラー:', error.message)
      } else {
        console.log('ログアウト成功')
        // ストアの認証状態をクリア
        store.commit('setAuthState', { event: 'SIGNED_OUT', session: null })
        // 明示的にログインページにリダイレクト
        if (route.value.path !== '/login') {
          router.push('/login')
        }
      }
    }

    const setupRealtime = () => {
      subscription = $supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (
            payload: RealtimePostgresChangesPayload<{
              id: number
              content: string
              user_id: string
              created_at: string
            }>
          ) => {
            console.log('New message received:', payload.new)
            console.log('Current messages before update:', messages.value)
            messages.value = [payload.new, ...messages.value]
            console.log('Current messages after update:', messages.value)
          }
        )
        .subscribe(
          (status: 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT') => {
            console.log('Realtime subscription status:', status)
          }
        )

      console.log('Realtime subscription set up')
    }

    onMounted(() => {
      fetchUser()
      fetchMessages()
      setupRealtime()
    })

    onUnmounted(() => {
      if (subscription) {
        subscription.unsubscribe()
      }
    })

    return { user, messages, newMessage, sendMessage, logout, formatDate }
  },
})
</script>
