-- Migration: Create account-related tables (addresses, payment_methods, notification_prefs, etc.)

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address_line TEXT NOT NULL,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Bénin',
  postal_code VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  delivery_method VARCHAR(20) DEFAULT 'standard', -- 'standard' or 'express'
  delivery_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand VARCHAR(50), -- Visa, Mastercard, MTN, Moov, etc.
  last4 VARCHAR(4),
  exp_month INTEGER,
  exp_year INTEGER,
  holder_name VARCHAR(255),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_orders BOOLEAN DEFAULT true,
  email_promos BOOLEAN DEFAULT false,
  sms_orders BOOLEAN DEFAULT false,
  sms_promos BOOLEAN DEFAULT false,
  push_all BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Return requests table
CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, refunded
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- topup, purchase, refund
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  reference VARCHAR(100),
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON notification_prefs(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);

-- RLS Policies
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Addresses policies
CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- Payment methods policies
CREATE POLICY "Users can view own payment methods" ON payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment methods" ON payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payment methods" ON payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own payment methods" ON payment_methods FOR DELETE USING (auth.uid() = user_id);

-- Notification prefs policies
CREATE POLICY "Users can view own notification prefs" ON notification_prefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification prefs" ON notification_prefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification prefs" ON notification_prefs FOR UPDATE USING (auth.uid() = user_id);

-- Return requests policies
CREATE POLICY "Users can view own return requests" ON return_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own return requests" ON return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wallet transactions policies
CREATE POLICY "Users can view own wallet transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- Function to get wallet balance
CREATE OR REPLACE FUNCTION get_wallet_balance(p_user_id UUID)
RETURNS TABLE(balance DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(
    CASE 
      WHEN type = 'purchase' THEN -amount 
      ELSE amount 
    END
  ), 0) as balance
  FROM wallet_transactions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
