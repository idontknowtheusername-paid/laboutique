import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Only create client if we have valid credentials
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Disable auth persistence for demo mode
  }
});

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-key' &&
         supabaseUrl.includes('.supabase.co');
};

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database helpers
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'active')
    .order('sort_order');
  return { data, error };
};

export const getProducts = async (limit = 20, offset = 0, categoryId?: string) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      categories (name, slug),
      vendors (name, logo_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query
    .range(offset, offset + limit - 1);
  
  return { data, error };
};

export const getProduct = async (slug: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name, slug),
      vendors (name, logo_url, rating),
      product_images (*),
      product_reviews (
        *,
        profiles (first_name, last_name, avatar_url)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  
  return { data, error };
};

export const searchProducts = async (query: string, filters?: any) => {
  let searchQuery = supabase
    .from('products')
    .select(`
      *,
      categories (name, slug),
      vendors (name, logo_url)
    `)
    .eq('status', 'active')
    .or(`name.ilike.%${query}%, description.ilike.%${query}%, tags.ilike.%${query}%`);

  if (filters?.category) {
    searchQuery = searchQuery.eq('category_id', filters.category);
  }
  
  if (filters?.minPrice) {
    searchQuery = searchQuery.gte('price', filters.minPrice);
  }
  
  if (filters?.maxPrice) {
    searchQuery = searchQuery.lte('price', filters.maxPrice);
  }

  const { data, error } = await searchQuery
    .order('created_at', { ascending: false })
    .limit(50);
  
  return { data, error };
};

export default supabase;