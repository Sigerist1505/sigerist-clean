import { useState } from "react";
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
  const { addToCart, isAddingToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Evita que el clic active el Link

    addToCart(
      {
        productId: product.id,
        quantity: 1,
        
      },
      {
        onSuccess: () => {
          setIsAdded(true);
          setError(null);
          setTimeout(() => setIsAdded(false), 2000); // Feedback de 2 segundos
        },
        onError: (error: any) => {
          setError("No se pudo agregar al carrito. Intenta de nuevo.");
          console.error("Add to cart error:", error);
        },
      }
    );
  };

  // Ajuste de la imagen para compatibilidad
  const imgSrc = product.imageUrl
    ? product.imageUrl.startsWith("/")
      ? product.imageUrl
      : `/assets/${product.imageUrl}`
    : "/assets/placeholder.jpg"; // Fallback si no hay imagen

  return (
    <Link href={`/product/${product.id}`} className="group">
      <Card className="group-hover:shadow-xl transition-all duration-300 bg-gray-50 rounded-2xl border border-gray-200">
        <CardContent className="p-6">
          <div className="relative mb-4">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-64 object-cover rounded-xl"
              loading="lazy"
            />
            <Badge className="absolute top-2 left-2 bg-sigerist-gold text-sigerist-charcoal">
              Personalizable
            </Badge>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-xl text-sigerist-charcoal mb-1">
                {product.name}
              </h4>
              <p className="text-gray-600 text-sm line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-sigerist-charcoal">
                {formatPrice(Number(product.price))}
              </span>
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.inStock}
                className={`px-6 py-2 font-semibold transition-colors ${
                  isAdded
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal"
                }`}
                aria-label={isAdded ? "Producto agregado" : "Agregar al carrito"}
              >
                {error ? "Error" : isAdded ? "Agregado!" : isAddingToCart ? "Agregando..." : "Agregar"}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}