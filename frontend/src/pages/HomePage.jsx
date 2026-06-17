import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { publicApi } from '@/lib/api';
import DropReveal from '@/components/DropReveal';
import LaMarvaFlagship from '@/components/LaMarvaFlagship';
import { products } from '@/data/products';

import { LiveFromPrice } from '@/components/LiveFromPrice';
// Helper to format price from products.js basePrice
const formatPrice = (basePrice) => `From $${basePrice.toLocaleString()}`;

// Custom hook for scroll reveal animations
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: options.threshold || 0.15,
        rootMargin: options.rootMargin || '0px 0px -50px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options.threshold, options.rootMargin]);

  return [ref, isVisible];
};

// Scroll Reveal wrapper component with configurable delay
const ScrollReveal = ({ children, delay = 0, className = '' }) => {
  const [ref, isVisible] = useScrollReveal();
  
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Featured Section CTA Button Component
const FeatureCTA = ({ to, children, testId }) => (
  <Link 
    to={to}
    className="inline-block px-8 py-4 bg-[#1a1a1a] text-phileon-gold border border-phileon-gold/60 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-[#222] hover:border-phileon-gold hover:brightness-110"
    data-testid={testId}
  >
    {children}
  </Link>
);

const HomePage = () => {
  const [collections, setCollections] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropReveal, setShowDropReveal] = useState(false);
  const navigate = useNavigate();
  const keyBufferRef = useRef('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, productsRes, testimonialsRes] = await Promise.all([
          publicApi.getCollections(),
          publicApi.getProducts({ featured: true }),
          publicApi.getTestimonials({ featured: true }),
        ]);
        setCollections(collectionsRes.data.slice(0, 4));
        setFeaturedProducts(productsRes.data.slice(0, 3));
        setTestimonials(testimonialsRes.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hidden gate: capture keypresses and check for "phileon" (desktop only)
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (!isMobile) {
      const handleKeyPress = (e) => {
        if (/^[a-zA-Z]$/.test(e.key)) {
          keyBufferRef.current += e.key.toLowerCase();
          if (keyBufferRef.current.length > 10) {
            keyBufferRef.current = keyBufferRef.current.slice(-10);
          }
          if (keyBufferRef.current.includes('phileon')) {
            keyBufferRef.current = '';
            navigate('/secret-drop');
          }
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [navigate]);

  const handleShopDrop = () => {
    setShowDropReveal(true);
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Drop Reveal Animation */}
      <DropReveal isActive={showDropReveal} targetPath="/shop-drop" dropText="DROP 001" />

      {/* Cinematic Hero Section */}
      <section className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden bg-black">
        {/* Hero Background Video */}
        <div className="absolute inset-0 h-full w-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={products.laMarva?.imageUrl}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/a8omotqb_phileon-opener.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-[0.12em] text-phileon-ivory mb-6 leading-[1.3] md:leading-[1.35]">
            Not jewelry.<br />Identity.
          </h1>
          <p className="text-xl md:text-2xl text-phileon-ivory-muted tracking-wide mb-12 max-w-2xl">
            Precious forms designed to hold attention.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5">
            <Link 
              to="/shop" 
              className="px-10 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:brightness-110"
            >
              View Collection
            </Link>
            <Link 
              to="/products/la-marva" 
              className="px-10 py-4 border border-phileon-gold text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/10 hover:brightness-110"
            >
              Discover La Marva
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
          <ChevronDown className="w-6 h-6 text-phileon-gold animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PTP CUFF FEATURE SECTION
          Product-dominant with subtle text overlay
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 lg:py-28 bg-phileon-black">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            {/* Product Hero - Dominant Visual */}
            <div className="relative mb-6 md:mb-8">
              <Link to="/products/ptp-cuff" className="block group">
                <div className="relative w-full overflow-hidden bg-phileon-black">
                  {/* Enhanced vignette overlay for strong product focus */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.6) 100%)'
                    }}
                  />
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    disablePictureInPicture
                    poster={products.ptpCuff?.imageUrl}
                    className="w-full h-auto object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  >
                    <source src="https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/4idyl7t2_PTPCuff2.mp4" type="video/mp4" />
                  </video>
                </div>
              </Link>
            </div>
          </ScrollReveal>
          
          {/* Content - Heavily understated, product first */}
          <ScrollReveal delay={200}>
            <div 
              className="text-center py-10 px-6 relative"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
              }}
            >
              <p className="text-phileon-gold/50 text-[10px] tracking-[0.4em] uppercase mb-3">
                THE PTP CUFF
              </p>
              <h2 className="font-serif text-xl md:text-2xl lg:text-3xl tracking-[0.04em] text-phileon-ivory/70 leading-tight font-light">
                Power To The People
              </h2>
              <div className="mt-8">
                <FeatureCTA to="/products/ptp-cuff" testId="ptp-cuff-cta">
                  Explore PTP
                </FeatureCTA>
              </div>
            </div>
          </ScrollReveal>
        </div>
        {/* Scroll stop spacer */}
        <div className="h-16 md:h-20"></div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BOUND HERO SECTION
          Single image, minimal text, creates curiosity
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bound-tease relative min-h-screen bg-[#0a0a0a] overflow-hidden">
        <Link to="/products/bound" className="block relative h-screen w-full">
          {/* Single hero image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/dxi7r360_1000143892.png"
              alt="BOUND — The Bustier Bangle"
              className="bound-tease-image h-full w-auto max-w-none object-contain"
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]/50" />
          </div>

          {/* Minimal text overlay - bottom left */}
          <div className="absolute bottom-0 left-0 right-0 pb-24 md:pb-36 lg:pb-44">
            <div className="max-w-7xl mx-auto px-8 md:px-16">
              <h2 className="bound-tease-title font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.02em] text-white/90 font-light">
                BOUND
              </h2>
              <p className="bound-tease-subtitle text-white/45 text-lg md:text-xl tracking-[0.12em] mt-3 font-light">
                The Bustier Bangle
              </p>
              
              {/* Subtle CTA */}
              <div className="bound-tease-cta mt-12 flex items-center gap-3 text-white/50 text-sm tracking-[0.2em] uppercase group-hover:text-white/80 transition-colors duration-500">
                <span className="text-phileon-gold/70">→</span>
                <span>ENTER</span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CATEGORY IDENTITY — 3-TILE SECTION
          Clean, curated category navigation
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-4 md:py-6 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-5 md:px-10">
          <div className="grid grid-cols-3 gap-1.5 md:gap-2">
            
            {/* GENTS RINGS */}
            <ScrollReveal delay={0}>
              <Link to="/shop?audience=gentlemens-club&category=rings" className="group block" data-testid="category-tile-gents">
                <div className="h-[80px] md:h-[110px] overflow-hidden bg-[#111] relative">
                  <img
                    src={products.coogiI?.imageUrl || products.cypher?.gallery?.[0]?.src}
                    alt="Gents Rings"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-3">
                    <h3 className="font-serif text-[11px] md:text-sm tracking-wide text-white group-hover:text-phileon-gold transition-colors duration-300">
                      GENTS RINGS
                    </h3>
                    <p className="text-white/45 text-[8px] md:text-[9px] mt-0.5 tracking-wide hidden md:block">
                      Structure. Weight. Presence.
                    </p>
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* LADIES RINGS */}
            <ScrollReveal delay={100}>
              <Link to="/shop?audience=ladies&category=rings" className="group block" data-testid="category-tile-ladies">
                <div className="h-[80px] md:h-[110px] overflow-hidden bg-[#111] relative">
                  <img
                    src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg"
                    alt="Ladies Rings"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-3">
                    <h3 className="font-serif text-[11px] md:text-sm tracking-wide text-white group-hover:text-phileon-gold transition-colors duration-300">
                      LADIES RINGS
                    </h3>
                    <p className="text-white/45 text-[8px] md:text-[9px] mt-0.5 tracking-wide hidden md:block">
                      Refined form. Effortless movement.
                    </p>
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* COLLECTIVE */}
            <ScrollReveal delay={200}>
              <Link to="/shop?audience=collective" className="group block" data-testid="category-tile-collective">
                <div className="h-[80px] md:h-[110px] overflow-hidden bg-[#111] relative">
                  <img
                    src={products.blessed?.imageUrl}
                    alt="Collective"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-3">
                    <h3 className="font-serif text-[11px] md:text-sm tracking-wide text-white group-hover:text-phileon-gold transition-colors duration-300">
                      COLLECTIVE
                    </h3>
                    <p className="text-white/45 text-[8px] md:text-[9px] mt-0.5 tracking-wide hidden md:block">
                      Editorial pieces beyond category.
                    </p>
                  </div>
                </div>
              </Link>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CINEMATIC IMAGE STRIP
          Auto-scrolling discovery — clickable product links
      ═══════════════════════════════════════════════════════════════ */}
      {(() => {
        // Unified strip items - ALL products from products.js
        const stripItems = [
          {
            title: "ROSE OF SHARON",
            image: "/rose-of-sharon/hero.png",
            href: "/products/rose-of-sharon",
            subtitle: "Sacred Collection. Faith blooms through the thorns. Available in Small and Signature sizes."
          },
          {
            title: "UNCLE JO",
            image: "/uncle-jo/hero.jpg",
            href: "/products/uncle-jo",
            subtitle: "Signature Mesh Collection. A matching ring and cuff forged from woven metal architecture."
          },
          {
            title: "VEYRON NOIR",
            image: "/veyron-noir/hero.png",
            href: "/products/veyron-noir",
            subtitle: "Tribute Series. 14K white gold."
          },
          { 
            title: "WYNETTE'S PALETTE", 
            image: "/wynette/hero.jpg", 
            href: "/products/wynette-palette",
            subtitle: "Every island brought a colour."
          },
          { 
            title: "LA MADONNA", 
            image: "/images/la-madonna-hand-category.png", 
            href: "/la-madonna",
            subtitle: "She took the corset off. Then she put it back on. In gold."
          },
          { 
            title: "LA MADONNA", 
            image: "/images/la-madonna-hero-monument.png", 
            href: "/la-madonna",
            subtitle: "Stripped to gold."
          },
          { 
            title: "LA SCARPA DELLA REGINA", 
            image: "/la-scarpa/scarpa-portrait.jpg", 
            href: "/la-scarpa-della-regina",
            subtitle: "The crown was given. The shoe was earned."
          },
          { 
            title: "LISA", 
            image: "/lisa/lisa-bold-hero.jpg", 
            href: "/lisa",
            subtitle: "Quiet seduction."
          },
          { 
            title: "DRAPE", 
            image: products.drape?.imageUrl, 
            href: "/products/drape" 
          },
          { 
            title: "LE COCKTAIL DE JESSICA", 
            image: products.cocktailJessica?.imageUrl, 
            href: "/products/le-cocktail-de-jessica" 
          },
          { 
            title: "PRISE DE COURONNE", 
            image: products.priseDeCouronne?.imageUrl, 
            href: "/products/prise-de-couronne" 
          },
          { 
            title: "MONIKA COUTURE", 
            image: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg", 
            href: "/products/monika-couture" 
          },
          { 
            title: "TOLA II", 
            image: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rst0mhem_1000143383.png", 
            href: "/products/tola-ii" 
          },
          { 
            title: "CYPHER", 
            image: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/eo70jcdb_1000144968.png", 
            href: "/products/cypher" 
          },
          { 
            title: "GALATIANS 6:14", 
            image: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/qotxl9is_1000143699.webp", 
            href: "/products/galatians-614" 
          },
          { 
            title: "FORME CUFF", 
            image: "https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/k7kbqg47_1000142846.png", 
            href: "/products/forme-cuff" 
          },
          { 
            title: "LA MARVA", 
            image: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg", 
            href: "/products/la-marva" 
          },
          { 
            title: "PTP CUFF", 
            image: "https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/n1f04383_1000140851.jpg", 
            href: "/products/ptp-cuff" 
          },
          { 
            title: "ANNIE ROSE", 
            image: "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg", 
            href: "/products/annie-rose" 
          },
          { 
            title: "RHYTHM MESH", 
            image: "https://customer-assets.emergentagent.com/job_b18523eb-3184-4ba4-8ef3-cdebf4fafd5f/artifacts/nl2vulxg_1000143088.jpg", 
            href: "/products/rhythm-mesh-ring" 
          },
          { 
            title: "BOUND", 
            image: "https://customer-assets.emergentagent.com/job_66f130cc-5570-4637-a9c3-d393428997f1/artifacts/4ujxm427_1000143869.png", 
            href: "/products/bound" 
          },
          { 
            title: "APEX", 
            image: "https://customer-assets.emergentagent.com/job_8f8138bc-86c3-4d15-a30c-36578e565f9d/artifacts/jphlogf7_1000144036.webp", 
            href: "/products/apex" 
          },
          { 
            title: "HOMAGE", 
            image: "https://customer-assets.emergentagent.com/job_03b460e6-a844-40cb-a5e9-37c38452303a/artifacts/mmqzzrsg_1000144453.png", 
            href: "/products/homage" 
          },
          { 
            title: "IL MORSO DEL RE", 
            image: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/lq8adcpf_1000145384.png", 
            href: "/products/morso" 
          },
          { 
            title: "LA BÊTE", 
            image: "https://customer-assets.emergentagent.com/job_0245fcda-4bab-426a-9d07-34d2d68c629a/artifacts/p6cpotus_1000145540.png", 
            href: "/products/labete" 
          },
          { 
            title: "MIDWEEK", 
            image: products.midweek?.imageUrl, 
            href: "/products/midweek" 
          },
          { 
            title: "ALEJANDRA HEELS", 
            image: products.alejandraHeels?.images?.hero || "https://customer-assets.emergentagent.com/job_phileon-website/artifacts/alejandra-hero.jpg", 
            href: "/products/alejandra-heels" 
          },
          { 
            title: "BLESSED", 
            image: products.blessed?.imageUrl || products.blessed?.gallery?.[0]?.src, 
            href: "/products/blessed" 
          },
          { 
            title: "ROSARIA", 
            image: products.rosaria?.images?.hero, 
            href: "/products/rosaria" 
          },
          { 
            title: "DÉSIR CORSET", 
            image: products.desirCorset?.images?.hero, 
            href: "/products/desir-corset" 
          },
          { 
            title: "TRACE", 
            image: "https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/7tyc41kp_1000143768.png", 
            href: "/products/trace" 
          },
          { 
            title: "COOGI I", 
            image: products.coogiI?.imageUrl, 
            href: "/products/coogi-i" 
          }
        ];

        // Duplicate for seamless loop
        const allItems = [...stripItems, ...stripItems];

        return (
          <section className="cinematic-strip-section relative py-16 md:py-24 bg-[#0a0a0a] overflow-hidden">
            {/* Fade edges - enhanced for infinite feel */}
            <div className="strip-edge-fade-left" />
            <div className="strip-edge-fade-right" />
            
            {/* Auto-scrolling track */}
            <div className="cinematic-strip-track">
              {allItems.map((item, index) => (
                <Link 
                  key={`${item.title}-${index}`} 
                  to={item.href} 
                  className={`strip-image ${item.title === "BOUND" ? "strip-image-bound" : ""}`}
                  data-testid={`strip-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable="false"
                  />
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════════════
          THE COLLECTIVE — Discovery Grid
          No BOUND repetition, fresh selection
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 md:py-48 bg-[#080808]">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          {/* Header */}
          <ScrollReveal delay={100}>
            <div className="text-center mb-20">
              <h2 className="font-serif text-2xl md:text-3xl tracking-[0.08em] text-phileon-ivory/80 font-light">
                THE COLLECTIVE
              </h2>
            </div>
          </ScrollReveal>

          {/* Preview Grid - No BOUND, fresh variety */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16">
            <ScrollReveal delay={150}>
              <Link to="/products/forme-cuff" className="group block">
                <div className="aspect-square overflow-hidden bg-[#111] rounded-sm relative">
                  <div 
                    className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)'
                    }}
                  />
                  <img
                    src="https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/k7kbqg47_1000142846.png"
                    alt="FORME CUFF"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-6 text-center">
                  <h3 className="font-serif text-lg tracking-wide text-phileon-ivory/90 group-hover:text-phileon-gold transition-colors duration-300">
                    FORME CUFF
                  </h3>
                  <p className="text-xs text-phileon-ivory/40 mt-2">Shaped by the Curve</p>
                  <p className="text-sm text-phileon-gold/70 mt-2"><LiveFromPrice slug="forme-cuff" fallback={formatPrice(products.formeCuff.basePrice)} /></p>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <Link to="/products/la-marva" className="group block">
                <div className="aspect-square overflow-hidden bg-[#111] rounded-sm relative">
                  <div 
                    className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)'
                    }}
                  />
                  <img
                    src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg"
                    alt="La Marva"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-6 text-center">
                  <h3 className="font-serif text-lg tracking-wide text-phileon-ivory/90 group-hover:text-phileon-gold transition-colors duration-300">
                    LA MARVA
                  </h3>
                  <p className="text-xs text-phileon-ivory/40 mt-2">Statement Ring</p>
                  <p className="text-sm text-phileon-gold/70 mt-2"><LiveFromPrice slug="la-marva" fallback={formatPrice(products.laMarva.basePrice)} /></p>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={350}>
              <Link to="/products/ptp-cuff" className="group block">
                <div className="aspect-square overflow-hidden bg-[#111] rounded-sm relative">
                  <div 
                    className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)'
                    }}
                  />
                  <img
                    src="https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/n1f04383_1000140851.jpg"
                    alt="PTP CUFF"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-6 text-center">
                  <h3 className="font-serif text-lg tracking-wide text-phileon-ivory/90 group-hover:text-phileon-gold transition-colors duration-300">
                    PTP CUFF
                  </h3>
                  <p className="text-xs text-phileon-ivory/40 mt-2">Power To The People</p>
                  <p className="text-sm text-phileon-gold/70 mt-2"><LiveFromPrice slug="ptp-cuff" fallback={formatPrice(products.ptpCuff.basePrice)} /></p>
                </div>
              </Link>
            </ScrollReveal>
          </div>

          {/* CTA Button */}
          <ScrollReveal delay={450}>
            <div className="text-center">
              <Link 
                to="/shop"
                className="inline-block px-12 py-4 border border-phileon-gold/60 text-phileon-gold text-xs tracking-[0.25em] uppercase font-medium transition-all duration-300 hover:border-phileon-gold hover:shadow-[0_0_20px_rgba(198,162,93,0.15)] hover:brightness-110"
                data-testid="view-all-shop-cta"
              >
                VIEW ALL
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SIGNATURE PRODUCTS GRID
          Core collection showcase
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-40 px-8 bg-phileon-black">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-phileon-gold/70 text-[10px] tracking-[0.35em] uppercase mb-4">Core Collection</p>
              <h2 className="font-serif text-2xl md:text-3xl tracking-[0.06em] text-phileon-ivory/90 font-light">
                Signature Pieces
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            <ScrollReveal delay={0}>
              <Link
                to="/products/uncle-jo"
                className="group block"
                data-testid="product-card-uncle-jo"
              >
                <div className="aspect-square overflow-hidden bg-black relative">
                  <div
                    className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(199,200,204,0.14) 100%)' }}
                  />
                  <img
                    src="/uncle-jo/hero.jpg"
                    alt="Uncle Jo"
                    className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="font-serif text-lg tracking-[0.06em] text-phileon-ivory/90 group-hover:text-phileon-gold transition-colors duration-300 font-light">
                    Uncle Jo
                  </h3>
                  <p className="text-xs text-phileon-ivory/40 mt-3 tracking-wide">
                    Signature Mesh Collection
                  </p>
                  <p className="text-sm mt-2" style={{ color: '#C0142E', letterSpacing: '0.18em' }}>FROM $1,100 USD</p>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={0}>
              <Link
                to="/products/veyron-noir"
                className="group block"
                data-testid="product-card-veyron-noir"
              >
                <div className="aspect-square overflow-hidden bg-black relative">
                  <div
                    className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(192,20,46,0.18) 100%)' }}
                  />
                  <img
                    src="/veyron-noir/hero.png"
                    alt="Veyron Noir"
                    className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="font-serif text-lg tracking-[0.06em] text-phileon-ivory/90 group-hover:text-phileon-gold transition-colors duration-300 font-light">
                    Veyron Noir
                  </h3>
                  <p className="text-xs text-phileon-ivory/40 mt-3 tracking-wide">
                    Tribute Series · 4 Metal Tiers
                  </p>
                  <p className="text-sm mt-2" style={{ color: '#C0142E', letterSpacing: '0.18em' }}>FROM $1,450 USD</p>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={0}>
              <Link
                to="/products/wynette-palette"
                className="group block"
                data-testid="product-card-wynette-palette"
              >
                <div className="aspect-square overflow-hidden bg-phileon-charcoal relative">
                  <div
                    className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.2) 100%)'
                    }}
                  />
                  <img
                    src="/wynette/shop-card.png"
                    alt="Wynette's Palette"
                    className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="font-serif text-lg tracking-[0.06em] text-phileon-ivory/90 group-hover:text-phileon-gold transition-colors duration-300 font-light">
                    Wynette&apos;s Palette
                  </h3>
                  <p className="text-xs text-phileon-ivory/40 mt-3 tracking-wide">
                    Collector Cocktail Ring · Dynamic Pricing
                  </p>
                  <p className="text-sm text-phileon-gold/80 mt-2">From <LiveFromPrice slug="wynette-palette" fallback="$2,000 USD" /></p>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={0}>
              <Link
                to="/products/la-marva"
                className="group block"
                data-testid="product-card-la-marva"
              >
                <div className="aspect-square overflow-hidden bg-phileon-charcoal relative">
                  {/* Subtle vignette */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.2) 100%)'
                    }}
                  />
                  <img
                    src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg"
                    alt="La Marva"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="font-serif text-lg tracking-[0.06em] text-phileon-ivory/90 group-hover:text-phileon-gold transition-colors duration-300 font-light">
                    La Marva
                  </h3>
                  <p className="text-xs text-phileon-ivory/40 mt-3 tracking-wide">
                    Signature Ring · Dynamic Pricing
                  </p>
                  <p className="text-sm text-phileon-gold/80 mt-2"><LiveFromPrice slug="la-marva" fallback={formatPrice(products.laMarva.basePrice)} /></p>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Link
                to="/products/annie-rose"
                className="group block"
                data-testid="product-card-annie-rose"
              >
                <div className="aspect-square overflow-hidden bg-phileon-charcoal relative">
                  <div 
                    className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.2) 100%)'
                    }}
                  />
                  <img
                    src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg"
                    alt="Annie Rose"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="font-serif text-lg tracking-[0.06em] text-phileon-ivory/90 group-hover:text-phileon-gold transition-colors duration-300 font-light">
                    Annie Rose
                  </h3>
                  <p className="text-xs text-phileon-ivory/40 mt-3 tracking-wide">
                    Lab & Natural Diamonds
                  </p>
                  <p className="text-sm text-phileon-gold/80 mt-2"><LiveFromPrice slug="annie-rose" fallback={formatPrice(products.annieRose.basePrice)} /></p>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Link
                to="/products/monika-couture"
                className="group block"
                data-testid="product-card-monika-couture"
              >
                <div className="aspect-square overflow-hidden bg-phileon-charcoal relative">
                  <div 
                    className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.2) 100%)'
                    }}
                  />
                  <img
                    src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg"
                    alt="Monika Couture Earrings"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="font-serif text-lg tracking-[0.06em] text-phileon-ivory/90 group-hover:text-phileon-gold transition-colors duration-300 font-light">
                    Monika Couture Earrings
                  </h3>
                  <p className="text-xs text-phileon-ivory/40 mt-3 tracking-wide">
                    Statement Earrings · Silver & Gold
                  </p>
                  <p className="text-sm text-phileon-gold/80 mt-2"><LiveFromPrice slug="monika-couture" fallback={formatPrice(products.monikaCouture.basePrice)} /></p>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Link
                to="/products/alejandra-heels"
                className="group block"
                data-testid="product-card-alejandra-heels"
              >
                <div className="aspect-square overflow-hidden bg-phileon-charcoal relative">
                  <div 
                    className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.2) 100%)'
                    }}
                  />
                  <img
                    src="https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/0y3jefc5_1000140400.jpg"
                    alt="Alejandra Heels Earrings"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="font-serif text-lg tracking-[0.06em] text-phileon-ivory/90 group-hover:text-phileon-gold transition-colors duration-300 font-light">
                    Alejandra Heels Earrings
                  </h3>
                  <p className="text-xs text-phileon-ivory/40 mt-3 tracking-wide">
                    Statement Earrings · Sculptural Design
                  </p>
                  <p className="text-sm text-phileon-gold/80 mt-2"><LiveFromPrice slug="alejandra-heels" fallback={formatPrice(products.alejandraHeels.basePrice)} /></p>
                </div>
              </Link>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={400}>
            <div className="text-center mt-16">
              <Link 
                to="/shop" 
                className="px-8 py-4 border border-phileon-gold/60 text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:border-phileon-gold hover:brightness-110"
              >
                View All Products
              </Link>
            </div>
          </ScrollReveal>
        </div>
        {/* Scroll stop spacer */}
        <div className="h-12 md:h-16"></div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE INSPIRATION VAULT — Homepage advertisement block
          Archive atmosphere · dark luxury · floating sketches · ember glow
      ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative py-28 md:py-36 px-6 md:px-12 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 30%, rgba(164,116,51,0.10), transparent 65%), radial-gradient(ellipse 45% 40% at 50% 95%, rgba(164,116,51,0.05), transparent 65%), #030305',
        }}
        data-testid="home-vault-block"
      >
        {/* Floating technical sketches as atmospheric backdrop */}
        <svg className="absolute" style={{ top: '12%', left: '6%', opacity: 0.10, color: '#a47433' }} width="140" height="140" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 3" />
          <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="0.7" />
          <path d="M60 20 L60 100 M20 60 L100 60" stroke="currentColor" strokeWidth="0.4" />
        </svg>
        <svg className="absolute hidden md:block" style={{ top: '14%', right: '7%', opacity: 0.10, color: '#a47433', transform: 'rotate(11deg)' }} width="110" height="150" viewBox="0 0 100 140" fill="none" aria-hidden="true">
          <rect x="20" y="30" width="60" height="80" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 2" />
          <path d="M30 50 L70 50 M30 70 L70 70 M30 90 L70 90" stroke="currentColor" strokeWidth="0.4" />
        </svg>
        <svg className="absolute hidden md:block" style={{ bottom: '12%', left: '9%', opacity: 0.10, color: '#a47433', transform: 'rotate(6deg)' }} width="160" height="120" viewBox="0 0 140 100" fill="none" aria-hidden="true">
          <ellipse cx="70" cy="50" rx="55" ry="30" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 3" />
        </svg>
        <svg className="absolute" style={{ bottom: '10%', right: '8%', opacity: 0.10, color: '#a47433', transform: 'rotate(-13deg)' }} width="120" height="120" viewBox="0 0 110 110" fill="none" aria-hidden="true">
          <polygon points="55,15 95,85 15,85" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 4" />
          <circle cx="55" cy="65" r="14" stroke="currentColor" strokeWidth="0.4" />
        </svg>

        <ScrollReveal delay={0}>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Eyebrow */}
            <p
              className="mb-5"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                letterSpacing: '0.45em',
                color: '#a47433',
                textTransform: 'uppercase',
              }}
            >
              THE INSPIRATION VAULT
            </p>

            {/* Headline */}
            <h2
              className="mb-8"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 400,
                fontSize: 'clamp(34px, 5vw, 64px)',
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                color: '#f5efe1',
              }}
            >
              The Ideas Before The Icons.
            </h2>

            {/* Body */}
            <p
              className="mx-auto mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(17px, 1.5vw, 21px)',
                lineHeight: 1.6,
                color: '#dcd5c4',
                maxWidth: 620,
              }}
            >
              Explore prototypes, retired concepts, one-off creations, and archive pieces from the Phileon design vault.
            </p>
            <p
              className="mx-auto mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(16px, 1.4vw, 19px)',
                lineHeight: 1.6,
                color: '#7f7866',
                maxWidth: 580,
              }}
            >
              Some were experiments. Some were stepping stones. Some were never released at all.
            </p>
            <p
              className="mx-auto mb-10"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(16px, 1.4vw, 19px)',
                color: '#7f7866',
              }}
            >
              All are available in limited quantities.
            </p>

            {/* Price callout */}
            <p
              className="mb-2"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 14,
                letterSpacing: '0.42em',
                color: '#a47433',
              }}
            >
              FROM $50 USD
            </p>
            <p
              className="mb-10"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 14,
                color: '#7f7866',
              }}
            >
              Most archive pieces range from $50–$200 USD.
            </p>

            {/* Button */}
            <Link
              to="/vault"
              data-testid="home-vault-cta"
              className="inline-block"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                letterSpacing: '0.42em',
                color: '#f5efe1',
                background: 'transparent',
                border: '1px solid #a47433',
                padding: '18px 44px',
                textTransform: 'uppercase',
                transition: 'background 280ms ease, color 280ms ease, letter-spacing 280ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#a47433';
                e.currentTarget.style.color = '#030305';
                e.currentTarget.style.letterSpacing = '0.48em';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#f5efe1';
                e.currentTarget.style.letterSpacing = '0.42em';
              }}
            >
              ENTER THE VAULT →
            </Link>

            {/* Footnote */}
            <p
              className="mt-12"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 12,
                color: '#7f7866',
                letterSpacing: '0.04em',
                lineHeight: 1.8,
              }}
            >
              Archive pieces. Alternative materials. Limited availability.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BRAND STATEMENT
          Minimal text interlude
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-24 px-8 bg-phileon-black border-t border-b border-white/5">
        <ScrollReveal delay={100}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl md:text-2xl text-phileon-ivory/70 leading-relaxed tracking-wide font-light">
              Phileon creates sculptural jewelry designed to be seen, remembered, and worn with presence.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LA MARVA FLAGSHIP SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <ScrollReveal delay={150}>
        <LaMarvaFlagship />
      </ScrollReveal>
      {/* Scroll stop spacer */}
      <div className="h-8 md:h-12 bg-phileon-black"></div>

      {/* ═══════════════════════════════════════════════════════════════
          ROSARIA FEATURE SECTION
          Statement earrings showcase
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36 lg:py-44 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal delay={150}>
            {/* Product Hero - Dominant Visual */}
            <div className="relative mb-6 md:mb-8">
              <Link to="/products/rosaria" className="block group">
                <div className="relative w-full overflow-hidden bg-black rounded-sm">
                  {/* Enhanced vignette overlay for strong product focus */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.35) 75%, rgba(0,0,0,0.5) 100%)'
                    }}
                  />
                  <img
                    src="https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/d15gu165_VideoCapture_20260312-012448.jpg"
                    alt="Rosaria Earrings"
                    className="w-full h-auto object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </Link>
            </div>
          </ScrollReveal>
          
          {/* Content - Heavily understated */}
          <ScrollReveal delay={350}>
            <div 
              className="text-center py-10 px-6 relative"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(5,5,5,0.5) 30%, rgba(5,5,5,0.5) 70%, rgba(0,0,0,0) 100%)'
              }}
            >
              <p className="text-phileon-gold/50 text-[10px] tracking-[0.4em] uppercase mb-3">
                STATEMENT EARRINGS
              </p>
              <h2 className="font-serif text-xl md:text-2xl lg:text-3xl tracking-[0.04em] text-phileon-ivory/70 leading-tight font-light">
                ROSARIA
              </h2>
              <p className="mt-4 text-phileon-ivory/35 text-sm max-w-sm mx-auto font-light">
                Petals of rose gold, sculpted in elegance.
              </p>
              <div className="mt-8">
                <FeatureCTA to="/products/rosaria" testId="rosaria-cta">
                  Explore Rosaria
                </FeatureCTA>
              </div>
            </div>
          </ScrollReveal>
        </div>
        {/* Scroll stop spacer */}
        <div className="h-16 md:h-20"></div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CUSTOM DESIGN CTA
          Bespoke offerings
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-36 md:py-44 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=2000&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>
        
        <ScrollReveal delay={100}>
          <div className="relative z-10 max-w-3xl mx-auto text-center px-8">
            <p className="text-phileon-gold/70 text-[10px] tracking-[0.35em] uppercase mb-6">Bespoke</p>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl tracking-[0.06em] text-phileon-ivory/90 leading-tight font-light">
              Create Something<br />Uniquely Yours
            </h2>
            <p className="mt-8 text-phileon-ivory/50 leading-relaxed font-light">
              From engagement rings that capture your love story to heirloom pieces 
              that carry generations of meaning—our artisans bring your vision to life.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center">
              <Link 
                to="/custom-design" 
                className="px-8 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:brightness-110"
              >
                Begin a Custom Piece
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );

};

export default HomePage;
