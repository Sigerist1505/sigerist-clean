import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatPrice, openWhatsApp } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@shared/schema";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ isOpen, onClose }: CartProps) {
  const {
    items,
    total,
    itemCount,
    updateItem,
    removeItem,
    clearCart,
    isLoading,
  } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleWhatsAppOrder = () => {
    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de realizar el pedido",
        variant: "destructive",
      });
      return;
    }

    let message = `🛍️ *Hola! Quiero realizar un pedido de Sigerist*\n\n`;
    message += `📦 *Productos:*\n`;

    items.forEach((item) => {
      message += `• ${item.name}\n`;
      message += `  Cantidad: ${item.quantity}\n`;
      message += `  Precio: ${formatPrice(item.price)}\n`;
      if (item.personalization) message += `  Personalización: ${item.personalization}\n`;
      if (item.addNameEmbroidery) message += `  Bordado de nombre incluido\n`;
      if (item.keychainPersonalization) message += `  Llavero personalizado: ${item.keychainPersonalization}\n`;
      message += `\n`;
    });

    message += `💰 *Total: ${formatPrice(total)}*\n\n`;
    message += `¡Gracias por elegir Sigerist! 🌟`;

    openWhatsApp("573000000000", message); // Reemplaza con tu número real
    toast({
      title: "Redirigiendo a WhatsApp",
      description: "Te hemos preparado el mensaje con tu pedido",
    });
  };

  const handleQuantityChange = (itemId: number | undefined, newQuantity: number) => {
    if (newQuantity < 1) {
      toast({
        title: "Cantidad inválida",
        description: "La cantidad no puede ser menor a 1",
        variant: "destructive",
      });
      return;
    }
    if (itemId) updateItem(itemId, newQuantity);
  };

  if (isLoading) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div> {/* Ajuste temporal si border-sigerist-gold no está definido */}
              <p>Cargando carrito...</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Carrito de Compras</span>
            {itemCount > 0 && <Badge variant="secondary">{itemCount} productos</Badge>}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-500 mb-4">
                  Explora nuestros productos y encuentra tu bolso perfecto
                </p>
                <Button onClick={onClose} variant="outline">
                  Continuar Comprando
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 py-4">
                  {items.map((item: CartItem) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex gap-4">
                        <img
                          src={item.imageUrl || "/assets/placeholder.jpg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/assets/placeholder.jpg";
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <p className="text-sm text-gray-500 mb-2">{formatPrice(item.price)}</p>
                          {item.personalization && (
                            <p className="text-xs text-gray-600 mb-1">{item.personalization}</p>
                          )}
                          {item.addNameEmbroidery && (
                            <p className="text-xs text-gray-600 mb-1">✨ Bordado de nombre incluido</p>
                          )}
                          {item.keychainPersonalization && (
                            <p className="text-xs text-gray-600 mb-1">Llavero: {item.keychainPersonalization}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => {
                                if (item.id) {
                                  removeItem(item.id);
                                  toast({
                                    title: "Producto eliminado",
                                    description: `${item.name} ha sido removido del carrito`,
                                  });
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-xl">{formatPrice(total)}</span>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    disabled={isCheckingOut}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Pedir por WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearCart();
                      toast({
                        title: "Carrito vaciado",
                        description: "Todos los productos han sido eliminados",
                      });
                    }}
                    className="w-full"
                  >
                    Vaciar Carrito
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Al continuar, serás redirigido a WhatsApp para completar tu pedido
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}