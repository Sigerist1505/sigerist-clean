#!/usr/bin/env node

// Script to add missing columns to cart_items table
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🚀 Fixing missing columns in cart_items table...');

async function addMissingColumns() {
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
      console.log('⚠️ cart_items table does not exist. Creating it...');
      
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
      
      // Create the complete cart_items table
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
      
      console.log('✅ cart_items table created successfully');
      
    } else {
      console.log('✅ cart_items table exists. Checking for missing columns...');
      
      // List of columns that should exist in cart_items table
      const requiredColumns = [
        'name_personalization',
        'keychain_personalization',
        'session_id',
        'embroidery_color',
        'embroidery_font',
        'custom_preview',
        'add_pompon',
        'add_personalized_keychain',
        'add_decorative_bow',
        'add_personalization',
        'express_service',
        'has_bordado',
        'image_url'
      ];
      
      for (const columnName of requiredColumns) {
        const columnExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'cart_items'
            AND column_name = ${columnName}
          );
        `;
        
        if (!columnExists[0].exists) {
          console.log(`➕ Adding missing column: ${columnName}`);
          
          // Add the column with appropriate type and default value
          let alterStatement;
          if (columnName.startsWith('add_') || columnName === 'has_bordado' || columnName === 'express_service') {
            alterStatement = `ALTER TABLE cart_items ADD COLUMN ${columnName} BOOLEAN DEFAULT false NOT NULL`;
          } else if (columnName === 'quantity') {
            alterStatement = `ALTER TABLE cart_items ADD COLUMN ${columnName} INTEGER DEFAULT 1 NOT NULL`;
          } else if (columnName === 'price') {
            alterStatement = `ALTER TABLE cart_items ADD COLUMN ${columnName} NUMERIC(10,2) NOT NULL DEFAULT 0`;
          } else {
            alterStatement = `ALTER TABLE cart_items ADD COLUMN ${columnName} TEXT`;
          }
          
          await sql.execute(alterStatement);
          console.log(`✅ Added column: ${columnName}`);
        } else {
          console.log(`✅ Column ${columnName} already exists`);
        }
      }
    }
    
    // Verify the fix worked
    console.log('🧪 Testing a sample query to verify the fix...');
    const testResult = await sql`
      SELECT id, name_personalization 
      FROM cart_items 
      LIMIT 1
    `;
    console.log('✅ Test query successful - name_personalization column is accessible');
    
    console.log('🎉 All missing columns have been added successfully!');
    console.log('💡 The cart functionality should now work properly.');
    
  } catch (error) {
    console.error('❌ Error fixing missing columns:', error);
    process.exit(1);
  }
}

// Run the fix
addMissingColumns()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });