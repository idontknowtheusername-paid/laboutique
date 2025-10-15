-- Migration complète pour créer toutes les tables nécessaires
-- Date: 2025-01-17

-- ========================================
-- Table: vendors (doit être créée en premier car products référence vendors)
-- ========================================
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Benin',
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    total_products INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    commission_rate DECIMAL(5, 2) DEFAULT 10.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Table: products
-- ========================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    
    -- Prix
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(12, 2) CHECK (compare_price >= 0),
    cost_price DECIMAL(12, 2) CHECK (cost_price >= 0),
    
    -- Stock
    track_quantity BOOLEAN DEFAULT true,
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    
    -- Dimensions
    weight DECIMAL(10, 2),
    dimensions JSONB,
    
    -- Relations
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    
    -- Informations complémentaires
    brand VARCHAR(255),
    tags TEXT[],
    images TEXT[],
    
    -- Statut
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    featured BOOLEAN DEFAULT false,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Table: cart_items (si elle n'existe pas déjà)
-- ========================================
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte unique: un user ne peut avoir qu'une seule ligne par produit
    UNIQUE(user_id, product_id)
);

-- ========================================
-- Index pour optimisation
-- ========================================

-- Vendors
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON public.vendors(slug);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_email ON public.vendors(email);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Cart items
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- ========================================
-- Triggers pour updated_at
-- ========================================

-- Vendors
DROP TRIGGER IF EXISTS update_vendors_updated_at ON public.vendors;
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Products
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Cart items
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RLS (Row Level Security)
-- ========================================

-- Vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active vendors"
    ON public.vendors FOR SELECT
    USING (status = 'active');

CREATE POLICY "Service role can do anything on vendors"
    ON public.vendors FOR ALL
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
    WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    USING (status = 'active');

CREATE POLICY "Service role can do anything on products"
    ON public.products FOR ALL
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
    WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Cart items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
    ON public.cart_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
    ON public.cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
    ON public.cart_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
    ON public.cart_items FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on cart_items"
    ON public.cart_items FOR ALL
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
    WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- ========================================
-- Vendor par défaut
-- ========================================
INSERT INTO public.vendors (id, name, slug, email, country, status)
VALUES (
    'default',
    'La Boutique B',
    'la-boutique-b',
    'contact@laboutiqueb.com',
    'Benin',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- Commentaires pour documentation
-- ========================================

COMMENT ON TABLE public.vendors IS 'Table des vendeurs/fournisseurs';
COMMENT ON TABLE public.products IS 'Table des produits';
COMMENT ON TABLE public.cart_items IS 'Table des paniers clients';

-- ========================================
-- Fin de la migration
-- ========================================
