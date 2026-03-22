import React, { useState } from 'react';

const FormeCuffPage = () => {
  // Metal options with pricing and images
  const metalOptions = {
    solidGold: {
      label: 'Solid Gold',
      options: [
        {
          id: 'yellow-10k',
          name: '10K Yellow Gold',
          shortName: 'Yellow 10K',
          price: 2850,
          currency: 'CAD',
          image: 'https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png',
        },
        {
          id: 'rose-10k',
          name: '10K Rose Gold',
          shortName: 'Rose 10K',
          price: 2850,
          currency: 'CAD',
          image: 'https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png',
        },
      ],
    },
    platedSilver: {
      label: 'Gold Plated Silver',
      options: [
        {
          id: 'plated-yellow',
          name: 'Gold Plated Silver (Yellow)',
          shortName: 'Yellow Plated',
          price: 695,
          currency: 'CAD',
          image: 'https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png',
        },
        {
          id: 'plated-rose',
          name: 'Gold Plated Silver (Rose)',
          shortName: 'Rose Plated',
          price: 695,
          currency: 'CAD',
          image: 'https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png',
        },
      ],
    },
  };

  // Flatten all options for easy lookup
  const allMetalOptions = [
    ...metalOptions.solidGold.options,
    ...metalOptions.platedSilver.options,
  ];

  // State for selected metal (default: 10K Yellow Gold)
  const [selectedMetalId, setSelectedMetalId] = useState('yellow-10k');
  
  // Get current selection
  const selectedMetal = allMetalOptions.find(m => m.id === selectedMetalId) || allMetalOptions[0];

  // Format price
  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Hero image (always 10K Yellow Gold)
  const heroImageUrl = "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/74rz59yq_1000142846.png";
  const videoUrl = "https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/26vbm4f4_XiaoYing_Video_1774098119024.mp4";

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
            className="forme-video"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* SECTION 3 — GALLERY */}
      <section className="forme-gallery-section">
        <div className="forme-gallery-container">
          <div className="forme-gallery-grid">
            {/* Row 1: Two lifestyle shots */}
            <div className="forme-gallery-item">
              <img 
                src="https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/rgzne2e0_1000143032.jpg" 
                alt="FORME CUFF - On Wrist"
                className="forme-gallery-image"
                data-testid="gallery-image-1"
              />
            </div>
            <div className="forme-gallery-item">
              <img 
                src="https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/a5hjexrp_1000143030.jpg" 
                alt="FORME CUFF - Product on Marble"
                className="forme-gallery-image"
                data-testid="gallery-image-2"
              />
            </div>
            {/* Row 2: Full-width front view */}
            <div className="forme-gallery-item forme-gallery-item-full">
              <img 
                src="https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/k7kbqg47_1000142846.png" 
                alt="FORME CUFF - Front View"
                className="forme-gallery-image"
                data-testid="gallery-image-3"
              />
            </div>
            {/* Row 3: Side angle and top view */}
            <div className="forme-gallery-item">
              <img 
                src="https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/asvnmb9f_1000142852.png" 
                alt="FORME CUFF - Side Angle"
                className="forme-gallery-image"
                data-testid="gallery-image-4"
              />
            </div>
            <div className="forme-gallery-item">
              <img 
                src="https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/w3ocrekw_1000142624.jpg" 
                alt="FORME CUFF - Top View"
                className="forme-gallery-image"
                data-testid="gallery-image-5"
              />
            </div>
            {/* Row 4: Detail close-ups */}
            <div className="forme-gallery-item">
              <img 
                src="https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/2czdv0i2_1000142848.png" 
                alt="FORME CUFF - Edge Detail"
                className="forme-gallery-image"
                data-testid="gallery-image-6"
              />
            </div>
            <div className="forme-gallery-item">
              <img 
                src="https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/0vvlo7f5_1000142850.png" 
                alt="FORME CUFF - Figure Detail"
                className="forme-gallery-image"
                data-testid="gallery-image-7"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — PRODUCT DETAILS & METAL SELECTOR */}
      <section className="forme-product-section">
        <div className="forme-product-layout">
          {/* Product Image */}
          <div className="forme-product-image-container">
            <img 
              src={selectedMetal.image} 
              alt={`FORME CUFF - ${selectedMetal.name}`}
              className="forme-product-image"
            />
          </div>

          {/* Product Info */}
          <div className="forme-product-info">
            <p className="forme-product-eyebrow">The Forme Collection</p>
            <h2 className="forme-product-title">FORME CUFF</h2>
            <p className="forme-product-price">
              {formatPrice(selectedMetal.price, selectedMetal.currency)}
            </p>

            {/* Metal Selector */}
            <div className="forme-metal-selector" data-testid="metal-selector">
              {/* Solid Gold Group */}
              <div className="forme-metal-group">
                <p className="forme-metal-group-label">{metalOptions.solidGold.label}</p>
                <div className="forme-metal-options">
                  {metalOptions.solidGold.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMetalId(option.id)}
                      className={`forme-metal-option ${selectedMetalId === option.id ? 'selected' : ''}`}
                      data-testid={`metal-option-${option.id}`}
                    >
                      <span className="forme-metal-name">{option.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plated Silver Group */}
              <div className="forme-metal-group">
                <p className="forme-metal-group-label">{metalOptions.platedSilver.label}</p>
                <div className="forme-metal-options">
                  {metalOptions.platedSilver.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMetalId(option.id)}
                      className={`forme-metal-option ${selectedMetalId === option.id ? 'selected' : ''}`}
                      data-testid={`metal-option-${option.id}`}
                    >
                      <span className="forme-metal-name">{option.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Supporting Copy */}
            <p className="forme-metal-note">
              Offered in solid gold and gold-plated silver — without compromise in form.
            </p>

            {/* Selected Metal Display */}
            <p className="forme-selected-metal">
              Selected: <span>{selectedMetal.name}</span>
            </p>
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
          padding: 40px 24px 80px;
        }

        .forme-gallery-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .forme-gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .forme-gallery-item {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          aspect-ratio: 1 / 1;
        }

        .forme-gallery-item-full {
          grid-column: 1 / -1;
          aspect-ratio: 16 / 9;
        }

        .forme-gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease, filter 0.3s ease;
        }

        .forme-gallery-item:hover .forme-gallery-image {
          transform: scale(1.03);
          filter: brightness(1.05);
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

        /* ========== METAL SELECTOR ========== */
        .forme-metal-selector {
          margin-bottom: 20px;
        }

        .forme-metal-group {
          margin-bottom: 20px;
        }

        .forme-metal-group:last-child {
          margin-bottom: 0;
        }

        .forme-metal-group-label {
          font-size: 10px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .forme-metal-options {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .forme-metal-option {
          padding: 10px 18px;
          background: transparent;
          border: 1px solid rgba(199, 162, 75, 0.25);
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 2px;
        }

        .forme-metal-option:hover {
          border-color: rgba(199, 162, 75, 0.5);
          color: #fff;
        }

        .forme-metal-option.selected {
          border-color: #C7A24B;
          background: rgba(199, 162, 75, 0.1);
          color: #C7A24B;
        }

        .forme-metal-name {
          white-space: nowrap;
        }

        .forme-metal-note {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .forme-selected-metal {
          font-size: 12px;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.5);
        }

        .forme-selected-metal span {
          color: #C7A24B;
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
            padding: 30px 16px 60px;
          }

          .forme-gallery-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .forme-gallery-item {
            border-radius: 6px;
          }

          .forme-gallery-item-full {
            grid-column: 1;
            aspect-ratio: 1 / 1;
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

          .forme-metal-options {
            justify-content: center;
          }

          .forme-metal-group-label {
            text-align: center;
          }

          .forme-metal-note {
            text-align: center;
          }

          .forme-selected-metal {
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
