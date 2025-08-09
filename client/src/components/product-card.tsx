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
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      name: product.name,
      quantity: 1,
      price: product.price,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300">
        <CardContent className="bg-gray-50 rounded-2xl p-6 m-6">
          <div className="relative mb-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-64 object-cover rounded-xl"
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
                {formatPrice(product.price)}
              </span>
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`px-6 py-2 font-semibold transition-colors ${
                  isAdded
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal'
                }`}
              >
                {isAdded ? 'Agregado!' : 'Agregar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}