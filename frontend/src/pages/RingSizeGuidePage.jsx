import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SizeGuideContent } from "@/components/SizeGuideModal";

export default function RingSizeGuidePage() {
  useEffect(() => {
    document.title = "Ring Size Guide — PHILEON";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="rsg-page" data-testid="ring-size-guide-page">
      <style>{`
        .rsg-page {
          background: #050505;
          min-height: 100vh;
          font-family: 'Cormorant Garamond', serif;
        }
        .rsg-return {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 0.35em;
          color: rgba(232,227,216,0.55);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 28px 0 0 60px;
          transition: color 220ms ease;
        }
        .rsg-return:hover { color: #d4af37; }
        @media (max-width: 720px) { .rsg-return { padding: 24px 0 0 20px; } }

        /* HERO */
        .rsg-hero {
          padding: 80px 24px 64px;
          text-align: center;
          background: radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212,175,55,0.06), transparent 70%);
        }
        .rsg-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 11px; letter-spacing: 0.45em;
          color: #d4af37;
          text-transform: uppercase;
          margin: 0 0 22px;
        }
        .rsg-title {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          font-size: clamp(38px, 6vw, 72px);
          letter-spacing: 0.04em;
          color: #f0d98c;
          line-height: 1;
          margin: 0 0 22px;
          text-transform: uppercase;
        }
        .rsg-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(16px, 1.5vw, 20px);
          color: #cfc8b8;
          margin: 0;
          max-width: 540px;
          margin-left: auto;
          margin-right: auto;
        }

        /* PAPER PANEL — re-uses warm tone from modal so SizeGuideContent reads correctly */
        .rsg-panel-wrap {
          max-width: 720px;
          margin: 0 auto 96px;
          padding: 0 16px;
        }
        .rsg-panel {
          background: #f3ebdf;
          color: #3c2c1f;
          padding: 56px 36px 64px;
          border-radius: 4px;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6);
        }
        @media (min-width: 720px) {
          .rsg-panel { padding: 80px 64px 88px; border-radius: 8px; }
        }
      `}</style>

      <Link to="/shop" className="rsg-return" data-testid="rsg-return">
        <ArrowLeft size={14} /> RETURN
      </Link>

      {/* HERO */}
      <section className="rsg-hero">
        <p className="rsg-eyebrow">PHILEON · SIZING</p>
        <h1 className="rsg-title">Ring Size Guide</h1>
        <p className="rsg-tagline">
          The most accurate method is to have your finger measured at a local jeweller.
          For at-home sizing, follow the steps below.
        </p>
      </section>

      {/* GUIDE PANEL — shares SizeGuideContent with the in-page modal */}
      <div className="rsg-panel-wrap">
        <div className="rsg-panel">
          <SizeGuideContent showLogo={false} />
        </div>
      </div>
    </div>
  );
}
