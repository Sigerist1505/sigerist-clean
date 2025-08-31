#!/usr/bin/env node

// Script mejorado para cargar TODOS los productos con galerías de imágenes completas
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada en variables de entorno');
  console.log('💡 Configura tu .env con: DATABASE_URL=tu-url-de-neon');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🚀 Iniciando carga completa de productos con galerías...');

async function seedCompleteProducts() {
  try {
    // 1. Crear tabla de productos con campos para galerías
    console.log('📊 Creando/actualizando tabla products...');
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        has_embroidery_option BOOLEAN DEFAULT false,
        embroidery_price NUMERIC(10,2) DEFAULT 0,
        
        -- Campos para imágenes de bordado
        embroidered_image_url TEXT,
        blank_image_url TEXT,
        
        -- Campos para galerías (como JSON arrays)
        gallery_images JSONB DEFAULT '[]',
        embroidered_gallery_images JSONB DEFAULT '[]',
        
        -- Metadatos
        animal_type TEXT,
        colors JSONB DEFAULT '[]',
        in_stock BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. Limpiar productos existentes
    console.log('🗑️ Limpiando productos existentes...');
    await sql`DELETE FROM products`;

    // 3. Insertar productos completos con galerías
    console.log('🎒 Insertando productos con galerías completas...');
    
    const productsWithGalleries = [
      // PAÑALERAS CON GALERÍAS COMPLETAS
      {
        name: 'Pañalera Multifuncional',
        description: 'Pañalera multifuncional con bordado personalizado y múltiples compartimentos - ¡Nuestro producto estrella!',
        price: 445000,
        category: 'Pañaleras',
        image_url: '/assets/Multifuncional 3 Bordada.jpg',
        has_embroidery_option: true,
        embroidery_price: 15000,
        embroidered_image_url: '/assets/Multifuncional 3 Bordada.jpg',
        blank_image_url: '/assets/Multifuncional 3 sin Bordado.jpg',
        gallery_images: JSON.stringify([
          '/assets/Multifuncional 3sinB.jpg',
          '/assets/Multifuncional_Extra1.jpg',
          '/assets/Multifuncional_Extra2.jpg'
        ]),
        embroidered_gallery_images: JSON.stringify([
          '/assets/Multifuncional 3 Bordada.jpg',
          '/assets/Multifuncional 2 Bordada.jpg',
          '/assets/Multifuncional_Bordado_Extra1.jpg',
          '/assets/Multifuncional_Bordado_Extra2.jpg'
        ]),
        animal_type: 'personalizado',
        colors: JSON.stringify(['Rosa', 'Azul', 'Beige'])
      },

      // ORGANIZADORES
      {
        name: 'Organizador de Higiene',
        description: 'Organizador de higiene transparente con bordado personalizado de flores - Perfecto para viajes',
        price: 145000,
        category: 'Organizadores',
        image_url: '/assets/Organizador Bordado.jpg',
        has_embroidery_option: true,
        embroidery_price: 10000,
        embroidered_image_url: '/assets/Organizador Bordado.jpg',
        blank_image_url: '/assets/Organizador_Sin bordar.jpg',
        gallery_images: JSON.stringify(['/assets/Organizador_Sin bordar.jpg']),
        embroidered_gallery_images: JSON.stringify(['/assets/Organizador Bordado.jpg']),
        animal_type: 'flores',
        colors: JSON.stringify(['Transparente', 'Rosa', 'Azul'])
      },

      {
        name: 'Organizador de Mudas',
        description: 'Organizador de mudas con bordado personalizado y diseño práctico',
        price: 145000,
        category: 'Organizadores',
        image_url: '/assets/Organizador_Bordado.jpg',
        has_embroidery_option: true,
        embroidery_price: 10000,
        embroidered_image_url: '/assets/Organizador_Bordado.jpg',
        blank_image_url: '/assets/Organizador.jpg',
        gallery_images: JSON.stringify(['/assets/Organizador.jpg']),
        embroidered_gallery_images: JSON.stringify(['/assets/Organizador_Bordado.jpg']),
        animal_type: 'personalizado',
        colors: JSON.stringify(['Beige', 'Rosa', 'Azul'])
      },

      // MOCHILAS
      {
        name: 'Mochila Clásica',
        description: 'Mochila clásica con bordado de leoncito adorable y acabados premium en beige y café',
        price: 425000,
        category: 'Mochilas',
        image_url: '/assets/Mochila clasica.jpg',
        has_embroidery_option: false,
        embroidery_price: 0,
        gallery_images: JSON.stringify(['/assets/Mochila clasica.jpg']),
        animal_type: 'leon',
        colors: JSON.stringify(['Beige', 'Café'])
      },

      // BOLSOS CON GALERÍAS
      {
        name: 'Bolso Mariposa',
        description: 'Elegante bolso con diseño de mariposa y bordado personalizado. Perfecto para el día a día con un toque de distinción.',
        price: 285000,
        category: 'Bolsos',
        image_url: '/assets/Bolsito Mariposa.jpg',
        has_embroidery_option: true,
        embroidery_price: 12000,
        embroidered_image_url: '/assets/Bolsito Mariposa.jpg',
        blank_image_url: '/assets/Bolso Mariposa sin Bordar.jpg',
        gallery_images: JSON.stringify(['/assets/Bolso Mariposa sin Bordar.jpg']),
        embroidered_gallery_images: JSON.stringify(['/assets/Bolsito Mariposa.jpg']),
        animal_type: 'mariposa',
        colors: JSON.stringify(['Rosa', 'Azul', 'Lila'])
      },

      {
        name: 'Bolso Mini Fantasy',
        description: 'Adorable bolso mini fantasy con bordados de animales - Colección especial para niñas',
        price: 245000,
        category: 'Bolsos',
        image_url: '/assets/Bolso Rosadito Bordado Minifantasy.jpg',
        has_embroidery_option: true,
        embroidery_price: 12000,
        embroidered_image_url: '/assets/Bolso Rosadito Bordado Minifantasy.jpg',
        blank_image_url: '/assets/Minifantasy rosado sin bordar.jpg',
        gallery_images: JSON.stringify([
          '/assets/Minifantasy rosado sin bordar.jpg',
          '/assets/Bolsito Gato.jpg',
          '/assets/Bolsito perrito.jpg',
          '/assets/Bolso Mariposa sin Bordar.jpg',
          '/assets/Stitch Sin Bordar.jpg'
        ]),
        embroidered_gallery_images: JSON.stringify([
          '/assets/Bolso Rosadito Bordado Minifantasy.jpg',
          '/assets/Bolsito Gato.jpg',
          '/assets/Bolsito perrito bordado.jpg',
          '/assets/Bolsito Mariposa.jpg',
          '/assets/Stitch Blanco.jpg'
        ]),
        animal_type: 'varios',
        colors: JSON.stringify(['Rosa', 'Azul', 'Blanco'])
      },

      // LONCHERAS
      {
        name: 'Lonchera Porta Biberones',
        description: 'Lonchera porta biberones con bordado de osita personalizado',
        price: 335000,
        category: 'Loncheras',
        image_url: '/assets/Porta Biberones_Bordado.jpg',
        has_embroidery_option: true,
        embroidery_price: 15000,
        embroidered_image_url: '/assets/Porta Biberones_Bordado.jpg',
        blank_image_url: '/assets/PortaBiberones_SinBordar.jpg',
        gallery_images: JSON.stringify(['/assets/PortaBiberones_SinBordar.jpg']),
        embroidered_gallery_images: JSON.stringify(['/assets/Porta Biberones_Bordado.jpg']),
        animal_type: 'osita',
        colors: JSON.stringify(['Rosa', 'Azul', 'Beige'])
      },

      {
        name: 'Lonchera Baúl',
        description: 'Lonchera baúl con bordado de osito y acabados premium con moño azul',
        price: 335000,
        category: 'Loncheras',
        image_url: '/assets/Lonchera baul.jpg',
        has_embroidery_option: true,
        embroidery_price: 15000,
        embroidered_image_url: '/assets/Lonchera baul.jpg',
        blank_image_url: '/assets/Lonchera baul sin bordar.jpg',
        gallery_images: JSON.stringify(['/assets/Lonchera baul sin bordar.jpg']),
        embroidered_gallery_images: JSON.stringify(['/assets/Lonchera baul.jpg']),
        animal_type: 'osito',
        colors: JSON.stringify(['Beige', 'Azul'])
      },

      // MALETAS CON GALERÍAS
      {
        name: 'Maleta Viajera',
        description: 'Maleta viajera con diseño floral bordado y detalles en rosa',
        price: 550000,
        category: 'Maletas',
        image_url: '/assets/Maleta viajera_Bordada_1754093212912.jpg',
        has_embroidery_option: true,
        embroidery_price: 20000,
        embroidered_image_url: '/assets/Maleta viajera_Bordada_1754093212912.jpg',
        blank_image_url: '/assets/Maleta Viajera_Sin bordar_1754094149303.jpg',
        gallery_images: JSON.stringify(['/assets/Maleta Viajera_Sin bordar_1754094149303.jpg']),
        embroidered_gallery_images: JSON.stringify(['/assets/Maleta viajera_Bordada_1754093212912.jpg']),
        animal_type: 'flores',
        colors: JSON.stringify(['Rosa', 'Negro', 'Beige'])
      },

      {
        name: 'Maleta Milan',
        description: 'Maleta Milan elegante con bordado personalizado de alta calidad',
        price: 480000,
        category: 'Maletas',
        image_url: '/assets/MaletaMilan_ConBordado.jpg',
        has_embroidery_option: true,
        embroidery_price: 20000,
        embroidered_image_url: '/assets/MaletaMilan_ConBordado_1754093212912.jpg',
        blank_image_url: '/assets/MaletaMilan_SinBordado.jpg',
        gallery_images: JSON.stringify([
          '/assets/MaletaMilan_SinBordado.jpg',
          '/assets/Milan_Extra1.jpg',
          '/assets/Milan_Extra2.jpg',
          '/assets/Milan_Extra3.jpg'
        ]),
        embroidered_gallery_images: JSON.stringify([
          '/assets/MaletaMilan_ConBordado_1754093212912.jpg',
          '/assets/Milan_Bordado_Extra1.jpg',
          '/assets/Milan_Bordado_Extra2.jpg',
          '/assets/Milan_Bordado_Extra3.jpg'
        ]),
        animal_type: 'personalizado',
        colors: JSON.stringify(['Negro', 'Café', 'Beige'])
      },

      // ACCESORIOS
      {
        name: 'Cambiador Portátil',
        description: 'Cambiador portátil con diseño funcional y elegante - Solo disponible sin bordado',
        price: 105000,
        category: 'Accesorios',
        image_url: '/assets/Cambiador_1754094149302.jpg',
        has_embroidery_option: false,
        embroidery_price: 0,
        gallery_images: JSON.stringify(['/assets/Cambiador_1754094149302.jpg']),
        animal_type: null,
        colors: JSON.stringify(['Beige', 'Café'])
      },

      {
        name: 'Portachupetas',
        description: 'Portachupetas elegante con bordado personalizado y acabados premium',
        price: 80000,
        category: 'Accesorios',
        image_url: '/assets/Portachupeta.jpg',
        has_embroidery_option: false,
        embroidery_price: 0,
        gallery_images: JSON.stringify(['/assets/Portachupeta.jpg']),
        animal_type: null,
        colors: JSON.stringify(['Rosa', 'Azul', 'Beige'])
      }
    ];

    // Insertar cada producto
    for (const product of productsWithGalleries) {
      await sql`
        INSERT INTO products (
          name, description, price, category, image_url, 
          has_embroidery_option, embroidery_price,
          embroidered_image_url, blank_image_url,
          gallery_images, embroidered_gallery_images,
          animal_type, colors, in_stock
        )
        VALUES (
          ${product.name}, ${product.description}, ${product.price}, 
          ${product.category}, ${product.image_url},
          ${product.has_embroidery_option}, ${product.embroidery_price},
          ${product.embroidered_image_url || null}, ${product.blank_image_url || null},
          ${product.gallery_images || '[]'}, ${product.embroidered_gallery_images || '[]'},
          ${product.animal_type}, ${product.colors || '[]'}, ${product.in_stock || true}
        )
      `;
    }

    console.log('✅ Productos cargados exitosamente!');
    
    // Verificar datos
    const productCount = await sql`SELECT COUNT(*) as count FROM products`;
    const withEmbroidery = await sql`SELECT COUNT(*) as count FROM products WHERE has_embroidery_option = true`;
    
    console.log(`📊 Total productos: ${productCount[0].count}`);
    console.log(`🧵 Con opción de bordado: ${withEmbroidery[0].count}`);
    
    console.log('🎉 Base de datos lista con todas las imágenes y galerías!');
    
  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    process.exit(1);
  }
}

seedCompleteProducts();