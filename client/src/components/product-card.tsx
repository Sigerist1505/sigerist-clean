import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/utils";
import { ImageGallery } from "./image-gallery";
import type { Product } from "@shared/schema";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  // Verificar si el producto tiene bordado disponible
  const hasBordado = product.variants?.bordado === true;
  const [showEmbroidery, setShowEmbroidery] = useState(hasBordado); // Default según si tiene bordado

  // Calcular precio dinámico: precio base es SIN bordado, +15k CON bordado
  const calculatePrice = () => {
    const basePrice = parseInt(product.price); // Este precio ya es SIN bordado
    if (hasBordado && showEmbroidery) {
      return (basePrice + 15000).toString(); // Agregar 15k cuando se selecciona bordado
    }
    return product.price; // Precio base sin bordado
  };

  const displayPrice = calculatePrice();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      quantity: 1,
      price: displayPrice, // Usar precio calculado
    });
  };

  // Get variant count for display
  const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;
  
  // Get gallery images based on embroidery selection
  const getGalleryImages = () => {
    if (!hasBordado) {
      // Si no tiene bordado, usar galleryImages o imagen principal
      return product.variants?.galleryImages || [product.imageUrl];
    }
    
    if (!showEmbroidery) {
      // Sin bordado: usar galleryImages o blankImageUrl
      return product.variants?.galleryImages || [product.blankImageUrl || product.imageUrl];
    } else {
      // Con bordado: usar bordadoGalleryImages o bordadoImageUrl
      return product.variants?.bordadoGalleryImages || [product.variants?.bordadoImageUrl || product.referenceImageUrl || product.imageUrl];
    }
  };
  
  const galleryImages = getGalleryImages();

  return (
    <Card className="group cursor-pointer bg-gradient-to-br from-gray-900/95 to-black/95 border-2 border-gray-600/30 hover:border-[#C0C0C0]/60 shadow-2xl hover:shadow-[0_0_30px_rgba(192,192,192,0.3)] transition-all duration-500 hover:scale-[1.03] relative overflow-hidden backdrop-blur-sm">
      {/* Stock Badge */}
      {product.inStock && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-green-600/90 to-green-700/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          En Stock
        </div>
      )}
      
      <Link href={`/product/${product.id}`}>
        <div className="relative h-64 bg-gradient-to-br from-white to-gray-50 rounded-lg overflow-hidden border border-gray-200/50">
          <ImageGallery 
            images={galleryImages} 
            alt={product.name}
            className="h-full"
          />
          
          {/* Embroidery Toggle Circles - Only show if product has embroidery option */}
          {hasBordado && (
            <div className="absolute top-3 left-3 flex gap-1 z-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowEmbroidery(true);
                }}
                className={`w-8 h-8 rounded-full transition-all duration-300 shadow-lg border-2 ${
                  showEmbroidery 
                    ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-400 scale-110' 
                    : 'bg-white/90 border-white hover:scale-105 hover:bg-yellow-50'
                }`}
                title="Con bordado"
              >
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  {showEmbroidery ? (
                    <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                  ) : (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-60"></div>
                  )}
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowEmbroidery(false);
                }}
                className={`w-8 h-8 rounded-full transition-all duration-300 shadow-lg border-2 ${
                  !showEmbroidery 
                    ? 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-500 scale-110' 
                    : 'bg-white/90 border-white hover:scale-105 hover:bg-gray-50'
                }`}
                title="Sin bordado"
              >
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  {!showEmbroidery ? (
                    <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                  ) : (
                    <div className="w-2 h-2 bg-gray-500 rounded-full opacity-60"></div>
                  )}
                </div>
              </button>
            </div>
          )}
        </div>
      </Link>
      
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-[#C0C0C0]/20 text-[#C0C0C0] font-medium border border-[#C0C0C0]/30">
              {product.category}
            </Badge>
            <div className="text-xs text-gray-400 font-medium">
              {showEmbroidery ? 'Con bordado' : 'Sin bordado'}
            </div>
          </div>
          {variantCount > 0 && (
            <div className="text-xs text-gray-400 font-medium">
              {variantCount} modelo{variantCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-[#C0C0C0] group-hover:text-amber-400 transition-colors leading-tight">
          {product.name}
        </h3>
        
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {product.colors && product.colors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.colors.slice(0, 3).map((color, index) => (
              <Badge key={index} variant="outline" className="text-xs border-[#C0C0C0]/30 text-[#C0C0C0] font-medium">
                {color}
              </Badge>
            ))}
            {product.colors.length > 3 && (
              <Badge variant="outline" className="text-xs border-[#C0C0C0]/30 text-[#C0C0C0] font-medium">
                +{product.colors.length - 3} más
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4 border-t border-gray-600/30">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-amber-400">
                {formatPrice(displayPrice)}
              </span>
              <span className="text-xs text-gray-400">
                {hasBordado ? (showEmbroidery ? 'Con bordado (+$15k)' : 'Sin bordado') : 'Precio final'}
              </span>
            </div>
            {variantCount > 0 && (
              <div className="text-right">
                <div className="text-xs text-amber-400 font-medium">Desde</div>
                <div className="text-xs text-gray-400">{variantCount} opciones</div>
              </div>
            )}
          </div>
          
          <Link href={`/product/${product.id}`} className="w-full">
            <Button
              size="lg"
              className="w-full bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold text-base py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-[#C0C0C0]/20"
            >
              Ver Detalles
            </Button>
          </Link>
        </div>

        {!product.inStock && (
          <Badge variant="destructive" className="w-full justify-center bg-orange-100 text-orange-800 border-orange-200 font-semibold py-2">
            Agotado
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
