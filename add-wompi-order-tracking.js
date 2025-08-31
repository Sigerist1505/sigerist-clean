// add-wompi-order-tracking.js
// Migration to add Wompi transaction tracking fields to orders table

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL must be set");
  process.exit(1);
}

async function addWompiOrderTrackingFields() {
  console.log("🚀 Adding Wompi transaction tracking fields to orders table...");
  
  try {
    const sqlClient = neon(DATABASE_URL);
    const db = drizzle(sqlClient);

    // Add new columns to orders table
    await db.execute(sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS transaction_id TEXT,
      ADD COLUMN IF NOT EXISTS payment_reference TEXT,
      ADD COLUMN IF NOT EXISTS payment_method TEXT;
    `);

    console.log("✅ Successfully added Wompi tracking fields to orders table:");
    console.log("   - transaction_id: Stores Wompi transaction ID");
    console.log("   - payment_reference: Stores Wompi payment reference");
    console.log("   - payment_method: Stores payment method used");
    
    // Test the new columns by checking the table structure
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name IN ('transaction_id', 'payment_reference', 'payment_method')
      ORDER BY column_name;
    `);
    
    console.log("📊 New columns added:");
    tableInfo.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

  } catch (error) {
    console.error("❌ Error adding Wompi tracking fields:", error);
    process.exit(1);
  }
}

// Run the migration
addWompiOrderTrackingFields().then(() => {
  console.log("🎉 Migration completed successfully!");
  process.exit(0);
}).catch(error => {
  console.error("💥 Migration failed:", error);
  process.exit(1);
});