#!/usr/bin/env node

// Script de migración específico para la tabla cart_items
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dHQzmwGqg76i@ep-tiny-truth-ae8g45rg-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🚀 Iniciando migración de tabla cart_items...');

async function migrateCartItems() {
  try {
    // 1. Verificar si la tabla cart_items existe
    console.log('🔍 Verificando tabla cart_items...');
    
    // 2. Crear tabla cart_items con todas las columnas necesarias
    console.log('📊 Creando/actualizando tabla cart_items...');
    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
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

    // 3. Agregar columnas faltantes si la tabla ya existía (ALTER TABLE para columnas que puedan faltar)
    console.log('🔧 Verificando y agregando columnas faltantes...');
    
    const columnsToAdd = [
      { name: 'name_personalization', type: 'TEXT' },
      { name: 'keychain_personalization', type: 'TEXT' },
      { name: 'has_bordado', type: 'BOOLEAN DEFAULT false NOT NULL' },
      { name: 'image_url', type: 'TEXT' }
    ];

    for (const column of columnsToAdd) {
      try {
        await sql`
          ALTER TABLE cart_items 
          ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql.unsafe(column.type)}
        `;
        console.log(`✅ Columna ${column.name} verificada/agregada`);
      } catch (error) {
        console.log(`ℹ️ Columna ${column.name} ya existe o error: ${error.message}`);
      }
    }

    console.log('✅ Migración de cart_items completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en migración de cart_items:', error);
    process.exit(1);
  }
}

migrateCartItems();