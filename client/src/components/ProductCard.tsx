import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import { Link } from 'wouter';
import type { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isAddingToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({ productId: product.id, quantity: 1 });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Asegura que la imagen funcione tanto si viene con "/assets/..." como si es solo el nombre
  const imgSrc = product.imageUrl?.startsWith('/')
    ? product.imageUrl
    : `/assets/${product.imageUrl || ''}`;

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="
        relative rounded-2xl border-2 border-gray-600/30 
        bg-gradient-to-br from-gray-900/95 to-black/95 
        shadow-2xl hover:border-[#ECC000]/60 
        hover:shadow-[0_0_25px_rgba(236,192,0,.25)]
        transition-all duration-500 hover:scale-[1.02]
        overflow-hidden backdrop-blur-sm
        text-card-foreground
      ">
        {/* Estado (stock) */}
        <span
          className={`absolute right-3 top-3 text-xs px-3 py-1 rounded-full
            ${product.inStock ? 'bg-green-600/80 text-white' : 'bg-gray-500/60 text-gray-200'}
          `}
        >
          {product.inStock ? 'En Stock' : 'Agotado'}
        </span>

        <CardContent className="p-6">
          {/* Imagen */}
          <div className="relative mb-4">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-64 object-cover rounded-xl bg-white/5"
              loading="lazy"
            />
            {/* Si tu catálogo indica si es personalizable, muéstralo; si no, quítalo */}
            <Badge className="absolute top-2 left-2 bg-sigerist-gold text-sigerist-charcoal">
              Personalizable
            </Badge>
          </div>

          {/* Texto */}
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-xl text-[#EDEDED] mb-1">
                {product.name}
              </h4>
              <p className="text-gray-300/80 text-sm line-clamp-2">
                {product.description}
              </p>
            </div>

            {/* Precio + botón */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-[#EDEDED]">
                {formatPrice(Number(product.price))}
              </span>
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.inStock}
                className={`px-6 py-2 font-semibold transition-colors ${
                  isAdded
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal'
                }`}
              >
                {isAdded ? 'Agregado!' : isAddingToCart ? 'Agregando...' : 'Agregar'}
              </Button>
            </div>

            {/* Chips opcionales */}
            {(product.animalType || product.category) && (
              <div className="flex items-center gap-2">
                {product.animalType && (
                  <Badge variant="secondary" className="text-xs">
                    {product.animalType}
                  </Badge>
                )}
                {product.category && (
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
