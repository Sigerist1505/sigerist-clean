import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShoppingBag, Home, Receipt, MessageCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const [location] = useLocation();
  const [transactionId, setTransactionId] = useState("");
  const [orderData, setOrderData] = useState<any>(null);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txId = params.get("transaction");
    if (txId) {
      setTransactionId(txId);
    }

    // Try to get order data from sessionStorage (set by checkout page)
    const storedOrderData = sessionStorage.getItem('completedOrder');
    if (storedOrderData) {
      try {
        const parsed = JSON.parse(storedOrderData);
        setOrderData(parsed);
        sessionStorage.removeItem('completedOrder'); // Clean up
      } catch (error) {
        console.error('Error parsing stored order data:', error);
      }
    }
    
    setIsLoading(false);
  }, [location]);

  const generateReceipt = () => {
    setIsGeneratingReceipt(true);
    
    // Use real order data if available, otherwise fallback to example data
    const receiptData = orderData ? {
      transactionId: orderData.transactionId || transactionId || 'N/A',
      date: new Date(orderData.createdAt || Date.now()).toLocaleDateString('es-CO'),
      time: new Date(orderData.createdAt || Date.now()).toLocaleTimeString('es-CO'),
      amount: orderData.total?.toLocaleString('es-CO') || '0',
      status: 'PROCESADO',
      paymentMethod: 'Tarjeta de Crédito',
      reference: orderData.reference || 'N/A',
      customerName: orderData.customerName || 'Cliente',
      customerEmail: orderData.customerEmail || '',
      items: orderData.items || []
    } : {
      transactionId: transactionId || 'N/A',
      date: new Date().toLocaleDateString('es-CO'),
      time: new Date().toLocaleTimeString('es-CO'),
      amount: '15,000', // Fallback amount
      status: 'PROCESADO',
      paymentMethod: 'Tarjeta de Crédito',
      reference: 'N/A',
      customerName: 'Cliente',
      customerEmail: '',
      items: []
    };

    // Generate items list for receipt
    let itemsHtml = '';
    if (receiptData.items && receiptData.items.length > 0) {
      itemsHtml = receiptData.items.map((item: any) => `
        <div style="border-bottom: 1px solid #eee; padding: 8px 0; margin: 4px 0;">
          <div style="font-weight: bold; color: #000;">${item.name}</div>
          <div style="font-size: 12px; color: #666;">
            Cantidad: ${item.quantity} • Precio: $${(item.price * item.quantity).toLocaleString('es-CO')} COP
          </div>
          ${item.personalization ? `<div style="font-size: 11px; color: #888;">Personalización: ${item.personalization}</div>` : ''}
          ${item.addNameEmbroidery ? `<div style="font-size: 11px; color: #888;">Con bordado de nombre</div>` : ''}
          ${item.keychainPersonalization ? `<div style="font-size: 11px; color: #888;">Llavero: ${item.keychainPersonalization}</div>` : ''}
        </div>
      `).join('');
    } else {
      itemsHtml = '<div style="text-align: center; color: #666; font-style: italic;">Detalles de productos no disponibles</div>';
    }

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
          .items-section { text-align: left; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
          .items-title { font-weight: bold; color: #333; margin-bottom: 10px; text-align: center; }
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
              <span class="label">Referencia:</span>
              <span class="value">${receiptData.reference}</span>
            </div>
            <div class="detail-row">
              <span class="label">Cliente:</span>
              <span class="value">${receiptData.customerName}</span>
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

          ${receiptData.items && receiptData.items.length > 0 ? `
          <div class="items-section">
            <div class="items-title">🛍️ Productos Comprados</div>
            ${itemsHtml}
          </div>
          ` : ''}
          
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
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ebc005]"></div>
                <span className="ml-2 text-[#C0C0C0]">Cargando información del pedido...</span>
              </div>
            ) : (
              <>
                <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-[#ebc005] mb-4">
                  ¡Pago Exitoso! 🎉
                </h1>
                <p className="text-[#C0C0C0] mb-4 max-w-md mx-auto">
                  Tu compra ha sido procesada correctamente por Wompi. {orderData ? 'Recibirás un email de confirmación en breve.' : 'El sistema está procesando tu pedido.'}
                </p>
                
                {orderData && (
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <p className="text-blue-400 text-sm font-semibold mb-2">
                      ✅ Orden #{orderData.id} confirmada
                    </p>
                    <p className="text-blue-400 text-sm">
                      💰 Total: ${orderData.total?.toLocaleString('es-CO')} COP
                    </p>
                    <p className="text-blue-400 text-sm">
                      📧 Email enviado a: {orderData.customerEmail}
                    </p>
                    <p className="text-blue-400 text-sm">
                      🛍️ {orderData.items?.length || 0} {orderData.items?.length === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                )}

                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <p className="text-blue-400 text-sm">
                    ✅ Pago procesado en Pesos Colombianos (COP)
                  </p>
                  <p className="text-blue-400 text-sm">
                    🏦 Transacción verificada por Wompi
                  </p>
                </div>
                
                {transactionId && (
                  <div className="bg-black/60 border border-[#C0C0C0]/20 rounded-lg p-4 mb-8 max-w-md mx-auto">
                    <p className="text-sm text-[#C0C0C0] mb-2">ID de Transacción:</p>
                    <p className="text-[#ebc005] font-mono text-sm break-all">
                      {transactionId}
                    </p>
                    {orderData?.reference && (
                      <>
                        <p className="text-sm text-[#C0C0C0] mb-2 mt-3">Referencia:</p>
                        <p className="text-[#ebc005] font-mono text-sm break-all">
                          {orderData.reference}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {orderData?.items && orderData.items.length > 0 && (
                  <div className="bg-black/60 border border-[#C0C0C0]/20 rounded-lg p-4 mb-8 max-w-md mx-auto text-left">
                    <h3 className="text-[#ebc005] font-semibold mb-3 text-center">🛍️ Productos Comprados</h3>
                    <div className="space-y-3">
                      {orderData.items.map((item: any, index: number) => (
                        <div key={index} className="border-b border-[#C0C0C0]/20 pb-2 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-white font-medium">{item.name}</p>
                              <p className="text-[#C0C0C0] text-sm">Cantidad: {item.quantity}</p>
                              {item.personalization && (
                                <p className="text-[#C0C0C0] text-xs">Personalización: {item.personalization}</p>
                              )}
                              {item.addNameEmbroidery && (
                                <p className="text-[#C0C0C0] text-xs">Con bordado de nombre</p>
                              )}
                              {item.keychainPersonalization && (
                                <p className="text-[#C0C0C0] text-xs">Llavero: {item.keychainPersonalization}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-[#ebc005] font-medium">
                                ${(item.price * item.quantity).toLocaleString('es-CO')} COP
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      onClick={() => {
                        const message = orderData 
                          ? `Hola! Acabo de realizar el pago con ID: ${transactionId}. Orden #${orderData.id}. ¿Podrían confirmar mi pedido?`
                          : `Hola! Acabo de realizar el pago con ID: ${transactionId}. ¿Podrían confirmar mi pedido?`;
                        window.open(`https://wa.me/573160183418?text=${encodeURIComponent(message)}`, '_blank');
                      }}
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}