#!/usr/bin/env node

// Script de migración con TODOS los productos de Sigerist Luxury Bags
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dHQzmwGqg76i@ep-tiny-truth-ae8g45rg-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🚀 Iniciando migración completa con todos los productos...');

async function migrateComplete() {
  try {
    // 1. BORRAR tablas existentes
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

    // 3. INSERTAR TODOS LOS PRODUCTOS REALES
    console.log('🎒 Insertando productos completos de Sigerist...');
    
    const completeProducts = [
      // KIT PROMOCIONAL
      {
        name: 'Kit Luxury de 7 Piezas',
        description: 'Kit completo con maleta, bolsos y accesorios. Ahorra $170,500 COP',
        price: 1534500,
        category: 'kits',
        image_url: '/images/kit-luxury.jpg',
        animal_type: null,
        colors: ['Negro', 'Café', 'Rosa', 'Azul'],
        in_stock: true
      },
      // MALETAS
      {
        name: 'Maleta Viajera Bordada',
        description: 'Elegante maleta de viaje con bordado personalizado artesanal',
        price: 350000,
        category: 'maletas',
        image_url: '/images/maleta-viajera-bordada.jpg',
        animal_type: 'personalizado',
        colors: ['Negro', 'Café', 'Rosa'],
        in_stock: true
      },
      {
        name: 'Maleta Milan Bordada',
        description: 'Maleta Milan de alta calidad con bordado personalizado',
        price: 330000,
        category: 'maletas',
        image_url: '/images/maleta-milan-bordada.jpg',
        animal_type: 'personalizado',
        colors: ['Negro', 'Café', 'Beige'],
        in_stock: true
      },
      {
        name: 'Maleta Milan Sin Bordar',
        description: 'Maleta Milan elegante sin personalización',
        price: 280000,
        category: 'maletas',
        image_url: '/images/maleta-milan-sin-bordar.jpg',
        animal_type: null,
        colors: ['Negro', 'Café', 'Beige'],
        in_stock: true
      },
      // BOLSOS
      {
        name: 'Bolso Mariposa Bordado',
        description: 'Hermoso bolso con diseño de mariposa bordada a mano',
        price: 180000,
        category: 'bolsos',
        image_url: '/images/bolso-mariposa-bordado.jpg',
        animal_type: 'mariposa',
        colors: ['Rosa', 'Azul', 'Lila'],
        in_stock: true
      },
      {
        name: 'Bolso Mariposa Sin Bordar',
        description: 'Elegante bolso con diseño de mariposa sin bordado',
        price: 130000,
        category: 'bolsos',
        image_url: '/images/bolso-mariposa-sin-bordar.jpg',
        animal_type: null,
        colors: ['Rosa', 'Azul', 'Lila'],
        in_stock: true
      },
      {
        name: 'Bolsito Gato Bordado',
        description: 'Adorable bolsito con diseño de gato bordado',
        price: 95000,
        category: 'bolsos',
        image_url: '/images/bolsito-gato.jpg',
        animal_type: 'gato',
        colors: ['Rosa', 'Celeste', 'Blanco'],
        in_stock: true
      },
      {
        name: 'Bolsito Perrito Bordado',
        description: 'Tierno bolsito con diseño de perrito bordado',
        price: 95000,
        category: 'bolsos',
        image_url: '/images/bolsito-perrito.jpg',
        animal_type: 'perro',
        colors: ['Café', 'Beige', 'Blanco'],
        in_stock: true
      },
      // ACCESORIOS
      {
        name: 'Cambiador',
        description: 'Práctico cambiador para bebé, resistente y fácil de limpiar',
        price: 85000,
        category: 'accesorios',
        image_url: '/images/cambiador.jpg',
        animal_type: null,
        colors: ['Beige', 'Rosa', 'Azul'],
        in_stock: true
      },
      {
        name: 'Organizador de Muda Bordado',
        description: 'Organizador práctico para mudas de ropa con bordado personalizado',
        price: 75000,
        category: 'accesorios',
        image_url: '/images/organizador-muda-bordado.jpg',
        animal_type: 'personalizado',
        colors: ['Rosa', 'Azul', 'Amarillo'],
        in_stock: true
      },
      {
        name: 'Organizador de Muda Sin Bordar',
        description: 'Organizador práctico para mudas de ropa sin personalización',
        price: 55000,
        category: 'accesorios',
        image_url: '/images/organizador-muda.jpg',
        animal_type: null,
        colors: ['Rosa', 'Azul', 'Amarillo'],
        in_stock: true
      },
      // LONCHERAS
      {
        name: 'Lonchera Baúl Bordada',
        description: 'Lonchera espaciosa tipo baúl con bordado personalizado',
        price: 95000,
        category: 'loncheras',
        image_url: '/images/lonchera-baul-bordada.jpg',
        animal_type: 'personalizado',
        colors: ['Rosa', 'Verde', 'Azul'],
        in_stock: true
      },
      {
        name: 'Lonchera Baúl Sin Bordar',
        description: 'Lonchera espaciosa tipo baúl sin personalización',
        price: 65000,
        category: 'loncheras',
        image_url: '/images/lonchera-baul.jpg',
        animal_type: null,
        colors: ['Rosa', 'Verde', 'Azul'],
        in_stock: true
      },
      // MOCHILAS
      {
        name: 'Mochila León Personalizada',
        description: 'Mochila con diseño de león y nombre bordado',
        price: 140000,
        category: 'mochilas',
        image_url: '/images/mochila-leon.jpg',
        animal_type: 'leon',
        colors: ['Amarillo', 'Café'],
        in_stock: true
      }
    ];

    for (const product of completeProducts) {
      await sql`
        INSERT INTO products (name, description, price, category, image_url, animal_type, colors, in_stock)
        VALUES (${product.name}, ${product.description}, ${product.price}, ${product.category}, ${product.image_url}, ${product.animal_type}, ${product.colors}, ${product.in_stock})
      `;
    }

    // 4. VERIFICAR resultados
    const result = await sql`SELECT COUNT(*) as count FROM products`;
    console.log(`✅ Migración completa exitosa: ${result[0].count} productos insertados`);
    
    // 5. MOSTRAR productos por categoría
    const categories = await sql`
      SELECT category, COUNT(*) as count 
      FROM products 
      GROUP BY category 
      ORDER BY category
    `;
    
    console.log('📋 Productos por categoría:');
    categories.forEach(cat => {
      console.log(`   ${cat.category}: ${cat.count} productos`);
    });

    console.log('🎉 Base de datos completa lista para Sigerist Luxury Bags');
    console.log('💰 Kit promocional incluido con descuento del 10%');
    console.log('🎨 14 productos con opciones bordado/sin bordado');

  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrateComplete();