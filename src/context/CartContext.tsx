import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { coupons, products } from '../data/products';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  savings: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = 'smartcart:cart';

interface PersistedCartState {
  items: Array<{ productId: string; quantity: number }>;
  appliedCouponCode: string | null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = readStorage<PersistedCartState>(CART_STORAGE_KEY, {
      items: [],
      appliedCouponCode: null,
    });

    return stored.items
      .map(item => {
        const product = products.find(entry => entry.id === item.productId);
        if (!product || item.quantity <= 0) return null;
        return { product, quantity: item.quantity };
      })
      .filter((item): item is CartItem => Boolean(item));
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const stored = readStorage<PersistedCartState>(CART_STORAGE_KEY, {
      items: [],
      appliedCouponCode: null,
    });

    return coupons.find(coupon => coupon.code === stored.appliedCouponCode) ?? null;
  });

  const addToCart = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setItems(prev =>
        prev.map(i =>
          i.product.id === productId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const applyCoupon = useCallback((code: string): boolean => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      return true;
    }
    return false;
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  useEffect(() => {
    if (items.length === 0 && !appliedCoupon) {
      removeStorage(CART_STORAGE_KEY);
      return;
    }

    writeStorage<PersistedCartState>(CART_STORAGE_KEY, {
      items: items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
      appliedCouponCode: appliedCoupon?.code ?? null,
    });
  }, [appliedCoupon, items]);

  const { subtotal, discount, total, itemCount, savings } = useMemo(() => {
    const nextSubtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const originalSubtotal = items.reduce(
      (sum, item) => sum + (item.product.originalPrice ?? item.product.price) * item.quantity,
      0,
    );

    let nextDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percent') {
        nextDiscount = (nextSubtotal * appliedCoupon.discount) / 100;
      } else {
        nextDiscount = Math.min(appliedCoupon.discount, nextSubtotal);
      }
    }

    return {
      subtotal: nextSubtotal,
      discount: nextDiscount,
      total: nextSubtotal - nextDiscount,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      savings: originalSubtotal - nextSubtotal + nextDiscount,
    };
  }, [appliedCoupon, items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        total,
        itemCount,
        savings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
