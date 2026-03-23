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

// Scroll Reveal wrapper component
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
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (!isMobile) {
      const handleKeyPress = (e) => {
        // Only process letter keys
        if (/^[a-zA-Z]$/.test(e.key)) {
          keyBufferRef.current += e.key.toLowerCase();
          
          // Keep only last 10 characters
          if (keyBufferRef.current.length > 10) {
            keyBufferRef.current = keyBufferRef.current.slice(-10);
          }
          
          // Check for "phileon"
          if (keyBufferRef.current.includes('phileon')) {
            keyBufferRef.current = ''; // Reset buffer
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
              className="px-10 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/90 hover:scale-[1.02]"
            >
              View Collection
            </Link>
            <Link 
              to="/products/la-marva" 
              className="px-10 py-4 border border-phileon-gold text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold hover:text-phileon-black"
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

      {/* PTP Cuff Feature Section */}
      <section className="py-24 md:py-32 lg:py-40 bg-phileon-black">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            {/* Video Hero - Full Width */}
            <div className="mb-12 md:mb-16">
              <Link to="/products/ptp-cuff" className="block group">
                <div className="relative w-full max-w-4xl mx-auto overflow-hidden bg-phileon-black">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    disablePictureInPicture
                    className="w-full h-auto object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  >
                    <source src="https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/4idyl7t2_PTPCuff2.mp4" type="video/mp4" />
                  </video>
                  {/* Mobile cinematic overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none md:hidden"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.22) 100%)'
                    }}
                  />
                </div>
              </Link>
            </div>
          </ScrollReveal>
          
          {/* Content - Centered */}
          <ScrollReveal delay={150}>
            <div className="text-center">
              <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-5">
                THE PTP CUFF
              </p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-[0.08em] text-phileon-ivory leading-tight">
                Power To The People
              </h2>
              <div className="mt-12">
                <Link 
                  to="/products/ptp-cuff" 
                  className="inline-block px-10 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/90 hover:scale-[1.02]"
                  data-testid="ptp-cuff-cta"
                >
                  Discover The PTP Cuff
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FORME CUFF Feature Section */}
      <section className="py-24 md:py-32 lg:py-40 bg-phileon-near-black">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            {/* Image Hero */}
            <div className="mb-12 md:mb-16">
              <Link to="/products/forme-cuff" className="block group">
                <div className="relative w-full max-w-3xl mx-auto overflow-hidden bg-phileon-black rounded-lg">
                  <img
                    src="https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/k7kbqg47_1000142846.png"
                    alt="FORME CUFF"
                    className="w-full h-auto object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
            </div>
          </ScrollReveal>
          
          {/* Content - Centered */}
          <ScrollReveal delay={150}>
            <div className="text-center">
              <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-5">
                NEW ARRIVAL
              </p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-[0.08em] text-phileon-ivory leading-tight">
                FORME CUFF
              </h2>
              <p className="mt-6 text-phileon-ivory-muted text-lg max-w-xl mx-auto">
                Shaped by the curve. Held in form.
              </p>
              <div className="mt-12">
                <Link 
                  to="/products/forme-cuff" 
                  className="inline-block px-10 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/90 hover:scale-[1.02]"
                  data-testid="forme-cuff-cta"
                >
                  Discover FORME CUFF
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Core Products Showcase */}
      <section className="py-28 lg:py-40 px-8 bg-phileon-black">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Core Collection</p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-phileon-ivory">
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
                  <img
                    src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg"
                    alt="La Marva"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="font-serif text-lg tracking-[0.08em] text-phileon-ivory group-hover:text-phileon-gold transition-colors duration-300">
                    La Marva
                  </h3>
                  <p className="text-sm text-phileon-ivory-muted mt-3">
                    Signature Ring · Dynamic Pricing
                  </p>
                  <p className="text-sm text-phileon-gold mt-2">From $3,400</p>
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
                  <img
                    src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg"
                    alt="Annie Rose"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="font-serif text-lg tracking-[0.08em] text-phileon-ivory group-hover:text-phileon-gold transition-colors duration-300">
                    Annie Rose
                  </h3>
                  <p className="text-sm text-phileon-ivory-muted mt-3">
                    Lab & Natural Diamonds
                  </p>
                  <p className="text-sm text-phileon-gold mt-2">From $6,400</p>
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
                  <img
                    src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg"
                    alt="Monika Couture Earrings"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="font-serif text-lg tracking-[0.08em] text-phileon-ivory group-hover:text-phileon-gold transition-colors duration-300">
                    Monika Couture Earrings
                  </h3>
                  <p className="text-sm text-phileon-ivory-muted mt-3">
                    Statement Earrings · Silver & Gold
                  </p>
                  <p className="text-sm text-phileon-gold mt-2">From $1,400</p>
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
                  <img
                    src="https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/0y3jefc5_1000140400.jpg"
                    alt="Alejandra Heels Earrings"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="font-serif text-lg tracking-[0.08em] text-phileon-ivory group-hover:text-phileon-gold transition-colors duration-300">
                    Alejandra Heels Earrings
                  </h3>
                  <p className="text-sm text-phileon-ivory-muted mt-3">
                    Statement Earrings · Sculptural Design
                  </p>
                  <p className="text-sm text-phileon-gold mt-2">From $1,250</p>
                </div>
              </Link>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={400}>
            <div className="text-center mt-16">
              <Link 
                to="/shop" 
                className="px-10 py-4 border border-phileon-gold text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold hover:text-phileon-black"
              >
                View All Products
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Brand Statement Section */}
      <section className="py-24 md:py-28 px-8 bg-phileon-black border-t border-b border-phileon-charcoal/30">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl md:text-2xl text-phileon-ivory leading-relaxed tracking-wide font-light">
              Phileon creates sculptural jewelry designed to be seen, remembered, and worn with presence.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* La Marva Flagship Section - Featured Story */}
      <ScrollReveal>
        <LaMarvaFlagship />
      </ScrollReveal>

      {/* Rosaria Feature Section */}
      <section className="py-24 md:py-32 lg:py-40 bg-phileon-black">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            {/* Image Hero */}
            <div className="mb-12 md:mb-16">
              <Link to="/products/rosaria" className="block group">
                <div className="relative w-full max-w-3xl mx-auto overflow-hidden bg-phileon-black rounded-lg">
                  <img
                    src="https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/d15gu165_VideoCapture_20260312-012448.jpg"
                    alt="Rosaria Earrings"
                    className="w-full h-auto object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
            </div>
          </ScrollReveal>
          
          {/* Content - Centered */}
          <ScrollReveal delay={150}>
            <div className="text-center">
              <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-5">
                STATEMENT EARRINGS
              </p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-[0.08em] text-phileon-ivory leading-tight">
                ROSARIA
              </h2>
              <p className="mt-6 text-phileon-ivory-muted text-lg max-w-xl mx-auto">
                Petals of rose gold, sculpted in elegance.
              </p>
              <div className="mt-12">
                <Link 
                  to="/products/rosaria" 
                  className="inline-block px-10 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/90 hover:scale-[1.02]"
                  data-testid="rosaria-cta"
                >
                  Discover Rosaria
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Custom Design CTA */}
      <section className="relative py-36 md:py-40 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=2000&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-black/65" />
        </div>
        
        <ScrollReveal>
          <div className="relative z-10 max-w-3xl mx-auto text-center px-8">
            <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-6">Bespoke</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-[0.08em] text-phileon-ivory leading-tight">
              Create Something<br />Uniquely Yours
            </h2>
            <p className="mt-10 text-phileon-ivory-muted leading-relaxed">
              From engagement rings that capture your love story to heirloom pieces 
              that carry generations of meaning—our artisans bring your vision to life.
            </p>
            <div className="mt-14 flex flex-col sm:flex-row gap-5 justify-center">
              <Link 
                to="/custom-design" 
                className="px-10 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/90 hover:scale-[1.02]"
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
