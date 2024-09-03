import { Plugin } from '@nuxt/types'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wcastqgurtpisvdwlndr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjYXN0cWd1cnRwaXN2ZHdsbmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzMzY3NjYsImV4cCI6MjA0MDkxMjc2Nn0.R_dxqzllrHgQaxvquNeeXiUMoS6O2VbGvOu11rO-2Gg'
const supabase = createClient(supabaseUrl, supabaseKey)

const supabasePlugin: Plugin = (_, inject) => {
  inject('supabase', supabase)
}

export default supabasePlugin
