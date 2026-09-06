/* PHILEON — 404 (Not Found)
   Editorial. Minimal. On brand. No exposed routing details. */
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NotFoundPage() {
  const location = useLocation();
  useEffect(() => {
    document.title = "PHILEON — Page Not Found";
  }, []);

  return (
    <div className="nf-page" data-testid="not-found-page">
      <style>{`
        .nf-page { background:#08070a; color:#e8e0cf;
          min-height:70vh; padding: clamp(48px, 8vw, 120px) clamp(20px, 4vw, 60px);
          display:flex; align-items:center; justify-content:center;
          font-family:'Cormorant Garamond',serif; text-align:center; }
        .nf-wrap { max-width:560px; }
        .nf-eyebrow { font-family:'Cinzel',serif; font-size:11px;
          letter-spacing:.7em; text-transform:uppercase; color:#c8a24a;
          margin:0 0 24px; }
        .nf-code { font-family:'Cinzel',serif; font-size:96px;
          letter-spacing:.14em; color:#c8a24a; margin:0 0 12px; line-height:1; }
        .nf-title { font-family:'Cinzel',serif; letter-spacing:.16em;
          font-size:clamp(22px, 3.5vw, 32px); color:#f4ecd6;
          margin:0 0 20px; text-transform:uppercase; }
        .nf-sub { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(15px, 1.6vw, 18px); color:rgba(232,224,207,.7);
          margin:0 0 40px; line-height:1.55; }
        .nf-actions { display:flex; flex-direction:column; gap:14px;
          align-items:center; }
        .nf-btn { display:inline-flex; align-items:center; justify-content:center;
          min-width:240px; padding:16px 40px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.5em;
          text-transform:uppercase; text-decoration:none;
          color:#f4ecd6; border:1.5px solid #c8a24a; background:transparent;
          transition:background 320ms ease, color 320ms ease, letter-spacing 320ms ease; }
        .nf-btn:hover { background:#c8a24a; color:#08070a; letter-spacing:.6em; }
        .nf-btn.secondary { color:rgba(232,224,207,.6); border:none;
          padding:12px 30px; font-size:10px; letter-spacing:.42em; }
        .nf-btn.secondary:hover { color:#c8a24a; background:transparent; }
      `}</style>
      <div className="nf-wrap">
        <p className="nf-eyebrow">PHILEON</p>
        <p className="nf-code" data-testid="not-found-code">404</p>
        <h1 className="nf-title">A quiet corner. Nothing here.</h1>
        <p className="nf-sub">
          The page you were looking for isn&apos;t part of PHILEON — perhaps a
          moved link, or a piece we&apos;ve since retired.
        </p>
        <div className="nf-actions">
          <Link to="/" className="nf-btn" data-testid="not-found-home">
            Return to PHILEON
          </Link>
          <Link to="/shop" className="nf-btn secondary" data-testid="not-found-shop">
            Continue Exploring
          </Link>
          <Link to="/contact" className="nf-btn secondary" data-testid="not-found-contact">
            Contact Concierge
          </Link>
        </div>
      </div>
    </div>
  );
}
