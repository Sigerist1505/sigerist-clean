#!/usr/bin/env node

// Script to add missing name_personalization column to cart_items table
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('Usage: DATABASE_URL=your_database_url node add-missing-column.js');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🚀 Adding missing name_personalization column to cart_items table...');

async function addMissingColumn() {
  try {
    console.log('🔍 Checking if cart_items table exists...');
    
    // Check if cart_items table exists
    const tableCheckResult = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cart_items'
      );
    `;
    
    if (!tableCheckResult[0].exists) {
      console.log('⚠️ cart_items table does not exist. Creating it with the complete schema...');
      
      // First ensure products table exists (it should from the migration scripts)
      const productsExist = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'products'
        );
      `;
      
      if (!productsExist[0].exists) {
        throw new Error('Products table does not exist. Please run the product migration script first.');
      }
      
      // Create the complete cart_items table with all required columns
      await sql`
        CREATE TABLE cart_items (
          id SERIAL PRIMARY KEY,
          session_id TEXT NOT NULL,
          product_id INTEGER NOT NULL REFERENCES products(id),
          name TEXT NOT NULL,
          quantity INTEGER DEFAULT 1 NOT NULL,
          personalization TEXT,
          embroidery_color TEXT,
          embroidery_font TEXT,
          custom_preview TEXT,
          add_pompon BOOLEAN DEFAULT false NOT NULL,
          add_personalized_keychain BOOLEAN DEFAULT false NOT NULL,
          add_decorative_bow BOOLEAN DEFAULT false NOT NULL,
          add_personalization BOOLEAN DEFAULT false NOT NULL,
          express_service BOOLEAN DEFAULT false NOT NULL,
          keychain_personalization TEXT,
          name_personalization TEXT,
          has_bordado BOOLEAN DEFAULT false NOT NULL,
          price NUMERIC(10,2) NOT NULL,
          image_url TEXT
        )
      `;
      
      console.log('✅ cart_items table created successfully with all columns');
      
    } else {
      console.log('✅ cart_items table exists. Checking for name_personalization column...');
      
      // Check if name_personalization column exists
      const columnExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'cart_items'
          AND column_name = 'name_personalization'
        );
      `;
      
      if (!columnExists[0].exists) {
        console.log('➕ Adding missing name_personalization column...');
        await sql`ALTER TABLE cart_items ADD COLUMN name_personalization TEXT`;
        console.log('✅ name_personalization column added successfully');
      } else {
        console.log('✅ name_personalization column already exists');
      }
    }
    
    // Verify the fix worked
    console.log('🧪 Testing a sample query to verify the fix...');
    const testResult = await sql`
      SELECT COUNT(*) as count 
      FROM cart_items 
      LIMIT 1
    `;
    console.log('✅ Test query successful - cart_items table is accessible');
    
    console.log('🎉 Migration completed successfully!');
    console.log('💡 The cart functionality should now work properly.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Deploy the updated application code');
    console.log('2. Test adding products to cart');
    console.log('3. Verify no more 404 errors occur');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
addMissingColumn()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });