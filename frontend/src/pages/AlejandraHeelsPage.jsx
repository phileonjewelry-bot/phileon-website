import React, { useState, useMemo, useEffect } from 'react';
import ProductGallery from '../components/ProductGallery';
import { useAddToCart } from '../hooks/useAddToCart';

const AlejandraHeelsPage = () => {
  // ========== METAL OPTIONS (7 variants) ==========
  const metalOptions = useMemo(() => [
    {
      id: 'silver',
      name: 'Silver',
      shortName: 'Silver',
      category: 'Silver',
      price: 1250,
      currency: 'CAD',
      swatchColor: '#C0C0C0',
      galleryType: 'silver',
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/mbasaxj6_1000140441.jpg",
    },
    {
      id: 'white-10k',
      name: '10K White Gold',
      shortName: 'White 10K',
      category: '10K Gold',
      price: 2450,
      currency: 'CAD',
      swatchColor: '#F5F5F0',
      galleryType: 'white',
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/q0cdb9tx_1000140440.jpg",
    },
    {
      id: 'rose-10k',
      name: '10K Rose Gold',
      shortName: 'Rose 10K',
      category: '10K Gold',
      price: 2450,
      currency: 'CAD',
      swatchColor: '#B76E79',
      galleryType: 'rose',
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/lghgq1oc_1000140403.jpg",
    },
    {
      id: 'yellow-10k',
      name: '10K Yellow Gold',
      shortName: 'Yellow 10K',
      category: '10K Gold',
      price: 2450,
      currency: 'CAD',
      swatchColor: '#D4AF37',
      galleryType: 'yellow',
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/ouebq651_1000140400.jpg",
    },
    {
      id: 'white-14k',
      name: '14K White Gold',
      shortName: 'White 14K',
      category: '14K Gold',
      price: 3250,
      currency: 'CAD',
      swatchColor: '#FAF9F6',
      galleryType: 'white',
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/q0cdb9tx_1000140440.jpg",
    },
    {
      id: 'rose-14k',
      name: '14K Rose Gold',
      shortName: 'Rose 14K',
      category: '14K Gold',
      price: 3250,
      currency: 'CAD',
      swatchColor: '#C4756E',
      galleryType: 'rose',
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/lghgq1oc_1000140403.jpg",
    },
    {
      id: 'yellow-14k',
      name: '14K Yellow Gold',
      shortName: 'Yellow 14K',
      category: '14K Gold',
      price: 3250,
      currency: 'CAD',
      swatchColor: '#CFB53B',
      galleryType: 'yellow',
      heroImage: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/ouebq651_1000140400.jpg",
    },
  ], []);

  // State for selected metal (default: Silver)
  const [selectedMetalId, setSelectedMetalId] = useState('silver');
  
  // Add to Cart hook
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  
  // Get current selection
  const selectedMetal = metalOptions.find(m => m.id === selectedMetalId) || metalOptions[0];

  // ========== GALLERY ITEMS ==========
  const galleryItems = useMemo(() => [
    {
      type: "video",
      src: "https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/7vzfuct9_phileon_video_web_compressed-2.mp4",
      alt: "Alejandra Heels Earrings - Product Video",
      objectFit: "contain",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/mbasaxj6_1000140441.jpg",
      alt: "Alejandra Heels Earrings - Sterling Silver",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/q0cdb9tx_1000140440.jpg",
      alt: "Alejandra Heels Earrings - White Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/ouebq651_1000140400.jpg",
      alt: "Alejandra Heels Earrings - Yellow Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/lghgq1oc_1000140403.jpg",
      alt: "Alejandra Heels Earrings - Rose Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/cvvwbdch_1000140396.jpg",
      alt: "Alejandra Heels Earrings - Rose Gold Detail with Diamonds",
    },
  ], []);

  // Handle add to cart
  const onAddToCart = () => {
    handleAddToCart({
      id: `alejandra-heels-${selectedMetal.id}`,
      name: 'Alejandra Heels Earrings',
      image: selectedMetal.heroImage,
      price: selectedMetal.price,
      slug: 'alejandra-heels',
      materials: [selectedMetal.name]
    }, 1, selectedMetal.name);
  };

  // Preload hero images for instant switching
  useEffect(() => {
    const preloadImages = metalOptions.map(m => m.heroImage).filter(Boolean);
    const uniqueImages = [...new Set(preloadImages)];
    
    uniqueImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [metalOptions]);

  // Format price
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Group metals by category for display
  const silverOptions = metalOptions.filter(m => m.category === 'Silver');
  const gold10kOptions = metalOptions.filter(m => m.category === '10K Gold');
  const gold14kOptions = metalOptions.filter(m => m.category === '14K Gold');

  // Hero image changes based on selected metal
  const heroImageUrl = selectedMetal.heroImage;

  return (
    <div className="alejandra-page bg-black min-h-screen" data-testid="alejandra-heels-page">
      
      {/* SECTION 1 — HERO */}
      <section 
        className="alejandra-hero"
        style={{
          backgroundImage: `url(${heroImageUrl})`,
        }}
      >
        <div className="alejandra-hero-overlay" />
        <div className="alejandra-hero-content">
          <h1 className="alejandra-hero-title">ALEJANDRA HEELS</h1>
          <p className="alejandra-hero-subtitle">Walk in elegance. Dance in light.</p>
        </div>
      </section>

      {/* SECTION 2 — VIDEO */}
      <section className="alejandra-video-section">
        <div className="alejandra-video-container">
          <video
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            className="w-full max-w-5xl rounded-lg"
          >
            <source src="https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/7vzfuct9_phileon_video_web_compressed-2.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* SECTION 3 — GALLERY (Horizontal Scrolling) */}
      <section className="alejandra-gallery-section">
        <div className="alejandra-gallery-container">
          <ProductGallery key={selectedMetal.galleryType} items={galleryItems} />
        </div>
      </section>

      {/* SECTION 4 — PRODUCT DETAILS & SWATCH SELECTOR */}
      <section className="alejandra-product-section">
        <div className="alejandra-product-layout">
          {/* Product Image */}
          <div className="alejandra-product-image-container">
            <img 
              src={selectedMetal.heroImage} 
              alt={`Alejandra Heels Earrings - ${selectedMetal.name}`}
              className="alejandra-product-image"
            />
          </div>

          {/* Product Info */}
          <div className="alejandra-product-info">
            <p className="alejandra-product-eyebrow">Statement Earrings</p>
            <h2 className="alejandra-product-title">ALEJANDRA HEELS</h2>
            <p className="alejandra-product-price" data-testid="product-price">
              {formatPrice(selectedMetal.price, selectedMetal.currency)}
            </p>

            {/* Visual Swatch Selector */}
            <div className="alejandra-swatch-selector" data-testid="swatch-selector">
              {/* Silver Group */}
              <div className="alejandra-swatch-group">
                <p className="alejandra-swatch-group-label">Silver</p>
                <div className="alejandra-swatch-options">
                  {silverOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMetalId(option.id)}
                      className={`alejandra-swatch ${selectedMetalId === option.id ? 'selected' : ''}`}
                      data-testid={`swatch-${option.id}`}
                      title={option.name}
                      aria-label={option.name}
                    >
                      <span 
                        className="alejandra-swatch-color"
                        style={{ backgroundColor: option.swatchColor }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 10K Gold Group */}
              <div className="alejandra-swatch-group">
                <p className="alejandra-swatch-group-label">10K Gold</p>
                <div className="alejandra-swatch-options">
                  {gold10kOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMetalId(option.id)}
                      className={`alejandra-swatch ${selectedMetalId === option.id ? 'selected' : ''}`}
                      data-testid={`swatch-${option.id}`}
                      title={option.name}
                      aria-label={option.name}
                    >
                      <span 
                        className="alejandra-swatch-color"
                        style={{ backgroundColor: option.swatchColor }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 14K Gold Group */}
              <div className="alejandra-swatch-group">
                <p className="alejandra-swatch-group-label">14K Gold</p>
                <div className="alejandra-swatch-options">
                  {gold14kOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMetalId(option.id)}
                      className={`alejandra-swatch ${selectedMetalId === option.id ? 'selected' : ''}`}
                      data-testid={`swatch-${option.id}`}
                      title={option.name}
                      aria-label={option.name}
                    >
                      <span 
                        className="alejandra-swatch-color"
                        style={{ backgroundColor: option.swatchColor }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Metal Label */}
            <p className="alejandra-selected-metal" data-testid="selected-metal-label">
              {selectedMetal.name}
            </p>

            {/* Supporting Copy */}
            <p className="alejandra-metal-note">
              Sculptural miniature heels cast in precious metal and finished with a pavé strap.
            </p>

            {/* Add to Cart Button */}
            <button
              onClick={onAddToCart}
              disabled={isAdding}
              className={`alejandra-add-to-cart ${isAdding ? 'added' : ''}`}
              data-testid="add-to-cart-button"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5 — DESCRIPTION */}
      <section className="alejandra-description-section">
        <div className="alejandra-description-content">
          <h2 className="alejandra-description-title">Miniature Masterpiece</h2>
          <p className="alejandra-description-text">
            The Alejandra Heels Earrings capture the spirit of fashion, movement, and confidence — 
            sculptural miniature stilettos that dangle with grace. Each heel is precision-cast 
            from solid metal, featuring intricate straps and a delicate pavé detail that 
            catches the light with every gesture.
          </p>
          <p className="alejandra-description-text">
            A playful couture design for those who walk with purpose and dance with joy.
          </p>
        </div>
      </section>

      <style>{`
        /* ========== HERO SECTION ========== */
        .alejandra-hero {
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

        .alejandra-hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          pointer-events: none;
        }

        .alejandra-hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 0 24px;
        }

        .alejandra-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px, 10vw, 72px);
          font-weight: 400;
          letter-spacing: 0.25em;
          color: #fff;
          margin-bottom: 20px;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
        }

        .alejandra-hero-subtitle {
          font-size: clamp(14px, 2.5vw, 18px);
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 300;
          text-transform: uppercase;
        }

        /* ========== VIDEO SECTION ========== */
        .alejandra-video-section {
          background: #000;
          padding: 80px 24px;
        }

        .alejandra-video-container {
          max-width: 1024px;
          margin: 0 auto;
        }

        .alejandra-video {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        /* ========== GALLERY SECTION ========== */
        .alejandra-gallery-section {
          background: #000;
          padding: 40px 24px 60px;
        }

        .alejandra-gallery-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ========== PRODUCT SECTION ========== */
        .alejandra-product-section {
          background: #000;
          padding: 80px 24px 100px;
        }

        .alejandra-product-layout {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .alejandra-product-image-container {
          position: relative;
        }

        .alejandra-product-image {
          width: 100%;
          height: auto;
          border-radius: 8px;
          transition: opacity 0.3s ease;
        }

        .alejandra-product-info {
          padding: 20px 0;
        }

        .alejandra-product-eyebrow {
          font-size: 11px;
          letter-spacing: 0.3em;
          color: rgba(199, 162, 75, 0.7);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .alejandra-product-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #fff;
          margin-bottom: 16px;
        }

        .alejandra-product-price {
          font-size: 28px;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: #C7A24B;
          margin-bottom: 32px;
        }

        /* ========== SWATCH SELECTOR ========== */
        .alejandra-swatch-selector {
          margin-bottom: 24px;
        }

        .alejandra-swatch-group {
          margin-bottom: 20px;
        }

        .alejandra-swatch-group:last-child {
          margin-bottom: 0;
        }

        .alejandra-swatch-group-label {
          font-size: 10px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .alejandra-swatch-options {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .alejandra-swatch {
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

        .alejandra-swatch:hover {
          border-color: rgba(199, 162, 75, 0.4);
        }

        .alejandra-swatch.selected {
          border-color: #C7A24B;
        }

        .alejandra-swatch-color {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: block;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(255, 255, 255, 0.1);
        }

        .alejandra-selected-metal {
          font-size: 14px;
          letter-spacing: 0.1em;
          color: #C7A24B;
          margin-bottom: 16px;
          font-weight: 400;
        }

        .alejandra-metal-note {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        /* ========== ADD TO CART BUTTON ========== */
        .alejandra-add-to-cart {
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

        .alejandra-add-to-cart:hover {
          background: #B8944A;
          transform: scale(1.02);
        }

        .alejandra-add-to-cart:active {
          transform: scale(0.98);
        }

        .alejandra-add-to-cart.added {
          background: #16a34a;
          transform: scale(1.02);
        }

        .alejandra-add-to-cart:disabled {
          cursor: not-allowed;
        }

        /* ========== DESCRIPTION SECTION ========== */
        .alejandra-description-section {
          background: #000;
          padding: 80px 24px 120px;
          border-top: 1px solid rgba(199, 162, 75, 0.1);
        }

        .alejandra-description-content {
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
        }

        .alejandra-description-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #C7A24B;
          margin-bottom: 32px;
        }

        .alejandra-description-text {
          font-size: 16px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 24px;
        }

        .alejandra-description-text:last-of-type {
          margin-bottom: 0;
        }

        /* ========== MOBILE RESPONSIVE ========== */
        @media (max-width: 768px) {
          .alejandra-hero {
            height: 80vh;
            min-height: 500px;
          }

          .alejandra-hero-title {
            letter-spacing: 0.15em;
          }

          .alejandra-video-section {
            padding: 60px 16px;
          }

          .alejandra-video {
            border-radius: 8px;
          }

          .alejandra-gallery-section {
            padding: 20px 12px 40px;
          }

          .alejandra-product-section {
            padding: 60px 20px 80px;
          }

          .alejandra-product-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .alejandra-product-info {
            text-align: center;
          }

          .alejandra-swatch-options {
            justify-content: center;
          }

          .alejandra-swatch-group-label {
            text-align: center;
          }

          .alejandra-selected-metal {
            text-align: center;
          }

          .alejandra-metal-note {
            text-align: center;
          }

          .alejandra-description-section {
            padding: 60px 20px 100px;
          }

          .alejandra-description-text {
            font-size: 15px;
            line-height: 1.75;
          }
        }
      `}</style>
    </div>
  );
};

export default AlejandraHeelsPage;
