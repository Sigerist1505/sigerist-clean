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
        name: product.name, // Añadido
        price: Number(product.price), // Añadido
        // personalization: product.personalization, // Eliminado por el error de TypeScript
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
      <Card className="group-hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-black to-gray-900 border-2 border-[#C0C0C0]/50 hover:border-[#ebc005] rounded-2xl">
        <CardContent className="p-6">
          <div className="relative mb-4">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-64 object-contain rounded-xl bg-white"
              loading="lazy"
            />
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-xl text-[#ebc005] mb-1">
                {product.name}
              </h4>
              <p className="text-[#C0C0C0] text-sm line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-[#c9a920]">
                {formatPrice(Number(product.price))}
              </span>
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.inStock}
                className={`px-6 py-2 font-semibold transition-colors ${
                  isAdded
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gradient-to-r from-[#ebc005] to-[#d4a804] text-[#000000] hover:from-[#d4a804] hover:to-[#b8950b]"
                }`}
                aria-label={isAdded ? "Producto agregado" : "Agregar al carrito"}
              >
                {error ? "Error" : isAdded ? "Agregado!" : isAddingToCart ? "Agregando..." : "Agregar"}
              </Button>
            </div>
            {error && <p className="text-[#ebc005] text-sm mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}