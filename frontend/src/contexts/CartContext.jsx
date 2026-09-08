import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();
const API = process.env.REACT_APP_BACKEND_URL;
const CART_SESSION_KEY = 'phileon_session_id';

// Layer 7 — fire the CLIENT-OBSERVED ADDED_TO_CART event through the
// existing /api/behavior/events pipeline. Env is server-stamped.
const fireAddedToCart = (slug) => {
  if (!slug) return;
  try {
    let sid = null;
    try { sid = sessionStorage.getItem(CART_SESSION_KEY); } catch (_e) { /* noop */ }
    if (!sid) {
      const rand = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sid = `phi-${rand}`;
      try { sessionStorage.setItem(CART_SESSION_KEY, sid); } catch (_e) { /* noop */ }
    }
    fetch(`${API}/api/behavior/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'ADDED_TO_CART',
        product_slug: String(slug),
        session_id: sid,
        source: 'cart-add',
      }),
      keepalive: true,
    }).catch(() => {});
  } catch (_e) {
    /* analytics never blocks cart */
  }
};

// Normalise a currency code for comparison; treat null/undefined/blank as USD
// because the majority of the pre-existing catalog is priced in USD and never
// set an explicit `currency` field.
const normaliseCurrency = (c) => (c || 'USD').toString().trim().toUpperCase();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Lazy initializer: read localStorage synchronously on first render so the
  // cart is populated before any effect runs. This prevents the previous
  // race where the save-effect would overwrite localStorage with `[]` before
  // the load-effect could hydrate — which caused the mixed-currency guard
  // to see an empty cart on freshly-navigated product pages.
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem('phileon_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing saved cart:', error);
      try { window.localStorage.removeItem('phileon_cart'); } catch (_e) { /* noop */ }
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('phileon_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1, variant = null) => {
    // ── Mixed-currency guard ────────────────────────────────────────────
    // Stripe checkout sessions must use a single currency. If the cart
    // already contains items priced in a different currency than this
    // incoming product, refuse the add and surface a customer-facing
    // message. No FX conversion is invented.
    const incomingCurrency = normaliseCurrency(product.currency);
    const existingCurrencies = new Set(items.map((it) => normaliseCurrency(it.currency)));
    if (existingCurrencies.size > 0 && !existingCurrencies.has(incomingCurrency)) {
      const existing = Array.from(existingCurrencies).join(', ');
      toast.error(
        `Items priced in different currencies (${incomingCurrency} vs ${existing}) must be purchased separately. Please complete your current cart first, or remove the existing items to add this one.`,
        { duration: 6000 }
      );
      return false;
    }

    const newItem = {
      product_id: product.id,
      name: product.name,
      image: product.images?.[0] || product.image,
      unit_amount_cents: Math.round((product.price || 0) * 100),
      lockedPriceCad: product.price || 0,
      productKey: product.productKey || null,
      tierKey: product.tierKey || null,
      sku: product.sku || null,
      // Optional engraving / personalisation fields — preserved through to
      // checkout for any product page that supports inscription add-ons.
      engravingEnabled: product.engravingEnabled || false,
      engravingMethod: product.engravingMethod || null,
      engravingText: product.engravingText || null,
      qty: quantity,
      variant,
      slug: product.slug,
      materials: product.materials,
      currency: product.currency || null,
      // Optional configuration descriptors preserved for ring products
      // that expose separate karat / metal colour / ring size selectors.
      karat: product.karat || null,
      metalColour: product.metalColour || null,
      ringSize: product.ringSize || null,
      gemstones: product.gemstones || null,
    };

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => 
        item.product_id === product.id && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
      );
      
      if (existingIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].qty += quantity;
        return updatedItems;
      } else {
        return [...prevItems, newItem];
      }
    });

    // Layer 7 — client-observed ADDED_TO_CART.
    fireAddedToCart(product.slug || product.productKey || product.id);

    setIsOpen(true);
    return true;
  };

  const updateQuantity = (productId, variant, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setItems(prevItems => 
      prevItems.map(item => 
        item.product_id === productId && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
          ? { ...item, qty: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId, variant = null) => {
    setItems(prevItems => 
      prevItems.filter(item => 
        !(item.product_id === productId && 
          JSON.stringify(item.variant) === JSON.stringify(variant))
      )
    );
  };

  const clearCart = () => setItems([]);

  const getTotalItems = () => items.reduce((total, item) => total + item.qty, 0);

  const getTotalAmount = () => items.reduce((total, item) => total + (item.unit_amount_cents * item.qty), 0);

  const getFormattedTotal = () =>
    Math.round(getTotalAmount() / 100).toLocaleString("en-US");

  const getCheckoutItems = () => {
    return items.map(item => ({
      product_id: item.product_id,
      name: item.name,
      description: item.materials?.join(' · ') || '',
      price: item.unit_amount_cents / 100,
      quantity: item.qty,
      qty: item.qty,
      images: item.image ? [item.image] : []
    }));
  };

  // Validate cart prices against server before checkout
  const validateCart = async () => {
    const API_URL = process.env.REACT_APP_BACKEND_URL || "";
    const validationItems = items
      .filter(item => item.productKey && item.tierKey)
      .map(item => ({
        product_key: item.productKey,
        tier_key: item.tierKey,
        client_price: item.lockedPriceCad,
        quantity: item.qty,
      }));

    if (validationItems.length === 0) return { valid: true, message: "No items to validate" };

    try {
      const res = await fetch(`${API_URL}/api/validate-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: validationItems }),
      });
      return await res.json();
    } catch (error) {
      console.error("Cart validation failed:", error);
      return { valid: true, message: "Validation skipped (offline)" };
    }
  };

  const value = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalAmount,
    getFormattedTotal,
    getCheckoutItems,
    validateCart,
    isOpen,
    setIsOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
