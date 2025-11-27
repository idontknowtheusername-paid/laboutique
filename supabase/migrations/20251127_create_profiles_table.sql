-- Migration: Create profiles table
-- Date: 2025-11-27
-- Description: User profiles with first_name and last_name (not full_name)

-- =============================================
-- 1. CREATE PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NULL,
  last_name TEXT NULL,
  avatar_url TEXT NULL,
  phone TEXT NULL,
  date_of_birth DATE NULL,
  gender TEXT NULL,
  language TEXT NULL DEFAULT 'fr',
  country TEXT NULL DEFAULT 'BJ',
  city TEXT NULL,
  address TEXT NULL,
  role TEXT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL DEFAULT NOW(),
  
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT profiles_gender_check CHECK (gender = ANY (ARRAY['male'::TEXT, 'female'::TEXT, 'other'::TEXT])),
  CONSTRAINT profiles_role_check CHECK (role = ANY (ARRAY['customer'::TEXT, 'vendor'::TEXT, 'admin'::TEXT]))
);

-- =============================================
-- 2. CREATE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles USING btree (email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles USING btree (country);

-- =============================================
-- 3. ENABLE RLS
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. RLS POLICIES
-- =============================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Public profiles are viewable (for reviews, etc.)
CREATE POLICY "Public profiles viewable"
  ON public.profiles
  FOR SELECT
  USING (true);

-- =============================================
-- 5. FUNCTION TO AUTO-CREATE PROFILE ON USER SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. TRIGGER TO AUTO-CREATE PROFILE
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 7. FUNCTION TO AUTO-UPDATE updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- =============================================
-- 8. COMMENTS
-- =============================================
COMMENT ON TABLE public.profiles IS 'User profiles with personal information';
COMMENT ON COLUMN public.profiles.first_name IS 'User first name (prénom)';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name (nom de famille)';
COMMENT ON COLUMN public.profiles.role IS 'User role: customer, vendor, or admin';
COMMENT ON COLUMN public.profiles.language IS 'Preferred language (fr, en)';
COMMENT ON COLUMN public.profiles.country IS 'Country code (BJ for Bénin)';
