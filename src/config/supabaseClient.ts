import { createClient } from '@supabase/supabase-js'
import { Database } from './database_types'

// подключение ссылки и ключа с .env
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL
const supabaseKey: string = import.meta.env.VITE_SUPABASE_KEY

// подключение supabase
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export default supabase