import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-sigerist-gold text-sigerist-charcoal text-lg px-6 py-2">
            Nuestra Historia
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-sigerist-charcoal mb-6">
            Sobre Sigerist
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Creamos bolsos de lujo únicos que combinan la tradición artesanal colombiana 
            con diseños modernos y personalizaciones que cuentan tu historia.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-sigerist-charcoal mb-6">
                    ¿Quiénes somos?
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      Sigerist nació de la pasión por crear accesorios únicos que reflejen 
                      la personalidad de cada mujer. Somos una empresa colombiana especializada 
                      en bolsos de lujo hechos a mano con los más altos estándares de calidad.
                    </p>
                    <p>
                      Cada bolso Sigerist es una obra de arte funcional, diseñada para 
                      acompañarte en tus momentos más importantes mientras expresas tu estilo único.
                    </p>
                    <p>
                      Nuestro compromiso va más allá de la moda: creamos piezas atemporales 
                      que duran toda la vida, utilizando materiales premium y técnicas 
                      artesanales tradicionales.
                    </p>
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-sigerist-gold/20 to-sigerist-charcoal/20 rounded-2xl flex items-center justify-center">
                  <span className="text-6xl">👜</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-sigerist-charcoal to-gray-800 text-white">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-sigerist-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-sigerist-charcoal">🎯</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
                <p className="leading-relaxed text-gray-200">
                  Crear bolsos de lujo personalizados que combinen la excelencia artesanal 
                  colombiana con diseños contemporáneos, ofreciendo a nuestras clientas 
                  piezas únicas que reflejen su personalidad y estilo de vida.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-sigerist-gold to-yellow-500 text-sigerist-charcoal">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Nuestra Visión</h3>
                <p className="leading-relaxed">
                  Ser la marca líder en Colombia de bolsos de lujo personalizados, 
                  reconocida por nuestra calidad excepcional, innovación en diseño 
                  y compromiso con la satisfacción de nuestras clientas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-sigerist-charcoal text-center mb-12">
            Nuestros Valores
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-sigerist-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-sigerist-charcoal">🏆</span>
                </div>
                <h3 className="text-xl font-bold text-sigerist-charcoal mb-4">Calidad</h3>
                <p className="text-gray-600">
                  Utilizamos solo los mejores materiales y técnicas artesanales 
                  para garantizar productos duraderos y elegantes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-sigerist-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-sigerist-charcoal">🎨</span>
                </div>
                <h3 className="text-xl font-bold text-sigerist-charcoal mb-4">Creatividad</h3>
                <p className="text-gray-600">
                  Cada diseño es único y personalizable, permitiendo que expreses 
                  tu individualidad a través de nuestros productos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-sigerist-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-sigerist-charcoal">💝</span>
                </div>
                <h3 className="text-xl font-bold text-sigerist-charcoal mb-4">Pasión</h3>
                <p className="text-gray-600">
                  Amamos lo que hacemos y esa pasión se refleja en cada detalle 
                  de nuestros bolsos y en el servicio que brindamos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Process */}
        <Card className="mb-16">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sigerist-charcoal text-center mb-12">
              Nuestro Proceso
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-sigerist-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-sigerist-charcoal font-bold">1</span>
                </div>
                <h3 className="font-bold text-sigerist-charcoal mb-2">Diseño</h3>
                <p className="text-sm text-gray-600">
                  Creamos diseños únicos basados en tendencias y necesidades específicas
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-sigerist-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-sigerist-charcoal font-bold">2</span>
                </div>
                <h3 className="font-bold text-sigerist-charcoal mb-2">Personalización</h3>
                <p className="text-sm text-gray-600">
                  Agregamos bordados y detalles personalizados según tus preferencias
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-sigerist-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-sigerist-charcoal font-bold">3</span>
                </div>
                <h3 className="font-bold text-sigerist-charcoal mb-2">Confección</h3>
                <p className="text-sm text-gray-600">
                  Nuestros artesanos expertos crean cada bolso a mano con precisión
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-sigerist-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-sigerist-charcoal font-bold">4</span>
                </div>
                <h3 className="font-bold text-sigerist-charcoal mb-2">Entrega</h3>
                <p className="text-sm text-gray-600">
                  Empacamos cuidadosamente y entregamos tu bolso único directamente a ti
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-sigerist-charcoal to-gray-800 text-white text-center">
          <CardContent className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">
              ¿Lista para tu bolso personalizado?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Descubre nuestra colección y crea el bolso perfecto que refleje tu estilo único
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-sigerist-gold hover:bg-yellow-600 text-sigerist-charcoal font-bold px-8 py-3 rounded-lg transition-colors"
                onClick={() => window.location.href = '/products'}
              >
                Ver Productos
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg transition-colors"
                onClick={() => window.open('https://wa.me/573001234567?text=Hola, me gustaría conocer más sobre Sigerist', '_blank')}
              >
                📱 Contactar por WhatsApp
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}