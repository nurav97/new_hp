-- Add Telemedicine support to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_telemedicine BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_url TEXT;

-- Update RLS if necessary (usually appointments are already covered, but let's ensure)
-- Assuming appointments RLS is already active from initial schema.
