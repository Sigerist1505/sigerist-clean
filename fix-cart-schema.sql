-- Cart Items Schema Fix
-- This SQL script fixes missing columns in the cart_items table
-- Safe to run multiple times - uses IF NOT EXISTS pattern

-- Check current table structure (for verification)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'cart_items' 
-- ORDER BY ordinal_position;

-- Add missing add_name_embroidery column
ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS add_name_embroidery BOOLEAN DEFAULT false NOT NULL;

-- Verify the column was added
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
AND column_name = 'add_name_embroidery';

-- Optional: Show all columns in cart_items table for verification
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'cart_items' 
-- ORDER BY ordinal_position;