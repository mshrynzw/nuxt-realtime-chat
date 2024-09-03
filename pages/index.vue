<template>
  <div>
    <div v-if="user">
      <p>Total messages: {{ messages.length }}</p>
      <div v-for="message in messages" :key="message.id">
        <p>{{ message.content }} ({{ message.user_id }})</p>
      </div>
      <input
        v-model="newMessage"
        placeholder="Type a message"
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">Send</button>
      <button @click="logout">ログアウト</button>
    </div>
    <div v-else>
      <p>
        Please
        <nuxt-link to="/login">log in</nuxt-link>
        to join the chat.
      </p>
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
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
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
        .order('created_at', { ascending: true })

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
            messages.value = [...messages.value, payload.new]
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

    return { user, messages, newMessage, sendMessage, logout }
  },
})
</script>
