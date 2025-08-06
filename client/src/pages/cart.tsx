import { Link } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { formatPrice } from '@/lib/utils'
import { Trash2, Plus, Minus } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, formattedTotalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="pt-16 pb-16">
                <div className="text-6xl mb-6">🛒</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Tu carrito está vacío
                </h2>
                <p className="text-gray-600 mb-8">
                  Agrega algunos productos para comenzar tu compra
                </p>
                <Link href="/products">
                  <Button size="lg" className="bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal">
                    Explorar Productos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-sigerist-charcoal mb-8">
            Carrito de Compras
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white rounded-lg border flex items-center justify-center">
                        <span className="text-gray-400 text-xs">IMG</span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-sigerist-charcoal">
                          {item.name}
                        </h3>
                        {item.personalization && (
                          <p className="text-sm text-gray-600">
                            Personalización: {item.personalization}
                          </p>
                        )}
                        <p className="text-lg font-bold text-sigerist-charcoal mt-2">
                          {formatPrice(parseFloat(item.price))}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-2 border-x min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Clear Cart */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  Vaciar Carrito
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Productos ({totalItems})</span>
                    <span>{formattedTotalPrice}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Envío</span>
                    <span>{formatPrice(25000)}</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-sigerist-charcoal">
                        {formatPrice(
                          items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0) + 25000
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Link href="/checkout">
                      <Button 
                        size="lg" 
                        className="w-full bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal font-semibold"
                      >
                        Proceder al Pago
                      </Button>
                    </Link>
                    
                    <Link href="/products">
                      <Button variant="outline" size="lg" className="w-full">
                        Continuar Comprando
                      </Button>
                    </Link>
                  </div>

                  <div className="text-xs text-gray-500 pt-4">
                    <p>• Envío gratis en pedidos superiores a $200,000</p>
                    <p>• Tiempo de entrega: 3-5 días hábiles</p>
                    <p>• Pago seguro garantizado</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}