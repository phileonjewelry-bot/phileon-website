import React, { useState, useRef, useEffect } from "react";
import { useAddToCart } from "../hooks/useAddToCart";

/* ═══════════════════════════════════════════════════════════════
   BOUND — THE BUSTIER BANGLE
   Luxury Editorial Product Page
   Cartier-level cinematic experience
═══════════════════════════════════════════════════════════════ */

const BoundPage = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedTier, setSelectedTier] = useState("signature");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const galleryRef = useRef(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  const tiers = {
    foundation: {
      name: "Foundation",
      metal: "10K Yellow Gold",
      price: 12800,
      description: "Built for presence."
    },
    signature: {
      name: "Signature",
      metal: "14K Yellow Gold",
      price: 18400,
      badge: "SIGNATURE",
      description: "Balanced weight and clarity."
    },
    heirloom: {
      name: "Heirloom",
      metal: "18K Yellow Gold",
      price: 24600,
      badge: "HEIRLOOM",
      description: "Maximum richness and permanence."
    }
  };

  const media = [
    {
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/dxi7r360_1000143892.png",
      alt: "BOUND hero model red carpet",
      section: null
    },
    {
      src: "https://customer-assets.emergentagent.com/job_66f130cc-5570-4637-a9c3-d393428997f1/artifacts/px6jqw9c_1000143911.png",
      alt: "BOUND editorial wrist black dress",
      section: null
    },
    {
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/xrcki9ji_1000143865.png",
      alt: "BOUND clean product front",
      section: "detail"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_66f130cc-5570-4637-a9c3-d393428997f1/artifacts/zwzt7f6l_1000143874.webp",
      alt: "BOUND collection lifestyle",
      section: "lifestyle"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_66f130cc-5570-4637-a9c3-d393428997f1/artifacts/4ujxm427_1000143869.png",
      alt: "BOUND angled on velvet",
      section: "craft"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/videj0m3_1000143867.png",
      alt: "BOUND back structure",
      section: "structure"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/4ha15kss_1000143886.webp",
      alt: "BOUND sculptural detail",
      section: "sculptural"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_66f130cc-5570-4637-a9c3-d393428997f1/artifacts/fs69juit_1000143873.webp",
      alt: "BOUND macro diamond mesh",
      section: "macro"
    },
    {
      src: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/k09vug5v_1000143894.png",
      alt: "BOUND specification shot",
      section: "spec"
    }
  ];

  const currentTier = tiers[selectedTier];

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const onAddToCart = () => {
    handleAddToCart({
      id: `bound-bustier-bangle-${selectedTier}`,
      name: "BOUND — The Bustier Bangle",
      image: media[0].src,
      price: currentTier.price,
      slug: "bound",
      materials: [currentTier.metal]
    }, 1, `${currentTier.name} · ${currentTier.metal}`);
  };

  return (
    <div className="bound-page bg-[#0a0a0a] text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO INTRO SECTION
          Full-screen cinematic opener - Campaign framing
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-hero relative h-screen w-full overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={media[0].src}
            alt="BOUND — The Bustier Bangle"
            className="h-full w-auto object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/40 via-transparent to-[#0a0a0a]/40" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 pb-20 md:pb-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <p className="text-[#C6A25D]/60 text-[10px] tracking-[0.5em] uppercase mb-4">
              PHILEON
            </p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-[0.02em] text-white/90 font-light">
              BOUND
            </h1>
            <p className="text-white/40 text-lg md:text-xl tracking-[0.15em] mt-2 font-light">
              The Bustier Bangle
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-[#C6A25D]/40 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN PRODUCT SECTION
          2-column layout: Gallery LEFT, Info RIGHT (sticky)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-product py-16 md:py-22 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-20">
            
            {/* LEFT — Gallery */}
            <div ref={galleryRef}>
              {/* Main Image */}
              <div 
                className="bound-gallery-main relative aspect-square overflow-hidden bg-[#0a0a0a] rounded-sm cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={media[activeImage].src}
                  alt={media[activeImage].alt}
                  className="w-full h-full object-contain transition-transform duration-700 ease-out"
                  style={{
                    transform: isZoomed ? `scale(1.8)` : 'scale(1)',
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                  }}
                />
              </div>

              {/* Thumbnails */}
              <div className="bound-thumbnails flex gap-3 mt-6 overflow-x-auto pb-2">
                {media.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-sm transition-all duration-300 ${
                      activeImage === index
                        ? "ring-2 ring-[#C6A25D] shadow-[0_0_12px_rgba(198,162,93,0.4)] brightness-110"
                        : "brightness-90 contrast-105 hover:brightness-110 hover:scale-105"
                    }`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT — Product Info (Sticky) */}
            <div className="lg:sticky lg:top-32 self-start">
              <div className="bound-info">
                <p className="text-[#C6A25D]/50 text-[10px] tracking-[0.4em] uppercase mb-6">
                  PHILEON
                </p>

                <h2 className="font-serif text-4xl md:text-5xl tracking-[0.02em] text-white/90 font-light">
                  BOUND
                </h2>
                <p className="text-white/50 text-lg tracking-[0.1em] mt-1 font-light">
                  The Bustier Bangle
                </p>

                <div className="mt-6 space-y-1">
                  <p className="text-white/40 text-sm italic tracking-wide">
                    La maîtrise du corps
                  </p>
                  <p className="text-white/25 text-xs italic">
                    The discipline of form
                  </p>
                </div>

                <div className="text-[#C6A25D] text-4xl mt-8 tracking-wide font-light">
                  ${currentTier.price.toLocaleString()} <span className="text-lg text-white/30">CAD</span>
                </div>

                <p className="text-white/50 text-sm mt-2">
                  {currentTier.metal} — {currentTier.description}
                </p>

                {/* Tier Selection */}
                <div className="mt-10">
                  <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-4">
                    Select Tier
                  </p>
                  <div className="space-y-3">
                    {Object.entries(tiers).map(([key, tier]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTier(key)}
                        className={`w-full text-left p-5 rounded-sm transition-all duration-300 ${
                          selectedTier === key
                            ? "bg-[#C6A25D]/10 border border-[#C6A25D]/40"
                            : "bg-white/[0.02] border border-white/[0.05] hover:border-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white/80 text-lg tracking-wide">{tier.name}</p>
                            <p className="text-white/30 text-xs mt-1">{tier.metal}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#C6A25D] text-xl">${tier.price.toLocaleString()}</p>
                            {tier.badge && (
                              <span className="text-[9px] tracking-[0.2em] text-[#C6A25D]/60 uppercase">
                                {tier.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-10 space-y-4">
                  <p className="text-white/60 text-sm leading-relaxed tracking-wide">
                    Form, held in tension.
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    A study in restraint and release —<br />
                    engineered to move with the body,<br />
                    yet command the eye.
                  </p>
                  <div className="text-white/50 text-sm leading-relaxed space-y-0">
                    <p>Balanced.</p>
                    <p>Controlled.</p>
                    <p>Unapologetically intentional.</p>
                  </div>
                  <p className="text-[#C6A25D]/40 text-[10px] tracking-[0.3em] uppercase mt-6">
                    PHILEON — OBJECT SERIES
                  </p>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={onAddToCart}
                  disabled={isAdding}
                  className={`w-full mt-10 py-5 text-sm tracking-[0.3em] uppercase transition-all duration-300 ${
                    isAdding
                      ? "bg-green-600 text-white"
                      : "bg-transparent border border-white/20 text-white/80 hover:bg-white hover:text-[#0a0a0a]"
                  }`}
                >
                  {isAdding ? buttonText : "ADD TO CART"}
                </button>

                <div className="mt-6 space-y-1 text-center">
                  <p className="text-white/30 text-xs tracking-wide">Sold as a single piece</p>
                  <p className="text-white/20 text-xs">Complimentary insured shipping within Canada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STORY SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-story py-32 md:py-48">
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <h3 className="font-serif text-3xl md:text-4xl text-[#C6A25D]/80 tracking-wide font-light">
            Form that follows you.
          </h3>
          <div className="mt-10 space-y-4 text-white/40 text-lg leading-relaxed">
            <p>Designed to move with the body, not against it.</p>
            <p>Every curve exists with intention.</p>
            <p>Every line holds its place.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DETAIL SECTION — Wrist on black dress
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-detail">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="aspect-square lg:aspect-auto overflow-hidden">
            <img
              src={media[2].src}
              alt="BOUND worn elegantly"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[6s] ease-out"
            />
          </div>
          <div className="flex items-center justify-center p-12 md:p-20 lg:p-32 bg-[#0a0a0a]">
            <div className="max-w-md">
              <h3 className="font-serif text-2xl md:text-3xl text-[#C6A25D]/80 tracking-wide font-light">
                Felt before it's seen.
              </h3>
              <div className="mt-8 space-y-4 text-white/40 text-base leading-relaxed">
                <p>A surface that softens against the skin.</p>
                <p>A structure that holds without force.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LIFESTYLE SECTION — Collection display
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-lifestyle">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="flex items-center justify-center p-12 md:p-20 lg:p-32 bg-[#0a0a0a] order-2 lg:order-1">
            <div className="max-w-md">
              <h3 className="font-serif text-2xl md:text-3xl text-[#C6A25D]/80 tracking-wide font-light">
                Worn without effort.
              </h3>
              <div className="mt-8 space-y-4 text-white/40 text-base leading-relaxed">
                <p>Not reserved for moments—</p>
                <p>but made to define them.</p>
              </div>
            </div>
          </div>
          <div className="aspect-square lg:aspect-auto order-1 lg:order-2 overflow-hidden">
            <img
              src={media[3].src}
              alt="BOUND in collection"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[6s] ease-out"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CRAFT SECTION — Angled on velvet
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-craft">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="aspect-square lg:aspect-auto overflow-hidden">
            <img
              src={media[4].src}
              alt="BOUND craft detail"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[6s] ease-out"
            />
          </div>
          <div className="flex items-center justify-center p-12 md:p-20 lg:p-32 bg-[#0a0a0a]">
            <div className="max-w-md">
              <h3 className="font-serif text-2xl md:text-3xl text-[#C6A25D]/80 tracking-wide font-light">
                Precision in every line.
              </h3>
              <div className="mt-8 space-y-4 text-white/40 text-base leading-relaxed">
                <p>Each curve engineered.</p>
                <p>Each intersection deliberate.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STRUCTURE SECTION — Back view
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-structure">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="flex items-center justify-center p-12 md:p-20 lg:p-32 bg-[#0a0a0a] order-2 lg:order-1">
            <div className="max-w-md">
              <h3 className="font-serif text-2xl md:text-3xl text-[#C6A25D]/80 tracking-wide font-light">
                Architecture of intention.
              </h3>
              <div className="mt-8 space-y-4 text-white/40 text-base leading-relaxed">
                <p>Every angle considered.</p>
                <p>Every joint resolved.</p>
              </div>
            </div>
          </div>
          <div className="aspect-square lg:aspect-auto order-1 lg:order-2 overflow-hidden">
            <img
              src={media[5].src}
              alt="BOUND structure"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[6s] ease-out"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MACRO SECTION — Diamond mesh detail (Full width)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-macro relative">
        <div className="aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden">
          <img
            src={media[7].src}
            alt="BOUND macro detail"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-[8s] ease-out"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 md:p-20 text-center">
          <h3 className="font-serif text-2xl md:text-4xl text-white/90 tracking-wide font-light">
            The language of detail.
          </h3>
          <p className="text-white/40 text-base mt-4 tracking-wide">
            Hand-set diamonds. Woven gold mesh. Generations of craft.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SCULPTURAL SECTION — Artistic angle
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-sculptural py-32 md:py-48">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-[#C6A25D]/50 text-[10px] tracking-[0.4em] uppercase mb-6">
                THE FORM
              </p>
              <h3 className="font-serif text-3xl md:text-4xl text-white/90 tracking-wide font-light">
                Sculpture, not jewelry.
              </h3>
              <div className="mt-8 space-y-4 text-white/40 text-base leading-relaxed">
                <p>The bustier silhouette reimagined as wearable architecture.</p>
                <p>A piece that exists in three dimensions, demanding attention from every angle.</p>
                <p>Gold mesh breathes. Diamond borders define. The wrist becomes art.</p>
              </div>
            </div>
            <div className="order-1 lg:order-2 overflow-hidden rounded-sm">
              <img
                src={media[6].src}
                alt="BOUND sculptural"
                className="w-full h-auto hover:scale-105 transition-transform duration-[6s] ease-out"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SPEC SECTION — Clean product centered
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-spec py-32 md:py-48 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[#C6A25D]/50 text-[10px] tracking-[0.4em] uppercase mb-10">
            SPECIFICATIONS
          </p>
          <img
            src={media[8].src}
            alt="BOUND specifications"
            className="w-full h-auto"
          />
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-[#C6A25D] text-2xl font-serif">18K</p>
              <p className="text-white/30 text-xs tracking-widest uppercase mt-2">Available Gold</p>
            </div>
            <div>
              <p className="text-[#C6A25D] text-2xl font-serif">Mesh</p>
              <p className="text-white/30 text-xs tracking-widest uppercase mt-2">Weave Pattern</p>
            </div>
            <div>
              <p className="text-[#C6A25D] text-2xl font-serif">VS+</p>
              <p className="text-white/30 text-xs tracking-widest uppercase mt-2">Diamond Clarity</p>
            </div>
            <div>
              <p className="text-[#C6A25D] text-2xl font-serif">1</p>
              <p className="text-white/30 text-xs tracking-widest uppercase mt-2">Size · Adjustable</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-final-cta py-32 md:py-48 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-[#C6A25D]/40 text-[10px] tracking-[0.5em] uppercase mb-6">
            PHILEON
          </p>
          <h2 className="font-serif text-4xl md:text-6xl tracking-[0.02em] text-white/90 font-light">
            BOUND
          </h2>
          <p className="text-white/40 text-lg tracking-[0.15em] mt-2 font-light">
            The Bustier Bangle
          </p>

          <div className="text-[#C6A25D] text-3xl mt-10 tracking-wide font-light">
            From ${tiers.foundation.price.toLocaleString()} CAD
          </div>

          <button
            onClick={onAddToCart}
            disabled={isAdding}
            className={`mt-10 px-16 py-5 text-sm tracking-[0.3em] uppercase transition-all duration-300 ${
              isAdding
                ? "bg-green-600 text-white"
                : "bg-transparent border border-white/20 text-white/80 hover:bg-white hover:text-[#0a0a0a]"
            }`}
          >
            {isAdding ? buttonText : "ADD TO CART"}
          </button>

          <p className="text-white/20 text-xs mt-8 tracking-wide">
            Complimentary insured shipping within Canada
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STYLES
      ═══════════════════════════════════════════════════════════════ */}
      <style>{`
        .bound-page {
          font-family: 'Playfair Display', serif;
        }

        .bound-gallery-main {
          background: linear-gradient(145deg, #0a0a0a 0%, #0f0f0f 100%);
        }

        .bound-thumbnails::-webkit-scrollbar {
          height: 4px;
        }

        .bound-thumbnails::-webkit-scrollbar-thumb {
          background: rgba(198, 162, 93, 0.2);
          border-radius: 999px;
        }

        .bound-thumbnails::-webkit-scrollbar-track {
          background: transparent;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }

        /* Smooth section transitions */
        .bound-story,
        .bound-detail,
        .bound-lifestyle,
        .bound-craft,
        .bound-structure,
        .bound-macro,
        .bound-sculptural,
        .bound-spec,
        .bound-final-cta {
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards;
          animation-delay: 0.2s;
        }

        /* Macro section overlay */
        .bound-macro {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default BoundPage;
