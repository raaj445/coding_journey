import { createClient } from "@supabase/supabase-js";

// Vite exposes only variables prefixed with VITE_ to browser-side code.
// Add these two values in Vercel Environment Variables and in a local .env file.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Keep the app usable for UI preview if the environment variables are not set yet.
// Authentication will show a clear setup message instead of crashing.
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;