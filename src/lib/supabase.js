import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const SUPABASE_URL = 'https://btwjbhpgmeuljaetqdbx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d2piaHBnbWV1bGphZXRxZGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Mzk5MTUsImV4cCI6MjA2NzUxNTkxNX0.PLJmWa7l0kGENgRLTa9uQPEdaRb79iWScSfGbDFi4Jo';

// Validate credentials
if (SUPABASE_URL === 'https://placeholder-project.supabase.co' || SUPABASE_ANON_KEY === 'placeholder-anon-key') {
  throw new Error('Missing Supabase credentials. Please check your configuration.');
}

// Create and configure Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;