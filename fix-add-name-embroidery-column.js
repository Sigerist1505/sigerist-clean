#!/usr/bin/env node

// Focused migration script to add the missing add_name_embroidery column
// This script is safe to run multiple times and only adds the missing column

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('ℹ️  Set DATABASE_URL to your Neon database connection string');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🔧 Fixing missing add_name_embroidery column...');

async function fixAddNameEmbroideryColumn() {
  try {
    // Check if the column exists
    console.log('🔍 Checking if add_name_embroidery column exists...');
    
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items' 
      AND column_name = 'add_name_embroidery'
    `;

    if (columnCheck.length > 0) {
      console.log('✅ Column add_name_embroidery already exists - no action needed');
      return;
    }

    console.log('➕ Column add_name_embroidery is missing, adding it now...');

    // Add the missing column
    await sql`
      ALTER TABLE cart_items 
      ADD COLUMN add_name_embroidery BOOLEAN DEFAULT false NOT NULL
    `;

    console.log('✅ Successfully added add_name_embroidery column');
    
    // Verify the column was added
    const verifyCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items' 
      AND column_name = 'add_name_embroidery'
    `;

    if (verifyCheck.length > 0) {
      console.log('✅ Verification successful - column exists in database');
    } else {
      console.error('❌ Verification failed - column was not added');
      process.exit(1);
    }

    console.log('🎉 Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    
    // Provide helpful error message for common issues
    if (error.message && error.message.includes('42703')) {
      console.log('ℹ️  This error suggests the column doesn\'t exist, which is expected');
    } else if (error.message && error.message.includes('already exists')) {
      console.log('ℹ️  Column already exists - this is good news!');
    }
    
    process.exit(1);
  }
}

fixAddNameEmbroideryColumn();