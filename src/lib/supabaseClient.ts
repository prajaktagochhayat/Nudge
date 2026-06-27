import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

// Detects if the user has configured their Supabase keys in a .env file
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'placeholder-url' && 
  !supabaseUrl.includes('placeholder');

// Initialize client (uses placeholder values if not configured to prevent crash during builds)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-nudge-db.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key-nudge-12345'
);
