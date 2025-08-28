import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart-provider";
import { useCustomerInfo } from "@/components/customer-info-provider";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { formatPrice } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag,
  CreditCard,
  Truck
} from "lucide-react";
import { useState } from "react";

// Helper function to get product image based on product name
function getProductImage(productName: string, hasBordado?: boolean): string {
  const defaultImage = "/assets/logo.png"; // Fallback image that exists
  
  // Map product names to their corresponding images (using actual filenames that exist)
  const productImageMap: Record<string, string> = {
    "Maleta Milan Bordada": "/assets/maleta-milan-bordada.jpg",
    "Maleta Milan Sin Bordar": "/assets/MaletaMilan_ConBordado.jpg",
    "Bolso Mariposa Bordado": "/assets/Bolsito Mariposa.jpg", 
    "Bolso Mariposa Sin Bordar": "/assets/Bolso Mariposa sin Bordar.jpg",
    "Bolsito Gato Bordado": "/assets/Bolsito Gato.jpg",
    "Bolsito Gato Sin Bordar": "/assets/Bolsito Gato.jpg",
    "Lonchera Baúl Bordada": "/assets/Lonchera baul.jpg",
    "Lonchera Baúl Sin Bordar": "/assets/Lonchera baul sin bordar.jpg",
    // Mochilas
    "Mochila Universitaria Bordada": "/assets/Mochila clasica.jpg",
    "Mochila Universitaria Sin Bordar": "/assets/Mochila clasica.jpg",
    "Mochila Milán Bordada": "/assets/maleta-milan-bordada.jpg",
    "Mochila Milán Sin Bordar": "/assets/MaletaMilan_ConBordado.jpg",
    // Kit and other products
    "Kit Luxury de 7 Piezas": "/assets/Bolsito Mariposa.jpg",
  };
  
  // Try exact match first
  let imageUrl = productImageMap[productName];
  
  // If no exact match, try to match based on product type and bordado status
  if (!imageUrl) {
    const nameLower = productName.toLowerCase();
    
    if (nameLower.includes("maleta") && nameLower.includes("milan")) {
      imageUrl = hasBordado ? "/assets/maleta-milan-bordada.jpg" : "/assets/MaletaMilan_ConBordado.jpg";
    } else if (nameLower.includes("bolso") && nameLower.includes("mariposa")) {
      imageUrl = hasBordado ? "/assets/Bolsito Mariposa.jpg" : "/assets/Bolso Mariposa sin Bordar.jpg";
    } else if (nameLower.includes("bolsito") && nameLower.includes("gato")) {
      imageUrl = "/assets/Bolsito Gato.jpg"; // Same image for both variants
    } else if (nameLower.includes("lonchera")) {
      imageUrl = hasBordado ? "/assets/Lonchera baul.jpg" : "/assets/Lonchera baul sin bordar.jpg";
    } else if (nameLower.includes("mochila") && nameLower.includes("universitaria")) {
      imageUrl = "/assets/Mochila clasica.jpg"; // Use classic mochila for universitaria
    } else if (nameLower.includes("mochila") && nameLower.includes("milan")) {
      imageUrl = hasBordado ? "/assets/maleta-milan-bordada.jpg" : "/assets/MaletaMilan_ConBordado.jpg";
    }
  }
  
  return imageUrl || defaultImage;
}

