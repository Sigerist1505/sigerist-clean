import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShoppingBag, Home, Receipt, MessageCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const [location] = useLocation();
  const [transactionId, setTransactionId] = useState("");
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txId = params.get("transaction");
    if (txId) {
      setTransactionId(txId);
    }
  }, [location]);

  const generateReceipt = () => {
    setIsGeneratingReceipt(true);
    
    const receiptData = {
      transactionId: transactionId || 'N/A',
      date: new Date().toLocaleDateString('es-CO'),
      time: new Date().toLocaleTimeString('es-CO'),
      amount: '15,000', // Ejemplo del último pago
      status: 'PROCESADO',
      paymentMethod: 'Tarjeta de Crédito'
    };

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Comprobante de Pago - Sigerist</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
          .receipt { background: white; border: 2px solid #000; border-radius: 10px; padding: 30px; text-align: center; }
          .header { border-bottom: 3px solid #ffd000; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #000; }
          .subtitle { color: #666; font-style: italic; margin-top: 5px; }
          .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .details { text-align: left; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #333; }
          .value { color: #000; }
          .amount { background: #ffd000; color: #000; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; margin: 20px 0; }
          .footer { border-top: 2px solid #ffd000; padding-top: 15px; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">SIGERIST</div>
            <div class="subtitle">Luxury Bags</div>
            <div style="margin-top: 10px; font-size: 18px; font-weight: bold;">COMPROBANTE DE PAGO</div>
          </div>
          
          <div class="success">
            ✅ PAGO PROCESADO EXITOSAMENTE
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">ID Transacción:</span>
              <span class="value">${receiptData.transactionId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fecha:</span>
              <span class="value">${receiptData.date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Hora:</span>
              <span class="value">${receiptData.time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Método de Pago:</span>
              <span class="value">${receiptData.paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span class="label">Estado:</span>
              <span class="value">${receiptData.status}</span>
            </div>
          </div>
          
          <div class="amount">
            $${receiptData.amount} COP
          </div>
          
          <div class="footer">
            <p><strong>Gracias por tu compra</strong></p>
            <p>Sigerist Luxury Bags</p>
            <p>WhatsApp: +57 3160183418</p>
            <p>Email: daniel.sigerist101@gmail.com</p>
            <p style="margin-top: 15px; font-size: 10px;">
              Este comprobante es válido como prueba de pago.<br>
              Conservar para cualquier reclamación.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
    }
    
    setIsGeneratingReceipt(false);
  };

  return (
    <div className="min-h-screen pt-16 bg-black">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center py-16 bg-black border border-[#C0C0C0]/30">
          <CardContent>
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[#ebc005] mb-4">
              ¡Pago Exitoso! 🎉
            </h1>
            <p className="text-[#C0C0C0] mb-4 max-w-md mx-auto">
              Tu compra ha sido procesada correctamente por Wompi. Recibirás un email de confirmación en breve.
            </p>
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-green-400 text-sm">
                ✅ Pago procesado en Pesos Colombianos (COP)
              </p>
              <p className="text-green-400 text-sm">
                🏦 Transacción verificada por Wompi
              </p>
            </div>
            
            {transactionId && (
              <div className="bg-black/60 border border-[#C0C0C0]/20 rounded-lg p-4 mb-8 max-w-md mx-auto">
                <p className="text-sm text-[#C0C0C0] mb-2">ID de Transacción:</p>
                <p className="text-[#ebc005] font-mono text-sm break-all">
                  {transactionId}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => window.open(`https://wa.me/573160183418?text=Hola! Acabo de realizar el pago con ID: ${transactionId}. ¿Podrían confirmar mi pedido?`, '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Contactar por WhatsApp
                </Button>

                <Button 
                  onClick={generateReceipt}
                  disabled={isGeneratingReceipt}
                  className="bg-[#ebc005] hover:bg-[#d4a804] text-black px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Receipt className="h-5 w-5" />
                  {isGeneratingReceipt ? 'Generando...' : 'Descargar Comprobante'}
                </Button>
              </div>

              <div className="pt-4">
                <Link href="/">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-[#ebc005] to-[#d4a804] text-black hover:from-[#d4a804] hover:to-[#b8950b] font-bold w-full sm:w-auto"
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
                Información de Entrega
              </h3>
              <div className="text-[#C0C0C0] space-y-2 text-sm">
                <p>• Servicio estándar: 15-20 días hábiles</p>
                <p>• Servicio express: 5-8 días hábiles (+$15,000)</p>
                <p>• Recibirás un email con el seguimiento de tu pedido</p>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm text-[#C0C0C0]">
                ¿Tienes preguntas? Contáctanos por WhatsApp:
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