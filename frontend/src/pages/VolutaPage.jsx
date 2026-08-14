import React from "react";

// VOLUTA — PLACEHOLDER PAGE
// ─────────────────────────────────────────────────────────────────────────
// FINAL PRODUCT #3 of 6. Working name — merchant confirmation pending.
// This page renders the merchant-approved provisional retail configuration
// ($6,995 CAD, 10K Rose Gold, 25 cm / 9.8 in anklet + matching earrings)
// but does NOT expose an active Add to Cart, does NOT register a trusted
// product, and does NOT touch the backend catalog. Trusted product count
// remains 84. Migration to trusted checkout is gated on:
//   1. final CAD weight
//   2. final medallion dimensions
//   3. final clasp/closure
//   4. merchant reconfirms $6,995 CAD retail
//   5. merchant explicit approval

const VOLUTA_HERO = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/t4zwoen5_1000171127.png";

// Additional plates will be wired here as more studio shots are supplied.
// The gallery is intentionally driven from a single source so re-sequencing
// or adding to it later is a one-line change.
const VOLUTA_GALLERY = [
  { src: VOLUTA_HERO, alt: "VOLUTA earring + anklet set — 10K Rose Gold on obsidian." },
];

export default function VolutaPage() {
  return (
    <div className="voluta-page" data-testid="voluta-page">
      {/* Hero */}
      <section className="voluta-hero" data-testid="voluta-hero">
        <div className="voluta-hero-inner">
          <div className="voluta-hero-media">
            <img
              src={VOLUTA_HERO}
              alt="VOLUTA — 10K Rose Gold earring and anklet set on obsidian"
              className="voluta-hero-img"
              data-testid="voluta-hero-image"
              loading="eager"
            />
          </div>

          <div className="voluta-hero-copy">
            <p className="voluta-eyebrow" data-testid="voluta-eyebrow">PHILEON FINE JEWELRY</p>
            <h1 className="voluta-title" data-testid="voluta-title">VOLUTA</h1>
            <p className="voluta-subline" data-testid="voluta-subline">EARRING + ANKLET SET</p>
            <p className="voluta-material" data-testid="voluta-material">10K ROSE GOLD</p>

            <div className="voluta-price-row">
              <span className="voluta-price" data-testid="voluta-price">$6,995 CAD</span>
              <span className="voluta-price-pill" data-testid="voluta-price-status">
                Final production specification pending
              </span>
            </div>

            <p className="voluta-campaign" data-testid="voluta-campaign">
              ONE MOTIF.<br />TWO POINTS OF THE BODY.
            </p>

            {/* Non-purchasable CTA — no cart wiring. */}
            <button
              type="button"
              className="voluta-cta-disabled"
              disabled
              aria-disabled="true"
              data-testid="voluta-cta-coming-soon"
            >
              COMING SOON
            </button>
            <p className="voluta-cta-note">In final development · Reserve intent will open on production sign-off.</p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="voluta-intro" data-testid="voluta-intro">
        <div className="voluta-container">
          <p className="voluta-intro-lead">
            VOLUTA carries one sculptural gesture across two points of the body.
          </p>
          <p className="voluta-intro-body">
            A procession of openwork rose-gold medallions encircles the ankle,
            while the same flowing architecture is repeated at the ear.
          </p>
          <p className="voluta-intro-tag">
            One motif. One material. Two expressions.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="voluta-gallery" data-testid="voluta-gallery">
        <div className="voluta-container">
          <p className="voluta-section-eyebrow">The Set</p>
          <div className="voluta-gallery-grid">
            {VOLUTA_GALLERY.map((plate, i) => (
              <div
                key={plate.src}
                className={`voluta-gallery-cell ${i === 0 ? "is-hero" : ""}`}
                data-testid={`voluta-gallery-plate-${i}`}
              >
                <img src={plate.src} alt={plate.alt} loading={i === 0 ? "eager" : "lazy"} />
              </div>
            ))}
          </div>
          <p className="voluta-gallery-note" data-testid="voluta-gallery-note">
            Additional studio and on-body plates arrive with production sign-off.
          </p>
        </div>
      </section>

      {/* Product details */}
      <section className="voluta-details" data-testid="voluta-details">
        <div className="voluta-container">
          <p className="voluta-section-eyebrow">Product</p>
          <dl className="voluta-spec-list">
            <div className="voluta-spec-row"><dt>Product</dt><dd>VOLUTA Earring + Anklet Set</dd></div>
            <div className="voluta-spec-row"><dt>Collection</dt><dd>PHILEON Fine Jewelry</dd></div>
            <div className="voluta-spec-row"><dt>Metal</dt><dd>Solid 10K Rose Gold</dd></div>
            <div className="voluta-spec-row"><dt>Anklet Length</dt><dd data-testid="voluta-anklet-length">25 cm / 9.8 in</dd></div>
            <div className="voluta-spec-row"><dt>Earrings</dt><dd>Matching Pair</dd></div>
            <div className="voluta-spec-row"><dt>Gemstones</dt><dd>None</dd></div>
            <div className="voluta-spec-row voluta-spec-row-price"><dt>Price</dt><dd data-testid="voluta-price-details">$6,995 CAD</dd></div>
          </dl>

          <p className="voluta-pending-line" data-testid="voluta-pending-line">
            Final Weight · Medallion Dimensions · Clasp Specification — To Be Confirmed
          </p>
        </div>
      </section>

      {/* Purchase summary */}
      <section className="voluta-purchase" data-testid="voluta-purchase-summary">
        <div className="voluta-container voluta-purchase-inner">
          <div>
            <p className="voluta-section-eyebrow">Set</p>
            <h2 className="voluta-purchase-title">VOLUTA</h2>
            <p className="voluta-purchase-sub">EARRING + ANKLET SET</p>
            <p className="voluta-purchase-line">10K ROSE GOLD</p>
            <p className="voluta-purchase-line">25 CM / 9.8 IN ANKLET</p>
            <p className="voluta-purchase-price" data-testid="voluta-purchase-price">$6,995 CAD</p>
          </div>
          <div className="voluta-purchase-status">
            <p className="voluta-status-eyebrow">Status</p>
            <p className="voluta-status-line" data-testid="voluta-status-line">
              Final Production Specification Pending
            </p>
            <button
              type="button"
              className="voluta-cta-disabled voluta-cta-wide"
              disabled
              aria-disabled="true"
              data-testid="voluta-cta-coming-soon-bottom"
            >
              IN FINAL DEVELOPMENT
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .voluta-page {
          background: #050505;
          color: #efe6d5;
          font-family: ui-serif, "Cormorant Garamond", Georgia, serif;
          padding-top: 64px;
        }
        .voluta-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* Hero */
        .voluta-hero { padding: 0 0 64px; background: radial-gradient(ellipse at 15% 20%, rgba(196,131,105,0.10) 0%, rgba(0,0,0,0) 60%), #050505; }
        .voluta-hero-inner {
          max-width: 1400px; margin: 0 auto; padding: 40px 24px;
          display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; align-items: center;
        }
        @media (max-width: 900px) {
          .voluta-hero-inner { grid-template-columns: 1fr; gap: 32px; padding: 24px 20px; }
        }
        .voluta-hero-media {
          position: relative; width: 100%; aspect-ratio: 1 / 1; background: #000;
          border: 1px solid rgba(196,131,105,0.20); border-radius: 2px; overflow: hidden;
        }
        .voluta-hero-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: contain; object-position: center; padding: 3%;
        }

        .voluta-eyebrow, .voluta-section-eyebrow, .voluta-status-eyebrow {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 10px; letter-spacing: 0.42em; text-transform: uppercase;
          color: #c48369; margin: 0;
        }
        .voluta-title {
          font-size: clamp(48px, 7vw, 84px); font-weight: 300; line-height: 0.9;
          letter-spacing: 0.02em; margin: 18px 0 0; color: #f2e6c8;
        }
        .voluta-subline {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 12px; letter-spacing: 0.36em; text-transform: uppercase;
          margin: 16px 0 0; color: rgba(239,230,213,0.75);
        }
        .voluta-material {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 12px; letter-spacing: 0.36em; text-transform: uppercase;
          margin: 8px 0 0; color: rgba(196,131,105,0.9);
        }
        .voluta-price-row {
          margin-top: 28px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
        }
        .voluta-price {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 22px; letter-spacing: 0.10em; color: #f2e6c8;
        }
        .voluta-price-pill {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 9px; letter-spacing: 0.36em; text-transform: uppercase;
          color: #c48369; border: 1px solid rgba(196,131,105,0.35);
          padding: 5px 10px; border-radius: 2px;
        }
        .voluta-campaign {
          margin-top: 32px; font-size: clamp(18px, 2vw, 22px);
          letter-spacing: 0.05em; line-height: 1.25; color: rgba(239,230,213,0.9);
        }
        .voluta-cta-disabled {
          font-family: "Helvetica Neue", Arial, sans-serif;
          display: inline-block; margin-top: 28px; padding: 16px 32px;
          background: transparent; color: rgba(196,131,105,0.6);
          border: 1px solid rgba(196,131,105,0.35); border-radius: 2px;
          font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase;
          cursor: not-allowed;
        }
        .voluta-cta-wide { width: 100%; max-width: 320px; margin-top: 16px; }
        .voluta-cta-note {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 10px; letter-spacing: 0.14em; color: rgba(239,230,213,0.4);
          margin-top: 12px; max-width: 360px;
        }

        /* Intro */
        .voluta-intro { padding: 72px 0; border-top: 1px solid rgba(196,131,105,0.15); }
        .voluta-intro-lead { font-size: clamp(20px, 2.4vw, 28px); color: #f2e6c8; margin: 0; max-width: 720px; }
        .voluta-intro-body { margin-top: 18px; font-size: 15px; line-height: 1.65; color: rgba(239,230,213,0.75); max-width: 620px; }
        .voluta-intro-tag {
          margin-top: 24px; font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 11px; letter-spacing: 0.36em; text-transform: uppercase; color: #c48369;
        }

        /* Gallery */
        .voluta-gallery { padding: 72px 0; background: #060404; }
        .voluta-gallery-grid {
          margin-top: 28px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
        }
        @media (max-width: 900px) { .voluta-gallery-grid { grid-template-columns: 1fr; } }
        .voluta-gallery-cell {
          background: #000; border: 1px solid rgba(196,131,105,0.15); border-radius: 2px;
          overflow: hidden; aspect-ratio: 4 / 5;
        }
        .voluta-gallery-cell.is-hero {
          grid-column: span 3; aspect-ratio: 3 / 2;
        }
        @media (max-width: 900px) {
          .voluta-gallery-cell.is-hero { grid-column: span 1; aspect-ratio: 4 / 5; }
        }
        .voluta-gallery-cell img {
          width: 100%; height: 100%; object-fit: contain; object-position: center; padding: 4%;
        }
        .voluta-gallery-note {
          margin-top: 28px; font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
          color: rgba(239,230,213,0.35);
        }

        /* Details */
        .voluta-details { padding: 72px 0; }
        .voluta-spec-list {
          margin: 28px 0 0; padding: 0; display: grid; grid-template-columns: 1fr; gap: 0;
          border-top: 1px solid rgba(196,131,105,0.15);
        }
        .voluta-spec-row {
          display: grid; grid-template-columns: 200px 1fr; gap: 16px;
          padding: 18px 0; border-bottom: 1px solid rgba(196,131,105,0.10);
          font-family: "Helvetica Neue", Arial, sans-serif;
        }
        @media (max-width: 640px) { .voluta-spec-row { grid-template-columns: 1fr; gap: 6px; } }
        .voluta-spec-row dt {
          font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
          color: rgba(196,131,105,0.85); margin: 0;
        }
        .voluta-spec-row dd {
          font-size: 14px; color: rgba(239,230,213,0.9); margin: 0;
        }
        .voluta-spec-row-price dd { font-size: 18px; letter-spacing: 0.08em; color: #f2e6c8; }
        .voluta-pending-line {
          margin-top: 28px; font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 10px; letter-spacing: 0.36em; text-transform: uppercase;
          color: #c48369; padding: 14px 16px; border: 1px dashed rgba(196,131,105,0.45);
          border-radius: 2px; display: inline-block;
        }

        /* Purchase summary */
        .voluta-purchase { padding: 72px 0 128px; background: #060404; border-top: 1px solid rgba(196,131,105,0.15); }
        .voluta-purchase-inner {
          display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; align-items: start;
        }
        @media (max-width: 900px) { .voluta-purchase-inner { grid-template-columns: 1fr; gap: 32px; } }
        .voluta-purchase-title {
          font-size: clamp(36px, 5vw, 52px); font-weight: 300; letter-spacing: 0.02em;
          margin: 12px 0 0; color: #f2e6c8;
        }
        .voluta-purchase-sub, .voluta-purchase-line {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 12px; letter-spacing: 0.32em; text-transform: uppercase;
          color: rgba(239,230,213,0.75); margin: 10px 0 0;
        }
        .voluta-purchase-price {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 24px; letter-spacing: 0.10em; color: #f2e6c8; margin: 24px 0 0;
        }
        .voluta-status-line {
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase;
          color: #c48369; margin: 12px 0 0;
        }
      `}</style>
    </div>
  );
}
