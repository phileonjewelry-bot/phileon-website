import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'phileon_cart';

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, qty = 1, variant } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product_id === product.id && item.variant === variant
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].qty += qty;
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        const newItem = {
          product_id: product.id,
          name: product.name,
          price: product.price_range || 'Inquiry',
          image: product.images?.[0] || '',
          qty,
          variant: variant || null,
          slug: product.slug
        };
        return { ...state, items: [...state.items, newItem] };
      }
    }

    case 'REMOVE_FROM_CART': {
      const { product_id } = action.payload;
      return {
        ...state,
        items: state.items.filter(item => item.product_id !== product_id)
      };
    }

    case 'UPDATE_QTY': {
      const { product_id, qty } = action.payload;
      if (qty <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { product_id } });
      }
      
      const updatedItems = state.items.map(item =>
        item.product_id === product_id ? { ...item, qty } : item
      );
      return { ...state, items: updatedItems };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'LOAD_CART':
      return { ...state, items: action.payload };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: []
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  // Analytics helper
  const logAnalytics = async (eventType, data = {}) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          product_id: data.product_id || '',
          device_info: data,
          session_id: sessionStorage.getItem('phileon_session_id') || 'anonymous'
        })
      });
    } catch (error) {
      console.warn('Analytics logging failed:', error);
    }
  };

  // Cart actions
  const addToCart = (product, qty = 1, variant = null) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, qty, variant } });
    logAnalytics('cart_add', { product_id: product.id, qty, variant });
  };

  const removeFromCart = (product_id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { product_id } });
    logAnalytics('cart_remove', { product_id });
  };

  const updateQty = (product_id, qty) => {
    dispatch({ type: 'UPDATE_QTY', payload: { product_id, qty } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + item.qty, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};