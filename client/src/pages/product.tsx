import { useState } from "react";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { ImageGallery } from "@/components/image-gallery";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  Clock,
  Award,
  ShoppingCart,
  MessageCircle,
} from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductVariants {
  bordado?: boolean;
  galleryImages?: string[];
  bordadoGalleryImages?: string[];
  bordadoImageUrl?: string;
  blankImageUrl?: string | null;
  referenceImageUrl?: string | null;
}

function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const { addItem } = useCart();
  const { toast } = useToast();
  const productId = params?.id ? parseInt(params.id) : 0;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showEmbroidery, setShowEmbroidery] = useState(true);
  const [personalization, setPersonalization] = useState("");
  const [addPompon, setAddPompon] = useState(false);
  const [addKeychain, setAddKeychain] = useState(false);
  const [addBow, setAddBow] = useState(false);
  const [addNameEmbroidery, setAddNameEmbroidery] = useState(false);
  const [addExpressService, setAddExpressService] = useState(false);
  const [keychainText, setKeychainText] = useState("");

  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product & { variants?: ProductVariants }>({
    queryKey: productId ? [`/api/products/${productId}`] : [], // Corrección: Usa la ruta completa con el ID
    enabled: !!productId, // Solo ejecuta si hay un ID válido
    retry: 1,
  });

  // Dynamic mock product mapping based on product ID
  const getMockProduct = (id: number) => {
    const mockProducts: Record<number, any> = {
      1: {
        id: 1,
        name: "Pañalera Multifuncional",
        description: "Pañalera multifuncional con bordado personalizado y múltiples compartimentos - ¡Nuestro producto estrella!",
        price: 445000,
        category: "Pañaleras",
        imageUrl: "/assets/Multifuncional 3 Bordada.jpg",
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Multifuncional 3 Bordada.jpg",
          blankImageUrl: "/assets/Multifuncional 3 sin Bordado.jpg",
          galleryImages: [
            "/assets/Multifuncional 3sinB.jpg",
            "/assets/Multifuncional_Extra1.jpg",
            "/assets/Multifuncional_Extra2.jpg"
          ],
          bordadoGalleryImages: [
            "/assets/Multifuncional 3 Bordada.jpg",
            "/assets/Multifuncional 2 Bordada.jpg",
            "/assets/Multifuncional_Bordado_Extra1.jpg",
            "/assets/Multifuncional_Bordado_Extra2.jpg"
          ],
        }
      },
      2: {
        id: 2,
        name: "Organizador de Higiene",
        description: "Organizador de higiene transparente con bordado personalizado de flores - Perfecto para viajes",
        price: 145000,
        category: "Organizadores",
        imageUrl: "/assets/Organizador Bordado.jpg",
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Organizador Bordado.jpg",
          blankImageUrl: "/assets/Organizador_Sin bordar.jpg",
          galleryImages: ["/assets/Organizador_Sin bordar.jpg"],
          bordadoGalleryImages: ["/assets/Organizador Bordado.jpg"],
        }
      },
      3: {
        id: 3,
        name: "Mochila Clásica",
        description: "Mochila clásica con bordado de leoncito adorable y acabados premium en beige y café",
        price: 425000,
        category: "Mochilas",
        imageUrl: "/assets/Mochila clasica.jpg",
        inStock: true,
        variants: {
          bordado: false,
          galleryImages: ["/assets/Mochila clasica.jpg"],
        }
      },
      4: {
        id: 4,
        name: "Bolso Mariposa",
        description: "Elegante bolso con diseño de mariposa y bordado personalizado. Perfecto para el día a día con un toque de distinción.",
        price: 285000,
        category: "Bolsos",
        imageUrl: "/assets/Bolsito Mariposa.jpg",
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Bolsito Mariposa.jpg",
          blankImageUrl: "/assets/Bolso Mariposa sin Bordar.jpg",
          galleryImages: ["/assets/Bolso Mariposa sin Bordar.jpg"],
          bordadoGalleryImages: ["/assets/Bolsito Mariposa.jpg"]
        }
      },
      5: {
        id: 5,
        name: "Organizador de Mudas",
        description: "Organizador de mudas con bordado personalizado y diseño práctico",
        price: 145000,
        category: "Organizadores",
        imageUrl: "/assets/Organizador_Bordado.jpg",
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Organizador_Bordado.jpg",
          blankImageUrl: "/assets/Organizador.jpg",
          galleryImages: ["/assets/Organizador.jpg"],
          bordadoGalleryImages: ["/assets/Organizador_Bordado.jpg"],
        }
      },
      6: {
        id: 6,
        name: "Mochila León",
        description: "Mochila con bordado de león y acabados premium",
        price: 435000,
        category: "Mochilas",
        imageUrl: "/assets/Mochila leon.jpg",
        inStock: true,
        variants: {
          bordado: false,
        }
      },
      7: {
        id: 7,
        name: "Mochila Milano",
        description: "Mochila Milano con diseño elegante y bordado de leoncito premium",
        price: 435000,
        category: "Mochilas",
        imageUrl: "/assets/maleta-milan-bordada.jpg",
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/maleta-milan-bordada.jpg",
          blankImageUrl: "/assets/MaletaMilan_ConBordado.jpg",
          galleryImages: [
            "/assets/MaletaMilan_ConBordado.jpg",
            "/assets/MaletaMilan_ConMoño.jpg"
          ],
          bordadoGalleryImages: [
            "/assets/maleta-milan-bordada.jpg",
            "/assets/MaletaMilan_ConBordado.jpg",
            "/assets/MaletaMilan_ConMoño.jpg"
          ],
        }
      },
      8: {
        id: 8,
        name: "Cambiador",
        description: "Cambiador portátil con diseño funcional y elegante - Solo disponible sin bordado",
        price: 105000,
        category: "Accesorios",
        imageUrl: "/assets/Cambiador.jpg",
        inStock: true,
        variants: {
          bordado: false,
          galleryImages: [
            "/assets/Cambiador.jpg",
            "/assets/Cambiador 2.jpg"
          ],
          bordadoGalleryImages: [
            "/assets/Cambiador.jpg",
            "/assets/Cambiador 2.jpg"
          ]
        }
      },
      9: {
        id: 9,
        name: "Lonchera Porta Biberones",
        description: "Lonchera porta biberones con bordado de osita personalizado",
        price: 335000,
        category: "Loncheras",
        imageUrl: "/assets/Porta Biberones_Bordado.jpg",
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Porta Biberones_Bordado.jpg",
          blankImageUrl: "/assets/PortaBiberones_SinBordar.jpg",
          galleryImages: ["/assets/PortaBiberones_SinBordar.jpg"],
          bordadoGalleryImages: ["/assets/Porta Biberones_Bordado.jpg"],
        }
      },
      10: {
        id: 10,
        name: "Lonchera Baul",
        description: "Lonchera baúl con bordado de osito y acabados premium con moño azul",
        price: 335000,
        category: "Loncheras",
        imageUrl: "/assets/Lonchera baul.jpg",
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Lonchera baul.jpg",
          blankImageUrl: "/assets/Lonchera baul sin bordar.jpg",
          galleryImages: ["/assets/Lonchera baul sin bordar.jpg"],
          bordadoGalleryImages: ["/assets/Lonchera baul.jpg"],
        }
      },
      11: {
        id: 11,
        name: "Maleta Viajera",
        description: "Maleta viajera con diseño floral bordado y detalles en rosa",
        price: 550000,
        category: "Maletas",
        imageUrl: "/assets/Maleta viajera_Bordada_1754093212912.jpg",
        inStock: true,
        variants: {
          bordado: true,
          bordadoImageUrl: "/assets/Maleta viajera_Bordada_1754093212912.jpg",
          blankImageUrl: "/assets/Maleta Viajera_Sin bordar_1754094149303.jpg",
        }
      },
      12: {
        id: 12,
        name: "Portachupeta",
        description: "Portachupeta elegante con bordado personalizado y acabados premium",
        price: 80000,
        category: "Accesorios",
        imageUrl: "/assets/Portachupeta.jpg",
        inStock: true,
        variants: {
          bordado: false,
        }
      }
    };

    return mockProducts[id] || null;
  };

  // For development testing - fallback to mock data when API fails
  const mockProduct = productId && (error || !product) ? getMockProduct(productId) : null;

  // Use product from API or fallback to mock data for UI testing
  const finalProduct = product || mockProduct;
  const finalIsLoading = isLoading && !mockProduct;
  const finalError = error && !mockProduct;

  const calculateFinalPrice = () => {
    if (!finalProduct) return 0;

    let basePrice = finalProduct.price;
    
    // Apply 15,000 COP discount for products without embroidery (if product supports embroidery)
    if (hasBordado && !showEmbroidery) {
      basePrice = Math.max(0, basePrice - 15000); // Ensure price doesn't go negative
    }
    
    let totalPrice = basePrice;

    if (addPompon) totalPrice += 45000;
    if (addKeychain) totalPrice += 55000;
    if (addBow) totalPrice += 55000;
    if (addNameEmbroidery) totalPrice += 15000;
    if (addExpressService) totalPrice += 50000;

    return totalPrice;
  };

  const handleAddToCart = () => {
    if (!finalProduct) return;

    const totalPrice = calculateFinalPrice();

    addItem({
      productId: finalProduct.id,
      name: finalProduct.name,
      price: totalPrice,
      quantity,
      personalization: personalization || undefined,
      addPompon,
      addPersonalizedKeychain: addKeychain,
      addDecorativeBow: addBow,
      addPersonalization: !!personalization,
      addNameEmbroidery,
      expressService: addExpressService,
      keychainPersonalization: keychainText || undefined,
      hasBordado: finalProduct.variants?.bordado === true && showEmbroidery,
    });
  };

  if (finalIsLoading) {
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

  if (finalError || !finalProduct) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Producto no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              El producto que buscas no existe o ha sido eliminado.
            </p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Intelligent bordado detection: check explicit flag or infer from available images
  const hasBordado = finalProduct.variants?.bordado === true || 
    (finalProduct.variants?.bordado !== false && 
     (!!finalProduct.variants?.bordadoImageUrl || 
      !!finalProduct.variants?.blankImageUrl || 
      (finalProduct.variants?.bordadoGalleryImages && finalProduct.variants.bordadoGalleryImages.length > 0)));

  const getGalleryImages = () => {
    const variants = finalProduct.variants;
    const galleryImages = variants?.galleryImages || [];
    const bordadoGalleryImages = variants?.bordadoGalleryImages || [];
    
    // Handle cases where database has inconsistent variant data
    // If bordado is null or undefined, try to determine from available images
    const shouldShowEmbroideredImages = hasBordado ? showEmbroidery : bordadoGalleryImages.length > 0 && galleryImages.length === 0;
    
    if (!hasBordado || !showEmbroidery) {
      // Product doesn't support embroidery OR user chose "without embroidery"
      if (galleryImages.length > 0) {
        return galleryImages;
      }
      // Fallback: if no gallery images but has bordado gallery images, use those (for Cambiador case)
      if (bordadoGalleryImages.length > 0) {
        return bordadoGalleryImages;
      }
      // Final fallback: use blank image or main image
      return [variants?.blankImageUrl || finalProduct.imageUrl];
    } else {
      // User chose "with embroidery", show embroidered images
      if (bordadoGalleryImages.length > 0) {
        return bordadoGalleryImages;
      }
      // Fallback: if no bordado gallery images but has regular gallery images, use those
      if (galleryImages.length > 0) {
        return galleryImages;
      }
      // Final fallback: use bordado image or main image
      return [variants?.bordadoImageUrl || variants?.referenceImageUrl || finalProduct.imageUrl];
    }
  };

  const galleryImages = getGalleryImages();

  return (
    <div
      className="min-h-screen pt-16"
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #0f0f0f 75%, #000000 100%)",
        color: "#ffffff",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-gray-400 text-sm">{finalProduct.category}</span>
          <Separator orientation="vertical" className="h-4 bg-gray-400" />
          <span className="text-sm font-medium text-white">{finalProduct.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative">
              <ImageGallery images={galleryImages} alt={finalProduct.name} className="aspect-square" />
              {hasBordado && (
                <div className="absolute top-6 left-6 flex gap-4 z-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowEmbroidery(true);
                    }}
                    className={`w-16 h-16 rounded-full border-3 transition-all duration-300 flex items-center justify-center shadow-xl backdrop-blur-sm hover:scale-105 ${
                      showEmbroidery
                        ? "bg-gradient-to-br from-[#ebc005] to-[#d4a804] border-[#ebc005] scale-110 shadow-[0_0_20px_rgba(235,192,5,0.6)]"
                        : "bg-black/80 border-[#C0C0C0]/60 hover:border-[#C0C0C0] hover:bg-black/60"
                    }`}
                    title="Con bordado"
                  >
                    <div
                      className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${
                        showEmbroidery 
                          ? "bg-white shadow-inner" 
                          : "bg-gradient-to-br from-[#ebc005]/70 to-[#d4a804]/70 opacity-60"
                      }`}
                    >
                      {showEmbroidery && (
                        <div className="w-3 h-3 rounded-full bg-[#ebc005]"></div>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowEmbroidery(false);
                    }}
                    className={`w-16 h-16 rounded-full border-3 transition-all duration-300 flex items-center justify-center shadow-xl backdrop-blur-sm hover:scale-105 ${
                      !showEmbroidery
                        ? "bg-gradient-to-br from-[#ebc005] to-[#d4a804] border-[#ebc005] scale-110 shadow-[0_0_20px_rgba(235,192,5,0.6)]"
                        : "bg-black/80 border-[#C0C0C0]/60 hover:border-[#C0C0C0] hover:bg-black/60"
                    }`}
                    title="Sin bordado"
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-3 transition-all duration-300 flex items-center justify-center ${
                        !showEmbroidery 
                          ? "border-white bg-white" 
                          : "border-[#C0C0C0]/60 bg-transparent opacity-60"
                      }`}
                    >
                      {!showEmbroidery && (
                        <div className="w-3 h-3 rounded-full bg-[#ebc005]"></div>
                      )}
                    </div>
                  </button>
                </div>
              )}
              {hasBordado && (
                <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {showEmbroidery ? "Con bordado" : "Sin bordado"}
                </div>
              )}
            </div>
            
            {hasBordado && (
              <div className="bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl p-6 border-2 border-[#ebc005]/60 shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-[#c9a920] text-center" style={{textShadow: '0 0 10px rgba(201, 169, 32, 0.4)'}}>
                  Opciones de Bordado
                </h3>
                <div className="flex gap-6 justify-center">
                  <button
                    onClick={() => setShowEmbroidery(true)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      showEmbroidery
                        ? "border-[#ebc005] bg-gradient-to-r from-[#ebc005]/20 to-[#d4a804]/20 text-[#ebc005] shadow-lg shadow-[#ebc005]/20"
                        : "border-[#C0C0C0]/40 bg-black/40 text-[#C0C0C0] hover:border-[#C0C0C0]/60 hover:bg-black/60"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        showEmbroidery 
                          ? "border-[#ebc005] bg-[#ebc005] shadow-inner" 
                          : "border-[#C0C0C0]/60 bg-transparent"
                      }`}
                    >
                      {showEmbroidery && (
                        <div className="w-3 h-3 rounded-full bg-white shadow-sm"></div>
                      )}
                    </div>
                    <span className="font-semibold text-lg">Con bordado</span>
                  </button>
                  <button
                    onClick={() => setShowEmbroidery(false)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      !showEmbroidery
                        ? "border-[#ebc005] bg-gradient-to-r from-[#ebc005]/20 to-[#d4a804]/20 text-[#ebc005] shadow-lg shadow-[#ebc005]/20"
                        : "border-[#C0C0C0]/40 bg-black/40 text-[#C0C0C0] hover:border-[#C0C0C0]/60 hover:bg-black/60"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        !showEmbroidery 
                          ? "border-[#ebc005] bg-[#ebc005] shadow-inner" 
                          : "border-[#C0C0C0]/60 bg-transparent"
                      }`}
                    >
                      {!showEmbroidery && (
                        <div className="w-3 h-3 rounded-full bg-white shadow-sm"></div>
                      )}
                    </div>
                    <span className="font-semibold text-lg">Sin bordado</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-[#c9a920] border-[#c9a920]">
                  {finalProduct.category}
                </Badge>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm text-gray-400">(4.9)</span>
                </div>
              </div>

              <h1
                className="text-3xl font-bold text-[#c9a920] mb-4"
                style={{ textShadow: "0 0 15px rgba(201, 169, 32, 0.6)" }}
              >
                {finalProduct.name}
              </h1>

              <div className="text-3xl font-bold text-amber-400 mb-6">
                {formatPrice(calculateFinalPrice())}
                {hasBordado && showEmbroidery && (
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    (incluye bordado personalizado)
                  </span>
                )}
                {hasBordado && !showEmbroidery && (
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    (ahorro de $15.000 sin bordado)
                  </span>
                )}
              </div>
              
              {hasBordado && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>• Con bordado: {formatPrice(finalProduct.price)}</div>
                    <div>• Sin bordado: {formatPrice(Math.max(0, finalProduct.price - 15000))}</div>
                  </div>
                </div>
              )}

              <p className="text-gray-300 text-lg leading-relaxed">{finalProduct.description}</p>
            </div>

            {hasBordado && (
              <div className="bg-gradient-to-br from-black/80 to-gray-900/80 rounded-xl p-6 border border-gray-600/50">
                <h3
                  className="text-lg font-semibold mb-4 text-gray-300"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Personalización
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Nombre para bordado (incluido en el precio)
                    </label>
                    <input
                      type="text"
                      value={personalization}
                      onChange={(e) => setPersonalization(e.target.value)}
                      placeholder="Escribe el nombre a bordar..."
                      className="w-full px-4 py-2 border border-gray-600/50 bg-black/60 text-white rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-400 mt-1">Máximo 20 caracteres</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-300">Adicionales Opcionales</h4>

                    <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-600/50">
                      <div>
                        <label className="font-medium text-white">Nombre Bordado</label>
                        <p className="text-xs text-gray-300">+$15.000</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={addNameEmbroidery}
                        onChange={(e) => setAddNameEmbroidery(e.target.checked)}
                        className="w-5 h-5 text-gray-400 rounded focus:ring-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-black/80 to-gray-900/80 rounded-xl p-6 border border-gray-600/50">
              <h3
                className="text-lg font-semibold mb-4 text-gray-300"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Servicio de Entrega
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-600/50">
                  <div>
                    <label className="font-medium text-white">Servicio Express</label>
                    <p className="text-xs text-gray-300">Entrega prioritaria +$50.000</p>
                    <p className="text-xs text-gray-400">
                      El envío regular ($25.000) se paga contraentrega
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={addExpressService}
                    onChange={(e) => setAddExpressService(e.target.checked)}
                    className="w-5 h-5 text-gray-400 rounded focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-black/80 to-gray-900/80 rounded-xl p-6 border border-gray-600/50">
              <h3
                className="text-lg font-semibold mb-4 text-gray-300"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Accesorios Adicionales
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-600/50">
                  <div>
                    <label className="font-medium text-white">Llavero</label>
                    <p className="text-xs text-gray-300">+$55.000</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={addKeychain}
                    onChange={(e) => setAddKeychain(e.target.checked)}
                    className="w-5 h-5 text-gray-400 rounded focus:ring-gray-400"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-600/50">
                  <div>
                    <label className="font-medium text-white">Moño</label>
                    <p className="text-xs text-gray-300">+$55.000</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={addBow}
                    onChange={(e) => setAddBow(e.target.checked)}
                    className="w-5 h-5 text-gray-400 rounded focus:ring-gray-400"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-600/50">
                  <div>
                    <label className="font-medium text-white">Pompón</label>
                    <p className="text-xs text-gray-300">+$45.000</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={addPompon}
                    onChange={(e) => setAddPompon(e.target.checked)}
                    className="w-5 h-5 text-gray-400 rounded focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Agregar al Carrito
              </Button>

              <a
                href={`https://wa.me/573160183418?text=Hola, estoy interesado en el producto: ${encodeURIComponent(
                  finalProduct.name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>

            <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border-2 border-[#C0C0C0]/30">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-[#C0C0C0] text-lg">Modalidades de Pago</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-gray-600/50">
                        <div className="w-2 h-2 bg-[#C0C0C0] rounded-full"></div>
                        <span className="text-gray-300 text-sm">Pago online con tarjeta (Wompi/Stripe)</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-gray-600/50">
                        <div className="w-2 h-2 bg-[#C0C0C0] rounded-full"></div>
                        <span className="text-gray-300 text-sm">Transferencia bancaria</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-[#C0C0C0] text-lg">Condiciones Especiales</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-gray-600/50">
                        <Clock className="h-4 w-4 text-[#C0C0C0] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-300 text-sm font-medium">Productos Bordados</p>
                          <p className="text-xs text-gray-400">Servicio estándar: 15-20 días | Express: 5-8 días</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-gray-600/50">
                        <Shield className="h-4 w-4 text-[#C0C0C0] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-300 text-sm font-medium">Garantía de Entrega</p>
                          <p className="text-xs text-gray-400">Seguimiento completo del pedido hasta tu puerta</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;