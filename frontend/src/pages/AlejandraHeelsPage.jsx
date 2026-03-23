import React, { useState, useMemo, useEffect } from 'react';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Add to Cart hook
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  
  // Get current selection
  const selectedMetal = metalOptions.find(m => m.id === selectedMetalId) || metalOptions[0];

  // ========== GALLERY IMAGES ONLY (No video) ==========
  const galleryImages = useMemo(() => [
    "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/mbasaxj6_1000140441.jpg",
    "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/q0cdb9tx_1000140440.jpg",
    "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/ouebq651_1000140400.jpg",
    "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/lghgq1oc_1000140403.jpg",
    "https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/cvvwbdch_1000140396.jpg",
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

  // Preload images
  useEffect(() => {
    galleryImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [galleryImages]);

  // Format price
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Group metals by category
  const silverOptions = metalOptions.filter(m => m.category === 'Silver');
  const gold10kOptions = metalOptions.filter(m => m.category === '10K Gold');
  const gold14kOptions = metalOptions.filter(m => m.category === '14K Gold');

  return (
    <div className="alejandra-page" data-testid="alejandra-heels-page">
      
      {/* ========== HERO VIDEO (ONE video only) ========== */}
      <section className="alejandra-hero-video">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="alejandra-video"
        >
          <source 
            src="https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/7vzfuct9_phileon_video_web_compressed-2.mp4" 
            type="video/mp4" 
          />
        </video>
        <div className="alejandra-hero-overlay">
          <h1 className="alejandra-hero-title">ALEJANDRA HEELS</h1>
          <p className="alejandra-hero-subtitle">Walk in elegance. Dance in light.</p>
        </div>
      </section>

      {/* ========== PRODUCT INFO + METAL SELECTOR ========== */}
      <section className="alejandra-product-section">
        <div className="alejandra-product-container">
          <p className="alejandra-eyebrow">Statement Earrings</p>
          <h2 className="alejandra-title">ALEJANDRA HEELS</h2>
          <p className="alejandra-price" data-testid="product-price">
            {formatPrice(selectedMetal.price, selectedMetal.currency)}
          </p>

          {/* Metal Swatch Selector */}
          <div className="alejandra-swatches" data-testid="swatch-selector">
            {/* Silver */}
            <div className="alejandra-swatch-group">
              <span className="alejandra-swatch-label">Silver</span>
              <div className="alejandra-swatch-row">
                {silverOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedMetalId(opt.id)}
                    className={`alejandra-swatch ${selectedMetalId === opt.id ? 'selected' : ''}`}
                    data-testid={`swatch-${opt.id}`}
                    title={opt.name}
                  >
                    <span style={{ backgroundColor: opt.swatchColor }} />
                  </button>
                ))}
              </div>
            </div>

            {/* 10K Gold */}
            <div className="alejandra-swatch-group">
              <span className="alejandra-swatch-label">10K Gold</span>
              <div className="alejandra-swatch-row">
                {gold10kOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedMetalId(opt.id)}
                    className={`alejandra-swatch ${selectedMetalId === opt.id ? 'selected' : ''}`}
                    data-testid={`swatch-${opt.id}`}
                    title={opt.name}
                  >
                    <span style={{ backgroundColor: opt.swatchColor }} />
                  </button>
                ))}
              </div>
            </div>

            {/* 14K Gold */}
            <div className="alejandra-swatch-group">
              <span className="alejandra-swatch-label">14K Gold</span>
              <div className="alejandra-swatch-row">
                {gold14kOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedMetalId(opt.id)}
                    className={`alejandra-swatch ${selectedMetalId === opt.id ? 'selected' : ''}`}
                    data-testid={`swatch-${opt.id}`}
                    title={opt.name}
                  >
                    <span style={{ backgroundColor: opt.swatchColor }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="alejandra-selected-metal" data-testid="selected-metal-label">
            {selectedMetal.name}
          </p>

          <p className="alejandra-description">
            Sculptural miniature heels cast in precious metal and finished with a pavé strap.
          </p>

          <button
            onClick={onAddToCart}
            disabled={isAdding}
            className={`alejandra-add-btn ${isAdding ? 'added' : ''}`}
            data-testid="add-to-cart-button"
          >
            {buttonText}
          </button>
        </div>
      </section>

      {/* ========== IMAGE GALLERY (Images only, NO video) ========== */}
      <section className="alejandra-gallery-section">
        <div className="alejandra-gallery-main">
          <img 
            src={galleryImages[currentImageIndex]} 
            alt={`Alejandra Heels - View ${currentImageIndex + 1}`}
            className="alejandra-gallery-image"
          />
          <div className="alejandra-gallery-nav">
            <button 
              onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : galleryImages.length - 1)}
              className="alejandra-gallery-arrow"
            >
              ‹
            </button>
            <span className="alejandra-gallery-counter">{currentImageIndex + 1} / {galleryImages.length}</span>
            <button 
              onClick={() => setCurrentImageIndex(i => i < galleryImages.length - 1 ? i + 1 : 0)}
              className="alejandra-gallery-arrow"
            >
              ›
            </button>
          </div>
        </div>
        <div className="alejandra-gallery-thumbs">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`alejandra-thumb ${currentImageIndex === idx ? 'active' : ''}`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      </section>

      {/* ========== STYLES ========== */}
      <style>{`
        .alejandra-page {
          background: #000;
          min-height: 100vh;
          color: #fff;
        }

        /* HERO VIDEO */
        .alejandra-hero-video {
          position: relative;
          width: 100%;
          height: 80vh;
          min-height: 500px;
          overflow: hidden;
        }

        .alejandra-video {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          object-fit: cover;
        }

        .alejandra-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
        }

        .alejandra-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 8vw, 64px);
          font-weight: 400;
          letter-spacing: 0.2em;
          margin-bottom: 16px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }

        .alejandra-hero-subtitle {
          font-size: clamp(14px, 2vw, 18px);
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.8);
          text-transform: uppercase;
        }

        /* PRODUCT SECTION */
        .alejandra-product-section {
          padding: 80px 24px;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .alejandra-eyebrow {
          font-size: 11px;
          letter-spacing: 0.3em;
          color: rgba(199, 162, 75, 0.7);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .alejandra-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 400;
          letter-spacing: 0.15em;
          margin-bottom: 16px;
        }

        .alejandra-price {
          font-size: 28px;
          font-weight: 300;
          color: #C7A24B;
          margin-bottom: 32px;
        }

        /* SWATCHES */
        .alejandra-swatches {
          margin-bottom: 24px;
        }

        .alejandra-swatch-group {
          margin-bottom: 20px;
        }

        .alejandra-swatch-label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .alejandra-swatch-row {
          display: flex;
          justify-content: center;
          gap: 12px;
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
        }

        .alejandra-swatch:hover {
          border-color: rgba(199, 162, 75, 0.4);
        }

        .alejandra-swatch.selected {
          border-color: #C7A24B;
        }

        .alejandra-swatch span {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }

        .alejandra-selected-metal {
          font-size: 14px;
          color: #C7A24B;
          margin-bottom: 16px;
        }

        .alejandra-description {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          font-style: italic;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .alejandra-add-btn {
          width: 100%;
          max-width: 320px;
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
        }

        .alejandra-add-btn:hover {
          background: #B8944A;
        }

        .alejandra-add-btn.added {
          background: #16a34a;
        }

        /* GALLERY (Images only) */
        .alejandra-gallery-section {
          padding: 40px 24px 100px;
          max-width: 900px;
          margin: 0 auto;
        }

        .alejandra-gallery-main {
          position: relative;
          margin-bottom: 20px;
        }

        .alejandra-gallery-image {
          width: 100%;
          height: auto;
          aspect-ratio: 4/5;
          object-fit: cover;
          border-radius: 4px;
        }

        .alejandra-gallery-nav {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(0,0,0,0.6);
          padding: 8px 16px;
          border-radius: 20px;
          backdrop-filter: blur(4px);
        }

        .alejandra-gallery-arrow {
          background: none;
          border: none;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          padding: 4px 8px;
          transition: color 0.2s;
        }

        .alejandra-gallery-arrow:hover {
          color: #C7A24B;
        }

        .alejandra-gallery-counter {
          font-size: 12px;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.7);
        }

        .alejandra-gallery-thumbs {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .alejandra-thumb {
          width: 60px;
          height: 75px;
          padding: 0;
          border: 2px solid transparent;
          background: none;
          cursor: pointer;
          overflow: hidden;
          border-radius: 4px;
          transition: border-color 0.2s;
        }

        .alejandra-thumb:hover {
          border-color: rgba(199, 162, 75, 0.5);
        }

        .alejandra-thumb.active {
          border-color: #C7A24B;
        }

        .alejandra-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .alejandra-hero-video {
            height: 60vh;
            min-height: 400px;
          }

          .alejandra-product-section {
            padding: 60px 20px;
          }

          .alejandra-gallery-section {
            padding: 20px 16px 80px;
          }

          .alejandra-thumb {
            width: 50px;
            height: 62px;
          }
        }
      `}</style>
    </div>
  );
};

export default AlejandraHeelsPage;
