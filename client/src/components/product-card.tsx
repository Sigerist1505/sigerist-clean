import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isAddingToCart } = useCart(); // Usamos isAddingToCart de useMutation
  const [isAdded, setIsAdded] = useState(false); // Restauramos el estado para "Agregado!"
  const [error, setError] = useState<string | null>(null);
  const [showEmbroidery, setShowEmbroidery] = useState(true); // State for bordado toggle
  const [imageLoading, setImageLoading] = useState(false); // State for image loading

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate price based on embroidery selection
    const hasBordado = product.variants?.bordado === true;
    const finalPrice = hasBordado && !showEmbroidery 
      ? Math.max(0, Number(product.price) - 15000) 
      : Number(product.price);

    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: finalPrice,
        quantity: 1,
        personalization: "",
        addPompon: false,
        addPersonalizedKeychain: false,
        addDecorativeBow: false,
        expressService: false,
        hasBordado: hasBordado && showEmbroidery,
        keychainPersonalization: "",
      },
      {
        onSuccess: () => {
          setError(null); // Limpiar error al éxito
          setIsAdded(true); // Mostrar "Agregado!"
          setTimeout(() => setIsAdded(false), 2000); // Temporizador restaurado
        },
        onError: (err: any) => {
          setError("No se pudo agregar al carrito. Intenta de nuevo.");
          console.error("Add to cart error:", err);
        },
      }
    );
  };

  // Check if product supports embroidery
  const hasBordado = product.variants?.bordado === true;
  
  // Memoize image source calculation to prevent flickering
  const imgSrc = useMemo(() => {
    let imageUrl = product.imageUrl;
    
    if (hasBordado) {
      if (showEmbroidery) {
        // Show embroidered version - use bordadoImageUrl if available, otherwise imageUrl
        imageUrl = product.variants?.bordadoImageUrl || product.imageUrl;
      } else {
        // Show non-embroidered version - use blankImageUrl if available, otherwise imageUrl
        imageUrl = product.variants?.blankImageUrl || product.imageUrl;
      }
    }
    
    const finalImageUrl = imageUrl?.startsWith("/") 
      ? imageUrl 
      : `/assets/${imageUrl}`;
      
    return finalImageUrl || "/assets/placeholder.jpg";
  }, [product, showEmbroidery, hasBordado]);

  return (
    <Link href={`/product/${product.id}`} className="group">
      <Card className="group-hover:shadow-xl transition-all duration-300 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl hover:border-gray-600 hover:shadow-[0_8px_25px_rgba(156,163,175,0.2)] md:bg-gradient-to-br md:from-slate-800/95 md:to-slate-900/95 md:border-2 md:border-[#C0C0C0]/30 md:hover:border-[#ebc005]/60 md:hover:shadow-[0_8px_25px_rgba(235,192,5,0.4)]">
        <CardContent className="p-6">
          <div className="relative mb-4">
            <div className="w-full h-64 bg-white product-image-bg rounded-xl p-4 border border-[#C0C0C0]/20">
              {imageLoading && (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                </div>
              )}
              <img
                src={imgSrc}
                alt={product.name}
                className={`w-full h-full object-contain rounded-lg transition-opacity duration-200 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                loading="lazy"
                onLoad={() => setImageLoading(false)}
                onLoadStart={() => setImageLoading(true)}
              />
            </div>
            
            {/* Bordado toggle buttons - only show if product supports embroidery */}
            {hasBordado && (
              <div className="absolute top-3 left-3 flex gap-3 z-20">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowEmbroidery(true);
                  }}
                  className={`w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center shadow-lg backdrop-blur-sm hover:scale-105 ${
                    showEmbroidery
                      ? "bg-gradient-to-br from-[#ebc005]/90 to-[#d4a804]/90 border-[#ebc005] scale-110 shadow-[#ebc005]/50"
                      : "bg-slate-700/80 border-[#C0C0C0]/60 hover:border-[#C0C0C0]"
                  }`}
                  title="Con bordado"
                >
                  <div
                    className={`w-5 h-5 rounded-full transition-all duration-300 ${
                      showEmbroidery 
                        ? "bg-white shadow-inner" 
                        : "bg-gradient-to-br from-[#ebc005] to-[#d4a804] opacity-70"
                    }`}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowEmbroidery(false);
                  }}
                  className={`w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center shadow-lg backdrop-blur-sm hover:scale-105 ${
                    !showEmbroidery
                      ? "bg-gradient-to-br from-[#ebc005]/90 to-[#d4a804]/90 border-[#ebc005] scale-110 shadow-[#ebc005]/50"
                      : "bg-slate-700/80 border-[#C0C0C0]/60 hover:border-[#C0C0C0]"
                  }`}
                  title="Sin bordado"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                      !showEmbroidery 
                        ? "border-white bg-transparent" 
                        : "border-[#C0C0C0] bg-transparent opacity-70"
                    }`}
                  />
                </button>
              </div>
            )}
            
            {/* Status indicator */}
            {hasBordado && (
              <div className="absolute bottom-3 left-3 bg-slate-800/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                {showEmbroidery ? "Con bordado" : "Sin bordado"}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-xl text-[#c9a920] mb-1" style={{textShadow: '0 0 10px rgba(201, 169, 32, 0.4)'}}>
                {product.name}
              </h4>
              <p className="text-[#C0C0C0] text-sm line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-amber-400">
                  {formatPrice(hasBordado && !showEmbroidery 
                    ? Math.max(0, Number(product.price) - 15000) 
                    : Number(product.price))}
                </span>
                {hasBordado && !showEmbroidery && (
                  <span className="text-xs text-green-400">
                    ¡Ahorro $15.000!
                  </span>
                )}
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.inStock}
                className={`px-6 py-2 font-semibold transition-all duration-300 border-2 ${
                  isAdded
                    ? "bg-green-600 hover:bg-green-700 text-white border-green-500"
                    : "bg-gradient-to-r from-[#ebc005] to-[#d4a804] text-[#000000] hover:from-[#d4a804] hover:to-[#b8950b] border-[#C0C0C0]/30 shadow-[0_4px_15px_rgba(235,192,5,0.3)]"
                }`}
                aria-label={isAdded ? "Producto agregado" : "Agregar al carrito"}
              >
                {error
                  ? "Error"
                  : isAdded
                  ? "Agregado!"
                  : isAddingToCart
                  ? "Agregando..."
                  : "Agregar"}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}