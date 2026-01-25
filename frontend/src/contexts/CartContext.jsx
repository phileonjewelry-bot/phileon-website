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
      unit_amount_cents: Math.round((product.price || 0) * 100), // Convert to cents
      qty: quantity,
      variant,
      // Additional fields for display
      slug: product.slug,
      materials: product.materials
    };

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => 
        item.product_id === product.id && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
      );
      
      if (existingIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].qty += quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, newItem];
      }
    });
    
    // Open drawer when item added
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

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.qty, 0);
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.unit_amount_cents * item.qty), 0);
  };

  const getFormattedTotal = () => {
    return (getTotalAmount() / 100).toFixed(2);
  };

  // Convert cart items to format expected by Stripe checkout session
  const getCheckoutItems = () => {
    return items.map(item => ({
      name: item.name,
      description: item.materials?.join(' · ') || '',
      price: item.unit_amount_cents / 100, // Convert back to dollars
      quantity: item.qty,
      images: item.image ? [item.image] : []
    }));
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
    isOpen,
    setIsOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};