import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";

// Extend global Window interface to include WidgetCheckout
declare global {
  interface Window {
    WidgetCheckout: any;
  }
}

interface WompiWidgetProps {
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

export function WompiWidget({
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
}: WompiWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<any>(null);
  const [useWidget, setUseWidget] = useState(true);
  const [customerData, setCustomerData] = useState({
    email: customerEmail || "",
    phone: customerPhone || "",
    fullName: customerName || ""
  });
  
  const { toast } = useToast();
  const widgetLoaded = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Load Wompi Widget script
  useEffect(() => {
    if (widgetLoaded.current) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://checkout.wompi.co/widget.js"]');
    if (existingScript) {
      widgetLoaded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.type = 'text/javascript';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      widgetLoaded.current = true;
      console.log('Wompi Widget script loaded successfully');
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Wompi Widget script:', error);
      // Fallback: still allow Web Checkout to work
      widgetLoaded.current = false;
      toast({
        title: "Script no disponible",
        description: "El Widget no se pudo cargar, pero puedes usar el Checkout Web.",
        variant: "destructive"
      });
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount - but keep script for other components
    };
  }, [toast]);

  // Use memo to prevent infinite loops
  const effectiveEmail = useMemo(() => customerData.email || customerEmail, [customerData.email, customerEmail]);
  const effectiveName = useMemo(() => customerData.fullName || customerName, [customerData.fullName, customerName]);
  const effectivePhone = useMemo(() => customerData.phone || customerPhone, [customerData.phone, customerPhone]);
  
  // Memoize customerAddress to prevent infinite loops
  const memoizedCustomerAddress = useMemo(() => customerAddress, [
    customerAddress?.address,
    customerAddress?.city,
    customerAddress?.department,
    customerAddress?.postalCode
  ]);

  // Memoize redirect URL
  const memoizedRedirectUrl = useMemo(() => 
    redirectUrl || `${window.location.origin}/payment-success`, 
    [redirectUrl]
  );

  // Get widget configuration from server
  const getWidgetConfig = useCallback(async () => {
    try {
      const response = await apiRequest("POST", "/api/wompi/widget-config", {
        amount_in_cents: Math.round(amount * 100),
        currency,
        reference,
        customer_data: {
          email: effectiveEmail || "",
          full_name: effectiveName || "",
          phone_number: effectivePhone || "",
          phone_number_prefix: "+57"
        },
        shipping_address: memoizedCustomerAddress ? {
          address_line_1: memoizedCustomerAddress.address,
          city: memoizedCustomerAddress.city,
          region: memoizedCustomerAddress.department,
          country: "CO",
          postal_code: memoizedCustomerAddress.postalCode || "",
          phone_number: effectivePhone || ""
        } : undefined,
        redirect_url: memoizedRedirectUrl,
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
  }, [amount, currency, reference, effectiveEmail, effectiveName, effectivePhone, memoizedCustomerAddress, memoizedRedirectUrl, toast]);

  useEffect(() => {
    // Only fetch config once when we have the required data
    if (amount && reference && effectiveEmail && effectiveName && !widgetConfig) {
      getWidgetConfig();
    }
  }, [amount, reference, effectiveEmail, effectiveName, widgetConfig, getWidgetConfig]);

  const handleOpenWidget = () => {
    if (!widgetConfig) {
      toast({
        title: "Configuración no lista",
        description: "La configuración del widget aún no está lista. Intenta nuevamente.",
        variant: "destructive"
      });
      return;
    }

    if (!window.WidgetCheckout) {
      // Fallback to Web Checkout if Widget is not available
      toast({
        title: "Widget no disponible",
        description: "Redirigiendo al Checkout Web de Wompi...",
      });
      handleWebCheckout();
      return;
    }

    setIsLoading(true);

    try {
      const checkout = new window.WidgetCheckout({
        currency: widgetConfig.currency,
        amountInCents: widgetConfig.amountInCents,
        reference: widgetConfig.reference,
        publicKey: widgetConfig.publicKey,
        signature: { integrity: widgetConfig.signature },
        redirectUrl: widgetConfig.redirectUrl,
        customerData: widgetConfig.customerData,
        shippingAddress: widgetConfig.shippingAddress
      });

      checkout.open((result: any) => {
        setIsLoading(false);
        
        if (result.transaction) {
          const transaction = result.transaction;
          console.log("Transaction result:", transaction);
          
          toast({
            title: "¡Pago procesado!",
            description: `Transacción ${transaction.id} - Estado: ${transaction.status}`,
          });

          if (onSuccess) {
            onSuccess(transaction.id);
          }
        } else if (result.error) {
          console.error("Widget error:", result.error);
          toast({
            title: "Error en el pago",
            description: result.error.message || "Ocurrió un error durante el pago",
            variant: "destructive"
          });

          if (onError) {
            onError(result.error.message || "Payment failed");
          }
        }
      });
    } catch (error: any) {
      setIsLoading(false);
      console.error("Error opening widget:", error);
      toast({
        title: "Error del Widget",
        description: "No se pudo abrir el widget. Usa el Checkout Web.",
        variant: "destructive"
      });
      // Fallback to Web Checkout
      handleWebCheckout();
    }
  };

  const handleWebCheckout = () => {
    if (!widgetConfig) {
      toast({
        title: "Configuración no lista",
        description: "La configuración del checkout aún no está lista.",
        variant: "destructive"
      });
      return;
    }

    // Submit the form to Wompi's checkout
    if (formRef.current) {
      formRef.current.submit();
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
        {/* Customer data form - only show if not provided */}
        {(!customerEmail || !customerName || !customerPhone) ? (
          <div className="space-y-4">
            {!customerEmail && (
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
            )}

            {!customerName && (
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
            )}

            {!customerPhone && (
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
            )}
            
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-gray-300 font-medium mb-3">💳 Continúa con el pago</h3>
            </div>
          </div>
        ) : (
          /* Customer data summary when provided */
          <div className="space-y-4">
            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
              <h3 className="text-green-300 font-medium mb-3">✅ Información del Cliente</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">📧</span>
                  <span>{customerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">👤</span>
                  <span>{customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">📱</span>
                  <span>{customerPhone}</span>
                </div>
                {customerAddress && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">📍</span>
                    <span>{customerAddress.city}, {customerAddress.department}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-gray-300 font-medium mb-3">💳 Procesar Pago</h3>
              <p className="text-sm text-gray-400 mb-3">Solo necesitas elegir tu método de pago preferido</p>
            </div>
          </div>
        )}

        {/* Payment method toggle */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="widget-method"
              name="payment-method"
              checked={useWidget}
              onChange={() => setUseWidget(true)}
              className="text-yellow-400"
            />
            <Label htmlFor="widget-method" className="text-gray-300">Widget de pago (en esta página)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="checkout-method"
              name="payment-method"
              checked={!useWidget}
              onChange={() => setUseWidget(false)}
              className="text-yellow-400"
            />
            <Label htmlFor="checkout-method" className="text-gray-300">Checkout Wompi (redirección)</Label>
          </div>
        </div>

        {/* Payment buttons */}
        <div className="space-y-3">
          {useWidget ? (
            <Button
              onClick={handleOpenWidget}
              disabled={isLoading || !widgetConfig || !effectiveEmail || !effectiveName}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-3"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Abriendo Widget...
                </div>
              ) : (
                `🛡️ Pagar ${formatPrice(amount)} con Widget`
              )}
            </Button>
          ) : (
            <Button
              onClick={handleWebCheckout}
              disabled={!widgetConfig || !effectiveEmail || !effectiveName}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3"
            >
              🌐 Ir a Checkout Wompi
            </Button>
          )}
        </div>

        {/* Hidden form for Web Checkout */}
        {widgetConfig && (
          <form
            ref={formRef}
            action="https://checkout.wompi.co/p/"
            method="GET"
            style={{ display: 'none' }}
          >
            <input type="hidden" name="public-key" value={widgetConfig.publicKey} />
            <input type="hidden" name="currency" value={widgetConfig.currency} />
            <input type="hidden" name="amount-in-cents" value={widgetConfig.amountInCents} />
            <input type="hidden" name="reference" value={widgetConfig.reference} />
            <input type="hidden" name="signature:integrity" value={widgetConfig.signature} />
            {widgetConfig.redirectUrl && (
              <input type="hidden" name="redirect-url" value={widgetConfig.redirectUrl} />
            )}
            {(widgetConfig.customerData?.email || effectiveEmail) && (
              <input type="hidden" name="customer-data:email" value={widgetConfig.customerData?.email || effectiveEmail} />
            )}
            {(widgetConfig.customerData?.full_name || effectiveName) && (
              <input type="hidden" name="customer-data:full-name" value={widgetConfig.customerData?.full_name || effectiveName} />
            )}
            {(widgetConfig.customerData?.phone_number || effectivePhone) && (
              <input type="hidden" name="customer-data:phone-number" value={widgetConfig.customerData?.phone_number || effectivePhone} />
            )}
            {widgetConfig.shippingAddress?.address_line_1 && (
              <input type="hidden" name="shipping-address:address-line-1" value={widgetConfig.shippingAddress.address_line_1} />
            )}
            {widgetConfig.shippingAddress?.city && (
              <input type="hidden" name="shipping-address:city" value={widgetConfig.shippingAddress.city} />
            )}
            {widgetConfig.shippingAddress?.region && (
              <input type="hidden" name="shipping-address:region" value={widgetConfig.shippingAddress.region} />
            )}
            {widgetConfig.shippingAddress?.country && (
              <input type="hidden" name="shipping-address:country" value={widgetConfig.shippingAddress.country} />
            )}
            {widgetConfig.shippingAddress?.phone_number && (
              <input type="hidden" name="shipping-address:phone-number" value={widgetConfig.shippingAddress.phone_number} />
            )}
          </form>
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