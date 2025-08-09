import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { InstagramButton } from "@/components/instagram-button";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/utils";
import { 
  Clock, 
  Award, 
  Heart, 
  Palette, 
  PenTool, 
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Instagram
} from "lucide-react";
import type { Product } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Usando rutas directas sin imports problemáticos
const MaletaMilan_ConBordado = "/attached_assets/MaletaMilan_ConBordado.jpg";
const Maleta_viajera_Bordada = "/attached_assets/Maleta viajera_Bordada.jpg";

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  const { itemCount } = useCart();
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const { toast } = useToast();

  const featuredProducts = products || [];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest("POST", "/api/contact", contactForm);
      
      // Create WhatsApp message
      const whatsappMessage = `Hola! Me interesa contactar con Sigerist Luxury Bags.\n\nNombre: ${contactForm.firstName} ${contactForm.lastName}\nEmail: ${contactForm.email}\nTeléfono: ${contactForm.phone}\nMensaje: ${contactForm.message}`;
      
      // Open WhatsApp
      const whatsappUrl = `https://wa.me/573160183418?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
      
      // Reset form
      setContactForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
      
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje se ha enviado correctamente",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Video Section */}
      <section id="video-kit" className="pt-16 relative h-screen overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/attached_assets/Video Kit_1754097764163.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay simple para no tapar el video */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 animate-fade-in-up" style={{ fontFamily: 'Playfair Display, serif' }}>
            ✨ Kit Completo de Lujo ✨
          </h1>
          <p className="text-2xl md:text-3xl opacity-90">
            7 Piezas Personalizadas de Alta Calidad
          </p>
        </div>
      </section>
      
      {/* Kit Information Section - Separada del video */}
      <section id="kit-info" className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h2 className="text-4xl font-bold mb-6 text-gray-300" style={{ fontFamily: 'Playfair Display, serif' }}>
              Kit Completo de Lujo - 7 Piezas
            </h2>
            <p className="text-xl text-gray-400">
              La colección más completa para mamás elegantes y organizadas
            </p>
          </div>
          
          {/* Información del Kit */}
          <div className="bg-gradient-to-br from-black/80 to-gray-900/80 rounded-3xl p-8 border border-gray-600/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-8 text-center text-gray-300" style={{ fontFamily: 'Playfair Display, serif' }}>
              Incluye:
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-white mb-8">
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Organizador de higiene:</span>
                <span className="font-bold text-xl">$145.000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Mochila Milán:</span>
                <span className="font-bold text-xl">$450.000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Maletín de viaje / clínica:</span>
                <span className="font-bold text-xl">$565.000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Portadocumentos:</span>
                <span className="font-bold text-xl">$190.000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Portachupetas:</span>
                <span className="font-bold text-xl">$80.000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Organizador de mudas:</span>
                <span className="font-bold text-xl">$60.000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg md:col-span-2">
                <span className="text-lg">• Cambiador:</span>
                <span className="font-bold text-xl">$105.000</span>
              </div>
            </div>
            
            {/* Cálculo de precios */}
            <div className="border-t border-gray-500 pt-8">
              <div className="bg-black/60 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center text-xl">
                  <span>💰 Valor total sin descuento:</span>
                  <span className="font-bold line-through text-gray-400">$1.595.000</span>
                </div>
                <div className="flex justify-between items-center text-xl">
                  <span>🔖 Descuento especial del 10%:</span>
                  <span className="font-bold text-green-400">-$159.500</span>
                </div>
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center text-3xl font-bold">
                    <span>💖 Precio final con descuento:</span>
                    <span className="text-gray-300">$1.435.500</span>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <p className="text-xl text-green-300 font-semibold bg-green-900/30 p-4 rounded-lg">
                    ¡Además llevas 1 accesorio totalmente GRATIS para combinar con tus bolsos!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold text-lg px-10 py-4 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg"
                onClick={() => window.open('https://wa.me/573160183418?text=¡Hola! Me interesa comprar el Kit Completo de Lujo (7 piezas) por $1.435.500 con descuento del 10% y accesorio gratis. ¿Pueden ayudarme con el proceso de compra?', '_blank')}
              >
                ¡Comprar Kit Completo!
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-300 text-gray-300 hover:bg-gray-800/20 font-bold text-lg px-10 py-4 rounded-full transform hover:scale-105 transition-all duration-300"
                onClick={() => scrollToSection('productos')}
              >
                Ver Productos Individuales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="productos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Nuestra Colección
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre nuestra línea completa de bolsos de lujo hechos a mano con la mejor calidad y diseños únicos
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white">
                Ver Toda la Colección
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Sigerist?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Cada bolso es una obra de arte única, diseñada especialmente para ti
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Bordados Personalizados
                </h3>
                <p className="text-gray-600">
                  Agrega nombres, diseños únicos y toques personales a cada bolso
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Calidad Premium
                </h3>
                <p className="text-gray-600">
                  Materiales de la más alta calidad, hechos para durar toda la vida
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
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

      {/* Sample Products with Images */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-gray-600 text-lg">
              Descubre nuestros diseños más populares
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Maleta Milano */}
            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-square bg-white rounded-t-lg overflow-hidden">
                  <img 
                    src={MaletaMilan_ConBordado} 
                    alt="Maleta Milano con Bordado" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Maleta Milano
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Elegante maleta para viajes con bordado personalizado
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      <span className="text-lg text-gray-600">Desde </span>
                      {formatPrice(450000)}
                    </div>
                    <div className="text-sm text-gray-500">
                      + $15,000 bordado
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maleta Viajera */}
            <Card className="group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-square bg-white rounded-t-lg overflow-hidden">
                  <img 
                    src={Maleta_viajera_Bordada} 
                    alt="Maleta Viajera Bordada" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Maleta Viajera
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Perfecta para viajes largos con compartimentos organizados
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      <span className="text-lg text-gray-600">Desde </span>
                      {formatPrice(565000)}
                    </div>
                    <div className="text-sm text-gray-500">
                      + $15,000 bordado
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                Ver Toda la Colección
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
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
            onClick={() => window.open('https://wa.me/573160183418?text=Hola, me interesa un bolso personalizado', '_blank')}
          >
            📱 Chatear por WhatsApp
          </Button>
        </div>
      </section>
    </div>
  )
}