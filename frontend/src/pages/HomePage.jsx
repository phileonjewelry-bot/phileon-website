import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { publicApi } from '@/lib/api';
import DropReveal from '@/components/DropReveal';
import LaMarvaFlagship from '@/components/LaMarvaFlagship';

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
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] text-phileon-ivory mb-6 leading-tight">
            Sculpted to be recognized.
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

      {/* Core Products Showcase */}
      <section className="py-24 lg:py-32 px-8 bg-phileon-near-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Core Collection</p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-phileon-ivory">
              Signature Pieces
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link
              to="/products/la-marva"
              className="group block"
              data-testid="product-card-la-marva"
            >
              <div className="aspect-square overflow-hidden bg-phileon-charcoal relative transition-transform duration-[350ms] ease-in-out group-hover:scale-105">
                <img
                  src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg"
                  alt="La Marva"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <h3 className="font-serif text-lg tracking-[0.08em] text-phileon-ivory group-hover:text-phileon-gold transition-colors duration-300">
                  La Marva
                </h3>
                <p className="text-sm text-phileon-ivory-muted mt-2">
                  Signature Ring · Dynamic Pricing
                </p>
                <p className="text-sm text-phileon-gold mt-1">From $3,400</p>
              </div>
            </Link>

            <Link
              to="/products/annie-rose"
              className="group block"
              data-testid="product-card-annie-rose"
            >
              <div className="aspect-square overflow-hidden bg-phileon-charcoal relative transition-transform duration-[350ms] ease-in-out group-hover:scale-105">
                <img
                  src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg"
                  alt="Annie Rose"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <h3 className="font-serif text-lg tracking-[0.08em] text-phileon-ivory group-hover:text-phileon-gold transition-colors duration-300">
                  Annie Rose
                </h3>
                <p className="text-sm text-phileon-ivory-muted mt-2">
                  Lab & Natural Diamonds
                </p>
                <p className="text-sm text-phileon-gold mt-1">From $6,400</p>
              </div>
            </Link>

            <Link
              to="/products/monika-couture"
              className="group block"
              data-testid="product-card-monika-couture"
            >
              <div className="aspect-square overflow-hidden bg-phileon-charcoal relative transition-transform duration-[350ms] ease-in-out group-hover:scale-105">
                <img
                  src="https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg"
                  alt="Monika Couture"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <h3 className="font-serif text-lg tracking-[0.08em] text-phileon-ivory group-hover:text-phileon-gold transition-colors duration-300">
                  Monika Couture
                </h3>
                <p className="text-sm text-phileon-ivory-muted mt-2">
                  Earrings · Silver & Gold
                </p>
                <p className="text-sm text-phileon-gold mt-1">From $1,400</p>
              </div>
            </Link>

            <Link
              to="/products/alejandra-heels"
              className="group block"
              data-testid="product-card-alejandra-heels"
            >
              <div className="aspect-square overflow-hidden bg-phileon-charcoal relative transition-transform duration-[350ms] ease-in-out group-hover:scale-105">
                <img
                  src="https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/0y3jefc5_1000140400.jpg"
                  alt="Alejandra Heels"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <h3 className="font-serif text-lg tracking-[0.08em] text-phileon-ivory group-hover:text-phileon-gold transition-colors duration-300">
                  Alejandra Heels
                </h3>
                <p className="text-sm text-phileon-ivory-muted mt-2">
                  Heel Earrings · Sculptural Design
                </p>
                <p className="text-sm text-phileon-gold mt-1">From $1,250</p>
              </div>
            </Link>
          </div>

          <div className="text-center mt-14">
            <Link 
              to="/shop" 
              className="px-10 py-4 border border-phileon-gold text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold hover:text-phileon-black"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Statement Section */}
      <section className="py-20 px-8 bg-phileon-black border-t border-b border-phileon-charcoal/30">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl md:text-2xl text-phileon-ivory leading-relaxed tracking-wide font-light">
            Phileon creates sculptural jewelry designed to be seen, remembered, and worn with presence.
          </p>
        </div>
      </section>

      {/* La Marva Flagship Section - Featured Story */}
      <LaMarvaFlagship />

      {/* Custom Design CTA */}
      <section className="relative py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=2000&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-black/65" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center px-8">
          <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-6">Bespoke</p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-[0.08em] text-phileon-ivory leading-tight">
            Create Something<br />Uniquely Yours
          </h2>
          <p className="mt-8 text-phileon-ivory-muted leading-relaxed">
            From engagement rings that capture your love story to heirloom pieces 
            that carry generations of meaning—our artisans bring your vision to life.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center">
            <Link 
              to="/custom-design" 
              className="px-10 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/90 hover:scale-[1.02]"
            >
              Begin a Custom Piece
            </Link>
          </div>
        </div>
      </section>
    </div>
  );

};

export default HomePage;
