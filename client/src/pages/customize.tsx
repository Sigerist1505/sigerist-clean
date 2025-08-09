import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ProductCustomizer } from "@/components/product-customizer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

export default function CustomizePage() {
  const [match, params] = useRoute("/customize/:id");
  const productId = params?.id ? parseInt(params.id) : null;

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  if (!match || !productId) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-accent mb-4">
              Producto No Encontrado
            </h1>
            <p className="text-gray-300 mb-8">
              El producto que intentas personalizar no existe.
            </p>
            <Link href="/">
              <Button className="bg-accent hover:bg-accent/90 text-black">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
              <p className="text-gray-300">Cargando producto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">
              Error al Cargar
            </h1>
            <p className="text-gray-300 mb-8">
              No se pudo cargar la información del producto.
            </p>
            <Link href="/">
              <Button className="bg-accent hover:bg-accent/90 text-black">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/product/${product.id}`}>
            <Button variant="ghost" className="text-accent hover:text-accent/80 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Producto
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-accent mb-4">
              Personaliza tu {product.name}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Crea un diseño único con bordados artesanales personalizados. 
              Ve la vista previa en tiempo real de tu bolso personalizado.
            </p>
          </div>
        </div>

        {/* Customizer */}
        <ProductCustomizer product={product} />

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="bg-black border border-accent/30">
            <CardContent className="p-6 text-center">
              <div className="text-accent text-2xl font-bold mb-2">48h</div>
              <div className="text-white font-medium mb-2">Tiempo de Bordado</div>
              <div className="text-gray-400 text-sm">
                Cada diseño es bordado a mano por artesanos expertos
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black border border-accent/30">
            <CardContent className="p-6 text-center">
              <div className="text-accent text-2xl font-bold mb-2">100%</div>
              <div className="text-white font-medium mb-2">Artesanal</div>
              <div className="text-gray-400 text-sm">
                Materiales de lujo y técnicas tradicionales
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black border border-accent/30">
            <CardContent className="p-6 text-center">
              <div className="text-accent text-2xl font-bold mb-2">24h</div>
              <div className="text-white font-medium mb-2">Entrega</div>
              <div className="text-gray-400 text-sm">
                Envío rápido una vez completado el bordado
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Steps */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-accent text-center mb-8">
            Proceso de Personalización
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-white font-medium mb-2">Diseña</h3>
              <p className="text-gray-400 text-sm">
                Personaliza tu bolso con nombre, tema y colores
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-white font-medium mb-2">Confirma</h3>
              <p className="text-gray-400 text-sm">
                Revisa tu diseño y agrega al carrito
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-white font-medium mb-2">Bordado</h3>
              <p className="text-gray-400 text-sm">
                Nuestros artesanos bordan tu diseño a mano
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-white font-medium mb-2">Entrega</h3>
              <p className="text-gray-400 text-sm">
                Recibe tu bolso único y personalizado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}