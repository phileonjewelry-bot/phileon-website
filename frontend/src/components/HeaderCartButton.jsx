import React from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../contexts/CartContext";

export default function HeaderCartButton() {
  const { toggleCart, count } = useCart();

  return (
    <button onClick={toggleCart} className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-white/25">
      <ShoppingBag className="h-5 w-5 text-white/80" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#CDA553] text-black text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}