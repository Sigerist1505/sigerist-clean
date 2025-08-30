-- Authentication Tables Migration Script
-- This script creates the missing authentication tables for the Sigerist application
-- Run this script in your Neon Database console or any PostgreSQL client

-- 1. Create registered_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS registered_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  shipping_address TEXT,
  discount_code TEXT,
  discount_used BOOLEAN DEFAULT false NOT NULL,
  discount_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. Create password_reset_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. Create contact_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 4. Create whatsapp_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  session_data TEXT NOT NULL,
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON password_reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON password_reset_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_registered_users_email ON registered_users(email);

-- 6. Verify tables were created (this will show an error if tables don't exist)
SELECT 'registered_users' as table_name, COUNT(*) as row_count FROM registered_users
UNION ALL
SELECT 'password_reset_codes' as table_name, COUNT(*) as row_count FROM password_reset_codes
UNION ALL
SELECT 'contact_messages' as table_name, COUNT(*) as row_count FROM contact_messages
UNION ALL
SELECT 'whatsapp_sessions' as table_name, COUNT(*) as row_count FROM whatsapp_sessions;