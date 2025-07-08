import { createClient } from '@supabase/supabase-js';

// Default project URL and anon key (will be replaced when connecting to Supabase)
const SUPABASE_URL = 'https://placeholder-project.supabase.co';
const SUPABASE_ANON_KEY = 'placeholder-anon-key';

// Export a simple placeholder client until real credentials are provided
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;