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
  const { addToCart, isAddingToCart } = useCart(); // Usamos isAddingToCart de useMutation
  const [isAdded, setIsAdded] = useState(false); // Restauramos el estado para "Agregado!"
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        personalization: "",
        addPompon: false,
        addPersonalizedKeychain: false,
        addDecorativeBow: false,
        expressService: false,
        hasBordado: false,
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

  const imgSrc = product.imageUrl
    ? product.imageUrl.startsWith("/")
      ? product.imageUrl
      : `/assets/${product.imageUrl}`
    : "/assets/placeholder.jpg";

  return (
    <Link href={`/product/${product.id}`} className="group">
      <Card className="group-hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-gray-900/95 to-black/95 border-2 border-[#C0C0C0]/30 hover:border-[#ebc005]/60 rounded-2xl hover:shadow-[0_8px_25px_rgba(235,192,5,0.4)]">
        <CardContent className="p-6">
          <div className="relative mb-4">
            <div className="w-full h-64 bg-white rounded-xl p-4 border border-[#C0C0C0]/20">
              <img
                src={imgSrc}
                alt={product.name}
                className="w-full h-full object-contain rounded-lg"
                loading="lazy"
              />
            </div>
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
              <span className="text-2xl font-bold text-amber-400">
                {formatPrice(Number(product.price))}
              </span>
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