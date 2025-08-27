import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";

interface WompiButtonProps {
  amount: number;
  currency?: string;
  reference: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  customerAddress?: {
    address: string;
    city: string;
    department: string;
    postalCode?: string;
  };
  redirectUrl?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export function WompiButton({
  amount,
  currency = "COP",
  reference,
  customerEmail,
  customerPhone,
  customerName,
  customerAddress,
  redirectUrl,
  onSuccess,
  onError
}: WompiButtonProps) {
  const [widgetConfig, setWidgetConfig] = useState<any>(null);
  const [customerData, setCustomerData] = useState({
    email: customerEmail || "",
    phone: customerPhone || "",
    fullName: customerName || ""
  });
  
  const { toast } = useToast();

  // Get widget configuration from server
  useEffect(() => {
    const getWidgetConfig = async () => {
      try {
        const response = await apiRequest("POST", "/api/wompi/widget-config", {
          amount_in_cents: Math.round(amount * 100),
          currency,
          reference,
          customer_data: {
            email: customerData.email,
            full_name: customerData.fullName,
            phone_number: customerData.phone,
            phone_number_prefix: "+57"
          },
          shipping_address: customerAddress ? {
            address_line_1: customerAddress.address,
            city: customerAddress.city,
            region: customerAddress.department,
            country: "CO",
            postal_code: customerAddress.postalCode || "",
            phone_number: customerData.phone
          } : undefined,
          redirect_url: redirectUrl || `${window.location.origin}/payment-success`,
          tax_in_cents: {
            vat: 0,
            consumption: 0
          }
        });

        const result = await response.json();
        
        if (result.success) {
          setWidgetConfig(result.data);
        } else {
          throw new Error(result.error || 'Failed to get widget configuration');
        }
      } catch (error: any) {
        console.error('Error getting widget config:', error);
        toast({
          title: "Error de configuración",
          description: "No se pudo configurar el widget de pagos.",
          variant: "destructive"
        });
      }
    };

    if (amount && reference && customerData.email) {
      getWidgetConfig();
    }
  }, [amount, currency, reference, customerData, customerAddress, redirectUrl, toast]);

  const handleWebCheckout = () => {
    if (!widgetConfig) {
      toast({
        title: "Configuración no lista",
        description: "La configuración del checkout aún no está lista.",
        variant: "destructive"
      });
      return;
    }

    // Create and submit form to Wompi checkout
    const form = document.createElement('form');
    form.action = 'https://checkout.wompi.co/p/';
    form.method = 'GET';
    form.target = '_blank';

    const fields = {
      'public-key': widgetConfig.publicKey,
      'currency': widgetConfig.currency,
      'amount-in-cents': widgetConfig.amountInCents.toString(),
      'reference': widgetConfig.reference,
      'signature:integrity': widgetConfig.signature,
      'redirect-url': widgetConfig.redirectUrl || '',
      'customer-data:email': widgetConfig.customerData?.email || '',
      'customer-data:full-name': widgetConfig.customerData?.full_name || '',
      'customer-data:phone-number': widgetConfig.customerData?.phone_number || '',
    };

    // Add shipping address if available
    if (widgetConfig.shippingAddress) {
      Object.assign(fields, {
        'shipping-address:address-line-1': widgetConfig.shippingAddress.address_line_1 || '',
        'shipping-address:city': widgetConfig.shippingAddress.city || '',
        'shipping-address:region': widgetConfig.shippingAddress.region || '',
        'shipping-address:country': widgetConfig.shippingAddress.country || 'CO',
        'shipping-address:phone-number': widgetConfig.shippingAddress.phone_number || '',
      });
    }

    // Create hidden inputs
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    // Add form to body, submit, and remove
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    toast({
      title: "Redirigiendo a Wompi",
      description: "Se abrirá el checkout oficial en una nueva pestaña.",
    });
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
        {/* Customer data form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email *</Label>
            <Input
              id="email"
              type="email"
              value={customerData.email}
              onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
              className="bg-black/60 border-gray-600 text-white"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-300">Nombre completo *</Label>
            <Input
              id="fullName"
              value={customerData.fullName}
              onChange={(e) => setCustomerData({...customerData, fullName: e.target.value})}
              className="bg-black/60 border-gray-600 text-white"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-300">Teléfono *</Label>
            <Input
              id="phone"
              type="tel"
              value={customerData.phone}
              onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
              className="bg-black/60 border-gray-600 text-white"
              placeholder="300 123 4567"
              required
            />
          </div>
        </div>

        {/* Wompi Widget Button (using data attributes method) */}
        {widgetConfig && (
          <div className="space-y-3">
            <div className="text-center text-sm text-gray-300 mb-3">
              Método de pago oficial de Wompi:
            </div>
            
            {/* Official Wompi Widget Button */}
            <form>
              <script
                src="https://checkout.wompi.co/widget.js"
                data-render="button"
                data-public-key={widgetConfig.publicKey}
                data-currency={widgetConfig.currency}
                data-amount-in-cents={widgetConfig.amountInCents}
                data-reference={widgetConfig.reference}
                data-signature:integrity={widgetConfig.signature}
                data-redirect-url={widgetConfig.redirectUrl}
                data-customer-data:email={widgetConfig.customerData?.email || ''}
                data-customer-data:full-name={widgetConfig.customerData?.full_name || ''}
                data-customer-data:phone-number={widgetConfig.customerData?.phone_number || ''}
                {...(widgetConfig.shippingAddress && {
                  'data-shipping-address:address-line-1': widgetConfig.shippingAddress.address_line_1,
                  'data-shipping-address:city': widgetConfig.shippingAddress.city,
                  'data-shipping-address:region': widgetConfig.shippingAddress.region,
                  'data-shipping-address:country': widgetConfig.shippingAddress.country,
                  'data-shipping-address:phone-number': widgetConfig.shippingAddress.phone_number,
                })}
              ></script>
            </form>

            <div className="text-center text-gray-400 text-sm">o</div>
            
            {/* Fallback Web Checkout Button */}
            <Button
              onClick={handleWebCheckout}
              disabled={!widgetConfig || !customerData.email || !customerData.fullName}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3"
            >
              🌐 Checkout Web Wompi (Alternativo)
            </Button>
          </div>
        )}

        <div className="text-center text-xs text-gray-400">
          Pago seguro procesado por Wompi 🔒
          <br />
          {widgetConfig ? '✅ Configuración lista' : '⏳ Cargando configuración...'}
        </div>
      </CardContent>
    </Card>
  );
}