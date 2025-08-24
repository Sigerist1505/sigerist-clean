import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ShoppingBag, Home, MessageCircle, RefreshCw } from "lucide-react";

export default function PaymentErrorPage() {
  const [location] = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const code = params.get("code");
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
    if (code) {
      setErrorCode(code);
    }
  }, [location]);

  const getErrorDetails = (error: string) => {
    if (error.includes("DECLINED") || error.includes("rechazado")) {
      return {
        title: "Pago Rechazado",
        description: "Tu banco no autorizó la transacción. Esto puede deberse a fondos insuficientes, límites de tarjeta o medidas de seguridad.",
        recommendations: [
          "Verifica que tengas fondos suficientes",
          "Contacta a tu banco para autorizar pagos en línea",
          "Intenta con otra tarjeta de crédito/débito",
          "Verifica los datos de la tarjeta (número, fecha, CVV)"
        ]
      };
    } else if (error.includes("insufficient_funds")) {
      return {
        title: "Fondos Insuficientes",
        description: "No hay suficiente saldo en tu tarjeta para completar esta compra.",
        recommendations: [
          "Verifica el saldo de tu tarjeta",
          "Intenta con otra tarjeta",
          "Reduce la cantidad de productos en tu carrito"
        ]
      };
    } else if (error.includes("invalid_card") || error.includes("invalid")) {
      return {
        title: "Datos de Tarjeta Inválidos",
        description: "Los datos ingresados no son correctos o la tarjeta no es válida.",
        recommendations: [
          "Verifica el número de tarjeta",
          "Revisa la fecha de vencimiento (MM/YY)",
          "Confirma el código CVV",
          "Asegúrate de que el nombre coincida con la tarjeta"
        ]
      };
    } else if (error.includes("expired_card")) {
      return {
        title: "Tarjeta Expirada",
        description: "La tarjeta que intentas usar ha expirado.",
        recommendations: [
          "Usa una tarjeta vigente",
          "Contacta a tu banco para renovar la tarjeta"
        ]
      };
    } else {
      return {
        title: "Error en el Pago",
        description: "Hubo un problema procesando tu pago con Wompi.",
        recommendations: [
          "Intenta nuevamente en unos minutos",
          "Verifica tu conexión a internet",
          "Usa el checkout recomendado de Wompi",
          "Contacta soporte si el problema persiste"
        ]
      };
    }
  };

  const errorDetails = getErrorDetails(errorMessage);

  return (
    <div className="min-h-screen pt-16 bg-black">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center py-16 bg-black border border-red-500/30">
          <CardContent>
            <XCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-red-400 mb-4">
              {errorDetails.title} ❌
            </h1>
            <p className="text-[#C0C0C0] mb-6 max-w-md mx-auto">
              {errorDetails.description}
            </p>
            
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-red-400 text-sm mb-2">
                🚫 Error procesando pago en Wompi
              </p>
              {errorCode && (
                <p className="text-red-400 text-xs">
                  Código: {errorCode}
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="bg-black/60 border border-[#C0C0C0]/20 rounded-lg p-4 mb-8 max-w-md mx-auto">
                <p className="text-sm text-[#C0C0C0] mb-2">Detalles del error:</p>
                <p className="text-red-400 font-mono text-sm break-all">
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="text-left max-w-md mx-auto mb-8">
              <h3 className="text-lg font-semibold text-[#ebc005] mb-3">
                ¿Qué puedes hacer?
              </h3>
              <ul className="space-y-2 text-[#C0C0C0] text-sm">
                {errorDetails.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#ebc005]">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/checkout">
                  <Button 
                    className="bg-[#ebc005] hover:bg-[#d4a804] text-black px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Intentar Nuevamente
                  </Button>
                </Link>

                <Button 
                  onClick={() => window.open(`https://wa.me/573160183418?text=Hola! Tuve problemas con el pago. Error: ${errorMessage}`, '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Contactar Soporte
                </Button>
              </div>

              <div className="pt-4">
                <Link href="/">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold w-full sm:w-auto"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Volver al Inicio
                  </Button>
                </Link>
                
                <Link href="/productos">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-[#C0C0C0]/30 text-[#C0C0C0] hover:text-[#ebc005] hover:border-[#ebc005] w-full sm:w-auto ml-0 sm:ml-4"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Seguir Comprando
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#C0C0C0]/20">
              <h3 className="text-lg font-semibold text-[#ebc005] mb-4">
                💡 Recomendación: Usa Checkout Wompi
              </h3>
              <div className="text-[#C0C0C0] space-y-2 text-sm">
                <p>Para mayor seguridad y compatibilidad, te recomendamos usar el checkout oficial de Wompi.</p>
                <Button 
                  onClick={() => window.open('https://checkout.wompi.co/l/VPOS_wRNRo4', '_blank')}
                  variant="outline"
                  className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-black font-semibold mt-3"
                >
                  🌟 Ir a Checkout Wompi
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm text-[#C0C0C0]">
                ¿Necesitas ayuda? Contáctanos por WhatsApp:
              </p>
              <a 
                href="https://wa.me/573160183418" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#ebc005] hover:text-[#d4a804] font-medium"
              >
                +57 316 018 3418
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}