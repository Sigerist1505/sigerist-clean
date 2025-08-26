import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/components/cart-provider";
import { useCustomerInfo } from "@/components/customer-info-provider";
import { WompiWidget } from "@/components/wompi-widget";
import { formatPrice } from "@/lib/utils";
import { useLocation } from "wouter";
import { ArrowLeft, ShoppingBag, CreditCard } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, itemCount, finalTotal, discountCode, discountAmount, clearCart } = useCart();
  const { customerInfo } = useCustomerInfo();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center py-16 bg-black border border-[#C0C0C0]/30">
            <CardContent>
              <ShoppingBag className="h-24 w-24 text-[#C0C0C0] mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-[#ebc005] mb-4">
                No hay productos en el carrito
              </h1>
              <p className="text-[#C0C0C0] mb-8 max-w-md mx-auto">
                Agrega algunos productos a tu carrito antes de proceder al checkout.
              </p>
              <Link href="/">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#ebc005] to-[#d4a804] text-black hover:from-[#d4a804] hover:to-[#b8950b] font-bold"
                >
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
    <div className="min-h-screen pt-16 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#ebc005] flex items-center gap-3">
              <CreditCard className="h-8 w-8" />
              Finalizar Compra
            </h1>
            <p className="text-[#C0C0C0] mt-2">
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'} • 
              {discountCode && (
                <span className="text-green-400">
                  Descuento {discountCode}: -{formatPrice(discountAmount)} • 
                </span>
              )}
              Total: {formatPrice(finalTotal)}
            </p>
          </div>
          <Link href="/cart">
            <Button variant="outline" className="border-[#C0C0C0]/30 text-[#C0C0C0] hover:text-[#ebc005] hover:border-[#ebc005]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Carrito
            </Button>
          </Link>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#ebc005] text-black flex items-center justify-center font-bold text-sm">
                1
              </div>
              <span className="text-[#C0C0C0]">Carrito</span>
            </div>
            <div className="w-12 h-0.5 bg-[#ebc005]"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#ebc005] text-black flex items-center justify-center font-bold text-sm">
                2
              </div>
              <span className="text-[#ebc005] font-semibold">Datos & Pago</span>
            </div>
            <div className="w-12 h-0.5 bg-[#C0C0C0]/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#C0C0C0]/30 text-[#C0C0C0] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="text-[#C0C0C0]">Confirmación</span>
            </div>
          </div>
          
          {/* Current step description */}
          <div className="text-center mt-4">
            <p className="text-[#C0C0C0] text-sm">
              📋 Paso 2: Ingresa los datos de tu tarjeta para completar la compra
            </p>
          </div>
        </div>

        {/* Wompi Widget Component with Cart Data */}
        <WompiWidget 
          amount={finalTotal}
          reference={`SIGERIST-${Date.now()}`}
          customerEmail={customerInfo.email || "daniel.sigerist101@gmail.com"}
          customerPhone={customerInfo.phone || "3160183418"}
          customerName={customerInfo.fullName || ""}
          customerAddress={customerInfo.address ? {
            address: customerInfo.address,
            city: customerInfo.city,
            department: customerInfo.department,
            postalCode: customerInfo.postalCode
          } : undefined}
          redirectUrl={`${window.location.origin}/payment-success`}
          onSuccess={(transactionId) => {
            console.log('Payment successful:', transactionId);
            // Limpiar carrito y redirigir a página de éxito
            clearCart();
            setLocation(`/payment-success?transaction=${transactionId}`);
          }}
          onError={(error) => {
            console.error('Payment error:', error);
            // Redirigir a página de error con detalles
            setLocation(`/payment-error?error=${encodeURIComponent(error)}`);
          }}
        />

        {/* Security badges */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center space-x-6 p-6 bg-gray-900 rounded-lg border border-[#C0C0C0]/30">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[#C0C0C0] text-sm">Pago 100% Seguro</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[#C0C0C0] text-sm">SSL Certificado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              <span className="text-[#C0C0C0] text-sm">Powered by Wompi</span>
            </div>
          </div>
        </div>

        {/* Return policy */}
        <div className="mt-8 text-center text-xs text-[#C0C0C0]">
          <p>Al realizar tu compra aceptas nuestros términos y condiciones.</p>
          <p className="mt-1">Servicio estándar: 15-20 días | Servicio express: 5-8 días | Envío gratuito a toda Colombia</p>
        </div>
      </div>
    </div>
  );
}