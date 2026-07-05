/* =====================================
   PHILEON — REUSABLE RING PRODUCT PAGE
   Use this component for ALL ring pages.
   ===================================== */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ringSizeProfiles } from "../data/ringSizes";
import { useAddToCart } from "../hooks/useAddToCart";
import { useLiveTierPrices } from "../hooks/useLivePrice";
import { slugToProductKey } from "../components/LiveFromPrice";
import RingSizeSelector, {
  DEFAULT_RING_SIZE,
  ringSizeLabel,
  ringSizeIdToken,
  ringSizeSkuToken,
} from "./RingSizeSelector";

export default function RingProductPage({ product }) {
  const videoRef = useRef(null);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  const productKey = slugToProductKey(product.slug) || product.slug;
  const tierPricesLive = useLiveTierPrices(productKey);

  const [activeMedia, setActiveMedia] = useState(0);
  const [selectedTier, setSelectedTier] = useState(
    product.defaultTier || "signature"
  );
  const [selectedSize, setSelectedSize] = useState(
    product.defaultRingSize || DEFAULT_RING_SIZE
  );
  const [customSize, setCustomSize] = useState("");

  const sizeConfig = useMemo(() => {
    return ringSizeProfiles[product.sizeProfile || "gents"];
  }, [product.sizeProfile]);

  const currentTier = product.tiers[selectedTier];

  // Per-tier gallery override — if the selected tier defines its own `media`,
  // use it; otherwise fall back to `product.media`. This keeps existing pages
  // (single gallery) untouched while allowing PARABOLA-style metal variants
  // (silver/white gold share one gallery, rose gold uses another).
  const activeGallery = useMemo(() => {
    return (currentTier && currentTier.media && currentTier.media.length > 0)
      ? currentTier.media
      : product.media;
  }, [currentTier, product.media]);

  // Reset thumbnail selection when the metal (and therefore the gallery)
  // changes, so we never point at a stale index past the new array's length.
  useEffect(() => {
    setActiveMedia(0);
  }, [selectedTier]);

  // Video autoplay handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0;
      video.play();
    };

    video.addEventListener("ended", handleEnded);

    const tryPlay = async () => {
      try {
        await video.play();
      } catch (err) {
        console.log("Autoplay blocked:", err);
      }
    };

    tryPlay();

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [activeMedia, selectedTier]);

  // One-time hero-video fade-in on page load only. Runs once regardless of
  // tier switches, gallery navigation, or video loops. Products without a
  // hero video are unaffected.
  const [heroMounted, setHeroMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setHeroMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const hasHeroVideo = activeGallery[0]?.type === "video";

  const isSizeValid = !!selectedSize;

  // Handle add to cart
  const onAddToCart = () => {
    const sizeLabelText = ringSizeLabel(selectedSize);
    const sizeIdToken = ringSizeIdToken(selectedSize);
    const skuToken = ringSizeSkuToken(selectedSize);
    const heroImage = activeGallery.find(m => m.type === "image")?.src || activeGallery[0]?.poster;

    handleAddToCart({
      id: `${product.id}-${selectedTier}-size-${sizeIdToken}`,
      name: `${product.name} — ${currentTier.metal} · ${sizeLabelText}`,
      image: heroImage,
      price: tierPricesLive[selectedTier]?.price || currentTier.price,
      productKey: productKey,
      tierKey: selectedTier,
      slug: product.id,
      materials: [currentTier.metal],
      ringSize: selectedSize,
      ringSizeLabel: sizeLabelText,
      sku: `${(product.id || "ring").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)}-${selectedTier.toUpperCase()}-SZ${skuToken}`,
    }, 1, `${currentTier.name} · ${currentTier.metal} · ${sizeLabelText}`);
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden" data-testid={`${product.id}-page`}>
      <div
        className={`max-w-7xl mx-auto px-4 grid grid-cols-1 gap-10 ${
          product.prominentHero
            ? "py-4 lg:grid-cols-[1.42fr_0.58fr]"
            : "py-8 lg:grid-cols-[1.2fr_0.8fr]"
        }`}
      >
        {/* LEFT SIDE — GALLERY */}
        <div>
          {/* HERO MEDIA */}
          <div className="product-media-wrap w-full max-w-full overflow-hidden">
            <div className="product-media-main w-full max-w-full aspect-square flex justify-center items-center overflow-hidden rounded-2xl bg-black border border-[#1f1f1f]">
              {activeGallery[activeMedia].type === "video" ? (
                <video
                  ref={videoRef}
                  src={activeGallery[activeMedia].src}
                  poster={activeGallery[activeMedia].poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  disableRemotePlayback
                  controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                  onContextMenu={(e) => e.preventDefault()}
                  onEnded={(e) => {
                    e.currentTarget.currentTime = 0;
                    e.currentTarget.play();
                  }}
                  className={`w-full h-full max-w-full object-contain block scale-[1.03] transition-transform duration-[6000ms] ${
                    hasHeroVideo
                      ? `transition-opacity ease-out duration-[1200ms] ${
                          heroMounted ? "opacity-100" : "opacity-0"
                        }`
                      : ""
                  }`}
                  data-testid="hero-video"
                />
              ) : (
                <img
                  src={activeGallery[activeMedia].src}
                  alt={activeGallery[activeMedia].alt}
                  className="w-full h-full max-w-full object-contain block scale-[1.03] transition-transform duration-[6000ms]"
                />
              )}
            </div>
          </div>

          {/* LINEAGE CAPTION — opt-in per product. Renders only when the hero
              video slot (index 0) is active AND the currently displayed media
              is a video. Quiet gold at 70% opacity, small uppercase Cinzel,
              thin underline. No card, no badge, no animation, no layout shift. */}
          {product.lineageCaption && activeMedia === 0 && activeGallery[0]?.type === "video" ? (
            <div className="mt-3 text-center">
              <Link
                to={product.lineageCaption.to}
                className="inline-block text-[10.5px] tracking-[0.32em] uppercase text-[#C6A25D]/70 hover:text-[#C6A25D] border-b border-[#C6A25D]/25 hover:border-[#C6A25D]/60 pb-0.5"
                style={{ fontFamily: "'Cinzel', serif" }}
                data-testid="lineage-caption"
              >
                {product.lineageCaption.label} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : null}

          {/* THUMBNAILS */}
          <div className="grid grid-cols-6 gap-2 mt-4">
            {activeGallery.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveMedia(index)}
                className={`relative overflow-hidden rounded-lg border transition-all ${
                  activeMedia === index
                    ? "border-[#C6A25D]"
                    : "border-[#2a2a2a] hover:border-[#4a4a4a]"
                }`}
                data-testid={`thumbnail-${index}`}
              >
                {item.type === "video" ? (
                  <div className="relative">
                    <img
                      src={item.poster}
                      alt={`${product.name} video thumbnail`}
                      className="w-full h-16 lg:h-20 object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-black/70 flex items-center justify-center text-white text-xs lg:text-sm">
                        ▶
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-16 lg:h-20 object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE — PRODUCT INFO */}
        <div className="lg:sticky lg:top-24 self-start">
          <p className="text-xs tracking-[0.3em] text-[#8e8e8e] uppercase mb-4">
            {product.collection || `The ${product.name.split(" ")[0]} Collection`}
          </p>

          <h1 className="text-4xl lg:text-5xl font-serif mb-3">{product.name}</h1>
          <p className="text-[#a0a0a0] italic text-lg lg:text-xl mb-6">
            {product.tagline}
          </p>

          <div className="text-[#C6A25D] text-4xl lg:text-5xl mb-3" data-testid="current-price">
            {tierPricesLive[selectedTier]?.formatted || `$${currentTier.price.toLocaleString()}`}
          </div>

          <p className="text-sm text-[#b5b5b5] mb-8 leading-relaxed">
            {currentTier.metal} — {currentTier.description}
          </p>

          {/* TIER SELECTION */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] text-[#8e8e8e] uppercase mb-3">
              Select Tier
            </p>

            <div className="space-y-3">
              {Object.entries(product.tiers).map(([key, tier]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTier(key)}
                  className={`w-full text-left rounded-xl border p-4 lg:p-5 transition-all ${
                    selectedTier === key
                      ? "border-[#C6A25D] bg-[#C6A25D]/10"
                      : "border-[#2a2a2a] bg-black hover:border-[#4a4a4a]"
                  }`}
                  data-testid={`tier-${key}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-xl lg:text-2xl font-medium">{tier.name}</div>
                      <div className="text-sm text-[#9d9d9d] mt-1">
                        {tier.metal}
                      </div>
                      <div className="text-[#C6A25D] text-2xl lg:text-3xl mt-3">
                        {tierPricesLive[key]?.formatted || `$${tier.price.toLocaleString()}`}
                      </div>
                    </div>

                    {tier.badge && (
                      <div className="text-[10px] lg:text-[11px] tracking-[0.2em] px-2 lg:px-3 py-1.5 lg:py-2 rounded-md bg-[#C6A25D] text-black font-semibold whitespace-nowrap">
                        {tier.badge}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SIZE SELECTION — sitewide reusable component */}
          <div className="mb-8">
            <RingSizeSelector
              value={selectedSize}
              onChange={setSelectedSize}
              bandWidthMm={product.bandWidthMm ?? null}
              testIdPrefix={`${product.id}-ringsize`}
              style={{
                "--ring-accent": "#C6A25D",
                "--ring-bg": "rgba(0, 0, 0, 0.85)",
                "--ring-fg": "#ffffff",
                "--ring-muted": "rgba(255, 255, 255, 0.5)",
              }}
            />

            {/* Metal confirmation line — subtle reinforcement of the customer's
                current metal + price before Add-to-Cart. No badge, no animation,
                no layout shift; quiet gold/cream tone, kept at a small size. */}
            <p
              className="mt-4 text-xs tracking-[0.14em] text-[#C6A25D]/70"
              data-testid="metal-selected-confirmation"
            >
              Metal Selected: {currentTier.metal} · ${currentTier.price.toLocaleString()}
            </p>
          </div>

          {/* STORY — Composition sits BEFORE the configurator CTA per SITEWIDE ORDER RULE */}
          <div className="mb-10">
            <h2 className="text-2xl lg:text-3xl font-serif text-[#C6A25D] mb-6">
              The {product.name} Story
            </h2>
            <p className="text-[#d2d2d2] leading-7 lg:leading-8 text-base lg:text-lg">
              {product.story}
            </p>
          </div>

          {/* SPECIFICATIONS */}
          <div className="mb-10">
            <h2 className="text-2xl lg:text-3xl font-serif text-[#C6A25D] mb-6">
              Specifications
            </h2>
            <ul className="space-y-4 lg:space-y-5 text-[#d2d2d2] text-sm lg:text-base">
              {product.specs.map((spec, index) => (
                <li key={index}>— {spec}</li>
              ))}
            </ul>
          </div>

          {/* ADD TO CART */}
          <button
            disabled={!isSizeValid || isAdding}
            onClick={onAddToCart}
            className={`w-full py-4 rounded-xl tracking-[0.25em] text-sm font-semibold transition-all ${
              isSizeValid && !isAdding
                ? "bg-[#C6A25D] text-black hover:bg-[#b8944f]"
                : "bg-[#3a3a3a] text-[#8a8a8a] cursor-not-allowed"
            } ${isAdding ? "bg-green-600 text-white" : ""}`}
            data-testid="add-to-cart-button"
          >
            {isAdding ? buttonText : (isSizeValid ? "ADD TO CART" : "SELECT A SIZE")}
          </button>

          <p className="text-center text-sm text-[#7f7f7f] mt-4 pb-16">
            Complimentary insured shipping within Canada
          </p>
        </div>
      </div>

      {/* FAMILY CROSS-LINK — quiet editorial connector between PARABOLA family
          members. Only renders when the product exposes `crossLink`; other
          product pages are unaffected. No card, no badge, no animation, no
          layout shift. Small uppercase Cinzel, warm gold, thin underline. */}
      {product.crossLink ? (
        <div className="max-w-7xl mx-auto px-4 pb-24 text-center">
          <Link
            to={product.crossLink.to}
            className="inline-block text-[11px] md:text-xs tracking-[0.3em] uppercase text-[#C6A25D]/85 hover:text-[#C6A25D] border-b border-[#C6A25D]/25 hover:border-[#C6A25D]/60 pb-1 transition-colors"
            style={{ fontFamily: "'Cinzel', serif" }}
            data-testid="family-cross-link"
          >
            {product.crossLink.label} <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
