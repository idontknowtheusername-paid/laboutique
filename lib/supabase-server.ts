import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Prefer server-only SUPABASE_URL when available to avoid mismatch with service-role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gfhuotmjoiyhtllsmnwy.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmaHVvdG1qb2l5aHRsbHNtbnd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4NTE2MiwiZXhwIjoyMDczMjYxMTYyfQ.eOY2qfzT2OGr7ztmBVgtEDQ8jX5Z9Cb3wOFQCvAegZk';

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

