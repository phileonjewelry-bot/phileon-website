import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('phileon_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('phileon_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('phileon_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1, variant = null) => {
    const newItem = {
      product_id: product.id,
      name: product.name,
      image: product.images?.[0] || product.image,
      unit_amount_cents: Math.round((product.price || 0) * 100),
      lockedPriceCad: product.price || 0,
      productKey: product.productKey || null,
      tierKey: product.tierKey || null,
      qty: quantity,
      variant,
      slug: product.slug,
      materials: product.materials
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
    
    setIsOpen(true);
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
