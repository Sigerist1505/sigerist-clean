-- SQL script to fix the missing add_name_embroidery column
-- This script is safe to run multiple times

-- Add the missing add_name_embroidery column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cart_items' 
                   AND column_name = 'add_name_embroidery') THEN
        ALTER TABLE cart_items 
        ADD COLUMN add_name_embroidery BOOLEAN DEFAULT false NOT NULL;
        
        RAISE NOTICE 'Column add_name_embroidery added successfully';
    ELSE
        RAISE NOTICE 'Column add_name_embroidery already exists';
    END IF;
END $$;