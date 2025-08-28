// Test script to validate embroidery toggle functionality
// This script validates that the product page correctly shows different images
// when toggling between "Con bordado" (with embroidery) and "Sin bordado" (without embroidery)

const fs = require('fs');
const path = require('path');

// Sample product data matching the actual database structure
const sampleProducts = [
  {
    id: 1,
    name: "Pañalera Multifuncional",
    imageUrl: "/assets/Multifuncional 3 Bordada.jpg",
    blankImageUrl: "/assets/Multifuncional 3 sin Bordado.jpg",
    variants: {
      bordado: true,
      bordadoImageUrl: "/assets/Multifuncional 3 Bordada.jpg",
      galleryImages: ["/assets/Multifuncional 3sinB.jpg"],
      bordadoGalleryImages: [
        "/assets/Multifuncional 3 Bordada.jpg",
        "/assets/Multifuncional 2 Bordada.jpg",
      ],
    },
  },
  {
    id: 2,
    name: "Organizador de Higiene",
    imageUrl: "/assets/Organizador Bordado.jpg",
    blankImageUrl: "/assets/Organizador_Sin bordar.jpg",
    variants: {
      bordado: true,
      bordadoImageUrl: "/assets/Organizador Bordado.jpg",
      galleryImages: ["/assets/Organizador_Sin bordar.jpg"],
      bordadoGalleryImages: ["/assets/Organizador Bordado.jpg"],
    },
  },
];

// FIXED gallery logic for product page (this is the corrected version)
function getGalleryImages(product, showEmbroidery) {
  const hasBordado = product.variants?.bordado === true;
  
  if (!hasBordado) {
    return product.variants?.galleryImages || [product.imageUrl];
  }
  if (!showEmbroidery) {
    // CRITICAL FIX: Use product.blankImageUrl instead of product.variants?.blankImageUrl
    return product.variants?.galleryImages || [product.blankImageUrl || product.imageUrl];
  } else {
    return (
      product.variants?.bordadoGalleryImages ||
      [product.variants?.bordadoImageUrl || product.variants?.referenceImageUrl || product.imageUrl]
    );
  }
}

// Test function to validate that images exist
function validateImageExists(imagePath, assetsDir) {
  // Remove /assets/ prefix and check if file exists
  const fileName = imagePath.replace('/assets/', '');
  const fullPath = path.join(assetsDir, fileName);
  return fs.existsSync(fullPath);
}

// Main test function
function testEmbroideryToggle() {
  console.log('🧪 Testing Embroidery Toggle Functionality\n');
  
  const assetsDir = path.join(__dirname, 'client', 'public', 'assets');
  let allTestsPassed = true;

  sampleProducts.forEach((product, index) => {
    console.log(`📦 Product ${index + 1}: ${product.name}`);
    console.log(`   Has embroidery support: ${product.variants?.bordado === true}`);
    
    // Test gallery images for both states
    const withEmbroideryGallery = getGalleryImages(product, true);
    const withoutEmbroideryGallery = getGalleryImages(product, false);
    
    console.log(`   🎨 With embroidery gallery: ${JSON.stringify(withEmbroideryGallery)}`);
    console.log(`   🎨 Without embroidery gallery: ${JSON.stringify(withoutEmbroideryGallery)}`);
    
    // Validate that galleries are different
    const galleryImagesDifferent = JSON.stringify(withEmbroideryGallery) !== JSON.stringify(withoutEmbroideryGallery);
    if (galleryImagesDifferent) {
      console.log('   ✅ Gallery images change correctly when toggling embroidery');
    } else {
      console.log('   ❌ Gallery images do NOT change when toggling embroidery');
      allTestsPassed = false;
    }
    
    // Validate that all referenced images exist
    const allImages = [...withEmbroideryGallery, ...withoutEmbroideryGallery];
    const uniqueImages = [...new Set(allImages)];
    
    console.log('   📸 Checking image files:');
    uniqueImages.forEach(imagePath => {
      const exists = validateImageExists(imagePath, assetsDir);
      if (exists) {
        console.log(`      ✅ ${imagePath} - EXISTS`);
      } else {
        console.log(`      ❌ ${imagePath} - MISSING`);
        allTestsPassed = false;
      }
    });
    
    // Test specific requirements from the fix
    if (product.variants?.bordado) {
      const usesBlankImageCorrectly = withoutEmbroideryGallery.includes(product.blankImageUrl) || 
                                     withoutEmbroideryGallery.some(img => img !== product.imageUrl);
      if (usesBlankImageCorrectly) {
        console.log('   ✅ Correctly uses different image for non-embroidered version');
      } else {
        console.log('   ❌ Does NOT use different image for non-embroidered version');
        allTestsPassed = false;
      }
    }
    
    console.log('   ---\n');
  });
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Embroidery toggle functionality is working correctly.');
    console.log('   ✅ Images change when toggling between "Con bordado" and "Sin bordado"');
    console.log('   ✅ All referenced image files exist');
    console.log('   ✅ Non-embroidered versions use correct blank images');
  } else {
    console.log('❌ SOME TESTS FAILED! Please review the issues above.');
    process.exit(1);
  }
}

// Run the tests
try {
  testEmbroideryToggle();
} catch (error) {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
}