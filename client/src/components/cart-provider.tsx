import { createContext, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getSessionId } from "@/lib/utils";
import type { CartItem, InsertCartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  total: number;
  itemCount: number;
  discountCode: string | null;
  discountAmount: number;
  finalTotal: number;
}

type CartAction =
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_ITEM"; payload: { id: number; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "CLEAR_CART" }
  | { type: "APPLY_DISCOUNT"; payload: { code: string; percentage: number } }
  | { type: "REMOVE_DISCOUNT" };

const initialState: CartState = {
  items: [],
  isLoading: false,
  total: 0,
  itemCount: 0,
  discountCode: null,
  discountAmount: 0,
  finalTotal: 0,
};

function calculateTotals(items: CartItem[], discountCode: string | null) {
  const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const discountAmount = discountCode ? (total * 10) / 100 : 0;
  const finalTotal = total - discountAmount;

  return { total, itemCount, discountAmount, finalTotal };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  let newState = { ...state };
  switch (action.type) {
    case "SET_ITEMS":
      const { total, itemCount, discountAmount, finalTotal } = calculateTotals(action.payload, state.discountCode);
      return { ...state, items: action.payload, total, itemCount, discountAmount, finalTotal };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "ADD_ITEM":
      const newItemsAdd = [...state.items, action.payload];
      const addTotals = calculateTotals(newItemsAdd, state.discountCode);
      return { ...state, items: newItemsAdd, ...addTotals };

    case "UPDATE_ITEM":
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      );
      const updateTotals = calculateTotals(updatedItems, state.discountCode);
      return { ...state, items: updatedItems, ...updateTotals };

    case "REMOVE_ITEM":
      const filteredItems = state.items.filter((item) => item.id !== action.payload);
      const totals = calculateTotals(filteredItems, state.discountCode);
      return { ...state, items: filteredItems, ...totals };

    case "CLEAR_CART":
      return { ...initialState };

    case "APPLY_DISCOUNT":
      const applyTotals = calculateTotals(state.items, action.payload.code);
      return {
        ...state,
        discountCode: action.payload.code,
        ...applyTotals,
      };

    case "REMOVE_DISCOUNT":
      const removeTotals = calculateTotals(state.items, null);
      return {
        ...state,
        discountCode: null,
        ...removeTotals,
      };

    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addItem: (item: InsertCartItem) => void;
  updateItem: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  applyDiscount: (code: string, percentage: number) => void;
  removeDiscount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const sessionId = getSessionId();

  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/cart/${sessionId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch cart: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      return data as CartItem[];
    },
    retry: 1,
    staleTime: 5000, // Cache for 5 seconds to prevent excessive refetching
  });

  // Calculate totals from the query data directly
  const totals = calculateTotals(cartItems, null); // We'll handle discount separately for now
  const [discountState, setDiscountState] = useState<{code: string | null, amount: number}>({
    code: null,
    amount: 0
  });

  const finalTotals = discountState.code 
    ? {
        ...totals,
        discountAmount: (totals.total * 15) / 100,
        finalTotal: totals.total - (totals.total * 15) / 100
      }
    : {...totals, discountAmount: 0, finalTotal: totals.total};

  const addItemMutation = useMutation({
    mutationFn: async (item: InsertCartItem) => {
      const response = await apiRequest("POST", "/api/cart", {
        ...item,
        price: Number(item.price), // Forzar conversión a número
        sessionId,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      return response.json() as Promise<CartItem[]>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
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

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      return response.json() as Promise<CartItem[]>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/cart/${id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      return response.json() as Promise<CartItem[]>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito",
      });
      // If cart is empty after removing item, redirect to home page
      if (cartItems.length <= 1) {
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/cart/session/${sessionId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      return response.json() as Promise<CartItem[]>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
      toast({
        title: "Carrito vaciado",
        description: "El carrito ha sido vaciado correctamente",
      });
      // Redirect to home page after clearing cart
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito",
        variant: "destructive",
      });
    },
  });

  const addItem = (item: InsertCartItem) => {
    addItemMutation.mutate(item);
  };

  const updateItem = (id: number, quantity: number) => {
    updateItemMutation.mutate({ id, quantity });
  };

  const removeItem = (id: number) => {
    removeItemMutation.mutate(id);
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  const applyDiscount = (code: string, percentage: number) => {
    setDiscountState({ code, amount: percentage });
  };

  const removeDiscount = () => {
    setDiscountState({ code: null, amount: 0 });
  };

  const value: CartContextType = {
    items: cartItems,
    isLoading,
    total: finalTotals.total,
    itemCount: finalTotals.itemCount,
    discountCode: discountState.code,
    discountAmount: finalTotals.discountAmount,
    finalTotal: finalTotals.finalTotal,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyDiscount,
    removeDiscount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}