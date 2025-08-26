import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { WompiWidget } from "@/components/wompi-widget";
import { WompiOfficial } from "@/components/wompi-official";

export default function WompiDemoPage() {
  const { toast } = useToast();
  const [selectedComponent, setSelectedComponent] = useState<'advanced' | 'official'>('official');
  const amount = 150000; // Ejemplo de monto
  const reference = `SIGERIST-DEMO-${Date.now()}`;

  const handlePaymentSuccess = (transactionId: string) => {
    toast({
      title: "¡Demo exitoso! ✅",
      description: `Transacción demo completada. ID: ${transactionId}`,
    });
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Error en demo",
      description: `Error en la demostración: ${error}`,
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen pt-16 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#ebc005] flex items-center gap-3">
              <CreditCard className="h-8 w-8" />
              Demo: Wompi Widget & Checkout
            </h1>
            <p className="text-[#C0C0C0] mt-2">
              Demo de integración oficial de Wompi • Total: {formatPrice(amount)}
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-[#C0C0C0]/30 text-[#C0C0C0] hover:text-[#ebc005] hover:border-[#ebc005]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
        </div>

        {/* Component Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={() => setSelectedComponent('official')}
              variant={selectedComponent === 'official' ? 'default' : 'outline'}
              className={selectedComponent === 'official' ? 'bg-yellow-600 text-black' : 'border-gray-600 text-gray-300'}
            >
              🛡️ Widget Oficial
            </Button>
            <Button
              onClick={() => setSelectedComponent('advanced')}
              variant={selectedComponent === 'advanced' ? 'default' : 'outline'}
              className={selectedComponent === 'advanced' ? 'bg-yellow-600 text-black' : 'border-gray-600 text-gray-300'}
            >
              ⚙️ Widget Avanzado
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#ebc005] text-black flex items-center justify-center font-bold text-sm">
                1
              </div>
              <span className="text-[#C0C0C0]">Producto Demo</span>
            </div>
            <div className="w-12 h-0.5 bg-[#ebc005]"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#ebc005] text-black flex items-center justify-center font-bold text-sm">
                2
              </div>
              <span className="text-[#ebc005] font-semibold">Pago con Wompi</span>
            </div>
            <div className="w-12 h-0.5 bg-[#C0C0C0]/30"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#C0C0C0]/30 text-[#C0C0C0] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="text-[#C0C0C0]">Resultado</span>
            </div>
          </div>
        </div>

        {/* Wompi Component Demo */}
        <div className="flex justify-center">
          {selectedComponent === 'official' ? (
            <WompiOfficial
              amount={amount}
              reference={reference}
              customerEmail="demo@sigerist.com"
              customerPhone="3160183418"
              customerName="Demo Usuario"
              customerAddress={{
                address: "Carrera 123 # 45-67",
                city: "Bogotá",
                department: "Cundinamarca",
                postalCode: "110111"
              }}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          ) : (
            <WompiWidget
              amount={amount}
              reference={reference}
              customerEmail="demo@sigerist.com"
              customerPhone="3160183418"
              customerName="Demo Usuario"
              customerAddress={{
                address: "Carrera 123 # 45-67",
                city: "Bogotá",
                department: "Cundinamarca",
                postalCode: "110111"
              }}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </div>

        {/* Information Card */}
        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="bg-gray-900 border-gray-600">
            <CardHeader>
              <CardTitle className="text-yellow-400">
                📖 {selectedComponent === 'official' ? 'Widget Oficial' : 'Widget Avanzado'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              {selectedComponent === 'official' ? (
                <>
                  <p><strong>Widget Oficial:</strong> Renderiza el botón oficial de Wompi usando script tags</p>
                  <p><strong>Método:</strong> data-render="button" con atributos data-*</p>
                  <p><strong>Ventajas:</strong> Implementación directa según documentación</p>
                  <p><strong>Fallback:</strong> Web Checkout si el widget no carga</p>
                </>
              ) : (
                <>
                  <p><strong>Widget Avanzado:</strong> Control programático con JavaScript</p>
                  <p><strong>Método:</strong> new WidgetCheckout() con configuración completa</p>
                  <p><strong>Ventajas:</strong> Mayor control y manejo de eventos</p>
                  <p><strong>Opciones:</strong> Widget y Web Checkout intercambiables</p>
                </>
              )}
              <p><strong>Firma de integridad:</strong> SHA256 generada automáticamente</p>
              <p><strong>Configuración:</strong> Usando credenciales de producción</p>
              <div className="pt-3 border-t border-gray-600">
                <p className="text-sm text-gray-400">
                  Ambas integraciones siguen la documentación oficial de Wompi y utilizan
                  los métodos recomendados según las mejores prácticas.
                </p>
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
              <span className="text-[#C0C0C0] text-sm">Integración Oficial</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[#C0C0C0] text-sm">Pago Seguro</span>
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
          <p>Demo de integración con Wompi siguiendo la documentación oficial.</p>
          <p className="mt-1">
            {selectedComponent === 'official' ? 'Widget oficial' : 'Widget avanzado'} implementado según las mejores prácticas.
          </p>
        </div>
      </div>
    </div>
  );
}