-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create markets table
CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'binary',
  probability NUMERIC NOT NULL DEFAULT 50,
  volume NUMERIC NOT NULL DEFAULT 0,
  liquidity NUMERIC NOT NULL DEFAULT 0,
  closing_date TIMESTAMP WITH TIME ZONE,
  resolution_date TIMESTAMP WITH TIME ZONE,
  resolution_source TEXT,
  fee NUMERIC NOT NULL DEFAULT 2,
  is_private BOOLEAN NOT NULL DEFAULT false,
  allow_comments BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create positions table
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  shares NUMERIC NOT NULL DEFAULT 0,
  average_price NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  profit NUMERIC NOT NULL DEFAULT 0,
  profit_percentage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  position TEXT NOT NULL,
  shares NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Markets policies
CREATE POLICY "Markets are viewable by everyone" 
ON markets FOR SELECT USING (true);

CREATE POLICY "Users can create markets" 
ON markets FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own markets" 
ON markets FOR UPDATE USING (auth.uid() = created_by);

-- Positions policies
CREATE POLICY "Users can view their own positions" 
ON positions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own positions" 
ON positions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own positions" 
ON positions FOR UPDATE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" 
ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_markets_updated_at
BEFORE UPDATE ON markets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
BEFORE UPDATE ON positions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

