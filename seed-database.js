import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada');
  process.exit(1);
}

// Creamos el cliente SQL
const sqlClient = neon(DATABASE_URL);

console.log('🚀 Iniciando configuración de base de datos para Sigerist...');

async function seedDatabase() {
  try {
    // 1. Crear tablas principales
    console.log('📊 Creando tablas...');
    
    await sqlClient`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC NOT NULL,
        image_url TEXT,
        category TEXT,
        stock INTEGER DEFAULT 100,
        has_embroidery_option BOOLEAN DEFAULT false,
        embroidery_price NUMERIC DEFAULT 0,
        specifications JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        personalization TEXT,
        price NUMERIC NOT NULL,
        embroidery_color TEXT,
        embroidery_font TEXT,
        custom_preview TEXT,
        add_pompon BOOLEAN DEFAULT false,
        add_personalized_keychain BOOLEAN DEFAULT false,
        add_decorative_bow BOOLEAN DEFAULT false,
        keychain_personalization TEXT,
        add_name_embroidery BOOLEAN DEFAULT false,
        express_service BOOLEAN DEFAULT false,
        specifications JSONB,
        has_bordado BOOLEAN DEFAULT false,
        add_personalization BOOLEAN DEFAULT false
      )
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        shipping_address TEXT NOT NULL,
        total_amount NUMERIC NOT NULL,
        payment_method TEXT,
        payment_status TEXT DEFAULT 'pending',
        order_status TEXT DEFAULT 'processing',
        items JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id SERIAL PRIMARY KEY,
        phone_number TEXT UNIQUE NOT NULL,
        session_data JSONB NOT NULL,
        last_activity TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS registered_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS discount_codes (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL,
        discount_value NUMERIC NOT NULL,
        is_active BOOLEAN DEFAULT true,
        valid_from TIMESTAMP DEFAULT NOW(),
        valid_until TIMESTAMP,
        usage_limit INTEGER,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id SERIAL PRIMARY KEY,
        campaign_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        sent_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        sent_at TIMESTAMP
      )
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS bag_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        base_color TEXT NOT NULL,
        embroidery_design TEXT,
        preview_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('✅ Tablas creadas exitosamente');

    // 2. Insertar productos iniciales de Sigerist
    console.log('🎒 Insertando productos de Sigerist...');
    
    const products = [
      {
        name: 'Mochila Clásica',
        description: 'Mochila elegante para uso diario con opción de bordado personalizado',
        price: 120000,
        category: 'Mochilas',
        has_embroidery_option: true,
        embroidery_price: 15000,
        image_url: '/assets/mochila-clasica.jpg'
      },
      {
        name: 'Mochila Milano',
        description: 'Mochila de lujo estilo Milano con acabados premium',
        price: 150000,
        category: 'Mochilas',
        has_embroidery_option: true,
        embroidery_price: 15000,
        image_url: '/assets/mochila-milano.jpg'
      },
      {
        name: 'Pañalera Multifuncional',
        description: 'Pañalera espaciosa con múltiples compartimentos',
        price: 180000,
        category: 'Pañaleras',
        has_embroidery_option: true,
        embroidery_price: 15000,
        image_url: '/assets/panalera-multifuncional.jpg'
      },
      {
        name: 'Maleta Viajera',
        description: 'Maleta de viaje con ruedas y diseño ergonómico',
        price: 250000,
        category: 'Maletas',
        has_embroidery_option: true,
        embroidery_price: 20000,
        image_url: '/assets/maleta-viajera.jpg'
      },
      {
        name: 'Bolso de Mano Elegante',
        description: 'Bolso de mano para ocasiones especiales',
        price: 90000,
        category: 'Bolsos',
        has_embroidery_option: true,
        embroidery_price: 12000,
        image_url: '/assets/bolso-elegante.jpg'
      },
      {
        name: 'Organizador de Muda',
        description: 'Organizador práctico para ropa de bebé',
        price: 45000,
        category: 'Organizadores',
        has_embroidery_option: true,
        embroidery_price: 10000,
        image_url: '/assets/organizador-muda.jpg'
      },
      {
        name: 'Cambiador Portátil',
        description: 'Cambiador plegable para bebés',
        price: 65000,
        category: 'Accesorios',
        has_embroidery_option: false,
        embroidery_price: 0,
        image_url: '/assets/cambiador-portatil.jpg'
      }
    ];

    for (const product of products) {
      await sqlClient`
        INSERT INTO products (name, description, price, category, has_embroidery_option, embroidery_price, image_url, stock)
        VALUES (${product.name}, ${product.description}, ${product.price}, ${product.category}, 
                ${product.has_embroidery_option}, ${product.embroidery_price}, ${product.image_url}, 50)
        ON CONFLICT DO NOTHING
      `;
    }

    // 3. Crear código de descuento promocional
    await sqlClient`
      INSERT INTO discount_codes (code, discount_type, discount_value, usage_limit)
      VALUES ('SIGERIST10', 'percentage', 10, 100)
      ON CONFLICT (code) DO NOTHING
    `;

    console.log('✅ Configuración de base de datos completada');
    console.log('🎉 Sigerist Luxury Bags está listo para Railway');
    
    // Verificar datos
    const productCount = await sqlClient`SELECT COUNT(*) as count FROM products`;
    console.log(`📊 Productos creados: ${productCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
    process.exit(1);
  }
}

seedDatabase();