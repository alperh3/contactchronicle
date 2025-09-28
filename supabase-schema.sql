-- Create connections table
CREATE TABLE connections (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  url TEXT,
  email_address TEXT,
  company TEXT,
  position TEXT,
  connected_on DATE,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_connections_company ON connections(company);
CREATE INDEX idx_connections_position ON connections(position);
CREATE INDEX idx_connections_location ON connections(location);
CREATE INDEX idx_connections_connected_on ON connections(connected_on);

-- Enable Row Level Security (RLS)
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for now)
-- In production, you should implement proper authentication and authorization
CREATE POLICY "Allow all operations" ON connections
  FOR ALL USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
