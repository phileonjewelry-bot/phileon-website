import React, { useState, useMemo, useEffect } from 'react';
import ProductGallery from '../components/ProductGallery';
import { useAddToCart } from '../hooks/useAddToCart';
import { products } from '../data/products';
import { useLiveTierPrices } from '../hooks/useLivePrice';
const MonikaCouturePage = () => {
  const tierPricesLive = useLiveTierPrices("monikaCouture");
  // ========== GALLERY ITEMS (Video first, then images) ==========
  const galleryItems = useMemo(() => [
    {
      type: "video",
      src: "/videos/monika-couture.mp4",
      poster: "/images/thumbnails/monika-couture-thumb.jpg",
      alt: "Monika Couture video",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg",
      alt: "Monika Couture - Hero",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/n57dc44j_1000139957.jpg",
      alt: "Monika Couture - Worn",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/16wydipm_1000139955.jpg",
      alt: "Monika Couture - All Colors",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/5zjvbk47_1000139953.jpg",
      alt: "Monika Couture - Silver",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/jcswkfyo_1000139952.jpg",
      alt: "Monika Couture - Rose Gold",
    },
    {
      type: "image",
      src: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/gqpaomuo_1000139951.jpg",
      alt: "Monika Couture - Yellow Gold",
    },
  ], []);

  // Map metal type to slide index for swatch navigation
  const metalToSlideIndex = {
    silver: 4,    // Silver image
    white: 4,     // Same as silver (similar look)
    rose: 5,      // Rose Gold image
    yellow: 6,    // Yellow Gold image
  };

  // ========== METAL OPTIONS ==========
  const metalOptions = useMemo(() => [
    {
      id: 'silver',
      name: 'Sterling Silver',
      category: 'Silver',
      price: tierPricesLive.silver?.price || products.monikaCouture.pricing.silver,
      currency: 'USD',
      swatchColor: '#C0C0C0',
      galleryType: 'silver',
    },
    {
      id: 'white-10k',
      name: '10K White Gold',
      category: '10K Gold',
      price: tierPricesLive.white10k?.price || products.monikaCouture.pricing.white10k,
      currency: 'USD',
      swatchColor: '#F5F5F0',
      galleryType: 'white',
    },
    {
      id: 'rose-10k',
      name: '10K Rose Gold',
      category: '10K Gold',
      price: tierPricesLive.rose10k?.price || products.monikaCouture.pricing.rose10k,
      currency: 'USD',
      swatchColor: '#B76E79',
      galleryType: 'rose',
    },
    {
      id: 'yellow-10k',
      name: '10K Yellow Gold',
      category: '10K Gold',
      price: tierPricesLive.yellow10k?.price || products.monikaCouture.pricing.yellow10k,
      currency: 'USD',
      swatchColor: '#D4AF37',
      galleryType: 'yellow',
    },
  ], [tierPricesLive]);

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
      id: `monika-couture-${selectedMetal.id}`,
      name: 'Monika Couture Earrings',
      image: galleryItems[1].src, // Use hero image (not video)
      price: selectedMetal.price,
      slug: 'monika-couture',
      materials: [selectedMetal.name]
    }, 1, selectedMetal.name);
  };

  // Preload all images
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

  // Group metals by category
  const silverOptions = metalOptions.filter(m => m.category === 'Silver');
  const goldOptions = metalOptions.filter(m => m.category === '10K Gold');

  return (
    <div className="monika-page" data-testid="monika-couture-page">
      
      {/* 1. HERO IMAGE */}
      <section className="monika-hero">
        <img 
          src={galleryItems[1].src}
          alt="Monika Couture Earrings Hero"
          className="monika-hero-image"
        />
        <div className="monika-hero-overlay">
          <h1 className="monika-hero-title">MONIKA COUTURE</h1>
          <p className="monika-hero-subtitle">Sculptural elegance. Architectural drama.</p>
        </div>
      </section>

      {/* 2. PRODUCT TITLE */}
      <section className="monika-title-section">
        <p className="monika-eyebrow">Earring Collection</p>
        <h2 className="monika-product-title">MONIKA COUTURE EARRINGS</h2>
      </section>

      {/* 3. MAIN GALLERY - Uses ProductGallery component */}
      <section className="monika-gallery-section">
        <div className="monika-gallery-container">
          <ProductGallery items={galleryItems} initialSlide={currentSlide} />
        </div>
      </section>

      {/* 4-8. METAL SWATCHES + PRODUCT INFO */}
      <section className="monika-purchase-section">
        <div className="monika-swatches" data-testid="swatch-selector">
          {/* Silver */}
          <div className="monika-swatch-group">
            <span className="monika-swatch-label">Silver</span>
            <div className="monika-swatch-row">
              {silverOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleMetalChange(opt.id)}
                  className={`monika-swatch ${selectedMetalId === opt.id ? 'selected' : ''}`}
                  data-testid={`swatch-${opt.id}`}
                  title={opt.name}
                >
                  <span style={{ backgroundColor: opt.swatchColor }} />
                </button>
              ))}
            </div>
          </div>

          {/* 10K Gold */}
          <div className="monika-swatch-group">
            <span className="monika-swatch-label">10K Gold</span>
            <div className="monika-swatch-row">
              {goldOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleMetalChange(opt.id)}
                  className={`monika-swatch ${selectedMetalId === opt.id ? 'selected' : ''}`}
                  data-testid={`swatch-${opt.id}`}
                  title={opt.name}
                >
                  <span style={{ backgroundColor: opt.swatchColor }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Metal Label */}
        <p className="monika-selected-metal" data-testid="selected-metal-label">
          {selectedMetal.name}
        </p>

        {/* Price */}
        <p className="monika-price" data-testid="product-price">
          {formatPrice(selectedMetal.price, selectedMetal.currency)}
        </p>

        {/* Description */}
        <p className="monika-description">
          A sculptural couture earring inspired by the architecture of high fashion.
          The design transforms the silhouette of a fashion heel into an open lattice 
          structure that feels bold, elegant, and dramatic in movement.
        </p>

        {/* Add to Cart */}
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className={`monika-add-btn ${isAdding ? 'added' : ''}`}
          data-testid="add-to-cart-button"
        >
          {buttonText}
        </button>
      </section>

      {/* STYLES */}
      <style>{`
        .monika-page {
          background: #000;
          min-height: 100vh;
          color: #fff;
        }

        /* 1. HERO */
        .monika-hero {
          position: relative;
          width: 100%;
          height: 75vh;
          min-height: 450px;
          overflow: hidden;
        }

        .monika-hero-image {
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

        .monika-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
        }

        .monika-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 7vw, 56px);
          font-weight: 400;
          letter-spacing: 0.2em;
          margin-bottom: 12px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }

        .monika-hero-subtitle {
          font-size: clamp(12px, 1.8vw, 16px);
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase;
        }

        /* 2. TITLE SECTION */
        .monika-title-section {
          text-align: center;
          padding: 60px 24px 40px;
        }

        .monika-eyebrow {
          font-size: 10px;
          letter-spacing: 0.3em;
          color: rgba(199, 162, 75, 0.6);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .monika-product-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 5vw, 36px);
          font-weight: 400;
          letter-spacing: 0.12em;
        }

        /* 3. GALLERY SECTION */
        .monika-gallery-section {
          background: #000;
          padding: 0 24px 50px;
        }

        .monika-gallery-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* 4-8. PURCHASE SECTION */
        .monika-purchase-section {
          max-width: 480px;
          margin: 0 auto;
          padding: 0 24px 100px;
          text-align: center;
        }

        .monika-swatches {
          margin-bottom: 28px;
        }

        .monika-swatch-group {
          margin-bottom: 20px;
        }

        .monika-swatch-label {
          display: block;
          font-size: 9px;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .monika-swatch-row {
          display: flex;
          justify-content: center;
          gap: 14px;
        }

        .monika-swatch {
          width: 40px;
          height: 40px;
          padding: 3px;
          background: transparent;
          border: 2px solid transparent;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .monika-swatch:hover {
          border-color: rgba(199, 162, 75, 0.4);
        }

        .monika-swatch.selected {
          border-color: #C7A24B;
        }

        .monika-swatch span {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }

        .monika-selected-metal {
          font-size: 13px;
          color: #C7A24B;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .monika-price {
          font-size: 26px;
          font-weight: 300;
          color: #C7A24B;
          margin-bottom: 20px;
        }

        .monika-description {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          font-style: italic;
          margin-bottom: 28px;
          line-height: 1.7;
          max-width: 360px;
          margin-left: auto;
          margin-right: auto;
        }

        .monika-add-btn {
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

        .monika-add-btn:hover {
          background: #B8944A;
        }

        .monika-add-btn.added {
          background: #16a34a;
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .monika-hero {
            height: 55vh;
            min-height: 380px;
          }

          .monika-title-section {
            padding: 48px 20px 32px;
          }

          .monika-gallery-section {
            padding: 0 12px 40px;
          }

          .monika-purchase-section {
            padding: 0 20px 80px;
          }

          .monika-swatch {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
    </div>
  );
};

export default MonikaCouturePage;
