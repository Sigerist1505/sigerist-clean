import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";

interface WompiCheckoutProps {
  amount: number;
  currency?: string;
  reference: string;
  customerEmail: string;
  customerPhone?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export function WompiCheckout({
  amount,
  currency = "COP",
  reference,
  customerEmail,
  customerPhone,
  onSuccess,
  onError
}: WompiCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    email: customerEmail,
    phone: customerPhone || "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardHolder: ""
  });
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv || !paymentData.cardHolder) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa todos los campos de la tarjeta",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Crear token de tarjeta con Wompi
      const tokenResponse = await apiRequest("POST", "/api/wompi/create-token", {
        cardNumber: paymentData.cardNumber.replace(/\s/g, ""),
        expMonth: paymentData.expiryMonth,
        expYear: paymentData.expiryYear,
        cvv: paymentData.cvv,
        cardHolderName: paymentData.cardHolder
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.data?.id) {
        throw new Error("Error al procesar la tarjeta");
      }

      // Crear transacción
      console.log('Creating transaction with token:', tokenData.data.id);
      const transactionResponse = await apiRequest("POST", "/api/wompi/create-transaction", {
        amount_in_cents: Math.round(amount * 100),
        currency,
        customer_email: paymentData.email,
        payment_method: {
          type: "CARD",
          token: tokenData.data.id,
          installments: 1
        },
        reference,
        customer_data: {
          phone_number: paymentData.phone,
          full_name: paymentData.cardHolder
        }
      });

      const transactionData = await transactionResponse.json();
      
      console.log('Transaction response:', transactionData);
      
      // Wompi puede devolver PENDING, APPROVED o DECLINED
      if (transactionData.success && transactionData.data?.id) {
        const status = transactionData.data.status;
        
        if (status === "APPROVED" || status === "PENDING") {
          toast({
            title: "¡Pago procesado!",
            description: status === "APPROVED" ? "Tu compra ha sido aprobada" : "Tu pago está siendo procesado",
          });
          onSuccess?.(transactionData.data.id);
        } else {
          throw new Error(transactionData.data?.status_message || `Estado del pago: ${status}`);
        }
      } else {
        throw new Error(transactionData.message || "Error al crear la transacción");
      }

    } catch (error: any) {
      const errorMessage = error.message || "Error al procesar el pago";
      toast({
        title: "Error en el pago",
        description: errorMessage,
        variant: "destructive"
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
    <Card className="w-full max-w-md mx-auto bg-black border-gray-600">
      <CardHeader>
        <CardTitle className="text-gray-300 text-center">
          Pago Seguro con Wompi
        </CardTitle>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-300">
            {formatPrice(amount || 0)}
          </div>
          <div className="text-sm text-gray-400">
            Referencia: {reference}
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
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3"
          >
            {isLoading ? "Procesando..." : `Pagar con Tarjeta ${formatPrice(amount)}`}
          </Button>

          <div className="text-center text-gray-400 text-sm">o</div>
          
          <Button 
            onClick={() => window.open('https://checkout.wompi.co/l/VPOS_wRNRo4', '_blank')}
            variant="outline"
            className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-black font-semibold py-3"
          >
            Pagar con Checkout Wompi (Recomendado)
          </Button>
        </div>

        <div className="text-center text-xs text-gray-400">
          Pago seguro procesado por Wompi 🔒
        </div>
      </CardContent>
    </Card>
  );
}