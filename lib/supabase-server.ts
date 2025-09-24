import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Prefer server-only SUPABASE_URL when available to avoid mismatch with service-role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Server-side Supabase client with service role for RLS-protected operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const isSupabaseAdminConfigured = () => {
  return Boolean(supabaseUrl && serviceRoleKey && supabaseUrl.includes('.supabase.co'));
};

