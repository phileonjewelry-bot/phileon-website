import React from 'react';

const FormeCuffPage = () => {
  // Asset URLs
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

      {/* SECTION 3 — DESCRIPTION */}
      <section className="forme-description-section">
        <div className="forme-description-content">
          <p className="forme-description-eyebrow">The Forme Collection</p>
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
          <div className="forme-description-divider" />
          <p className="forme-description-material">
            Available in 10K &amp; 14K Gold
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

        /* ========== DESCRIPTION SECTION ========== */
        .forme-description-section {
          background: #000;
          padding: 100px 24px 120px;
        }

        .forme-description-content {
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
        }

        .forme-description-eyebrow {
          font-size: 11px;
          letter-spacing: 0.3em;
          color: rgba(199, 162, 75, 0.7);
          text-transform: uppercase;
          margin-bottom: 16px;
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
          margin-bottom: 40px;
        }

        .forme-description-divider {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(199, 162, 75, 0.5), transparent);
          margin: 0 auto 24px;
        }

        .forme-description-material {
          font-size: 13px;
          letter-spacing: 0.2em;
          color: rgba(199, 162, 75, 0.6);
          text-transform: uppercase;
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

          .forme-description-section {
            padding: 80px 20px 100px;
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
