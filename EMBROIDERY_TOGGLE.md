# Embroidery Toggle Functionality

This document explains how the embroidery toggle feature works in the Sigerist e-commerce application.

## Overview

The embroidery toggle allows customers to preview products with and without embroidery (bordado). When a product supports embroidery, users can click toggle buttons to switch between:

- **Con bordado** (With embroidery) - Shows the embroidered version
- **Sin bordado** (Without embroidery) - Shows the non-embroidered version

## Product Data Structure

Products that support embroidery have the following structure:

```typescript
interface Product {
  id: number;
  name: string;
  imageUrl: string;           // Default embroidered image
  blankImageUrl: string;      // Non-embroidered image
  variants?: {
    bordado: boolean;         // Whether product supports embroidery
    bordadoImageUrl?: string; // Embroidered version image
    galleryImages?: string[]; // Gallery for non-embroidered version
    bordadoGalleryImages?: string[]; // Gallery for embroidered version
  };
}
```

## How It Works

### 1. Product Cards (List View)

In `client/src/components/product-card.tsx`, the image logic is:

```typescript
if (hasBordado) {
  if (showEmbroidery) {
    // Show embroidered version
    imageUrl = product.variants?.bordadoImageUrl || product.imageUrl;
  } else {
    // Show non-embroidered version
    imageUrl = product.blankImageUrl || product.imageUrl;
  }
}
```

### 2. Product Page (Detail View)

In `client/src/pages/product.tsx`, the gallery logic is:

```typescript
const getGalleryImages = () => {
  if (!hasBordado) {
    return product.variants?.galleryImages || [product.imageUrl];
  }
  if (!showEmbroidery) {
    // Uses custom gallery or falls back to blankImageUrl
    return product.variants?.galleryImages || [product.blankImageUrl || product.imageUrl];
  } else {
    // Uses embroidered gallery or falls back to bordadoImageUrl
    return product.variants?.bordadoGalleryImages || [product.variants?.bordadoImageUrl || product.imageUrl];
  }
};
```

## Image Priority

### With Embroidery (showEmbroidery = true):
1. `variants.bordadoGalleryImages` (gallery)
2. `variants.bordadoImageUrl` (single image)
3. `imageUrl` (fallback)

### Without Embroidery (showEmbroidery = false):
1. `variants.galleryImages` (custom gallery for non-embroidered)
2. `blankImageUrl` (single non-embroidered image)
3. `imageUrl` (fallback)

## Example Product Configuration

```javascript
{
  id: 1,
  name: "Pañalera Multifuncional",
  imageUrl: "/assets/Multifuncional 3 Bordada.jpg",
  blankImageUrl: "/assets/Multifuncional 3 sin Bordado.jpg",
  variants: {
    bordado: true,
    bordadoImageUrl: "/assets/Multifuncional 3 Bordada.jpg",
    galleryImages: ["/assets/Multifuncional 3sinB.jpg"], // Non-embroidered gallery
    bordadoGalleryImages: [ // Embroidered gallery
      "/assets/Multifuncional 3 Bordada.jpg",
      "/assets/Multifuncional 2 Bordada.jpg"
    ]
  }
}
```

## Recent Fix

**Issue**: The product page was incorrectly looking for `product.variants?.blankImageUrl` instead of `product.blankImageUrl`.

**Fix**: Changed line 143 in `client/src/pages/product.tsx` to use the correct property path.

**Result**: The embroidery toggle now correctly shows different images when switching between embroidered and non-embroidered versions.

## Testing

Run the validation test to ensure embroidery toggle works correctly:

```bash
node test-embroidery-toggle.js
```

This test validates:
- Images change when toggling embroidery state
- All referenced image files exist
- Non-embroidered versions use correct blank images