export default function CartPage() {
  const { items, total, finalTotal, itemCount, discountCode, discountAmount, updateItem, removeItem, clearCart, applyDiscount, removeDiscount } = useCart();
  const { customerInfo, updateCustomerInfo } = useCustomerInfo();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [discountInput, setDiscountInput] = useState("");
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: number) => {
    removeItem(itemId);
  };

  const handleApplyDiscount = () => {
    if (!discountInput.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de descuento",
        variant: "destructive",
      });
      return;
    }

    // Validar código BienvenidosSLB con vigencia de 30 días automática
    const validCode = "BienvenidosSLB";
    const today = new Date();
    
    // Calcular 30 días desde hoy automáticamente
    const codeStartDate = new Date(); // Desde hoy
    const codeExpiryDate = new Date();
    codeExpiryDate.setDate(today.getDate() + 30); // 30 días desde hoy

    if (discountInput.trim().toUpperCase() === validCode.toUpperCase() && 
        today >= codeStartDate && today <= codeExpiryDate) {
      applyDiscount(validCode, 15); // 15% de descuento
      toast({
        title: "¡Descuento Aplicado!",
        description: "15% de descuento aplicado correctamente - ¡Bienvenidos a SLB!",
      });
      setDiscountInput("");
    } else if (discountInput.trim().toUpperCase() === validCode.toUpperCase() && 
               (today < codeStartDate || today > codeExpiryDate)) {
      toast({
        title: "Código Expirado",
        description: "Este código de descuento ya no está disponible",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Código Inválido",
        description: "El código de descuento no es válido",
        variant: "destructive",
      });
    }
  };

  const handleRemoveDiscount = () => {
    removeDiscount();
    toast({
      title: "Descuento Removido",
      description: "El código de descuento ha sido removido",
    });
  };

  const validateCustomerInfo = () => {
    const { name, email, phone, address, city, department } = customerInfo;
    
    if (!name.trim()) {
      toast({
        title: "Información incompleta",
        description: "Por favor ingresa tu nombre completo",
        variant: "destructive",
      });
      return false;
    }
    
    if (!email.trim()) {
      toast({
        title: "Información incompleta", 
        description: "Por favor ingresa tu email",
        variant: "destructive",
      });
      return false;
    }
    
    if (!phone.trim()) {
      toast({
        title: "Información incompleta",
        description: "Por favor ingresa tu teléfono",
        variant: "destructive",
      });
      return false;
    }
    
    if (!address.trim()) {
      toast({
        title: "Dirección requerida",
        description: "Por favor ingresa tu dirección completa para el envío",
        variant: "destructive",
      });
      return false;
    }
    
    if (!city.trim()) {
      toast({
        title: "Información incompleta",
        description: "Por favor ingresa tu ciudad",
        variant: "destructive",
      });
      return false;
    }
    
    if (!department.trim()) {
      toast({
        title: "Información incompleta",
        description: "Por favor ingresa tu departamento",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleProceedToCheckout = () => {
    if (validateCustomerInfo()) {
      setLocation("/checkout");
    }
  };

  // Los totales ya están calculados en el cart provider
  const subtotal = total;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center py-16 bg-gradient-to-br from-gray-900/95 to-black/95 border-2 border-[#C0C0C0]/30">
            <CardContent>
              <ShoppingBag className="h-24 w-24 text-[#C0C0C0] mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-[#C0C0C0] mb-4">
                Tu carrito está vacío
              </h1>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Explora nuestra colección de bolsos de lujo personalizados y encuentra 
                el regalo perfecto.
              </p>
              <Link href="/">
                <Button size="lg" className="hover-scale">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continuar Comprando
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#c9a920]" style={{textShadow: '0 0 15px rgba(201, 169, 32, 0.6)'}}>Carrito de Compras</h1>
            <p className="text-[#C0C0C0]">
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continuar Comprando
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="bg-gradient-to-br from-gray-900/95 to-black/95 border-2 border-[#C0C0C0]/30 hover:border-[#C0C0C0]/60 hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-white rounded-xl flex-shrink-0 border border-[#C0C0C0]/20 p-2">
                      <img
                        src={getProductImage(item.name, item.hasBordado)}
                        alt={item.name}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          // Fallback to default image if product image fails to load
                          (e.target as HTMLImageElement).src = "/assets/logo.png";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[#c9a920] truncate mb-3" style={{textShadow: '0 0 10px rgba(201, 169, 32, 0.4)'}}>
                        {item.name}
                      </h3>
                      
                      {/* Especificaciones del pedido */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-medium text-sm">Tipo:</span>
                          <span className="text-[#C0C0C0] text-sm">
                            {item.hasBordado ? 'Con bordado personalizado' : 'Sin bordado'}
                          </span>
                        </div>
                        
                        {item.personalization && (
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-medium text-sm">Bordado:</span>
                            <span className="text-[#C0C0C0] text-sm">{item.personalization}</span>
                          </div>
                        )}
                        
                        {(item.addPersonalizedKeychain || item.addDecorativeBow || item.addPompon) && (
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-medium text-sm">Adicionales:</span>
                            <div className="flex flex-wrap gap-1">
                              {item.addPersonalizedKeychain && (
                                <Badge variant="secondary" className="text-xs bg-orange-600/20 text-orange-300 border-orange-600/30">
                                  Llavero
                                </Badge>
                              )}
                              {item.addDecorativeBow && (
                                <Badge variant="secondary" className="text-xs bg-orange-600/20 text-orange-300 border-orange-600/30">
                                  Moño
                                </Badge>
                              )}
                              {item.addPompon && (
                                <Badge variant="secondary" className="text-xs bg-orange-600/20 text-orange-300 border-orange-600/30">
                                  Pompón
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-medium text-sm">Envío:</span>
                          <span className="text-[#C0C0C0] text-sm">
                            {item.expressService ? (
                              <Badge variant="secondary" className="text-xs bg-green-600/20 text-green-300 border-green-600/30">
                                Express (+$50.000)
                              </Badge>
                            ) : (
                              <span className="text-green-300 text-xs">Regular ($25.000 contraentrega)</span>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-lg font-bold text-amber-400">
                        {formatPrice(item.price)} {/* Cambiado a item.price directamente */}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity! - 1)}
                          disabled={item.quantity! <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium text-[#C0C0C0]">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity! + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
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
                className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vaciar Carrito
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border-2 border-[#C0C0C0]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#c9a920]" style={{textShadow: '0 0 10px rgba(201, 169, 32, 0.5)'}}>
                  <CreditCard className="h-5 w-5" />
                  Resumen del Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[#C0C0C0]">Subtotal ({itemCount} productos)</span>
                  <span className="font-medium text-amber-400">{formatPrice(subtotal)}</span>
                </div>
                
                {/* Discount Code Section */}
                <div className="border border-[#C0C0C0]/30 rounded-lg p-4 bg-gray-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-[#c9a920]">🎉 Código de Descuento</span>
                  </div>
                  {!discountCode ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ingresa tu código de descuento"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        className="text-sm bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyDiscount}
                        className="whitespace-nowrap text-xs px-3 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-black"
                      >
                        Aplicar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-900/30 border border-green-400/30 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium text-green-300">{discountCode}</p>
                        <p className="text-xs text-gray-400">Descuento del 10% aplicado</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveDiscount}
                        className="text-orange-400 hover:text-orange-300 p-1 h-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {discountCode && (
                  <div className="flex justify-between text-green-400">
                    <span>Descuento (10%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-[#C0C0C0]">Personalización</span>
                  <span className="font-medium text-green-400">Gratis</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-[#C0C0C0]">
                    <Truck className="h-4 w-4" />
                    Envío Regular ($25.000)
                  </span>
                  <span className="font-medium text-green-400">Se paga contraentrega</span>
                </div>
                <Separator className="bg-[#C0C0C0]/30" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-[#C0C0C0]">Total Final</span>
                  <span className="text-amber-400">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  * El envío regular ($25.000) se paga contraentrega
                </p>

                {/* Payment Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[#c9a920]">💰 Modalidades de Pago</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-900/20 border border-green-400/30 rounded-lg">
                      <p className="text-sm text-green-300 font-medium">• Pago online con tarjeta (Wompi/Stripe)</p>
                      <p className="text-xs text-gray-400">Pago inmediato y seguro</p>
                    </div>
                    
                    <div className="p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg">
                      <p className="text-sm text-blue-300 font-medium">• Transferencia bancaria</p>
                      <p className="text-xs text-gray-400">Cuenta Ahorros Bancolombia: 23883092333</p>
                      <p className="text-xs text-gray-400">Enviar pantallazo al WhatsApp: 3160183418</p>
                    </div>
                    
                    <div className="p-3 bg-orange-900/20 border border-orange-400/30 rounded-lg">
                      <p className="text-sm text-orange-300 font-medium">• Contraentrega (solo envío)</p>
                      <p className="text-xs text-gray-400">Solo se paga el costo de envío contraentrega</p>
                      <p className="text-xs text-gray-400">El producto se paga previamente</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border-2 border-[#C0C0C0]/30">
              <CardHeader>
                <CardTitle className="text-[#c9a920]" style={{textShadow: '0 0 10px rgba(201, 169, 32, 0.5)'}}>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Nombre completo *
                  </label>
                  <Input
                    placeholder="Tu nombre completo"
                    value={customerInfo.name}
                    onChange={(e) => updateCustomerInfo({ name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={customerInfo.email}
                    onChange={(e) => updateCustomerInfo({ email: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Teléfono *
                  </label>
                  <Input
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={customerInfo.phone}
                    onChange={(e) => updateCustomerInfo({ phone: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Dirección *
                  </label>
                  <Input
                    placeholder="Calle 123 # 45-67, Apartamento 123"
                    value={customerInfo.address}
                    onChange={(e) => updateCustomerInfo({ address: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Ciudad *
                    </label>
                    <Input
                      placeholder="Bogotá"
                      value={customerInfo.city}
                      onChange={(e) => updateCustomerInfo({ city: e.target.value })}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Departamento *
                    </label>
                    <Input
                      placeholder="Cundinamarca"
                      value={customerInfo.department}
                      onChange={(e) => updateCustomerInfo({ department: e.target.value })}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Código Postal
                  </label>
                  <Input
                    placeholder="110111"
                    value={customerInfo.postalCode}
                    onChange={(e) => updateCustomerInfo({ postalCode: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-accent focus:ring-accent"
                  />
                </div>

                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl border border-[#C0C0C0]/20"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceder al Pago - {formatPrice(total)}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  Al finalizar tu pedido, serás redirigido a WhatsApp para confirmar los detalles
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <WhatsAppButton 
        message="Hola! Tengo algunas preguntas sobre mi carrito de compras."
      />
    </div>
  );
}