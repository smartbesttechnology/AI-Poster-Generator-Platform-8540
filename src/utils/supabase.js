import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const supabaseUrl = 'https://btwjbhpgmeuljaetqdbx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d2piaHBnbWV1bGphZXRxZGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzk5MTUsImV4cCI6MjA2NzUxNTkxNX0.PLJmWa7l0kGENgRLTa9uQPEdaRb79iWScSfGbDFi4Jo';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Export default for compatibility
export default supabase;