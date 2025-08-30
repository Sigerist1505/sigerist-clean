-- Migration to ensure password_reset_codes table has created_at column
-- This fixes the "column 'created_at' does not exist" error

-- Check if the column exists and add it if it doesn't
DO $$
BEGIN
    -- Check if created_at column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'password_reset_codes' 
        AND column_name = 'created_at'
    ) THEN
        -- Add the created_at column with default value
        ALTER TABLE password_reset_codes 
        ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
        
        RAISE NOTICE 'Added created_at column to password_reset_codes table';
    ELSE
        RAISE NOTICE 'created_at column already exists in password_reset_codes table';
    END IF;
END $$;

-- Ensure the table exists with all required columns
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON password_reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON password_reset_codes(expires_at);

-- Clean up any expired codes older than 24 hours
DELETE FROM password_reset_codes 
WHERE expires_at < NOW() - INTERVAL '24 hours';