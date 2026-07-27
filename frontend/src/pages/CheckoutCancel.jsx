import React from "react";
import { Link } from "react-router-dom";

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-black text-white" data-testid="checkout-cancel-page">
      <div className="max-w-[560px] mx-auto px-6 md:px-8 pt-16 pb-24 text-center">
        <p className="text-[9px] tracking-[0.42em] text-white/30 mb-3">CHECKOUT · CANCELLED</p>
        <h1 className="text-[28px] md:text-[36px] tracking-[0.015em] font-light text-white/90">Payment was not completed</h1>
        <p className="text-white/50 text-[14px] mt-4">
          No charge was placed. Your cart is exactly where you left it — you can return to it whenever you're ready.
        </p>
        <div className="mt-10 flex flex-col gap-3">
          <Link to="/checkout" className="inline-block bg-white text-black rounded-md py-3 px-8 text-[10px] tracking-[0.18em] font-medium hover:bg-white/92 transition-colors" data-testid="checkout-cancel-retry">
            RETURN TO CHECKOUT
          </Link>
          <Link to="/cart" className="text-[10px] tracking-[0.28em] text-white/50 hover:text-white/80 uppercase" data-testid="checkout-cancel-back-to-cart">Return to Cart</Link>
          <Link to="/shop?category=rings" className="text-[10px] tracking-[0.28em] text-white/30 hover:text-white/60 uppercase">Keep browsing Fine Jewelry</Link>
        </div>
      </div>
    </div>
  );
}
