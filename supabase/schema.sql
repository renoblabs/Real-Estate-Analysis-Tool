-- REI OPS™ - Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Property Information
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  property_type TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms DECIMAL,
  square_feet INTEGER,
  year_built INTEGER,
  lot_size INTEGER,

  -- Financial Inputs
  purchase_price DECIMAL NOT NULL,
  down_payment_percent DECIMAL NOT NULL,
  down_payment_amount DECIMAL NOT NULL,
  interest_rate DECIMAL NOT NULL,
  amortization_years INTEGER NOT NULL,

  -- Strategy & Condition
  strategy TEXT NOT NULL,
  property_condition TEXT,
  renovation_cost DECIMAL DEFAULT 0,
  after_repair_value DECIMAL,

  -- Revenue
  monthly_rent DECIMAL NOT NULL,
  other_income DECIMAL DEFAULT 0,
  vacancy_rate DECIMAL NOT NULL,

  -- Expenses
  property_tax_annual DECIMAL NOT NULL,
  insurance_annual DECIMAL NOT NULL,
  property_management_percent DECIMAL NOT NULL,
  maintenance_percent DECIMAL NOT NULL,
  utilities_monthly DECIMAL DEFAULT 0,
  hoa_fees_monthly DECIMAL DEFAULT 0,
  other_expenses_monthly DECIMAL DEFAULT 0,

  -- Calculated Outputs (stored for performance)
  total_acquisition_cost DECIMAL,
  cmhc_premium DECIMAL,
  land_transfer_tax DECIMAL,
  mortgage_amount DECIMAL,
  monthly_mortgage_payment DECIMAL,
  monthly_cash_flow DECIMAL,
  annual_cash_flow DECIMAL,
  cash_on_cash_return DECIMAL,
  cap_rate DECIMAL,
  dscr DECIMAL,
  grm DECIMAL,
  deal_score INTEGER,
  deal_grade TEXT,

  -- BRRRR Specific
  brrrr_cash_left_in_deal DECIMAL,
  brrrr_cash_recovered DECIMAL,

  -- Management
  status TEXT DEFAULT 'analyzing',
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,

  -- Metadata
  analysis_version TEXT DEFAULT '1.0'
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  investor_type TEXT DEFAULT 'Beginner',
  default_vacancy_rate DECIMAL DEFAULT 5.0,
  default_pm_percent DECIMAL DEFAULT 8.0,
  default_maintenance_percent DECIMAL DEFAULT 10.0,
  target_coc_return DECIMAL DEFAULT 8.0,
  target_cap_rate DECIMAL DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table (for tracking usage)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_province ON deals(province);
CREATE INDEX IF NOT EXISTS idx_deals_city ON deals(city);
CREATE INDEX IF NOT EXISTS idx_deals_deal_score ON deals(deal_score DESC);

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deals table
DROP POLICY IF EXISTS "Users can view their own deals" ON deals;
CREATE POLICY "Users can view their own deals"
  ON deals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own deals" ON deals;
CREATE POLICY "Users can insert their own deals"
  ON deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own deals" ON deals;
CREATE POLICY "Users can update their own deals"
  ON deals FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own deals" ON deals;
CREATE POLICY "Users can delete their own deals"
  ON deals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_preferences table
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for analytics_events table
DROP POLICY IF EXISTS "Users can insert their own events" ON analytics_events;
CREATE POLICY "Users can insert their own events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification queries (run these to confirm setup)
-- SELECT COUNT(*) FROM deals;
-- SELECT COUNT(*) FROM user_preferences;
-- SELECT COUNT(*) FROM analytics_events;
