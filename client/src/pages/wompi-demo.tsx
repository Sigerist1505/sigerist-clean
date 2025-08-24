import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function WompiDemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    email: "daniel.sigerist101@gmail.com",
    phone: "3160183418",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardHolder: ""
  });
  const { toast } = useToast();

  const amount = 150000; // Ejemplo de monto
  const reference = `SIGERIST-DEMO-${Date.now()}`;

  const handlePaymentDemo = async () => {
    if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv || !paymentData.cardHolder) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa todos los campos de la tarjeta",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Mostrar mensaje de inicio de proceso
    toast({
      title: "Procesando pago...",
      description: "Validando datos de tarjeta con Wompi",
    });
    
    // Simular proceso de pago
    setTimeout(() => {
      toast({
        title: "Tarjeta validada ✓",
        description: "Procesando transacción con Wompi...",
      });
    }, 1000);

    setTimeout(() => {
      toast({
        title: "¡Pago exitoso! ✅",
        description: `Tu compra por ${formatPrice(amount)} COP ha sido aprobada. ID: DEMO-${Date.now()}`,
      });
      setIsLoading(false);
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#ebc005] flex items-center gap-3">
              <CreditCard className="h-8 w-8" />
              Demo: Pago con Wompi
            </h1>
            <p className="text-[#C0C0C0] mt-2">
              1 producto • Total: {formatPrice(amount)}
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-[#C0C0C0]/30 text-[#C0C0C0] hover:text-[#ebc005] hover:border-[#ebc005]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
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
              <span className="text-[#ebc005] font-semibold">Pago</span>
            </div>
            <div className="w-12 h-0.5 bg-[#C0C0C0]/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#C0C0C0]/30 text-[#C0C0C0] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="text-[#C0C0C0]">Confirmación</span>
            </div>
          </div>
        </div>

        {/* Enhanced Wompi Checkout Component */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md mx-auto bg-black border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-300 text-center">
                Pago Seguro con Wompi
              </CardTitle>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-300">
                  {formatPrice(amount)}
                </div>
                <div className="text-sm text-yellow-400 font-medium">
                  💰 Precios en Pesos Colombianos (COP)
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Referencia: {reference}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  🔒 Procesado por Wompi - Pago 100% Seguro
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={paymentData.email}
                  onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                  className="bg-black/60 border-gray-600 text-white"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={paymentData.phone}
                  onChange={(e) => setPaymentData({...paymentData, phone: e.target.value})}
                  className="bg-black/60 border-gray-600 text-white"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardHolder" className="text-gray-300">Nombre del titular</Label>
                <Input
                  id="cardHolder"
                  value={paymentData.cardHolder}
                  onChange={(e) => setPaymentData({...paymentData, cardHolder: e.target.value.toUpperCase()})}
                  className="bg-black/60 border-gray-600 text-white"
                  placeholder="NOMBRE COMPLETO"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-gray-300">Número de tarjeta</Label>
                <Input
                  id="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({...paymentData, cardNumber: formatCardNumber(e.target.value)})}
                  className="bg-black/60 border-gray-600 text-white"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth" className="text-gray-300">Mes</Label>
                  <Input
                    id="expiryMonth"
                    value={paymentData.expiryMonth}
                    onChange={(e) => setPaymentData({...paymentData, expiryMonth: e.target.value})}
                    className="bg-black/60 border-gray-600 text-white"
                    placeholder="MM"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryYear" className="text-gray-300">Año</Label>
                  <Input
                    id="expiryYear"
                    value={paymentData.expiryYear}
                    onChange={(e) => setPaymentData({...paymentData, expiryYear: e.target.value})}
                    className="bg-black/60 border-gray-600 text-white"
                    placeholder="YY"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-gray-300">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                    className="bg-black/60 border-gray-600 text-white"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handlePaymentDemo}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando con Wompi...
                    </div>
                  ) : (
                    `💳 Pagar ${formatPrice(amount)} COP con Tarjeta`
                  )}
                </Button>

                <div className="text-center text-gray-400 text-sm">o</div>
                
                <Button 
                  onClick={() => window.open('https://checkout.wompi.co/l/VPOS_wRNRo4', '_blank')}
                  variant="outline"
                  className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-black font-semibold py-3"
                  disabled={isLoading}
                >
                  🌟 Pagar con Checkout Wompi (Recomendado)
                </Button>
              </div>

              <div className="text-center text-xs text-gray-400">
                Pago seguro procesado por Wompi 🔒
              </div>
            </CardContent>
          </Card>
        </div>

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