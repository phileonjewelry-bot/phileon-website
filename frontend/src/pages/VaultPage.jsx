import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

// ============================================================
// VAULT — /vault/drews-world
// ------------------------------------------------------------
// Exclusive drop environment. Fixed pricing — DOES NOT use the
// sitewide live metal pricing system. Items added from here
// bypass /api/validate-cart because they have no productKey /
// tierKey (see CartContext.validateCart filter).
// ============================================================

// Cinematic hero video — uploaded by user (Lady Bamburgh reveal)
const VAULT_HERO_VIDEO =
  'https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/gjr06mge_hf_20260419_224240_b1b530d9-43a4-4ed4-b0d0-16f3cc8b1826.mp4';

// Poster fallback — prevents headless black-frame screenshots
const VAULT_HERO_POSTER =
  'https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/9wkvhexa_1000147014.png';

// Fixed Vault product — no live pricing, no tierKey, no productKey
const VAULT_LADY_BAMBURGH = {
  id: 'vault-lady-bamburgh-01',
  name: 'LADY BAMBURGH — VAULT EDITION',
  slug: 'vault-lady-bamburgh',
  price: 14800,
  image: VAULT_HERO_POSTER,
  images: [VAULT_HERO_POSTER],
  materials: ['18K Gold', 'Natural Diamonds', 'Vault Edition'],
  // NO productKey / NO tierKey — bypasses live-price validation by design
  vaultExclusive: true,
};

const VaultPage = () => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToBag = () => {
    addToCart(VAULT_LADY_BAMBURGH, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  };

  return (
    <div className="min-h-screen bg-black text-white" data-testid="vault-page">
      {/* Back to Shop */}
      <Link
        to="/"
        className="fixed top-20 left-6 z-20 flex items-center gap-2 text-[11px] tracking-[0.3em] text-white/50 hover:text-[#D4AF37] transition-colors"
        data-testid="vault-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO SHOP</span>
      </Link>

      {/* ============ CINEMATIC HERO ============ */}
      <section
        className="relative w-full h-[90vh] overflow-hidden bg-black"
        data-testid="vault-hero"
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={VAULT_HERO_VIDEO}
          poster={VAULT_HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          data-testid="vault-hero-video"
        />

        {/* Cinematic gradient — deep blacks top & bottom, breathing light in center */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        {/* Vault Exclusive Label */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <span
            className="text-[10px] tracking-[0.5em] text-[#D4AF37]/80 border border-[#D4AF37]/40 px-4 py-2"
            data-testid="vault-exclusive-label"
          >
            VAULT EXCLUSIVE · LIMITED RELEASE
          </span>
        </div>

        {/* Content — centered editorial */}
        <div className="absolute inset-0 flex items-end justify-center pb-20 px-6 text-center">
          <div className="max-w-xl">
            <p className="text-[11px] tracking-[0.4em] text-white/60 mb-3" data-testid="vault-eyebrow">
              PHILEON
            </p>

            <h1
              className="text-4xl md:text-6xl text-white tracking-wide mb-5"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
              data-testid="vault-title"
            >
              LADY BAMBURGH
            </h1>

            <p className="text-white/75 italic text-base md:text-lg mb-10" data-testid="vault-tagline">
              Presence without permission.
            </p>

            <button
              onClick={handleAddToBag}
              disabled={added}
              className="px-10 py-4 bg-[#D4AF37] hover:bg-[#E4BF47] disabled:bg-[#2a8a3a] text-black text-[12px] tracking-[0.25em] font-medium transition-all duration-300 inline-flex items-center gap-3"
              data-testid="vault-add-to-bag-btn"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  ADDED TO BAG
                </>
              ) : (
                <>ADD TO BAG — $14,800 CAD</>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ============ EDITORIAL STATEMENT ============ */}
      <section className="max-w-2xl mx-auto px-6 py-32 text-center" data-testid="vault-statement">
        <p className="text-[10px] tracking-[0.4em] text-[#D4AF37]/50 mb-8">THE VAULT</p>
        <p
          className="text-xl md:text-2xl text-white/80 leading-relaxed italic"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Not a collection. A release. <br />
          Priced once. Held forever.
        </p>
        <div className="w-12 h-px bg-[#D4AF37]/40 mx-auto mt-10" />
      </section>

      {/* ============ SPECIFICATIONS ============ */}
      <section className="max-w-3xl mx-auto px-6 pb-32" data-testid="vault-specs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-[9px] tracking-[0.35em] text-white/30 mb-2">METAL</p>
            <p className="text-[13px] tracking-[0.15em] text-white/80">18K GOLD</p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.35em] text-white/30 mb-2">STONES</p>
            <p className="text-[13px] tracking-[0.15em] text-white/80">NATURAL DIAMONDS</p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.35em] text-white/30 mb-2">EDITION</p>
            <p className="text-[13px] tracking-[0.15em] text-white/80">VAULT — FIXED PRICE</p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.35em] text-white/30 mb-2">SHIPPING</p>
            <p className="text-[13px] tracking-[0.15em] text-white/80">WORLDWIDE</p>
          </div>
        </div>
      </section>

      {/* ============ CLOSING ============ */}
      <footer className="text-center pb-20 px-6" data-testid="vault-footer">
        <p className="text-[10px] tracking-[0.3em] text-[#D4AF37]/50 mb-3">
          DREW&apos;S WORLD
        </p>
        <p className="text-white/30 text-xs italic">
          Reserved for those who seek what others overlook.
        </p>
      </footer>
    </div>
  );
};

export default VaultPage;
