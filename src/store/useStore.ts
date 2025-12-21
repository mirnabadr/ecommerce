import { create } from "zustand";
import { Product } from "@/lib/db/schema";

interface CartItem extends Product {
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  addToCart: (product) => {
    const cart = get().cart;
    const existingItem = cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      set({
        cart: cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ cart: [...cart, { ...product, quantity: 1 }] });
    }
  },
  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.id !== productId) });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set({
      cart: get().cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    });
  },
  clearCart: () => set({ cart: [] }),
  getTotalPrice: () => {
    // Note: Product schema doesn't have price directly, prices are on variants
    // This is a simplified client-side store - actual cart uses server actions
    return get().cart.reduce((total, item) => {
      // Return 0 for now since price is not available on Product type
      return total;
    }, 0);
  },
}));

