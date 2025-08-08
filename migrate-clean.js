#!/usr/bin/env node

// Script de migración limpia para Neon Database
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dHQzmwGqg76i@ep-tiny-truth-ae8g45rg-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🚀 Iniciando migración limpia...');

async function migrate() {
  try {
    // 1. BORRAR tablas existentes para empezar limpio
    console.log('🗑️ Limpiando tablas existentes...');
    await sql`DROP TABLE IF EXISTS cart_items CASCADE`;
    await sql`DROP TABLE IF EXISTS orders CASCADE`;
    await sql`DROP TABLE IF EXISTS order_items CASCADE`;
    await sql`DROP TABLE IF EXISTS customers CASCADE`;
    await sql`DROP TABLE IF EXISTS products CASCADE`;

    // 2. CREAR tabla products (alineada con shared/schema.ts)
    console.log('📊 Creando tabla products...');
    await sql`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        animal_type TEXT,
        colors TEXT[],
        in_stock BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 3. INSERTAR productos básicos
    console.log('🎒 Insertando productos...');
    
    const products = [
      {
        name: 'Maleta Viajera Bordada',
        description: 'Elegante maleta de viaje con bordado personalizado',
        price: 180000,
        category: 'maletas',
        image_url: '/images/maleta-viajera.jpg',
        animal_type: null,
        colors: ['Negro', 'Café', 'Rosa'],
        in_stock: true
      },
      {
        name: 'Bolso Mariposa',
        description: 'Hermoso bolso con diseño de mariposa',
        price: 120000,
        category: 'bolsos',
        image_url: '/images/bolso-mariposa.jpg',
        animal_type: 'mariposa',
        colors: ['Rosa', 'Azul', 'Lila'],
        in_stock: true
      },
      {
        name: 'Mochila Clásica',
        description: 'Mochila resistente para uso diario',
        price: 95000,
        category: 'mochilas',
        image_url: '/images/mochila-clasica.jpg',
        animal_type: null,
        colors: ['Negro', 'Azul Marino'],
        in_stock: true
      },
      {
        name: 'Cambiador',
        description: 'Práctico cambiador para bebé',
        price: 85000,
        category: 'accesorios',
        image_url: '/images/cambiador.jpg',
        animal_type: null,
        colors: ['Beige', 'Rosa', 'Azul'],
        in_stock: true
      },
      {
        name: 'Lonchera Baúl',
        description: 'Lonchera espaciosa tipo baúl',
        price: 65000,
        category: 'loncheras',
        image_url: '/images/lonchera-baul.jpg',
        animal_type: null,
        colors: ['Rosa', 'Verde', 'Azul'],
        in_stock: true
      }
    ];

    for (const product of products) {
      await sql`
        INSERT INTO products (name, description, price, category, image_url, animal_type, colors, in_stock)
        VALUES (${product.name}, ${product.description}, ${product.price}, ${product.category}, ${product.image_url}, ${product.animal_type}, ${product.colors}, ${product.in_stock})
      `;
    }

    // 4. VERIFICAR resultados
    const result = await sql`SELECT COUNT(*) as count FROM products`;
    console.log(`✅ Migración exitosa: ${result[0].count} productos insertados`);

    console.log('🎉 Base de datos lista para Sigerist Luxury Bags');

  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrate();