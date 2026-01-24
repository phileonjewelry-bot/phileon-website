import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { lsGet, lsSet } from "../lib/storage";

const CartContext = createContext(null);
const CART_KEY = "phileon_cart_v1";

const normalizeItem = (product, qty = 1, variant = null) => {
  // product should include: id/_id, name/title, price, image
  const id = product?.id || product?._id;
  return {
    product_id: String(id),
    name: product?.name || product?.title || "Product",
    price: Number(product?.price ?? 0),
    image: product?.image || product?.thumbnail || product?.images?.[0] || "",
    qty: Math.max(1, Number(qty || 1)),
    variant: variant || null,
    inventory_count: Number(product?.inventory_count ?? product?.stock ?? 999999),
  };
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => lsGet(CART_KEY, []));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    lsSet(CART_KEY, items);
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((v) => !v);

  const addToCart = (product, qty = 1, variant = null) => {
    const item = normalizeItem(product, qty, variant);

    // Sold out guard (optional)
    if (item.inventory_count <= 0) return;

    setItems((prev) => {
      const idx = prev.findIndex(
        (x) => x.product_id === item.product_id && JSON.stringify(x.variant) === JSON.stringify(item.variant)
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });

    setIsOpen(true);
  };

  const removeFromCart = (product_id, variant = null) => {
    setItems((prev) =>
      prev.filter(
        (x) => !(x.product_id === String(product_id) && JSON.stringify(x.variant) === JSON.stringify(variant))
      )
    );
  };

  const updateQty = (product_id, qty, variant = null) => {
    const q = Math.max(1, Number(qty || 1));
    setItems((prev) =>
      prev.map((x) => {
        if (x.product_id === String(product_id) && JSON.stringify(x.variant) === JSON.stringify(variant)) {
          return { ...x, qty: q };
        }
        return x;
      })
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, x) => sum + Number(x.price || 0) * Number(x.qty || 0), 0);
  }, [items]);

  const count = useMemo(() => items.reduce((n, x) => n + Number(x.qty || 0), 0), [items]);

  const value = {
    items,
    count,
    subtotal,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};