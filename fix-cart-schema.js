#!/usr/bin/env node

// Script to fix the cart_items table schema mismatch
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dHQzmwGqg76i@ep-tiny-truth-ae8g45rg-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🚀 Iniciando reparación del esquema cart_items...');

async function fixCartSchema() {
  try {
    // Check if cart_items table exists
    console.log('🔍 Verificando si la tabla cart_items existe...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cart_items'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('📊 Tabla cart_items existe, verificando columnas...');
      
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
        console.log('➕ Agregando columna name_personalization faltante...');
        await sql`ALTER TABLE cart_items ADD COLUMN name_personalization TEXT`;
      } else {
        console.log('✅ Columna name_personalization ya existe');
      }
      
    } else {
      console.log('📊 Creando tabla cart_items completa...');
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
    }

    // Also check for other required tables from the schema
    console.log('🔍 Verificando otras tablas requeridas...');
    
    // Check and create orders table if not exists
    const ordersExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
      );
    `;
    
    if (!ordersExists[0].exists) {
      console.log('📊 Creando tabla orders...');
      await sql`
        CREATE TABLE orders (
          id SERIAL PRIMARY KEY,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          items TEXT NOT NULL,
          total NUMERIC(10,2) NOT NULL,
          status TEXT DEFAULT 'pending' NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
    }

    // Check and create contact_messages table if not exists
    const contactExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contact_messages'
      );
    `;
    
    if (!contactExists[0].exists) {
      console.log('📊 Creando tabla contact_messages...');
      await sql`
        CREATE TABLE contact_messages (
          id SERIAL PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
    }

    // Check and create registered_users table if not exists
    const usersExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'registered_users'
      );
    `;
    
    if (!usersExists[0].exists) {
      console.log('📊 Creando tabla registered_users...');
      await sql`
        CREATE TABLE registered_users (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          phone TEXT,
          shipping_address TEXT,
          discount_code TEXT,
          discount_used BOOLEAN DEFAULT false NOT NULL,
          discount_expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
    }

    // Check and create whatsapp_sessions table if not exists
    const whatsappExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'whatsapp_sessions'
      );
    `;
    
    if (!whatsappExists[0].exists) {
      console.log('📊 Creando tabla whatsapp_sessions...');
      await sql`
        CREATE TABLE whatsapp_sessions (
          id SERIAL PRIMARY KEY,
          phone_number TEXT NOT NULL UNIQUE,
          session_data TEXT NOT NULL,
          last_activity TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
    }

    // Check and create email_campaigns table if not exists
    const campaignsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'email_campaigns'
      );
    `;
    
    if (!campaignsExists[0].exists) {
      console.log('📊 Creando tabla email_campaigns...');
      await sql`
        CREATE TABLE email_campaigns (
          id SERIAL PRIMARY KEY,
          campaign_name TEXT NOT NULL,
          subject TEXT NOT NULL,
          content TEXT NOT NULL,
          email TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          discount_code TEXT NOT NULL,
          registration_date TEXT NOT NULL,
          accepts_marketing BOOLEAN DEFAULT false NOT NULL,
          status TEXT DEFAULT 'draft' NOT NULL,
          sent_count INTEGER DEFAULT 0 NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          sent_at TIMESTAMP
        )
      `;
    }

    console.log('✅ Esquema de base de datos reparado exitosamente');
    console.log('🎉 Todas las tablas y columnas requeridas están ahora presentes');

  } catch (error) {
    console.error('❌ Error reparando el esquema:', error);
    process.exit(1);
  }
}

// Ejecutar la reparación
migrateToCompleteSchema();

async function migrateToCompleteSchema() {
  await fixCartSchema();
  process.exit(0);
}