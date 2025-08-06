import { Link } from 'wouter'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sigerist-charcoal to-black text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-sigerist-gold text-sigerist-charcoal text-lg px-6 py-2">
              Lujo Personalizado
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-sigerist-silver bg-clip-text text-transparent">
              Sigerist Luxury Bags
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
              Bolsos de lujo hechos a mano con bordados personalizados que cuentan tu historia única
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal font-bold text-lg px-8 py-3">
                  Explorar Colección
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-sigerist-gold text-sigerist-gold hover:bg-sigerist-gold hover:text-sigerist-charcoal">
                Personalizar Bolso
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-sigerist-charcoal mb-4">
              ¿Por qué elegir Sigerist?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Cada bolso es una obra de arte única, diseñada especialmente para ti
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-sigerist-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-bold text-sigerist-charcoal mb-4">
                  Bordados Personalizados
                </h3>
                <p className="text-gray-600">
                  Agrega nombres, diseños únicos y toques personales a cada bolso
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-sigerist-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-bold text-sigerist-charcoal mb-4">
                  Calidad Premium
                </h3>
                <p className="text-gray-600">
                  Materiales de la más alta calidad, hechos para durar toda la vida
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-sigerist-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="text-xl font-bold text-sigerist-charcoal mb-4">
                  Envío Seguro
                </h3>
                <p className="text-gray-600">
                  Entrega rápida y segura en toda Colombia con seguimiento
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-sigerist-charcoal mb-4">
              Productos Destacados
            </h2>
            <p className="text-gray-600 text-lg">
              Descubre nuestra colección más popular
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-square bg-white rounded-t-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">Imagen del Producto</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-sigerist-charcoal mb-2">
                    Mochila Clásica
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Elegante y funcional para el día a día
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-sigerist-charcoal">
                      {formatPrice(75000)}
                    </span>
                    <Button className="bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-square bg-white rounded-t-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">Imagen del Producto</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-sigerist-charcoal mb-2">
                    Maleta Milano
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Perfecta para viajes con estilo
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-sigerist-charcoal">
                      {formatPrice(120000)}
                    </span>
                    <Button className="bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-square bg-white rounded-t-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">Imagen del Producto</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-sigerist-charcoal mb-2">
                    Pañalera Multifuncional
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Espaciosa y práctica para mamás
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-sigerist-charcoal">
                      {formatPrice(95000)}
                    </span>
                    <Button className="bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/products">
              <Button size="lg" className="bg-sigerist-charcoal hover:bg-gray-800 text-white">
                Ver Toda la Colección
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sigerist-charcoal text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            ¿Listo para tu bolso personalizado?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contáctanos por WhatsApp y nuestro equipo te ayudará a crear el bolso perfecto para ti
          </p>
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3"
            onClick={() => window.open('https://wa.me/573001234567?text=Hola, me interesa un bolso personalizado', '_blank')}
          >
            📱 Chatear por WhatsApp
          </Button>
        </div>
      </section>
    </div>
  )
}