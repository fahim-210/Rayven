import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, CartItemCustomization } from '../types/index.ts';

interface CartContextValue {
  items: CartItem[];
  addToCart: (
    product: Product,
    variant: ProductVariant,
    quantity?: number,
    customization?: CartItemCustomization
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  subtotal: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('rayven_cart_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('rayven_wishlist_ids');
      return stored ? JSON.parse(stored) : ['prd_01', 'prd_02'];
    } catch {
      return ['prd_01', 'prd_02'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rayven_cart_items', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('rayven_wishlist_ids', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const addToCart = (
    product: Product,
    variant: ProductVariant,
    quantity: number = 1,
    customization?: CartItemCustomization
  ) => {
    // Enforce stock bounds
    const safeMaxStock = Math.max(0, variant.stockQuantity);
    if (safeMaxStock <= 0) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.variant.id === variant.id &&
          item.customization?.playerPrint === customization?.playerPrint &&
          item.customization?.playerName === customization?.playerName &&
          item.customization?.playerNumber === customization?.playerNumber &&
          item.customization?.badgePatch === customization?.badgePatch
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, safeMaxStock);
        updated[existingIndex].quantity = newQty;
        return updated;
      }

      const safeQuantity = Math.min(Math.max(1, quantity), safeMaxStock);
      const newItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        product,
        variant,
        quantity: safeQuantity,
        customization,
      };
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== cartItemId) return item;
        // Strictly never allow 0 or negative quantity, never above available stock
        const maxStock = Math.max(1, item.variant.stockQuantity);
        const clampedQuantity = Math.min(Math.max(1, newQuantity), maxStock);
        return { ...item, quantity: clampedQuantity };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const unit = item.variant.priceOverride ?? item.product.basePrice;
    let customSurcharge = 0;
    if (item.customization?.playerPrint) customSurcharge += 15.0;
    if (item.customization?.badgePatch) customSurcharge += 10.0;
    return acc + (unit + customSurcharge) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        subtotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
