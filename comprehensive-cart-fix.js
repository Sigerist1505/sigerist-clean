#!/usr/bin/env node

// Comprehensive cart schema fix
// This script diagnoses and fixes all cart_items table schema issues

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('ℹ️  Set DATABASE_URL to your Neon database connection string');
  console.log('ℹ️  Example: export DATABASE_URL="postgresql://user:pass@host/db"');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🔧 Comprehensive Cart Schema Fix...');
console.log('📋 This will ensure all required columns exist in cart_items table');

async function fixCartSchema() {
  try {
    // 1. Check if cart_items table exists
    console.log('\n🔍 Step 1: Checking if cart_items table exists...');
    const tableExists = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'cart_items'
    `;

    if (tableExists.length === 0) {
      console.error('❌ cart_items table does not exist');
      console.log('ℹ️  Please run the main migration first: npm run migrate:cart');
      process.exit(1);
    }
    console.log('✅ cart_items table exists');

    // 2. Get current table structure
    console.log('\n🔍 Step 2: Analyzing current table structure...');
    const currentColumns = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'cart_items'
      ORDER BY ordinal_position
    `;

    console.log(`📊 Found ${currentColumns.length} columns in cart_items table`);

    // 3. Define required columns
    const requiredColumns = [
      { name: 'id', type: 'integer', nullable: false },
      { name: 'session_id', type: 'text', nullable: false },
      { name: 'product_id', type: 'integer', nullable: false },
      { name: 'name', type: 'text', nullable: false },
      { name: 'quantity', type: 'integer', nullable: false },
      { name: 'personalization', type: 'text', nullable: true },
      { name: 'embroidery_color', type: 'text', nullable: true },
      { name: 'embroidery_font', type: 'text', nullable: true },
      { name: 'custom_preview', type: 'text', nullable: true },
      { name: 'add_pompon', type: 'boolean', nullable: false },
      { name: 'add_personalized_keychain', type: 'boolean', nullable: false },
      { name: 'add_decorative_bow', type: 'boolean', nullable: false },
      { name: 'add_personalization', type: 'boolean', nullable: false },
      { name: 'express_service', type: 'boolean', nullable: false },
      { name: 'keychain_personalization', type: 'text', nullable: true },
      { name: 'add_name_embroidery', type: 'boolean', nullable: false },
      { name: 'has_bordado', type: 'boolean', nullable: false },
      { name: 'price', type: 'numeric', nullable: false }
    ];

    // 4. Find missing columns
    const currentColumnNames = currentColumns.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(
      required => !currentColumnNames.includes(required.name)
    );

    if (missingColumns.length === 0) {
      console.log('✅ All required columns are present');
      console.log('\n🎉 Schema is already correct - no changes needed');
      return;
    }

    console.log(`\n⚠️  Found ${missingColumns.length} missing columns:`);
    missingColumns.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });

    // 5. Add missing columns
    console.log('\n➕ Adding missing columns...');
    
    for (const column of missingColumns) {
      try {
        let columnDef = column.type;
        
        if (column.type === 'boolean') {
          columnDef = 'BOOLEAN DEFAULT false NOT NULL';
        } else if (column.type === 'integer') {
          columnDef = 'INTEGER DEFAULT 1 NOT NULL';
        } else if (column.type === 'text') {
          columnDef = 'TEXT';
        } else if (column.type === 'numeric') {
          columnDef = 'NUMERIC(10,2) NOT NULL';
        }

        console.log(`   Adding ${column.name}...`);
        
        await sql`
          ALTER TABLE cart_items 
          ADD COLUMN ${sql(column.name)} ${sql.unsafe(columnDef)}
        `;
        
        console.log(`   ✅ Added ${column.name}`);
        
      } catch (error) {
        if (error.message && error.message.includes('already exists')) {
          console.log(`   ℹ️  ${column.name} already exists - skipping`);
        } else {
          console.error(`   ❌ Failed to add ${column.name}:`, error.message);
        }
      }
    }

    // 6. Final verification
    console.log('\n🔍 Step 3: Final verification...');
    const finalColumns = await sql`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'cart_items'
    `;

    const finalColumnNames = finalColumns.map(col => col.column_name);
    const stillMissingColumns = requiredColumns.filter(
      required => !finalColumnNames.includes(required.name)
    );

    if (stillMissingColumns.length === 0) {
      console.log('✅ All required columns are now present');
      console.log('\n🎉 Cart schema fix completed successfully!');
      console.log('🔄 The application should now work correctly with cart operations');
    } else {
      console.error(`❌ Some columns are still missing:`, stillMissingColumns.map(c => c.name));
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error during cart schema fix:', error);
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify DATABASE_URL is correct and accessible');
    console.log('2. Ensure you have proper database permissions');
    console.log('3. Check if the database server is running');
    process.exit(1);
  }
}

fixCartSchema();