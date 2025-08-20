import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getSessionId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type CartItemWithProduct = {
  id: number;
  productId: number;
  quantity: number;
  price: number; // <-- Asegúrate de incluir el campo price aquí
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
    // ...otros campos relevantes
  };
  // ...otros campos si los tienes
};

interface AddToCartData {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  personalization?: string;
  addPompon?: boolean;
  addPersonalizedKeychain?: boolean;
  addDecorativeBow?: boolean;
  addNameEmbroidery?: boolean;
  expressService?: boolean;
  keychainPersonalization?: string;
  hasBordado?: boolean;
  specifications?: {
    bordado?: boolean;
    llavero?: boolean;
    mono?: boolean;
    pompon?: boolean;
    nombreBordado?: boolean;
    servicioExpress?: boolean;
    personalizacion?: string;
  };
}

export function useCart() {
  const [sessionId] = useState(() => getSessionId());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cart items (con producto relacionado)
  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/cart/${sessionId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch cart: ${response.status} - ${errorText}`);
      }
      return response.json() as Promise<CartItemWithProduct[]>;
    },
    retry: 1,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (data: AddToCartData) => {
      const response = await apiRequest('POST', '/api/cart', {
        ...data,
        sessionId,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
      toast({
        title: "Producto agregado",
        description: "El producto se agregó correctamente al carrito",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const response = await apiRequest('PUT', `/api/cart/${id}`, { quantity });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/cart/${id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/cart/session/${sessionId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  // Totals: usa el precio personalizado del ítem si existe
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price ?? item.product?.price ?? 0) * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return {
    cartItems,
    cartTotal,
    cartCount,
    isLoading,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeItem: removeItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    sessionId,
  };
}