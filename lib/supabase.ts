import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lrwysrpszheawgdgmneb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyd3lzcnBzemhlYXdnZGdtbmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODMwMDIsImV4cCI6MjA5Mzk1OTAwMn0.eWpiGjgzO6k4Sy1Q3pkQgkCaaK8_D8hwGe_jGd04FeA'

export const supabase = createClient(supabaseUrl, supabaseKey)