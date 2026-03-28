import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { publicApi } from '@/lib/api';
import DropReveal from '@/components/DropReveal';
import LaMarvaFlagship from '@/components/LaMarvaFlagship';

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
      <section className="relative h-screen w-full overflow-hidden bg-black">
        {/* Hero Background Video */}
        <div className="absolute inset-0 h-full w-full">
          <video
            autoPlay
            muted
            loop
            playsInline
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
      <section className="py-28 md:py-36 lg:py-44 bg-phileon-black">
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
          FORME CUFF FEATURE SECTION
          New arrival with dominant product visual
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36 lg:py-44 bg-[#080808]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal delay={100}>
            {/* Product Hero - Dominant Visual */}
            <div className="relative mb-6 md:mb-8">
              <Link to="/products/forme-cuff" className="block group">
                <div className="relative w-full overflow-hidden bg-black rounded-sm">
                  {/* Enhanced vignette overlay for strong product focus */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.35) 75%, rgba(0,0,0,0.5) 100%)'
                    }}
                  />
                  <img
                    src="https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/k7kbqg47_1000142846.png"
                    alt="FORME CUFF"
                    className="w-full h-auto object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </Link>
            </div>
          </ScrollReveal>
          
          {/* Content - Heavily understated */}
          <ScrollReveal delay={300}>
            <div 
              className="text-center py-10 px-6 relative"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(8,8,8,0.5) 30%, rgba(8,8,8,0.5) 70%, rgba(0,0,0,0) 100%)'
              }}
            >
              <p className="text-phileon-gold/50 text-[10px] tracking-[0.4em] uppercase mb-3">
                NEW ARRIVAL
              </p>
              <h2 className="font-serif text-xl md:text-2xl lg:text-3xl tracking-[0.04em] text-phileon-ivory/70 leading-tight font-light">
                FORME CUFF
              </h2>
              <p className="mt-4 text-phileon-ivory/35 text-sm max-w-sm mx-auto font-light">
                Shaped by the curve. Held in form.
              </p>
              <div className="mt-8">
                <FeatureCTA to="/products/forme-cuff" testId="forme-cuff-cta">
                  Explore FORME
                </FeatureCTA>
              </div>
            </div>
          </ScrollReveal>
        </div>
        {/* Scroll stop spacer */}
        <div className="h-16 md:h-20"></div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          GALATIANS 6:14 FEATURE SECTION
          Image LEFT, text RIGHT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36 lg:py-44 bg-phileon-black">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image LEFT */}
            <ScrollReveal delay={100}>
              <Link to="/products/galatians-614" className="block group">
                <div className="relative aspect-square overflow-hidden bg-black rounded-sm">
                  <div 
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.3) 80%)'
                    }}
                  />
                  <img
                    src="https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/qotxl9is_1000143699.webp"
                    alt="GALATIANS 6:14 pendant"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </Link>
            </ScrollReveal>
            
            {/* Text RIGHT */}
            <ScrollReveal delay={300}>
              <div className="text-center lg:text-left py-8">
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-[0.04em] text-phileon-ivory/90 leading-tight font-light">
                  GALATIANS 6:14
                </h2>
                <p className="mt-4 text-phileon-ivory/50 text-lg font-light italic">
                  Faith, worn with intention.
                </p>
                <div className="mt-10">
                  <FeatureCTA to="/products/galatians-614" testId="galatians-cta">
                    Explore
                  </FeatureCTA>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
        <div className="h-16 md:h-20"></div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TRACE FEATURE SECTION
          Image RIGHT, text LEFT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36 lg:py-44 bg-[#080808]">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text LEFT (order changes on mobile) */}
            <ScrollReveal delay={100} className="order-2 lg:order-1">
              <div className="text-center lg:text-left py-8">
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-[0.04em] text-phileon-ivory/90 leading-tight font-light">
                  TRACE
                </h2>
                <p className="mt-4 text-phileon-ivory/50 text-lg font-light italic">
                  The imprint of form.
                </p>
                <div className="mt-10">
                  <FeatureCTA to="/products/trace" testId="trace-cta">
                    Explore
                  </FeatureCTA>
                </div>
              </div>
            </ScrollReveal>

            {/* Image RIGHT */}
            <ScrollReveal delay={300} className="order-1 lg:order-2">
              <Link to="/products/trace" className="block group">
                <div className="relative aspect-square overflow-hidden bg-black rounded-sm">
                  <div 
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.3) 80%)'
                    }}
                  />
                  <img
                    src="https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/1owcvzg5_1000143757.png"
                    alt="TRACE earrings"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </div>
        <div className="h-16 md:h-20"></div>
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
                  <p className="text-sm text-phileon-gold/80 mt-2">From $3,400</p>
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
                  <p className="text-sm text-phileon-gold/80 mt-2">From $6,400</p>
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
                  <p className="text-sm text-phileon-gold/80 mt-2">From $1,400</p>
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
                  <p className="text-sm text-phileon-gold/80 mt-2">From $1,250</p>
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
