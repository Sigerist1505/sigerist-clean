#!/usr/bin/env node

// Migration script to create missing authentication tables
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dHQzmwGqg76i@ep-tiny-truth-ae8g45rg-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🚀 Iniciando migración de tablas de autenticación...');

async function migrate() {
  try {
    // 1. Create registered_users table if it doesn't exist
    console.log('👤 Creando tabla registered_users...');
    await sql`
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
        accepts_marketing BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // 2. Create password_reset_codes table if it doesn't exist
    console.log('🔑 Creando tabla password_reset_codes...');
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_codes (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // 3. Create contact_messages table if it doesn't exist
    console.log('📧 Creando tabla contact_messages...');
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // 4. Create whatsapp_sessions table if it doesn't exist
    console.log('💬 Creando tabla whatsapp_sessions...');
    await sql`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id SERIAL PRIMARY KEY,
        phone_number TEXT NOT NULL UNIQUE,
        session_data TEXT NOT NULL,
        last_activity TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // 5. Verify tables were created
    console.log('🔍 Verificando tablas creadas...');
    
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('registered_users', 'password_reset_codes', 'contact_messages', 'whatsapp_sessions')
      ORDER BY table_name
    `;

    console.log('✅ Tablas verificadas:');
    tablesResult.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // 6. Verify password_reset_codes has the 'used' column
    const columnsResult = await sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'password_reset_codes' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    console.log('🔍 Columnas de password_reset_codes:');
    columnsResult.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });

    console.log('🎉 Migración de autenticación completada exitosamente');

  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrate();