import React, { useState, useMemo, useEffect } from 'react';
import { useAddToCart } from '../hooks/useAddToCart';

const RhythmMeshRingPage = () => {
  // ========== METAL OPTIONS ==========
  const metalOptions = useMemo(() => [
    {
      id: 'silver',
      name: 'Silver',
      category: 'Silver',
      price: 1450,
      currency: 'CAD',
      swatchColor: '#C0C0C0',
    },
    {
      id: 'white-10k',
      name: '10K White Gold',
      category: '10K Gold',
      price: 2850,
      currency: 'CAD',
      swatchColor: '#F5F5F0',
    },
  ], []);

  // ========== GALLERY IMAGES ==========
  const galleryImages = useMemo(() => [
    "https://customer-assets.emergentagent.com/job_610e6b12-110f-4709-a3d7-334f7b0abd3a/artifacts/nhkjujpb_1000143088.jpg",
    "https://customer-assets.emergentagent.com/job_610e6b12-110f-4709-a3d7-334f7b0abd3a/artifacts/fkn1jc4h_1000143079.jpg",
    "https://customer-assets.emergentagent.com/job_610e6b12-110f-4709-a3d7-334f7b0abd3a/artifacts/5sgfwfn0_1000143092.jpg",
    "https://customer-assets.emergentagent.com/job_610e6b12-110f-4709-a3d7-334f7b0abd3a/artifacts/bze0z8es_1000143313.jpg",
    "https://customer-assets.emergentagent.com/job_610e6b12-110f-4709-a3d7-334f7b0abd3a/artifacts/kx1dagdy_1000143311.png",
    "https://customer-assets.emergentagent.com/job_610e6b12-110f-4709-a3d7-334f7b0abd3a/artifacts/xjxr3blo_1000143315.png",
  ], []);

  // State
  const [selectedMetalId, setSelectedMetalId] = useState('silver');
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  
  // Get current selection
  const selectedMetal = metalOptions.find(m => m.id === selectedMetalId) || metalOptions[0];

  // Handle add to cart
  const onAddToCart = () => {
    handleAddToCart({
      id: `rhythm-mesh-ring-${selectedMetal.id}`,
      name: 'Rhythm Mesh™ Ring',
      image: galleryImages[0],
      price: selectedMetal.price,
      slug: 'rhythm-mesh-ring',
      materials: [selectedMetal.name]
    }, 1, selectedMetal.name);
  };

  // Preload all images
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
  const goldOptions = metalOptions.filter(m => m.category === '10K Gold');

  return (
    <div className="rhythm-page" data-testid="rhythm-mesh-ring-page">
      
      {/* 1. HERO IMAGE */}
      <section className="rhythm-hero">
        <img 
          src={galleryImages[0]} 
          alt="Rhythm Mesh Ring Hero"
          className="rhythm-hero-image"
        />
        <div className="rhythm-hero-overlay">
          <h1 className="rhythm-hero-title">RHYTHM MESH™</h1>
          <p className="rhythm-hero-subtitle">Structured motion. Captured in metal.</p>
        </div>
      </section>

      {/* 2. PRODUCT TITLE */}
      <section className="rhythm-title-section">
        <p className="rhythm-eyebrow">Unisex Ring</p>
        <h2 className="rhythm-product-title">RHYTHM MESH™ RING</h2>
      </section>

      {/* 3. MAIN GALLERY */}
      <section className="rhythm-gallery">
        <div className="rhythm-gallery-grid">
          {galleryImages.map((img, idx) => (
            <div key={idx} className="rhythm-gallery-item">
              <img 
                src={img} 
                alt={`Rhythm Mesh Ring - View ${idx + 1}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 4-8. METAL SWATCHES + PRODUCT INFO */}
      <section className="rhythm-purchase-section">
        <div className="rhythm-swatches" data-testid="swatch-selector">
          {/* Silver */}
          <div className="rhythm-swatch-group">
            <span className="rhythm-swatch-label">Silver</span>
            <div className="rhythm-swatch-row">
              {silverOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedMetalId(opt.id)}
                  className={`rhythm-swatch ${selectedMetalId === opt.id ? 'selected' : ''}`}
                  data-testid={`swatch-${opt.id}`}
                  title={opt.name}
                >
                  <span style={{ backgroundColor: opt.swatchColor }} />
                </button>
              ))}
            </div>
          </div>

          {/* 10K Gold */}
          <div className="rhythm-swatch-group">
            <span className="rhythm-swatch-label">10K Gold</span>
            <div className="rhythm-swatch-row">
              {goldOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedMetalId(opt.id)}
                  className={`rhythm-swatch ${selectedMetalId === opt.id ? 'selected' : ''}`}
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
        <p className="rhythm-selected-metal" data-testid="selected-metal-label">
          {selectedMetal.name}
        </p>

        {/* Price */}
        <p className="rhythm-price" data-testid="product-price">
          {formatPrice(selectedMetal.price, selectedMetal.currency)}
        </p>

        {/* Description */}
        <p className="rhythm-description">
          A bold statement ring featuring an intricate mesh-textured band crowned with a stunning emerald-cut citrine. 
          The architectural mesh pattern creates a captivating interplay of light and shadow, while micro-pavé prongs 
          secure the centerpiece with precision elegance.
        </p>

        {/* Add to Cart */}
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className={`rhythm-add-btn ${isAdding ? 'added' : ''}`}
          data-testid="add-to-cart-button"
        >
          {buttonText}
        </button>
      </section>

      {/* STYLES */}
      <style>{`
        .rhythm-page {
          background: #000;
          min-height: 100vh;
          color: #fff;
        }

        /* 1. HERO */
        .rhythm-hero {
          position: relative;
          width: 100%;
          height: 75vh;
          min-height: 450px;
          overflow: hidden;
        }

        .rhythm-hero-image {
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

        .rhythm-hero-overlay {
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

        .rhythm-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 7vw, 56px);
          font-weight: 400;
          letter-spacing: 0.2em;
          margin-bottom: 12px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }

        .rhythm-hero-subtitle {
          font-size: clamp(12px, 1.8vw, 16px);
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase;
        }

        /* 2. TITLE SECTION */
        .rhythm-title-section {
          text-align: center;
          padding: 60px 24px 40px;
        }

        .rhythm-eyebrow {
          font-size: 10px;
          letter-spacing: 0.3em;
          color: rgba(199, 162, 75, 0.6);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .rhythm-product-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 5vw, 36px);
          font-weight: 400;
          letter-spacing: 0.12em;
        }

        /* 3. GALLERY */
        .rhythm-gallery {
          padding: 0 24px 50px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .rhythm-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .rhythm-gallery-item {
          aspect-ratio: 1/1;
          overflow: hidden;
          border-radius: 4px;
          background: #111;
        }

        .rhythm-gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .rhythm-gallery-item:hover img {
          transform: scale(1.03);
        }

        /* 4-8. PURCHASE SECTION */
        .rhythm-purchase-section {
          max-width: 480px;
          margin: 0 auto;
          padding: 0 24px 100px;
          text-align: center;
        }

        .rhythm-swatches {
          margin-bottom: 28px;
        }

        .rhythm-swatch-group {
          margin-bottom: 20px;
        }

        .rhythm-swatch-label {
          display: block;
          font-size: 9px;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .rhythm-swatch-row {
          display: flex;
          justify-content: center;
          gap: 14px;
        }

        .rhythm-swatch {
          width: 40px;
          height: 40px;
          padding: 3px;
          background: transparent;
          border: 2px solid transparent;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rhythm-swatch:hover {
          border-color: rgba(199, 162, 75, 0.4);
        }

        .rhythm-swatch.selected {
          border-color: #C7A24B;
        }

        .rhythm-swatch span {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }

        .rhythm-selected-metal {
          font-size: 13px;
          color: #C7A24B;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .rhythm-price {
          font-size: 26px;
          font-weight: 300;
          color: #C7A24B;
          margin-bottom: 20px;
        }

        .rhythm-description {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          font-style: italic;
          margin-bottom: 28px;
          line-height: 1.7;
          max-width: 360px;
          margin-left: auto;
          margin-right: auto;
        }

        .rhythm-add-btn {
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

        .rhythm-add-btn:hover {
          background: #B8944A;
        }

        .rhythm-add-btn.added {
          background: #16a34a;
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .rhythm-hero {
            height: 55vh;
            min-height: 380px;
          }

          .rhythm-title-section {
            padding: 48px 20px 32px;
          }

          .rhythm-gallery {
            padding: 0 16px 40px;
          }

          .rhythm-gallery-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .rhythm-purchase-section {
            padding: 0 20px 80px;
          }

          .rhythm-swatch {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
    </div>
  );
};

export default RhythmMeshRingPage;
