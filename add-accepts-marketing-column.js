// add-accepts-marketing-column.js
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

const sql = neon(process.env.DATABASE_URL);

async function addAcceptsMarketingColumn() {
  try {
    console.log('🔄 Adding accepts_marketing column to registered_users table...');
    
    // Check if column already exists
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'registered_users' 
      AND column_name = 'accepts_marketing'
    `;
    
    if (columnExists.length > 0) {
      console.log('✅ Column accepts_marketing already exists');
      return;
    }
    
    // Add the column
    await sql`
      ALTER TABLE registered_users 
      ADD COLUMN accepts_marketing BOOLEAN DEFAULT false NOT NULL
    `;
    
    console.log('✅ Successfully added accepts_marketing column to registered_users table');
    
    // Verify the column was added
    const verification = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'registered_users' 
      AND column_name = 'accepts_marketing'
    `;
    
    console.log('📊 Column details:', verification[0]);
    
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addAcceptsMarketingColumn();