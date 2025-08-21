import { createContext, useContext, useReducer, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const discountAmount = discountCode ? (total * 15) / 100 : 0;
  const finalTotal = total - discountAmount;

  return { total, itemCount, discountAmount, finalTotal };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_ITEMS":
      const { total, itemCount, discountAmount, finalTotal } = calculateTotals(action.payload, state.discountCode);
      return { ...state, items: action.payload, total, itemCount, discountAmount, finalTotal };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "ADD_ITEM":
      const newItems = [...state.items, action.payload];
      const addTotals = calculateTotals(newItems, state.discountCode);
      return { ...state, items: newItems, ...addTotals };

    case "UPDATE_ITEM":
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      );
      const updateTotals = calculateTotals(updatedItems, state.discountCode);
      return { ...state, items: updatedItems, ...updateTotals };

    case "REMOVE_ITEM":
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      const removeTotals = calculateTotals(filteredItems, state.discountCode);
      return { ...state, items: filteredItems, ...removeTotals };

    case "CLEAR_CART":
      return { ...initialState };

    case "APPLY_DISCOUNT":
      const applyTotals = calculateTotals(state.items, action.payload.code);
      return {
        ...state,
        discountCode: action.payload.code,
        ...applyTotals
      };

    case "REMOVE_DISCOUNT":
      const removeTotals2 = calculateTotals(state.items, null);
      return {
        ...state,
        discountCode: null,
        ...removeTotals2
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
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cartItems } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    refetchInterval: false,
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: InsertCartItem) => {
      const response = await apiRequest("POST", "/api/cart", item);
      return response.json();
    },
    onSuccess: (updatedCartItems: CartItem[]) => {
      dispatch({ type: "SET_ITEMS", payload: updatedCartItems });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Producto agregado",
        description: "El producto se agregó correctamente al carrito",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return response.json();
    },
    onSuccess: (updatedCartItems: CartItem[]) => {
      dispatch({ type: "SET_ITEMS", payload: updatedCartItems });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/cart/${id}`);
      return response.json();
    },
    onSuccess: (updatedCartItems: CartItem[]) => {
      dispatch({ type: "SET_ITEMS", payload: updatedCartItems });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
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

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/cart");
      return response.json();
    },
    onSuccess: (updatedCartItems: CartItem[]) => {
      dispatch({ type: "SET_ITEMS", payload: updatedCartItems });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (cartItems) {
      dispatch({ type: "SET_ITEMS", payload: cartItems });
    }
  }, [cartItems]);

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
    dispatch({ type: "APPLY_DISCOUNT", payload: { code, percentage } });
  };

  const removeDiscount = () => {
    dispatch({ type: "REMOVE_DISCOUNT" });
  };

  const value: CartContextType = {
    ...state,
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