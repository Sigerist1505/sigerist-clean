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

    // 2. CREAR tabla products
    console.log('📊 Creando tabla products...');
    await sql`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC NOT NULL,
        image_url TEXT,
        category TEXT,
        stock INTEGER DEFAULT 100,
        has_embroidery BOOLEAN DEFAULT false,
        embroidery_price NUMERIC DEFAULT 0,
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
        has_embroidery: true,
        embroidery_price: 15000,
        image_url: '/images/maleta-viajera.jpg'
      },
      {
        name: 'Bolso Mariposa',
        description: 'Hermoso bolso con diseño de mariposa',
        price: 120000,
        category: 'bolsos',
        has_embroidery: true,
        embroidery_price: 15000,
        image_url: '/images/bolso-mariposa.jpg'
      },
      {
        name: 'Mochila Clásica',
        description: 'Mochila resistente para uso diario',
        price: 95000,
        category: 'mochilas',
        has_embroidery: false,
        embroidery_price: 0,
        image_url: '/images/mochila-clasica.jpg'
      },
      {
        name: 'Cambiador',
        description: 'Práctico cambiador para bebé',
        price: 85000,
        category: 'accesorios',
        has_embroidery: false,
        embroidery_price: 0,
        image_url: '/images/cambiador.jpg'
      },
      {
        name: 'Lonchera Baúl',
        description: 'Lonchera espaciosa tipo baúl',
        price: 65000,
        category: 'loncheras',
        has_embroidery: true,
        embroidery_price: 15000,
        image_url: '/images/lonchera-baul.jpg'
      }
    ];

    for (const product of products) {
      await sql`
        INSERT INTO products (name, description, price, category, has_embroidery, embroidery_price, image_url)
        VALUES (${product.name}, ${product.description}, ${product.price}, ${product.category}, ${product.has_embroidery}, ${product.embroidery_price}, ${product.image_url})
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