import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

const STORAGE_KEY = 'phileon_wishlist';

export const WishlistProvider = ({ children }) => {
  const [ids, setIds] = useState([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem(STORAGE_KEY);
    if (savedWishlist) {
      try {
        const wishlistData = JSON.parse(savedWishlist);
        setIds(wishlistData);
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

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

  const toggleWishlist = (product_id) => {
    const isInWishlist = ids.includes(product_id);
    
    if (isInWishlist) {
      setIds(prev => prev.filter(id => id !== product_id));
    } else {
      setIds(prev => [...prev, product_id]);
    }

    logAnalytics('wishlist_toggle', { 
      product_id, 
      action: isInWishlist ? 'remove' : 'add' 
    });
  };

  const isInWishlist = (product_id) => {
    return ids.includes(product_id);
  };

  const value = {
    ids,
    toggleWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};