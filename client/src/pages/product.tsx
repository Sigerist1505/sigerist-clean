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

  const calculateFinalPrice = () => {
    if (!product) return 0;

    let basePrice = product.price;
    
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
    if (!product) return;

    const totalPrice = calculateFinalPrice();

    addItem({
      productId: product.id,
      name: product.name,
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
      hasBordado: product.variants?.bordado === true && showEmbroidery,
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

  const hasBordado = product.variants?.bordado === true;

  const getGalleryImages = () => {
    if (!hasBordado) {
      return product.variants?.galleryImages || [product.imageUrl];
    }
    if (!showEmbroidery) {
      return product.variants?.galleryImages || [product.variants?.blankImageUrl || product.imageUrl];
    } else {
      return (
        product.variants?.bordadoGalleryImages ||
        [product.variants?.bordadoImageUrl || product.variants?.referenceImageUrl || product.imageUrl]
      );
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
          <span className="text-gray-400 text-sm">{product.category}</span>
          <Separator orientation="vertical" className="h-4 bg-gray-400" />
          <span className="text-sm font-medium text-white">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative">
              <ImageGallery images={galleryImages} alt={product.name} className="aspect-square" />
              {hasBordado && (
                <div className="absolute top-6 left-6 flex flex-col gap-3 z-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowEmbroidery(true);
                    }}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-3 shadow-lg backdrop-blur-sm text-sm font-bold ${
                      showEmbroidery
                        ? "bg-gradient-to-br from-[#ebc005]/95 to-[#d4a804]/95 border-[#ebc005] text-black shadow-[#ebc005]/50 scale-105"
                        : "bg-black/85 border-[#C0C0C0]/60 text-white hover:border-[#C0C0C0] hover:scale-105"
                    }`}
                    title="Ver con bordado"
                  >
                    <div
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        showEmbroidery 
                          ? "bg-black shadow-inner" 
                          : "bg-gradient-to-br from-[#ebc005] to-[#d4a804] opacity-70"
                      }`}
                    />
                    <span className="whitespace-nowrap">CON BORDADO</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowEmbroidery(false);
                    }}
                    className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-3 shadow-lg backdrop-blur-sm text-sm font-bold ${
                      !showEmbroidery
                        ? "bg-gradient-to-br from-[#ebc005]/95 to-[#d4a804]/95 border-[#ebc005] text-black shadow-[#ebc005]/50 scale-105"
                        : "bg-black/85 border-[#C0C0C0]/60 text-white hover:border-[#C0C0C0] hover:scale-105"
                    }`}
                    title="Ver sin bordado"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        !showEmbroidery 
                          ? "border-black bg-transparent" 
                          : "border-[#C0C0C0] bg-transparent opacity-70"
                      }`}
                    />
                    <span className="whitespace-nowrap">SIN BORDADO</span>
                  </button>
                </div>
              )}
              {hasBordado && (
                <div className="absolute bottom-6 right-6 bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-[#ebc005]/60 text-sm font-bold shadow-lg">
                  <span className="text-[#ebc005]">●</span> {showEmbroidery ? "CON BORDADO" : "SIN BORDADO"}
                  {!showEmbroidery && <span className="text-green-400 ml-2">(¡Ahorro $15.000!)</span>}
                </div>
              )}
            </div>
            
            {hasBordado && (
              <div className="bg-gradient-to-br from-gray-900/90 to-black/95 rounded-xl p-4 border-2 border-[#ebc005]/60">
                <h3 className="text-lg font-semibold mb-3 text-[#c9a920] text-center" style={{textShadow: '0 0 10px rgba(201, 169, 32, 0.4)'}}>
                  Opciones de Bordado
                </h3>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowEmbroidery(true)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      showEmbroidery
                        ? "border-[#ebc005] bg-[#ebc005]/10 text-[#ebc005]"
                        : "border-[#C0C0C0]/40 bg-black/40 text-[#C0C0C0] hover:border-[#C0C0C0]/60"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        showEmbroidery 
                          ? "border-[#ebc005] bg-[#ebc005]" 
                          : "border-[#C0C0C0]/60"
                      }`}
                    >
                      {showEmbroidery && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="font-medium">Con bordado</span>
                  </button>
                  <button
                    onClick={() => setShowEmbroidery(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                      !showEmbroidery
                        ? "border-[#ebc005] bg-[#ebc005]/10 text-[#ebc005]"
                        : "border-[#C0C0C0]/40 bg-black/40 text-[#C0C0C0] hover:border-[#C0C0C0]/60"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        !showEmbroidery 
                          ? "border-[#ebc005] bg-[#ebc005]" 
                          : "border-[#C0C0C0]/60"
                      }`}
                    >
                      {!showEmbroidery && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="font-medium">Sin bordado</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-[#c9a920] border-[#c9a920]">
                  {product.category}
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
                {product.name}
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
                    <div>• Con bordado: {formatPrice(product.price)}</div>
                    <div>• Sin bordado: {formatPrice(Math.max(0, product.price - 15000))}</div>
                  </div>
                </div>
              )}

              <p className="text-gray-300 text-lg leading-relaxed">{product.description}</p>
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
                  product.name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
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
                        <span className="text-gray-300 text-sm">Pago contra entrega (solo costo de envío)</span>
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