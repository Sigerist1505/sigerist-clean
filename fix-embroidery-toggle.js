#!/usr/bin/env node

// Script to fix embroidery toggle functionality
// This ensures products have correct variants.bordado flags and blankImageUrl mappings

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_dHQzmwGqg76i@ep-tiny-truth-ae8g45rg-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🔧 Fixing embroidery toggle functionality...');

async function fixEmbroideryToggle() {
  try {
    // Get all products to fix
    const products = await sql`SELECT * FROM products`;
    console.log(`📊 Found ${products.length} products to process`);

    // Define the correct image mappings for products that support embroidery
    const embroideryMappings = {
      // Updated mappings based on requirements
      'Maleta Viajera Bordada': {
        imageUrl: '/assets/maleta-viajera-bordada.jpg',
        blankImageUrl: '/assets/maleta-viajera-bordada.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/maleta-viajera-bordada.jpg' }
      },
      'Mini fantasy': {
        imageUrl: '/assets/Bolsito Mariposa.jpg',
        blankImageUrl: '/assets/Bolso Mariposa sin Bordar.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Bolsito Mariposa.jpg' }
      },
      'Mochila Clásica': {
        imageUrl: '/assets/Mochila clasica.jpg',
        blankImageUrl: '/assets/Mochila clasica.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Mochila clasica.jpg' }
      },
      'Cambiador': {
        imageUrl: '/assets/Cambiador.jpg',
        blankImageUrl: '/assets/Cambiador.jpg',
        variants: { bordado: false, bordadoImageUrl: '/assets/Cambiador.jpg' }
      },
      'Lonchera Baúl': {
        imageUrl: '/assets/Lonchera baul.jpg',
        blankImageUrl: '/assets/Lonchera baul sin bordar.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Lonchera baul.jpg' }
      },
      'Producto de Prueba': {
        imageUrl: '/assets/IMG-20250531-WA0015.jpg',
        blankImageUrl: '/assets/IMG-20250531-WA0015.jpg',
        variants: { bordado: false, bordadoImageUrl: '/assets/IMG-20250531-WA0015.jpg' }
      },
      'Multifuncional': {
        imageUrl: '/assets/Multifuncional.jpg',
        blankImageUrl: '/assets/Multifuncional 3 sin Bordado.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Multifuncional.jpg' }
      },
      'Pañalera Grande': {
        imageUrl: '/assets/Pañalera Grande con nombre.jpg',
        blankImageUrl: '/assets/Pañalera Grande.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Pañalera Grande con nombre.jpg' }
      },
      'Maleta Milan': {
        imageUrl: '/assets/MaletaMilan_ConBordado.jpg',
        blankImageUrl: '/assets/MaletaMilan_ConBordado.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/maleta-milan-bordada.jpg' }
      },
      'Organizador de Higiene': {
        imageUrl: '/assets/Organizador Bordado.jpg',
        blankImageUrl: '/assets/Organizador_Sin bordar.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Organizador Bordado.jpg' }
      },
      'Portachupetas': {
        imageUrl: '/assets/Portachupeta.jpg',
        blankImageUrl: '/assets/Portachupeta.jpg',
        variants: { bordado: false, bordadoImageUrl: '/assets/Portachupeta.jpg' }
      },
      'Organizador de mudas': {
        imageUrl: '/assets/Organizador_Bordado.jpg',
        blankImageUrl: '/assets/Organizador.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Organizador_Bordado.jpg' }
      },
      'Lochera/Porta Biberones': {
        imageUrl: '/assets/Porta Biberones_Bordado.jpg',
        blankImageUrl: '/assets/PortaBiberones_SinBordar.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Porta Biberones_Bordado.jpg' }
      },
      'Porta Biberones': {
        imageUrl: '/assets/Porta Biberones_Bordado.jpg',
        blankImageUrl: '/assets/PortaBiberones_SinBordar.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Porta Biberones_Bordado.jpg' }
      },

      // Keep existing mappings for backward compatibility
      'Bolso Mariposa Bordado': {
        imageUrl: '/assets/Bolsito Mariposa.jpg',
        blankImageUrl: '/assets/Bolso Mariposa sin Bordar.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Bolsito Mariposa.jpg' }
      },
      
      // Multifuncional 3
      'Pañalera Multifuncional': {
        imageUrl: '/assets/Multifuncional 3 Bordada.jpg',
        blankImageUrl: '/assets/Multifuncional 3 sin Bordado.jpg',
        variants: { 
          bordado: true, 
          bordadoImageUrl: '/assets/Multifuncional 3 Bordada.jpg',
          galleryImages: ['/assets/Multifuncional 3sinB.jpg'],
          bordadoGalleryImages: [
            '/assets/Multifuncional 3 Bordada.jpg',
            '/assets/Multifuncional 2 Bordada.jpg'
          ]
        }
      },

      // Lonchera Porta Biberones
      'Lonchera Porta Biberones': {
        imageUrl: '/assets/Porta Biberones_Bordado.jpg',
        blankImageUrl: '/assets/PortaBiberones_SinBordar.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Porta Biberones_Bordado.jpg' }
      },

      // Lonchera Baul
      'Lonchera Baul': {
        imageUrl: '/assets/Lonchera baul.jpg',
        blankImageUrl: '/assets/Lonchera baul sin bordar.jpg',
        variants: { bordado: true, bordadoImageUrl: '/assets/Lonchera baul.jpg' }
      },

      // Maleta Milan
      'Mochila Milano': {
        imageUrl: '/assets/maleta-milan-bordada.jpg',
        blankImageUrl: '/assets/MaletaMilan_ConBordado.jpg', // This might be the non-embroidered version
        variants: { bordado: true, bordadoImageUrl: '/assets/maleta-milan-bordada.jpg' }
      },

      // Mini Fantasy Collection
      'Colección Mini Fantasy': {
        imageUrl: '/assets/Bolso Rosadito Bordado Minifantasy.jpg',
        blankImageUrl: '/assets/Minifantasy rosado sin bordar.jpg',
        variants: { 
          bordado: true,
          bordadoImageUrl: '/assets/Bolso Rosadito Bordado Minifantasy.jpg',
          galleryImages: [
            '/assets/Minifantasy rosado sin bordar.jpg',
            '/assets/Bolsito Gato.jpg',
            '/assets/Bolsito perrito.jpg',
            '/assets/Bolso Mariposa sin Bordar.jpg',
            '/assets/Stitch Sin Bordar.jpg'
          ],
          bordadoGalleryImages: [
            '/assets/Bolso Rosadito Bordado Minifantasy.jpg',
            '/assets/Bolsito Gato.jpg',
            '/assets/Bolsito perrito bordado.jpg',
            '/assets/Bolsito Mariposa.jpg',
            '/assets/Stitch Blanco.jpg'
          ]
        }
      }
    };

    let updatedCount = 0;

    for (const product of products) {
      // Check if this product has an embroidery mapping
      const mapping = embroideryMappings[product.name];
      
      if (mapping) {
        console.log(`🔄 Updating product: ${product.name}`);
        
        await sql`
          UPDATE products 
          SET 
            image_url = ${mapping.imageUrl},
            blank_image_url = ${mapping.blankImageUrl},
            variants = ${JSON.stringify(mapping.variants)}
          WHERE id = ${product.id}
        `;
        
        updatedCount++;
      } else {
        // Check if product name contains keywords that suggest it should have embroidery
        const nameContainsEmbroideryKeywords = /bordad|embroid/i.test(product.name);
        
        if (nameContainsEmbroideryKeywords && (!product.variants || !product.variants.bordado)) {
          console.log(`🔄 Setting bordado flag for: ${product.name}`);
          
          const currentVariants = product.variants || {};
          const updatedVariants = { ...currentVariants, bordado: true };
          
          await sql`
            UPDATE products 
            SET variants = ${JSON.stringify(updatedVariants)}
            WHERE id = ${product.id}
          `;
          
          updatedCount++;
        }
      }
    }

    console.log(`✅ Updated ${updatedCount} products with embroidery toggle support`);
    console.log('🎉 Embroidery toggle fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing embroidery toggle:', error);
    process.exit(1);
  }
}

fixEmbroideryToggle();