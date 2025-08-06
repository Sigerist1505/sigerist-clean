import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@shared/schema";

export function ProductPage() {
  const [match, params] = useRoute("/product/:id");
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [personalization, setPersonalization] = useState("");

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['/api/products', params?.id],
    enabled: !!params?.id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      personalization,
    });

    toast({
      title: "Producto agregado",
      description: `${product.name} ha sido agregado al carrito`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4" />
          <div className="h-4 bg-muted rounded w-48 mx-auto mb-2" />
          <div className="h-4 bg-muted rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Producto no encontrado</h2>
            <p className="text-muted-foreground">El producto que buscas no existe o ha sido eliminado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl p-6 shadow-lg">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-4" variant="secondary">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <Badge variant={product.inStock ? "default" : "destructive"}>
                  {product.inStock ? "En Stock" : "Agotado"}
                </Badge>
              </div>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Colores disponibles:</h3>
                  <div className="flex gap-2">
                    {product.colors.map((color, index) => (
                      <Badge key={index} variant="outline">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Personalization */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    ✨ Personalización
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nombre para bordar (opcional)
                      </label>
                      <input
                        type="text"
                        value={personalization}
                        onChange={(e) => setPersonalization(e.target.value)}
                        placeholder="Ej: María"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={15}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Máximo 15 caracteres
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-medium">Cantidad:</label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  size="lg"
                  className="w-full bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal font-semibold text-lg py-3"
                >
                  {product.inStock ? "Agregar al Carrito" : "Producto Agotado"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}