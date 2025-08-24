#!/usr/bin/env node

// Comprehensive migration script to ensure cart_items table has all required columns
// This script compares the actual database schema with the expected schema from the code

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('ℹ️  Set DATABASE_URL to your Neon database connection string');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Expected columns based on shared/schema.ts
const expectedColumns = [
  { name: 'id', type: 'serial', nullable: false },
  { name: 'session_id', type: 'text', nullable: false },
  { name: 'product_id', type: 'integer', nullable: false },
  { name: 'name', type: 'text', nullable: false },
  { name: 'quantity', type: 'integer', nullable: false, default: '1' },
  { name: 'personalization', type: 'text', nullable: true },
  { name: 'embroidery_color', type: 'text', nullable: true },
  { name: 'embroidery_font', type: 'text', nullable: true },
  { name: 'custom_preview', type: 'text', nullable: true },
  { name: 'add_pompon', type: 'boolean', nullable: false, default: 'false' },
  { name: 'add_personalized_keychain', type: 'boolean', nullable: false, default: 'false' },
  { name: 'add_decorative_bow', type: 'boolean', nullable: false, default: 'false' },
  { name: 'add_personalization', type: 'boolean', nullable: false, default: 'false' },
  { name: 'express_service', type: 'boolean', nullable: false, default: 'false' },
  { name: 'keychain_personalization', type: 'text', nullable: true },
  { name: 'add_name_embroidery', type: 'boolean', nullable: false, default: 'false' },
  { name: 'has_bordado', type: 'boolean', nullable: false, default: 'false' },
  { name: 'price', type: 'numeric', nullable: false }
];

console.log('🔍 Auditing cart_items table schema...');

async function auditCartItemsSchema() {
  try {
    // Get current table structure
    console.log('📊 Fetching current table structure...');
    
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

    if (currentColumns.length === 0) {
      console.error('❌ cart_items table does not exist');
      process.exit(1);
    }

    console.log('✅ Found cart_items table with', currentColumns.length, 'columns');

    // Check for missing columns
    const currentColumnNames = currentColumns.map(col => col.column_name);
    const missingColumns = expectedColumns.filter(
      expected => !currentColumnNames.includes(expected.name)
    );

    if (missingColumns.length === 0) {
      console.log('✅ All expected columns are present');
      return;
    }

    console.log(`⚠️  Found ${missingColumns.length} missing columns:`);
    missingColumns.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });

    // Add missing columns
    console.log('➕ Adding missing columns...');
    
    for (const column of missingColumns) {
      try {
        let columnDef = `${column.type}`;
        
        if (column.default) {
          columnDef += ` DEFAULT ${column.default}`;
        }
        
        if (!column.nullable) {
          columnDef += ' NOT NULL';
        }

        console.log(`   Adding ${column.name}...`);
        
        await sql`
          ALTER TABLE cart_items 
          ADD COLUMN ${sql(column.name)} ${sql.unsafe(columnDef)}
        `;
        
        console.log(`   ✅ Added ${column.name}`);
        
      } catch (error) {
        console.error(`   ❌ Failed to add ${column.name}:`, error.message);
      }
    }

    // Verify final state
    console.log('🔍 Verifying final table structure...');
    
    const finalColumns = await sql`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'cart_items'
    `;

    const finalColumnNames = finalColumns.map(col => col.column_name);
    const stillMissingColumns = expectedColumns.filter(
      expected => !finalColumnNames.includes(expected.name)
    );

    if (stillMissingColumns.length === 0) {
      console.log('🎉 All columns are now present - schema audit completed successfully');
    } else {
      console.error('❌ Some columns are still missing:', stillMissingColumns.map(c => c.name));
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error during schema audit:', error);
    process.exit(1);
  }
}

auditCartItemsSchema();