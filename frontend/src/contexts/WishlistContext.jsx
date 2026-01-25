import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('phileon_wishlist');
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error parsing saved wishlist:', error);
        localStorage.removeItem('phileon_wishlist');
      }
    }
  }, []);

  // Save wishlist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('phileon_wishlist', JSON.stringify(items));
  }, [items]);

  const addToWishlist = (productId) => {
    setItems(prevItems => {
      if (!prevItems.includes(productId)) {
        return [...prevItems, productId];
      }
      return prevItems;
    });
  };

  const removeFromWishlist = (productId) => {
    setItems(prevItems => prevItems.filter(id => id !== productId));
  };

  const toggleWishlist = (productId) => {
    setItems(prevItems => {
      if (prevItems.includes(productId)) {
        return prevItems.filter(id => id !== productId);
      } else {
        return [...prevItems, productId];
      }
    });
  };

  const isInWishlist = (productId) => {
    return items.includes(productId);
  };

  const getTotalWishlistItems = () => {
    return items.length;
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const value = {
    items,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    getTotalWishlistItems,
    clearWishlist,
    // Legacy support
    has: isInWishlist,
    toggle: toggleWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};