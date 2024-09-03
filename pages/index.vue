<template>
  <div v-if="user">
    <div v-for="message in messages" :key="message.id">
      <p>{{ message.content }}</p>
    </div>
    <input v-model="newMessage" placeholder="Type a message" />
    <button @click="sendMessage">Send</button>
  </div>
  <div v-else>
    <p>Please <nuxt-link to="/login">log in</nuxt-link> to join the chat.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const { app } = useContext()
    const $supabase = app.$supabase
    const user = ref<any>(null)
    const messages = ref<any[]>([])
    const newMessage = ref('')
    let subscription: any = null

    const fetchUser = async () => {
      const { data, error } = await $supabase.auth.getUser()
      if (error) {
        console.error('Error fetching user:', error.message)
      } else {
        user.value = data.user
      }
    }

    const fetchMessages = async () => {
      const { data, error } = await $supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) console.error('Error fetching messages:', error.message)
      else messages.value = data
    }

    const sendMessage = async () => {
      if (!user.value) return
      const { error } = await $supabase
        .from('messages')
        .insert([{ 
          content: newMessage.value, 
          user_id: user.value.id 
        }])

      if (error) console.error('Error sending message:', error.message)
      else {
        newMessage.value = ''
        await fetchMessages() // メッセージを再取得
      }
    }

    const setupRealtime = () => {
      subscription = $supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          messages.value.push(payload.new)
        })
        .subscribe()
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

    return { user, messages, newMessage, sendMessage }
  }
})
</script>
