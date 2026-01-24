import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { lsGet, lsSet } from "../lib/storage";

const WishlistContext = createContext(null);
const WISHLIST_KEY = "phileon_wishlist_v1";

export const WishlistProvider = ({ children }) => {
  const [ids, setIds] = useState(() => lsGet(WISHLIST_KEY, []));

  useEffect(() => {
    lsSet(WISHLIST_KEY, ids);
  }, [ids]);

  const has = (productId) => ids.includes(String(productId));

  const toggle = (productId) => {
    const id = String(productId);
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const value = useMemo(() => ({ ids, has, toggle }), [ids]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};