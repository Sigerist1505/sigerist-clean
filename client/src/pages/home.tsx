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
import { InlineInstagramButton } from "@/components/inline-instagram-button";
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
  Instagram,
} from "lucide-react";
import type { Product } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const Home = () => {
  const { data: products, isLoading, isError, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: 1,
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

      const whatsappMessage = `Hola! Me interesa contactar con Sigerist Luxury Bags.\n\nNombre: ${contactForm.firstName} ${contactForm.lastName}\nEmail: ${contactForm.email}\nTeléfono: ${contactForm.phone}\nMensaje: ${contactForm.message}`;

      const whatsappUrl = `https://wa.me/573160183418?text=${encodeURIComponent(
        whatsappMessage
      )}`;
      window.open(whatsappUrl, "_blank");

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
        duration: 3000,
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
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Video Section */}
      <section
        id="video-kit"
        className="pt-16 relative h-screen overflow-hidden"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/Video Kit.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1
            className="text-6xl md:text-8xl font-bold mb-4 animate-fade-in-up"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            ✨ Kit Completo de Lujo ✨
          </h1>
          <p className="text-2xl md:text-3xl opacity-90">
            7 Piezas Personalizadas de Alta Calidad
          </p>
        </div>
      </section>

      {/* Kit Information Section */}
      <section id="kit-info" className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h2
              className="text-4xl font-bold mb-6 text-gray-300"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Kit Completo de Lujo - 7 Piezas
            </h2>
            <p className="text-xl text-gray-400">
              La colección más completa para mamás elegantes y organizadas
            </p>
          </div>

          <div className="bg-gradient-to-br from-black/80 to-gray-900/80 rounded-3xl p-8 border border-gray-600/50 backdrop-blur-sm">
            <h3
              className="text-2xl font-bold mb-8 text-center text-gray-300"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Incluye:
            </h3>

            <div className="grid md:grid-cols-2 gap-6 text-white mb-8">
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Organizador de higiene:</span>
                <span className="font-bold text-xl">$145,000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Mochila Milán:</span>
                <span className="font-bold text-xl">$450,000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Maleta viajera:</span>
                <span className="font-bold text-xl">$565,000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Portadocumentos:</span>
                <span className="font-bold text-xl">$190,000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Portachupetas:</span>
                <span className="font-bold text-xl">$80,000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• organizador de mudas:</span>
                <span className="font-bold text-xl">$60,000</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg">
                <span className="text-lg">• Cambiador:</span>
                <span className="font-bold text-xl">$105,000</span>
              </div>
            </div>

            <div className="border-t border-gray-600 pt-6 mb-8">
              <div className="flex justify-between items-center text-2xl font-bold text-center text-white mb-4">
                <span>Total normal:</span>
                <span className="line-through text-gray-400">$1,595,000</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-bold text-center mb-4">
                <span className="text-orange-400">Descuento (10%):</span>
                <span className="text-orange-400">-$159,500</span>
              </div>
              <div className="flex justify-between items-center text-3xl font-bold text-center text-orange-400">
                <span>Precio final:</span>
                <span>$1,435,500</span>
              </div>
              <p className="text-center text-lg text-gray-300 mt-4">
                ¡INCLUYE 1 accesorio GRATIS!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img
                  src="/assets/MaletaMilan_ConBordado.jpg"
                  alt="Maleta Milano con bordado personalizado"
                  className="w-full rounded-2xl shadow-2xl border border-gray-600"
                />
              </div>
              <div className="text-white">
                <h4
                  className="text-2xl font-bold mb-4 text-gray-300"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Mochila Milán Bordada
                </h4>
                <p className="text-lg text-gray-400 mb-6">
                  Nuestra mochila estrella. Elegante,
                  funcional y perfecta para el día a día.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-orange-400" />
                    <span>Bordado artesanal incluido</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-orange-400" />
                    <span>Materiales de la más alta calidad</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-orange-400" />
                    <span>Diseños personalizables</span>
                  </div>
                </div>
                <WhatsAppButton
                  phone="573160183418"
                  message="¡Hola! Me interesa el Kit Completo de Lujo de 7 piezas por $1,435,000. ¿Podrían darme más información por favor?"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-16 bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-black/80 to-gray-800/80 rounded-3xl p-8 border border-gray-600/50 backdrop-blur-sm">
            <img
              src="/assets/logo.png"
              alt="Promoción especial Sigerist"
              className="mx-auto mb-8 h-20 w-auto md:h-24 lg:h-28 object-contain"
            />

            <h2
              className="text-4xl font-bold mb-6 text-gray-300"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Diferenciate con nuestros bolsos personalizados. ¡El momento es ahora!
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="bg-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Entrega Rápida
                </h3>
                <p className="text-gray-400">15-20 días hábiles</p>
              </div>

              <div className="text-center">
                <div className="bg-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Calidad Premium
                </h3>
                <p className="text-gray-400">Materiales de lujo</p>
              </div>

              <div className="text-center">
                <div className="bg-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <PenTool className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Bordado Artesanal
                </h3>
                <p className="text-gray-400">Diseños únicos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="productos" className="py-20 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-6 text-gray-300"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Nuestros Productos Destacados
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Descubre nuestra exclusiva colección de bolsos de lujo, diseñados con
              amor y bordados artesanalmente para hacer cada pieza única y especial.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-700 rounded-xl h-64 mb-4"></div>
                  <div className="bg-gray-700 rounded h-4 mb-2"></div>
                  <div className="bg-gray-700 rounded h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {featuredProducts && featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredProducts.slice(0, 6).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gray-800/50 rounded-2xl p-8 max-w-md mx-auto border border-gray-600">
                    <h3 className="text-2xl font-bold text-gray-300 mb-4">
                      Catálogo en Carga
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Estamos preparando nuestros productos exclusivos para ti.
                    </p>
                    <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                </div>
              )}

              {process.env.NODE_ENV === "development" && (
                <div className="mt-8 p-4 bg-gray-800 rounded-lg text-sm text-gray-400">
                  <strong>Debug Info:</strong>
                  <br />
                  Products loaded: {featuredProducts?.length || 0}
                  <br />
                  Products data: {JSON.stringify(featuredProducts?.slice(0, 2), null, 2)}
                </div>
              )}
            </>
          )}

          <div className="text-center mt-12">
            <Link href="/productos">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-3 rounded-full">
                Ver Todos los Productos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2
                className="text-4xl font-bold mb-6 text-gray-300"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                ¿Quiénes somos?
              </h2>
              <p className="text-lg text-gray-400 mb-6 leading-relaxed">
                En Sigerist nos especializamos en la creación de bolsos de lujo con
                bordados artesanales únicos. Cada pieza es cuidadosamente diseñada y
                elaborada por nuestros artesanos expertos, combinando técnicas
                tradicionales con diseños modernos y elegantes.
              </p>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Nuestro compromiso es ofrecer productos de la más alta calidad que
                reflejen el estilo y personalidad de cada cliente, creando piezas
                verdaderamente únicas y especiales.
              </p>

              <div className="space-y-6">
                <h3
                  className="text-2xl font-bold text-gray-300"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Nuestra Misión
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Crear bolsos de lujo únicos y personalizados que combinen
                  artesanía tradicional con diseño contemporáneo, ofreciendo a
                  nuestros clientes productos de la más alta calidad que reflejen su
                  estilo personal y les acompañen en sus momentos más importantes.
                </p>

                <h3
                  className="text-2xl font-bold text-gray-300"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Nuestra Visión
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Ser reconocidos como la marca líder en Colombia en la creación de
                  bolsos de lujo artesanales, expandiendo nuestra presencia a nivel
                  nacional e internacional, manteniendo siempre nuestro compromiso
                  con la excelencia, la innovación y la satisfacción del cliente.
                </p>
              </div>
            </div>

            <div>
              <img
                src="/assets/Bolsito perrito.jpg"
                alt="Sobre Sigerist Luxury Bags"
                className="w-full rounded-2xl shadow-2xl border border-gray-600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-6 text-gray-300"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Contáctanos
            </h2>
            <p className="text-xl text-gray-400">
              Estamos aquí para ayudarte con cualquier pregunta
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-black/50 border-gray-600">
              <CardContent className="p-8">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre
                      </label>
                      <Input
                        value={contactForm.firstName}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, firstName: e.target.value })
                        }
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Apellido
                      </label>
                      <Input
                        value={contactForm.lastName}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, lastName: e.target.value })
                        }
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <Input
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, phone: e.target.value })
                      }
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mensaje
                    </label>
                    <Textarea
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, message: e.target.value })
                      }
                      className="bg-gray-800 border-gray-600 text-white min-h-32"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-6 text-gray-300">
                  Información de Contacto
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-500/20 rounded-full w-12 h-12 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-gray-400">+57 316 018 3418</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-orange-500/20 rounded-full w-12 h-12 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-400">info@sigeristluxury.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-orange-500/20 rounded-full w-12 h-12 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-gray-400">Medellín, Colombia</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-white">
                <h3 className="text-2xl font-bold mb-6 text-gray-300">
                  Síguenos
                </h3>
                <div className="flex gap-4">
                  <WhatsAppButton
                    phone="573160183418"
                    message="¡Hola! Me interesa conocer más sobre sus productos de lujo."
                  />
                  <InlineInstagramButton />
                </div>
              </div>

              <div className="bg-gradient-to-br from-black/60 to-gray-800/60 rounded-2xl p-6 border border-gray-600/50">
                <h4 className="text-xl font-bold text-white mb-4">
                  ¿Necesitas ayuda?
                </h4>
                <p className="text-gray-400 mb-4">
                  Nuestro equipo está listo para ayudarte con cualquier pregunta sobre
                  nuestros productos.
                </p>
                <WhatsAppButton
                  phone="573160183418"
                  message="Hola, necesito ayuda con información sobre sus productos."
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
