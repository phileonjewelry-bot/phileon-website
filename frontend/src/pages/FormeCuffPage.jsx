import React, { useState, useMemo, useEffect } from 'react';
import ProductGallery from '../components/ProductGallery';
import { useAddToCart } from '../hooks/useAddToCart';
import { products } from '@/data/products';

const FormeCuffPage = () => {
  // Get pricing from products.js
  const formeCuffProduct = products.formeCuff;
  const productSolidGold = formeCuffProduct.metalOptions.solidGold;
  const productPlated = formeCuffProduct.metalOptions.platedSilver;

  // ========== IMAGE SETS ==========
  // Yellow Gold Gallery Images (in specified order)
  const yellowGoldGallery = useMemo(() => [
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/k7kbqg47_1000142846.png",
      alt: "FORME CUFF Yellow Gold - Hero front luxury shot",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/asvnmb9f_1000142852.png",
      alt: "FORME CUFF Yellow Gold - Black background angled",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/rgzne2e0_1000143032.jpg",
      alt: "FORME CUFF Yellow Gold - Marble tabletop shot",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/w3ocrekw_1000142624.jpg",
      alt: "FORME CUFF Yellow Gold - Open cuff structure view",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/0vvlo7f5_1000142850.png",
      alt: "FORME CUFF Yellow Gold - Macro detail",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/a5hjexrp_1000143030.jpg",
      alt: "FORME CUFF Yellow Gold - Wrist lifestyle",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/2czdv0i2_1000142848.png",
      alt: "FORME CUFF Yellow Gold - Edge craftsmanship detail",
    },
  ], []);

  // Rose Gold Gallery Images (in specified order)
  const roseGoldGallery = useMemo(() => [
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/gs6lblps_1000142863.png",
      alt: "FORME CUFF Rose Gold - Hero front luxury shot",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/29riw0xa_1000142651.jpg",
      alt: "FORME CUFF Rose Gold - Black background angled",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/c8cqewbk_1000142653.jpg",
      alt: "FORME CUFF Rose Gold - Marble tabletop shot",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/x6tgkf40_1000142649.jpg",
      alt: "FORME CUFF Rose Gold - Open cuff structure view",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/gs6lblps_1000142863.png",
      alt: "FORME CUFF Rose Gold - Macro detail",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/29riw0xa_1000142651.jpg",
      alt: "FORME CUFF Rose Gold - Wrist lifestyle",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/x6tgkf40_1000142649.jpg",
      alt: "FORME CUFF Rose Gold - Edge craftsmanship detail",
    },
  ], []);

  // ========== METAL OPTIONS ==========
  const metalOptions = useMemo(() => [
    {
      id: 'yellow-10k',
      name: '10K Yellow Gold',
      shortName: 'Yellow 10K',
      category: 'Solid Gold',
      price: productSolidGold.find(o => o.id === 'yellow-10k')?.price || 2850,
      currency: 'CAD',
      swatchColor: '#D4AF37', // Yellow gold color
      galleryType: 'yellow',
      heroImage: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/k7kbqg47_1000142846.png",
    },
    {
      id: 'rose-10k',
      name: '10K Rose Gold',
      shortName: 'Rose 10K',
      category: 'Solid Gold',
      price: productSolidGold.find(o => o.id === 'rose-10k')?.price || 2850,
      currency: 'CAD',
      swatchColor: '#B76E79', // Rose gold color
      galleryType: 'rose',
      heroImage: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/gs6lblps_1000142863.png",
    },
    {
      id: 'plated-yellow',
      name: 'Gold Plated Silver (Yellow)',
      shortName: 'Yellow Plated',
      category: 'Gold Plated Silver',
      price: productPlated.find(o => o.id === 'plated-yellow')?.price || 695,
      currency: 'CAD',
      swatchColor: '#D4AF37', // Yellow gold color
      galleryType: 'yellow', // Uses yellow gold image set
      heroImage: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/k7kbqg47_1000142846.png",
    },
    {
      id: 'plated-rose',
      name: 'Gold Plated Silver (Rose)',
      shortName: 'Rose Plated',
      category: 'Gold Plated Silver',
      price: productPlated.find(o => o.id === 'plated-rose')?.price || 695,
      currency: 'CAD',
      swatchColor: '#B76E79', // Rose gold color
      galleryType: 'rose', // Uses rose gold image set
      heroImage: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/gs6lblps_1000142863.png",
    },
  ], [productSolidGold, productPlated]);

  // State for selected metal (default: 10K Yellow Gold)
  const [selectedMetalId, setSelectedMetalId] = useState('yellow-10k');
  
  // Add to Cart hook
  const { isAdding, handleAddToCart, buttonText, buttonClass } = useAddToCart();
  
  // Get current selection
  const selectedMetal = metalOptions.find(m => m.id === selectedMetalId) || metalOptions[0];

  // Handle add to cart
  const onAddToCart = () => {
    handleAddToCart({
      id: `forme-cuff-${selectedMetal.id}`,
      name: 'FORME CUFF',
      image: selectedMetal.heroImage,
      price: selectedMetal.price,
      slug: 'forme-cuff',
      materials: [selectedMetal.name]
    }, 1, selectedMetal.name);
  };

  // Get the active gallery based on selected metal's gallery type
  const activeGallery = useMemo(() => {
    return selectedMetal.galleryType === 'rose' ? roseGoldGallery : yellowGoldGallery;
  }, [selectedMetal.galleryType, roseGoldGallery, yellowGoldGallery]);

  // Preload hero images for instant switching
  useEffect(() => {
    const preloadImages = [
      yellowGoldGallery[0]?.src,
      roseGoldGallery[0]?.src,
    ].filter(Boolean);

    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [yellowGoldGallery, roseGoldGallery]);

  // Format price
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Group metals by category for display (using local metalOptions)
  const solidGoldOptions = metalOptions.filter(m => m.category === 'Solid Gold');
  const platedOptions = metalOptions.filter(m => m.category === 'Gold Plated Silver');

  // Hero image changes based on selected metal
  const heroImageUrl = selectedMetal.heroImage;

  return (
    <div className="forme-cuff-page bg-black min-h-screen" data-testid="forme-cuff-page">
      
      {/* SECTION 1 — HERO */}
      <section 
        className="forme-hero"
        style={{
          backgroundImage: `url(${heroImageUrl})`,
        }}
      >
        <div className="forme-hero-overlay" />
        <div className="forme-hero-content">
          <h1 className="forme-hero-title">FORME CUFF</h1>
          <p className="forme-hero-subtitle">Shaped by the curve. Held in form.</p>
        </div>
      </section>

      {/* SECTION 2 — VIDEO */}
      <section className="forme-video-section">
        <div className="forme-video-container">
          <video
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            className="w-full max-w-5xl rounded-lg"
          >
            <source src="/videos/forme-cuff.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* SECTION 3 — GALLERY (Horizontal Scrolling, Metal-Based) */}
      <section className="forme-gallery-section">
        <div className="forme-gallery-container">
          <ProductGallery key={selectedMetal.galleryType} items={activeGallery} />
        </div>
      </section>

      {/* SECTION 4 — PRODUCT DETAILS & SWATCH SELECTOR */}
      <section className="forme-product-section">
        <div className="forme-product-layout">
          {/* Product Image */}
          <div className="forme-product-image-container">
            <img 
              src={selectedMetal.heroImage} 
              alt={`FORME CUFF - ${selectedMetal.name}`}
              className="forme-product-image"
            />
          </div>

          {/* Product Info */}
          <div className="forme-product-info">
            <p className="forme-product-eyebrow">The Forme Collection</p>
            <h2 className="forme-product-title">FORME CUFF</h2>
            <p className="forme-product-price" data-testid="product-price">
              {formatPrice(selectedMetal.price, selectedMetal.currency)}
            </p>

            {/* Visual Swatch Selector */}
            <div className="forme-swatch-selector" data-testid="swatch-selector">
              {/* Solid Gold Group */}
              <div className="forme-swatch-group">
                <p className="forme-swatch-group-label">Solid Gold</p>
                <div className="forme-swatch-options">
                  {solidGoldOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMetalId(option.id)}
                      className={`forme-swatch ${selectedMetalId === option.id ? 'selected' : ''}`}
                      data-testid={`swatch-${option.id}`}
                      title={option.name}
                      aria-label={option.name}
                    >
                      <span 
                        className="forme-swatch-color"
                        style={{ backgroundColor: option.swatchColor }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Plated Silver Group */}
              <div className="forme-swatch-group">
                <p className="forme-swatch-group-label">Gold Plated Silver</p>
                <div className="forme-swatch-options">
                  {platedOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMetalId(option.id)}
                      className={`forme-swatch ${selectedMetalId === option.id ? 'selected' : ''}`}
                      data-testid={`swatch-${option.id}`}
                      title={option.name}
                      aria-label={option.name}
                    >
                      <span 
                        className="forme-swatch-color"
                        style={{ backgroundColor: option.swatchColor }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Metal Label */}
            <p className="forme-selected-metal" data-testid="selected-metal-label">
              {selectedMetal.name}
            </p>

            {/* Supporting Copy */}
            <p className="forme-metal-note">
              Offered in solid gold and gold-plated silver — without compromise in form.
            </p>

            {/* Add to Cart Button */}
            <button
              onClick={onAddToCart}
              disabled={isAdding}
              className={`forme-add-to-cart ${isAdding ? 'added' : ''}`}
              data-testid="add-to-cart-button"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5 — DESCRIPTION */}
      <section className="forme-description-section">
        <div className="forme-description-content">
          <h2 className="forme-description-title">Sculpted Silhouettes</h2>
          <p className="forme-description-text">
            The Forme Cuff captures the elegance of the human form in motion — 
            figures intertwined, dancing along the curve of the wrist. Each silhouette 
            is precision-cut from solid gold, creating a play of light and shadow 
            that shifts with every gesture.
          </p>
          <p className="forme-description-text">
            A celebration of movement, connection, and the beauty of the body in balance.
          </p>
        </div>
      </section>

      <style>{`
        /* ========== HERO SECTION ========== */
        .forme-hero {
          position: relative;
          height: 85vh;
          min-height: 600px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-image 0.3s ease;
        }

        .forme-hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          pointer-events: none;
        }

        .forme-hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 0 24px;
        }

        .forme-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px, 10vw, 72px);
          font-weight: 400;
          letter-spacing: 0.25em;
          color: #fff;
          margin-bottom: 20px;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
        }

        .forme-hero-subtitle {
          font-size: clamp(14px, 2.5vw, 18px);
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 300;
          text-transform: uppercase;
        }

        /* ========== VIDEO SECTION ========== */
        .forme-video-section {
          background: #000;
          padding: 80px 24px;
        }

        .forme-video-container {
          max-width: 1024px;
          margin: 0 auto;
        }

        .forme-video {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        /* ========== GALLERY SECTION ========== */
        .forme-gallery-section {
          background: #000;
          padding: 40px 24px 60px;
        }

        .forme-gallery-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ========== PRODUCT SECTION ========== */
        .forme-product-section {
          background: #000;
          padding: 80px 24px 100px;
        }

        .forme-product-layout {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .forme-product-image-container {
          position: relative;
        }

        .forme-product-image {
          width: 100%;
          height: auto;
          border-radius: 8px;
          transition: opacity 0.3s ease;
        }

        .forme-product-info {
          padding: 20px 0;
        }

        .forme-product-eyebrow {
          font-size: 11px;
          letter-spacing: 0.3em;
          color: rgba(199, 162, 75, 0.7);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .forme-product-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #fff;
          margin-bottom: 16px;
        }

        .forme-product-price {
          font-size: 28px;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: #C7A24B;
          margin-bottom: 32px;
        }

        /* ========== SWATCH SELECTOR ========== */
        .forme-swatch-selector {
          margin-bottom: 24px;
        }

        .forme-swatch-group {
          margin-bottom: 20px;
        }

        .forme-swatch-group:last-child {
          margin-bottom: 0;
        }

        .forme-swatch-group-label {
          font-size: 10px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .forme-swatch-options {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .forme-swatch {
          width: 44px;
          height: 44px;
          padding: 3px;
          background: transparent;
          border: 2px solid transparent;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .forme-swatch:hover {
          border-color: rgba(199, 162, 75, 0.4);
        }

        .forme-swatch.selected {
          border-color: #C7A24B;
        }

        .forme-swatch-color {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: block;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(255, 255, 255, 0.1);
        }

        .forme-selected-metal {
          font-size: 14px;
          letter-spacing: 0.1em;
          color: #C7A24B;
          margin-bottom: 16px;
          font-weight: 400;
        }

        .forme-metal-note {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        /* ========== ADD TO CART BUTTON ========== */
        .forme-add-to-cart {
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
        }

        .forme-add-to-cart:hover {
          background: #B8944A;
          transform: scale(1.02);
        }

        .forme-add-to-cart:active {
          transform: scale(0.98);
        }

        .forme-add-to-cart.added {
          background: #16a34a;
          transform: scale(1.02);
        }

        .forme-add-to-cart:disabled {
          cursor: not-allowed;
        }

        /* ========== DESCRIPTION SECTION ========== */
        .forme-description-section {
          background: #000;
          padding: 80px 24px 120px;
          border-top: 1px solid rgba(199, 162, 75, 0.1);
        }

        .forme-description-content {
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
        }

        .forme-description-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #C7A24B;
          margin-bottom: 32px;
        }

        .forme-description-text {
          font-size: 16px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 24px;
        }

        .forme-description-text:last-of-type {
          margin-bottom: 0;
        }

        /* ========== MOBILE RESPONSIVE ========== */
        @media (max-width: 768px) {
          .forme-hero {
            height: 80vh;
            min-height: 500px;
          }

          .forme-hero-title {
            letter-spacing: 0.15em;
          }

          .forme-video-section {
            padding: 60px 16px;
          }

          .forme-video {
            border-radius: 8px;
          }

          .forme-gallery-section {
            padding: 20px 12px 40px;
          }

          .forme-product-section {
            padding: 60px 20px 80px;
          }

          .forme-product-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .forme-product-info {
            text-align: center;
          }

          .forme-swatch-options {
            justify-content: center;
          }

          .forme-swatch-group-label {
            text-align: center;
          }

          .forme-selected-metal {
            text-align: center;
          }

          .forme-metal-note {
            text-align: center;
          }

          .forme-description-section {
            padding: 60px 20px 100px;
          }

          .forme-description-text {
            font-size: 15px;
            line-height: 1.75;
          }
        }
      `}</style>
    </div>
  );
};

export default FormeCuffPage;
