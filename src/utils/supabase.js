import { createClient } from '@supabase/supabase-js';

// Use default values that will be replaced when connected to a real Supabase project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Create a mock implementation if env variables are missing
const mockClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ error: null }),
    signUp: () => Promise.resolve({ error: null }),
    signInWithOAuth: () => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve()
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null })
    })
  })
};

// Use real client if credentials are available, otherwise use mock
export const supabase = (supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder'))
  ? mockClient
  : createClient(supabaseUrl, supabaseKey);