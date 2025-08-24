#!/usr/bin/env node

// Verification script to check if the database fix worked
// This script verifies that the add_name_embroidery column exists and the cart functionality works

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('ℹ️  Set DATABASE_URL to your Neon database connection string');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🔍 Verificando que el fix del error 500 funcionó...');

async function verifyDatabaseFix() {
  try {
    // 1. Check if cart_items table exists
    console.log('\n📋 Step 1: Verificando tabla cart_items...');
    const tableExists = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'cart_items'
    `;

    if (tableExists.length === 0) {
      console.error('❌ La tabla cart_items no existe. Ejecuta primero: npm run migrate:cart');
      process.exit(1);
    }
    console.log('✅ Tabla cart_items existe');

    // 2. Check if add_name_embroidery column exists
    console.log('\n🔍 Step 2: Verificando columna add_name_embroidery...');
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items' 
      AND column_name = 'add_name_embroidery'
    `;

    if (columnExists.length === 0) {
      console.error('❌ La columna add_name_embroidery NO existe. Ejecuta el fix: npm run fix:add-name-embroidery');
      process.exit(1);
    }
    console.log('✅ Columna add_name_embroidery existe');

    // 3. Show all cart_items columns for verification
    console.log('\n📊 Step 3: Estructura actual de cart_items:');
    const allColumns = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'cart_items'
      ORDER BY ordinal_position
    `;

    console.log('┌─────────────────────────────┬──────────────┬─────────────┬──────────────┐');
    console.log('│ Column Name                 │ Data Type    │ Nullable    │ Default      │');
    console.log('├─────────────────────────────┼──────────────┼─────────────┼──────────────┤');
    
    allColumns.forEach(col => {
      const name = col.column_name.padEnd(27);
      const type = col.data_type.padEnd(12);
      const nullable = col.is_nullable.padEnd(11);
      const defaultVal = (col.column_default || 'NULL').padEnd(12);
      console.log(`│ ${name} │ ${type} │ ${nullable} │ ${defaultVal} │`);
    });
    
    console.log('└─────────────────────────────┴──────────────┴─────────────┴──────────────┘');

    // 4. Test a simple cart operation
    console.log('\n🧪 Step 4: Probando operación básica de carrito...');
    
    const testSessionId = `test_${Date.now()}`;
    
    try {
      // Try to insert a test cart item
      await sql`
        INSERT INTO cart_items (
          session_id, 
          product_id, 
          name, 
          quantity, 
          add_name_embroidery, 
          price
        ) VALUES (
          ${testSessionId}, 
          1, 
          'Test Product', 
          1, 
          false, 
          100.00
        )
      `;
      
      console.log('✅ Inserción de item de carrito exitosa');

      // Try to read the cart item
      const cartItems = await sql`
        SELECT * FROM cart_items 
        WHERE session_id = ${testSessionId}
      `;
      
      if (cartItems.length > 0) {
        console.log('✅ Lectura de item de carrito exitosa');
      }

      // Clean up test data
      await sql`
        DELETE FROM cart_items 
        WHERE session_id = ${testSessionId}
      `;
      
      console.log('✅ Limpieza de datos de prueba exitosa');
      
    } catch (error) {
      console.error('❌ Error en prueba de carrito:', error.message);
      process.exit(1);
    }

    console.log('\n🎉 ¡VERIFICACIÓN EXITOSA!');
    console.log('✅ El fix del error 500 funcionó correctamente');
    console.log('✅ La aplicación debería funcionar sin errores ahora');
    console.log('\n🚀 Puedes verificar en: https://sigeristluxurybags.com');
    
  } catch (error) {
    console.error('❌ Error durante verificación:', error);
    
    if (error.message && error.message.includes('42703')) {
      console.log('\n🔧 Sugerencia: La columna add_name_embroidery aún no existe.');
      console.log('   Ejecuta: npm run fix:add-name-embroidery');
    } else if (error.message && error.message.includes('42P01')) {
      console.log('\n🔧 Sugerencia: La tabla cart_items no existe.');
      console.log('   Ejecuta: npm run migrate:cart');
    }
    
    process.exit(1);
  }
}

verifyDatabaseFix();