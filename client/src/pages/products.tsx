import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context'
import { useToast } from '@/hooks/use-toast'
import { formatPrice } from '@/lib/utils'
import { Link } from 'wouter'
import type { Product } from '@shared/schema'

export default function ProductsPage() {
  const { addItem } = useCart()
  const { toast } = useToast()

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  })

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    })

    toast({
      title: "Producto agregado",
      description: `${product.name} ha sido agregado al carrito`,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-sigerist-charcoal mb-8">Productos</h1>
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error cargando productos</h2>
            <p className="text-muted-foreground">No pudimos cargar los productos. Intenta de nuevo más tarde.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-sigerist-charcoal mb-4">
            Nuestra Colección
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubre nuestra línea completa de bolsos de lujo hechos a mano con la mejor calidad y diseños únicos
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products?.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative aspect-square bg-white rounded-t-lg overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-sigerist-gold text-sigerist-charcoal">
                    {product.category}
                  </Badge>
                  {product.inStock && (
                    <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                      En Stock
                    </Badge>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-sigerist-charcoal mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Colores disponibles:</p>
                      <div className="flex gap-2">
                        {product.colors.map((color, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-sigerist-charcoal">
                      {formatPrice(product.price)}
                    </span>
                    <div className="flex gap-2">
                      <Link href={`/product/${product.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        size="sm"
                        className="bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal"
                      >
                        {product.inStock ? 'Agregar' : 'Agotado'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {products && products.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-500">
              Vuelve pronto para ver nuestras nuevas colecciones
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-sigerist-charcoal mb-4">
            ¿Necesitas algo personalizado?
          </h2>
          <p className="text-gray-600 mb-6">
            Contáctanos para crear un diseño único especialmente para ti
          </p>
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.open('https://wa.me/573001234567?text=Hola, necesito un diseño personalizado', '_blank')}
          >
            📱 Contactar por WhatsApp
          </Button>
        </div>
      </div>
    </div>
  )
}