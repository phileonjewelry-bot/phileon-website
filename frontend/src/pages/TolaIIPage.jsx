import React, { useState, useMemo, useEffect } from 'react';
import ProductGallery from '../components/ProductGallery';
import { useAddToCart } from '../hooks/useAddToCart';

const TolaIIPage = () => {
  // ========== TOLA II PRODUCT DATA (Official) ==========
  const productData = {
    name: "TOLA II",
    tagline: "Weight. Discipline. Presence.",
    category: "rings",
    audience: "gentlemens-club",
    description: "TOLA II is built on restraint and control. A structured gold form, anchored by a central chain and framed with precision-set black stones. Every surface is intentional. Every detail holds weight.",
    specs: [
      "Approx. top width: 12–13mm",
      "Approx. band width: 3–4mm",
      "Approx. weight: 15g (10K), 17g (14K), 21g (18K)",
      "60 black stones total",
      "High polish finish with structured pavé setting"
    ]
  };

  // ========== TIER SYSTEM (Ironclad Rules) ==========
  const tierOptions = useMemo(() => [
    {
      id: 'foundation',
      name: 'Foundation',
      tierLabel: 'Foundation Edition',
      metal: '10K Yellow Gold',
      price: 2850,
      currency: 'CAD',
      description: '10K gold with precision-set black stones. Built for everyday structure and presence.',
      tag: '',
      highlight: false,
    },
    {
      id: 'signature',
      name: 'Signature',
      tierLabel: 'Signature Edition',
      metal: '14K Yellow Gold',
      price: 3700,
      currency: 'CAD',
      description: '14K gold with enhanced depth and clarity. Balanced weight with elevated finish.',
      tag: 'Most Popular',
      highlight: true,
    },
    {
      id: 'heirloom',
      name: 'Heirloom',
      tierLabel: 'Heirloom Edition',
      metal: '18K Yellow Gold',
      price: 5200,
      currency: 'CAD',
      description: '18K gold with maximum richness and density. Designed for permanence.',
      tag: 'Collector',
      highlight: false,
    },
  ], []);

  // ========== GALLERY ITEMS (Video First, then Images) ==========
  const galleryItems = useMemo(() => [
    {
      type: "video",
      src: "/videos/tola-ii.mp4",
      alt: "TOLA II - Product Video",
      objectFit: "contain",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rst0mhem_1000143383.png",
      alt: "TOLA II - Hero shot",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/sm6c4t2r_1000143432.png",
      alt: "TOLA II - Front view on black background",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/ipu9le7o_1000141790.png",
      alt: "TOLA II - Side profile view",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/m0g80wsc_1000143416.png",
      alt: "TOLA II - Macro detail",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/1ta12tya_1000143385.png",
      alt: "TOLA II - Lifestyle shot",
    },
  ], []);

  // ========== STATE ==========
  const [selectedTierId, setSelectedTierId] = useState('signature');
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  // Get current selection
  const selectedTier = tierOptions.find(t => t.id === selectedTierId) || tierOptions[1];

  // Handle add to cart
  const onAddToCart = () => {
    handleAddToCart({
      id: `tola-ii-${selectedTier.id}`,
      name: 'TOLA II',
      image: galleryItems[0].src,
      price: selectedTier.price,
      slug: 'tola-ii',
      materials: [selectedTier.metal]
    }, 1, `${selectedTier.tierLabel} — ${selectedTier.metal}`);
  };

  // Preload images
  useEffect(() => {
    galleryItems.forEach(item => {
      if (item.type === 'image') {
        const img = new Image();
        img.src = item.src;
      }
    });
  }, [galleryItems]);

  // Format price
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="tola-page" data-testid="tola-ii-page">
      
      {/* ============================================
          IRONCLAD LAYOUT: LEFT (Gallery) + RIGHT (Sticky Info)
          ============================================ */}
      <div className="tola-main-layout">
        
        {/* LEFT COLUMN — Gallery */}
        <div className="tola-left-column">
          <div className="tola-gallery-wrapper">
            <ProductGallery items={galleryItems} />
          </div>
        </div>

        {/* RIGHT COLUMN — Sticky Product Info */}
        <div className="tola-right-column">
          <div className="tola-sticky-panel" data-testid="product-info-panel">
            
            {/* Product Name */}
            <p className="tola-eyebrow">The TOLA Collection</p>
            <h1 className="tola-product-name">{productData.name}</h1>
            
            {/* Tagline */}
            <p className="tola-tagline">{productData.tagline}</p>
            
            {/* Price */}
            <p className="tola-price" data-testid="product-price">
              {formatPrice(selectedTier.price, selectedTier.currency)}
            </p>

            {/* Tier Selector */}
            <div className="tola-tier-selector" data-testid="tier-selector">
              <p className="tola-selector-label">Select Tier</p>
              <div className="tola-tier-buttons">
                {tierOptions.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`tola-tier-btn ${selectedTierId === tier.id ? 'selected' : ''} ${tier.highlight ? 'highlight' : ''}`}
                    data-testid={`tier-${tier.id}`}
                  >
                    {tier.tag && <span className="tola-tier-tag">{tier.tag}</span>}
                    <span className="tola-tier-name">{tier.name}</span>
                    <span className="tola-tier-metal">{tier.metal}</span>
                    <span className="tola-tier-price">{formatPrice(tier.price, tier.currency)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Tier Description */}
            <p className="tola-tier-description">{selectedTier.description}</p>

            {/* BUY Button */}
            <button
              onClick={onAddToCart}
              disabled={isAdding}
              className={`tola-buy-btn ${isAdding ? 'added' : ''}`}
              data-testid="add-to-cart-button"
            >
              {buttonText}
            </button>

            {/* Shipping Note */}
            <p className="tola-shipping-note">
              Complimentary insured shipping within Canada
            </p>
          </div>
        </div>
      </div>

      {/* ============================================
          BELOW SECTION — Description & Specs
          ============================================ */}
      <section className="tola-below-section">
        <div className="tola-below-content">
          
          {/* Description */}
          <div className="tola-description-block">
            <h2 className="tola-section-title">The TOLA II Story</h2>
            <p className="tola-description-text">{productData.description}</p>
          </div>

          {/* Specs */}
          <div className="tola-specs-block">
            <h2 className="tola-section-title">Specifications</h2>
            <ul className="tola-specs-list">
              {productData.specs.map((spec, index) => (
                <li key={index} className="tola-spec-item">{spec}</li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* ============================================
          STYLES
          ============================================ */}
      <style>{`
        .tola-page {
          background: #000;
          min-height: 100vh;
          color: #fff;
        }

        /* ========== MAIN LAYOUT (Left/Right Split) ========== */
        .tola-main-layout {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 0;
          min-height: 100vh;
        }

        /* LEFT COLUMN — Gallery */
        .tola-left-column {
          padding: 40px 40px 80px 60px;
          border-right: 1px solid rgba(199, 162, 75, 0.1);
        }

        .tola-gallery-wrapper {
          max-width: 900px;
        }

        /* RIGHT COLUMN — Sticky Info */
        .tola-right-column {
          position: relative;
        }

        .tola-sticky-panel {
          position: sticky;
          top: 100px;
          padding: 60px 40px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
        }

        /* Hide scrollbar but allow scrolling */
        .tola-sticky-panel::-webkit-scrollbar {
          width: 0;
          display: none;
        }

        /* ========== PRODUCT INFO ========== */
        .tola-eyebrow {
          font-size: 10px;
          letter-spacing: 0.3em;
          color: rgba(199, 162, 75, 0.6);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .tola-product-name {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 400;
          letter-spacing: 0.15em;
          margin-bottom: 12px;
        }

        .tola-tagline {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
          letter-spacing: 0.02em;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .tola-price {
          font-size: 32px;
          font-weight: 300;
          color: #C7A24B;
          letter-spacing: 0.02em;
          margin-bottom: 32px;
        }

        /* ========== TIER SELECTOR ========== */
        .tola-tier-selector {
          margin-bottom: 24px;
        }

        .tola-selector-label {
          font-size: 10px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .tola-tier-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tola-tier-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: left;
        }

        .tola-tier-btn:hover {
          border-color: rgba(199, 162, 75, 0.4);
          background: rgba(199, 162, 75, 0.05);
        }

        .tola-tier-btn.selected {
          border-color: #C7A24B;
          background: rgba(199, 162, 75, 0.1);
        }

        .tola-tier-btn.highlight {
          border-color: rgba(199, 162, 75, 0.3);
        }

        .tola-tier-tag {
          position: absolute;
          top: -8px;
          right: 12px;
          font-size: 9px;
          letter-spacing: 0.1em;
          color: #000;
          background: #C7A24B;
          padding: 3px 8px;
          border-radius: 2px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .tola-tier-name {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #fff;
          margin-bottom: 4px;
        }

        .tola-tier-metal {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 6px;
        }

        .tola-tier-price {
          font-size: 16px;
          color: #C7A24B;
          font-weight: 400;
        }

        .tola-tier-description {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        /* ========== BUY BUTTON ========== */
        .tola-buy-btn {
          width: 100%;
          padding: 18px 32px;
          background: #C7A24B;
          border: none;
          color: #000;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 2px;
          margin-bottom: 16px;
        }

        .tola-buy-btn:hover {
          background: #B8944A;
          transform: scale(1.02);
        }

        .tola-buy-btn:active {
          transform: scale(0.98);
        }

        .tola-buy-btn.added {
          background: #16a34a;
        }

        .tola-buy-btn:disabled {
          cursor: not-allowed;
        }

        .tola-shipping-note {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.35);
          text-align: center;
          letter-spacing: 0.05em;
        }

        /* ========== BELOW SECTION (Description & Specs) ========== */
        .tola-below-section {
          border-top: 1px solid rgba(199, 162, 75, 0.1);
          padding: 80px 60px 120px;
        }

        .tola-below-content {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
        }

        .tola-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: #C7A24B;
          margin-bottom: 24px;
        }

        .tola-description-text {
          font-size: 14px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
        }

        .tola-description-text:last-of-type {
          margin-bottom: 0;
        }

        /* ========== SPECS LIST ========== */
        .tola-specs-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tola-spec-item {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          line-height: 1.5;
        }

        .tola-spec-item:last-child {
          border-bottom: none;
        }

        .tola-spec-item::before {
          content: "—";
          margin-right: 12px;
          color: #C7A24B;
        }

        /* ========== MOBILE RESPONSIVE ========== */
        @media (max-width: 1024px) {
          .tola-main-layout {
            grid-template-columns: 1fr;
          }

          .tola-left-column {
            padding: 24px 20px 40px;
            border-right: none;
            border-bottom: 1px solid rgba(199, 162, 75, 0.1);
          }

          .tola-right-column {
            padding: 0;
          }

          .tola-sticky-panel {
            position: static;
            padding: 40px 24px 60px;
            max-height: none;
          }

          .tola-below-content {
            grid-template-columns: 1fr;
            gap: 60px;
          }

          .tola-below-section {
            padding: 60px 24px 100px;
          }
        }

        @media (max-width: 640px) {
          .tola-product-name {
            font-size: 28px;
          }

          .tola-price {
            font-size: 26px;
          }

          .tola-tier-btn {
            padding: 14px 16px;
          }

          .tola-section-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default TolaIIPage;
