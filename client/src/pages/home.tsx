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

import MaletaMilan_ConBordado from "@assets/MaletaMilan_ConBordado.jpg";

import Maleta_viajera_Bordada from "@assets/Maleta viajera_Bordada.jpg";

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
      {/* Hero Section */}
      <section id="inicio" className="pt-16 bg-black min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                {/* Logo del elefante */}
                <div className="mb-8">
                  <img 
                    src="/images/logo.png" 
                    alt="Sigerist Luxury Bags Logo - Bolsos personalizados artesanales Colombia Medellín" 
                    className="h-20 w-auto mx-auto lg:mx-0"
                  />
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-center lg:text-left">
                  <span className="tracking-wider text-[#c9a920]" style={{textShadow: '0 0 20px rgba(201, 169, 32, 0.6), 0 0 40px rgba(201, 169, 32, 0.3)'}}>SIGERIST</span><br/>
                  <span className="text-3xl lg:text-4xl italic font-light text-[#ffffff] bg-[#000000] ml-[71px] mr-[71px] mt-[28px] mb-[28px]">Luxury Bags</span>
                </h1>
                <div className="w-24 h-2 mx-auto lg:mx-0 mt-6 bg-[#C0C0C0]" style={{boxShadow: '0 0 15px rgba(192, 192, 192, 0.8), 0 0 25px rgba(192, 192, 192, 0.5)'}}></div>
                <p className="text-xl text-gray-300 mt-6 leading-relaxed">
                  Cada bolso es una obra de arte única, diseñada especialmente para crear momentos inolvidables con detalles artesanales excepcionales.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => scrollToSection('productos')}
                >
                  Ver Catálogo
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105"
                  onClick={() => scrollToSection('contacto')}
                >
                  Contactar
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-12 pt-8 bg-gradient-to-r from-transparent via-accent/10 to-transparent py-6 rounded-xl">
                <div className="text-center">
                  <div className="text-4xl font-black text-accent">500+</div>
                  <div className="text-sm text-muted-foreground font-semibold">Mamás Felices</div>
                </div>
                <div className="w-px h-12 bg-border opacity-50"></div>
                <div className="text-center">
                  <div className="text-4xl font-black text-accent">100%</div>
                  <div className="text-sm text-muted-foreground font-semibold">Artesanal</div>
                </div>
                <div className="w-px h-12 bg-border opacity-50"></div>
                <div className="text-center">
                  <div className="text-4xl font-black text-accent">48h</div>
                  <div className="text-sm text-muted-foreground font-semibold">Entrega</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="/attached_assets/image_1754118036043.png" 
                alt="Sigerist Luxury Bags - Colección Premium" 
                className="rounded-2xl shadow-2xl w-full hover-scale bg-white p-4"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Featured Products */}
      <section id="productos" className="py-20 bg-black border-t-4 border-gray-400/40 shadow-[inset_0_4px_20px_rgba(128,128,128,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-gray-700/20 to-[#C0C0C0]/20 px-6 py-2 rounded-full mb-4 border border-[#C0C0C0]/30">
              <span className="text-[#C0C0C0] font-bold text-sm uppercase tracking-widest">🔥 EDICIÓN LIMITADA</span>
            </div>
            <h2 className="text-5xl font-black text-[#c9a920] mb-6 tracking-wide" style={{textShadow: '0 0 20px rgba(201, 169, 32, 0.6), 0 0 40px rgba(201, 169, 32, 0.3)'}}>
              NUESTRAS COLECCIONES
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Dos líneas exclusivas: productos bordados personalizados y nuestra colección clásica
            </p>
          </div>

          {/* Línea Bordada */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-block bg-gradient-to-r from-gray-700 to-[#C0C0C0] p-1 rounded-2xl mb-4">
                <div className="bg-black px-8 py-4 rounded-xl">
                  <h3 className="text-3xl font-black text-[#C0C0C0] tracking-wide" style={{textShadow: '0 0 15px rgba(192, 192, 192, 0.8)'}}>
                    ✨ LÍNEA BORDADA
                  </h3>
                  <p className="text-[#C0C0C0] mt-2">Personalización completa con nombres y diseños únicos</p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-2xl p-6 animate-pulse">
                    <div className="bg-gray-700 h-48 rounded-xl mb-4"></div>
                    <div className="bg-gray-700 h-4 rounded mb-2"></div>
                    <div className="bg-gray-700 h-4 rounded w-2/3"></div>
                  </div>
                ))
              ) : (
                featuredProducts
                  .filter(product => product.category.includes('Bordado') || product.category.includes('Bordada'))
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
              )}
            </div>
          </div>

          {/* Línea Sin Bordar */}
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-2xl p-6 animate-pulse">
                    <div className="bg-gray-700 h-48 rounded-xl mb-4"></div>
                    <div className="bg-gray-700 h-4 rounded mb-2"></div>
                    <div className="bg-gray-700 h-4 rounded w-2/3"></div>
                  </div>
                ))
              ) : (
                featuredProducts
                  .filter(product => !product.category.includes('Bordado') && !product.category.includes('Bordada'))
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
              )}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary text-[#ffffff] hover:bg-primary hover:text-primary-foreground hover-scale bg-[#ebc005]"
              >
                Ver Toda la Colección
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Personalization Section */}
      <section id="personalizacion" className="py-20 bg-black border-t-4 border-gray-400/40 shadow-[inset_0_4px_20px_rgba(128,128,128,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-6 text-[#c9a920]">
                  Personalización <span className="text-[#c9a920]">Exclusiva</span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Cada bolso es único, con bordados artesanales que incluyen el nombre de tu pequeño y diseños temáticos especiales que crean recuerdos inolvidables.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-accent text-accent-foreground rounded-full p-3 flex-shrink-0">
                    <PenTool className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-[#C0C0C0]">Bordado Artesanal</h3>
                    <p className="text-gray-300">
                      Cada nombre y diseño es bordado a mano con hilos de alta calidad y técnicas tradicionales.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-accent text-accent-foreground rounded-full p-3 flex-shrink-0">
                    <Palette className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-[#C0C0C0]">Diseños Temáticos</h3>
                    <p className="text-gray-300">
                      Amplia variedad de animales y temas para crear el bolso perfecto para cada personalidad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-accent text-accent-foreground rounded-full p-3 flex-shrink-0">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-[#C0C0C0]">Calidad Premium</h3>
                    <p className="text-gray-300">
                      Materiales de lujo seleccionados cuidadosamente para garantizar durabilidad y elegancia.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                size="lg"
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-[0_8px_25px_rgba(128,128,128,0.4)] border-2 border-[#C0C0C0]/30 uppercase tracking-wider"
                onClick={() => window.open('https://wa.me/573160183418?text=Hola! Me interesa diseñar un bolso personalizado', '_blank')}
              >
                🎁 DISEÑAR MI BOLSO
              </Button>
            </div>

            <div className="relative">
              <img 
                src={MaletaMilan_ConBordado} 
                alt="Bolso personalizado Sigerist - Bordado artesanal de lujo con fondo blanco" 
                className="rounded-2xl shadow-2xl w-full hover-scale"
              />
              <div className="absolute -top-6 -right-6 bg-[#C0C0C0] text-black p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold">48h</div>
                <div className="text-sm">Tiempo de bordado</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="py-20 bg-black border-t-4 border-[#C0C0C0]/40 shadow-[inset_0_4px_20px_rgba(192,192,192,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-gray-700/20 to-[#C0C0C0]/20 px-6 py-2 rounded-full mb-4 border border-[#C0C0C0]/30">
              <span className="text-[#C0C0C0] font-bold text-sm uppercase tracking-widest">⭐ 5.0 ESTRELLAS</span>
            </div>
            <h2 className="text-5xl font-black text-[#c9a920] mb-6 tracking-wide" style={{textShadow: '0 0 20px rgba(201, 169, 32, 0.6), 0 0 40px rgba(201, 169, 32, 0.3)'}}>
              +500 MAMÁS NOS RECOMIENDAN
            </h2>
            <div className="w-32 h-2 mx-auto mb-6 bg-[#C0C0C0]" style={{boxShadow: '0 0 15px rgba(192, 192, 192, 0.8), 0 0 25px rgba(192, 192, 192, 0.5)'}}></div>
            <p className="text-2xl text-[#C0C0C0] max-w-3xl mx-auto font-medium mb-4">
              "El mejor regalo que le he dado a mi hija" - María González
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Testimonios verificados de madres colombianas que eligieron Sigerist
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "María González",
                location: "Medellín, Colombia",
                text: "El bolso personalizado quedó absolutamente hermoso. La calidad del bordado y los materiales superaron nuestras expectativas. Mi hijo está encantado con su diseño personalizado.",
                product: "/attached_assets/image_1754098325226.png"
              },
              {
                name: "Carlos Ramírez",
                location: "Bogotá, Colombia", 
                text: "Excelente servicio al cliente y entrega rápida. La lonchera de Abigail con la princesa bordada es una obra de arte. Definitivamente volveremos a comprar.",
                product: "/attached_assets/IMG-20250531-WA0010.jpg"
              },
              {
                name: "Ana Vargas",
                location: "Cali, Colombia",
                text: "La atención al detalle es impresionante. Cada puntada del bordado está perfecta y los colores son vibrantes. Un regalo perfecto para cualquier ocasión.",
                product: "/attached_assets/IMG-20250531-WA0005.jpg"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-black border-2 border-[#C0C0C0]/50 hover:border-[#C0C0C0] shadow-2xl hover:shadow-[0_0_25px_rgba(192,192,192,0.25)] transition-all duration-500 hover-lift">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="flex text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.product} 
                      alt={`Producto Sigerist comprado por ${testimonial.name}`} 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="ml-4">
                      <div className="font-semibold text-accent">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-[#ebc005] to-[#d4a804] rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                  <span className="text-black font-black text-xl tracking-wider">S</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-black text-[#ebc005] tracking-wider" style={{textShadow: '0 0 10px rgba(235, 192, 5, 0.3)'}}>Sigerist</h3>
                  <p className="text-sm text-[#C0C0C0] font-light italic tracking-widest">LUXURY BAGS</p>
                </div>
              </div>
              <p className="text-[#C0C0C0] font-light leading-relaxed text-base tracking-wide">
                Creamos bolsos de lujo personalizados que capturan momentos especiales y crean recuerdos duraderos.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6 text-[#ebc005] tracking-wider uppercase" style={{textShadow: '0 0 8px rgba(235, 192, 5, 0.3)'}}>Productos</h4>
              <ul className="space-y-3 text-[#C0C0C0]">
                <li><Link href="/products" className="hover:text-[#ebc005] transition-colors font-light tracking-wide">Mochilas Personalizadas</Link></li>
                <li><Link href="/products" className="hover:text-[#ebc005] transition-colors font-light tracking-wide">Bolsos de Mano</Link></li>
                <li><Link href="/products" className="hover:text-[#ebc005] transition-colors font-light tracking-wide">Accesorios</Link></li>
                <li><Link href="/products" className="hover:text-[#ebc005] transition-colors font-light tracking-wide">Regalos Especiales</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6 text-[#C0C0C0] tracking-wider uppercase" style={{textShadow: '0 0 8px rgba(192, 192, 192, 0.3)'}}>Servicios</h4>
              <ul className="space-y-3 text-[#C0C0C0]">
                <li><button onClick={() => scrollToSection('personalizacion')} className="hover:text-amber-400 transition-colors font-light tracking-wide">Personalización</button></li>
                <li><span className="hover:text-amber-400 transition-colors font-light tracking-wide">Envío Nacional</span></li>
                <li><span className="hover:text-amber-400 transition-colors font-light tracking-wide">Garantía de Calidad</span></li>
                <li><span className="hover:text-amber-400 transition-colors font-light tracking-wide">Soporte 24/7</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6 text-[#C0C0C0] tracking-wider uppercase" style={{textShadow: '0 0 8px rgba(192, 192, 192, 0.3)'}}>Contacto</h4>
              <ul className="space-y-3 text-[#C0C0C0] font-light tracking-wide">
                <li>Medellín, Colombia</li>
                <li>+57 300 123 4567</li>
                <li>info@sigeristluxurybags.com</li>
              </ul>
              <div className="flex space-x-4 mt-6">
                <a 
                  href="https://www.instagram.com/sigeristluxurybags/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#C0C0C0] hover:text-amber-400 transition-colors p-2"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://wa.me/573160183418" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:text-[#20BA5A] transition-colors p-2"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-[#C0C0C0]/30 mt-12 pt-8 text-center">
            <p className="text-[#C0C0C0] font-light tracking-widest">&copy; 2024 Sigerist Luxury Bags. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
      <InstagramButton />
    </div>
  );
}
