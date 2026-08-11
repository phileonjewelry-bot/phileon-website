/* ==========================================================================
   PHILEON — CHECKOUT PAUSED
   The customer left the Stripe hosted checkout without completing payment.
   No charge was placed and the cart is preserved intact. The copy avoids
   implying payment failed unless the backend genuinely reports a failure.
   ========================================================================== */
import React from "react";
import { Link } from "react-router-dom";

export default function CheckoutCancel() {
  return (
    <div className="pc-page" data-testid="checkout-cancel-page">
      <style>{`
        .pc-page { background:#08070a; color:#e8e0cf;
          font-family:'Cormorant Garamond',serif; min-height:100vh;
          padding:clamp(48px,8vw,120px) clamp(20px,4vw,60px) 96px; }
        .pc-wrap { max-width:640px; margin:0 auto; text-align:center; }
        .pc-eyebrow { font-family:'Cinzel',serif; font-size:10.5px;
          letter-spacing:.7em; text-transform:uppercase;
          color:#c8a24a; margin:0 0 28px; }
        .pc-heading { font-family:'Cinzel',serif; font-weight:400;
          font-size:clamp(36px,6vw,72px); letter-spacing:.14em; line-height:1.1;
          margin:0 0 18px; color:#f4ecd6; text-transform:uppercase; }
        .pc-support { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(17px,1.8vw,22px); letter-spacing:.02em;
          color:rgba(232,224,207,.7); margin:0 0 44px; }
        .pc-note { font-family:'Cormorant Garamond',serif;
          font-size:clamp(15px,1.5vw,17px); line-height:1.7;
          color:rgba(232,224,207,.55); max-width:520px; margin:0 auto 48px; }
        .pc-actions { display:flex; flex-direction:column; align-items:center; gap:14px; }
        .pc-btn { display:inline-flex; align-items:center; justify-content:center;
          min-width:260px; padding:18px 44px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.5em;
          text-transform:uppercase; text-decoration:none;
          transition:background 320ms ease,color 320ms ease,letter-spacing 320ms ease; }
        .pc-btn.primary { color:#f4ecd6; border:1.5px solid #c8a24a; background:transparent; }
        .pc-btn.primary:hover { background:#c8a24a; color:#08070a; letter-spacing:.6em; }
        .pc-btn.secondary { color:rgba(232,224,207,.6); border:none; padding:14px 32px;
          font-size:10px; letter-spacing:.42em; }
        .pc-btn.secondary:hover { color:#c8a24a; }
      `}</style>

      <div className="pc-wrap">
        <p className="pc-eyebrow">PHILEON · Checkout</p>
        <h1 className="pc-heading" data-testid="checkout-cancel-heading">CHECKOUT PAUSED.</h1>
        <p className="pc-support">Your selection is still yours to revisit.</p>
        <p className="pc-note">
          No charge was placed. Your cart is exactly as you left it, waiting
          for you to return whenever the moment is right.
        </p>
        <div className="pc-actions">
          <Link to="/cart" className="pc-btn primary" data-testid="checkout-return-to-cart">
            Return to Cart
          </Link>
          <Link
            to="/shop?category=rings"
            className="pc-btn secondary"
            data-testid="checkout-cancel-keep-browsing"
          >
            Keep Browsing Fine Jewelry
          </Link>
        </div>
      </div>
    </div>
  );
}
