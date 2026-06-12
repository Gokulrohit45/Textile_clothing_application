import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const s = localStorage.getItem('sh_cart');
    return s ? JSON.parse(s) : [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const s = localStorage.getItem('sh_coupon');
    return s ? JSON.parse(s) : null;
  });

  useEffect(() => { localStorage.setItem('sh_cart', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => {
    if (appliedCoupon) localStorage.setItem('sh_coupon', JSON.stringify(appliedCoupon));
    else localStorage.removeItem('sh_coupon');
  }, [appliedCoupon]);

  const addToCart = (product, size, color, colorName, qty = 1) => {
    const key = `${product.id}-${size}-${colorName}`;
    setCartItems(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, {
        key, productId: product.id, productName: product.name,
        image: product.images?.[0] || '', price: product.price,
        originalPrice: product.originalPrice, size, color, colorName, qty
      }];
    });
  };

  const removeFromCart = (key) => setCartItems(prev => prev.filter(i => i.key !== key));

  const updateQty = (key, qty) => {
    if (qty <= 0) return removeFromCart(key);
    setCartItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (coupon) => setAppliedCoupon(coupon);
  const removeCoupon = () => setAppliedCoupon(null);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') return Math.round(subtotal * appliedCoupon.value / 100);
    if (appliedCoupon.type === 'fixed') return Math.min(appliedCoupon.value, subtotal);
    return 0;
  };

  const getShippingDiscount = (shippingCharge) => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'shipping') return shippingCharge;
    return 0;
  };

  return (
    <CartContext.Provider value={{
      cartItems, appliedCoupon, subtotal, cartCount,
      addToCart, removeFromCart, updateQty, clearCart,
      applyCoupon, removeCoupon, getDiscount, getShippingDiscount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
