import React, { useState, useMemo, useEffect } from 'react';
import ProductGallery from '../components/ProductGallery';
import { useAddToCart } from '../hooks/useAddToCart';
import { products } from '@/data/products';
import { useLiveTierPrices } from '@/hooks/useLivePrice';
const AlejandraHeelsPage = () => {
  // Get pricing from products.js
  const alejandraProduct = products.alejandraHeels;
  const pricing = alejandraProduct.pricing;
  const tierPricesLive = useLiveTierPrices("alejandraHeels");

  // ========== SHARED GALLERY IMAGES (all metals use the same set) ==========
  // Structure: Video (if exists) -> Primary image -> Secondary images
  const galleryItems = useMemo(() => [
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/mbasaxj6_1000140441.jpg",
      alt: "Alejandra Heels - Silver",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/q0cdb9tx_1000140440.jpg",
      alt: "Alejandra Heels - White Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/ouebq651_1000140400.jpg",
      alt: "Alejandra Heels - Yellow Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_content-restore-8/artifacts/lghgq1oc_1000140403.jpg",
      alt: "Alejandra Heels - Rose Gold View 1",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/cvvwbdch_1000140396.jpg",
      alt: "Alejandra Heels - Rose Gold View 2",
    },
  ], []);

  // Map metal galleryType to starting slide index
  const metalToSlideIndex = {
    silver: 0,
    white: 1,
    yellow: 2,
    rose: 3,
  };

  // ========== METAL OPTIONS (7 variants) ==========
  const metalOptions = useMemo(() => [
    {
      id: 'silver',
      name: 'Silver',
      category: 'Silver',
      price: pricing.silver.cubic,
      currency: 'CAD',
      swatchColor: '#C0C0C0',
      galleryType: 'silver',
    },
    {
      id: 'white-10k',
      name: '10K White Gold',
      category: '10K Gold',
      price: pricing.solid10k.whiteLab,
      currency: 'CAD',
      swatchColor: '#F5F5F0',
      galleryType: 'white',
    },
    {
      id: 'rose-10k',
      name: '10K Rose Gold',
      category: '10K Gold',
      price: pricing.solid10k.roseLab,
      currency: 'CAD',
      swatchColor: '#B76E79',
      galleryType: 'rose',
    },
    {
      id: 'yellow-10k',
      name: '10K Yellow Gold',
      category: '10K Gold',
      price: pricing.solid10k.yellowLab,
      currency: 'CAD',
      swatchColor: '#D4AF37',
      galleryType: 'yellow',
    },
    {
      id: 'white-14k',
      name: '14K White Gold',
      category: '14K Gold',
      price: pricing.solid14k.whiteLab,
      currency: 'CAD',
      swatchColor: '#FAF9F6',
      galleryType: 'white',
    },
    {
      id: 'rose-14k',
      name: '14K Rose Gold',
      category: '14K Gold',
      price: pricing.solid14k.roseLab,
      currency: 'CAD',
      swatchColor: '#C4756E',
      galleryType: 'rose',
    },
    {
      id: 'yellow-14k',
      name: '14K Yellow Gold',
      category: '14K Gold',
      price: pricing.solid14k.yellowLab,
      currency: 'CAD',
      swatchColor: '#CFB53B',
      galleryType: 'yellow',
    },
  ], [pricing]);

  // State
  const [selectedMetalId, setSelectedMetalId] = useState('silver');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  
  // Get current selection
  const selectedMetal = metalOptions.find(m => m.id === selectedMetalId) || metalOptions[0];

  // Handle metal change - update gallery to corresponding slide
  const handleMetalChange = (metalId) => {
    setSelectedMetalId(metalId);
    const metal = metalOptions.find(m => m.id === metalId);
    if (metal) {
      const slideIndex = metalToSlideIndex[metal.galleryType] || 0;
      setCurrentSlide(slideIndex);
    }
  };

  // Handle add to cart
  const onAddToCart = () => {
    handleAddToCart({
      id: `alejandra-heels-${selectedMetal.id}`,
      name: 'Alejandra Heels Earrings',
      image: galleryItems[0].src,
      price: selectedMetal.price,
      slug: 'alejandra-heels',
      materials: [selectedMetal.name]
    }, 1, selectedMetal.name);
  };

  // Preload all images
  useEffect(() => {
    galleryItems.forEach(item => {
      const img = new Image();
      img.src = item.src;
    });
  }, [galleryItems]);

  // Format price
  const formatPrice = (price, currency) => {
    if (tierPricesLive.default) {
      return tierPricesLive.default.formatted;
    }
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
      
      {/* 1. HERO VIDEO */}
      <section className="alejandra-hero">
        <video autoPlay muted loop playsInline className="alejandra-hero-video">
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

      {/* 2. PRODUCT TITLE */}
      <section className="alejandra-title-section">
        <p className="alejandra-eyebrow">Statement Earrings</p>
        <h2 className="alejandra-product-title">ALEJANDRA HEELS</h2>
      </section>

      {/* 3. MAIN GALLERY - Uses ProductGallery component */}
      <section className="alejandra-gallery-section">
        <div className="alejandra-gallery-container">
          <ProductGallery items={galleryItems} initialSlide={currentSlide} />
        </div>
      </section>

      {/* 4. METAL SWATCHES (Directly under gallery) */}
      <section className="alejandra-swatches-section">
        <div className="alejandra-swatches" data-testid="swatch-selector">
          {/* Silver */}
          <div className="alejandra-swatch-group">
            <span className="alejandra-swatch-label">Silver</span>
            <div className="alejandra-swatch-row">
              {silverOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleMetalChange(opt.id)}
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
                  onClick={() => handleMetalChange(opt.id)}
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
                  onClick={() => handleMetalChange(opt.id)}
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

        {/* 5. SELECTED METAL LABEL */}
        <p className="alejandra-selected-metal" data-testid="selected-metal-label">
          {selectedMetal.name}
        </p>

        {/* 6. PRICE */}
        <p className="alejandra-price" data-testid="product-price">
          {formatPrice(selectedMetal.price, selectedMetal.currency)}
        </p>

        {/* 7. SHORT DESCRIPTION */}
        <p className="alejandra-description">
          Sculptural miniature heels cast in precious metal and finished with a pavé strap.
        </p>

        {/* 8. ADD TO CART */}
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className={`alejandra-add-btn ${isAdding ? 'added' : ''}`}
          data-testid="add-to-cart-button"
        >
          {buttonText}
        </button>
      </section>

      {/* STYLES */}
      <style>{`
        .alejandra-page {
          background: #000;
          min-height: 100vh;
          color: #fff;
        }

        /* 1. HERO */
        .alejandra-hero {
          position: relative;
          width: 100%;
          height: 75vh;
          min-height: 450px;
          overflow: hidden;
        }

        .alejandra-hero-video {
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
          background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
        }

        .alejandra-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 7vw, 56px);
          font-weight: 400;
          letter-spacing: 0.2em;
          margin-bottom: 12px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }

        .alejandra-hero-subtitle {
          font-size: clamp(12px, 1.8vw, 16px);
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase;
        }

        /* 2. TITLE SECTION */
        .alejandra-title-section {
          text-align: center;
          padding: 60px 24px 40px;
        }

        .alejandra-eyebrow {
          font-size: 10px;
          letter-spacing: 0.3em;
          color: rgba(199, 162, 75, 0.6);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .alejandra-product-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 5vw, 36px);
          font-weight: 400;
          letter-spacing: 0.12em;
        }

        /* 3. GALLERY SECTION */
        .alejandra-gallery-section {
          background: #000;
          padding: 0 24px 50px;
        }

        .alejandra-gallery-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* 4-8. SWATCHES + PRODUCT INFO */
        .alejandra-swatches-section {
          max-width: 480px;
          margin: 0 auto;
          padding: 0 24px 100px;
          text-align: center;
        }

        .alejandra-swatches {
          margin-bottom: 28px;
        }

        .alejandra-swatch-group {
          margin-bottom: 20px;
        }

        .alejandra-swatch-label {
          display: block;
          font-size: 9px;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .alejandra-swatch-row {
          display: flex;
          justify-content: center;
          gap: 14px;
        }

        .alejandra-swatch {
          width: 40px;
          height: 40px;
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
          font-size: 13px;
          color: #C7A24B;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .alejandra-price {
          font-size: 26px;
          font-weight: 300;
          color: #C7A24B;
          margin-bottom: 20px;
        }

        .alejandra-description {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          font-style: italic;
          margin-bottom: 28px;
          line-height: 1.7;
          max-width: 320px;
          margin-left: auto;
          margin-right: auto;
        }

        .alejandra-add-btn {
          width: 100%;
          max-width: 300px;
          padding: 16px 32px;
          background: #C7A24B;
          border: none;
          color: #000;
          font-size: 12px;
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

        /* MOBILE */
        @media (max-width: 768px) {
          .alejandra-hero {
            height: 55vh;
            min-height: 380px;
          }

          .alejandra-title-section {
            padding: 48px 20px 32px;
          }

          .alejandra-gallery-section {
            padding: 0 12px 40px;
          }

          .alejandra-swatches-section {
            padding: 0 20px 80px;
          }

          .alejandra-swatch {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
    </div>
  );
};

export default AlejandraHeelsPage;
