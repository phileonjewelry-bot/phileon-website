import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { publicApi } from '@/lib/api';
import DropReveal from '@/components/DropReveal';

const HomePage = () => {
  const [collections, setCollections] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropReveal, setShowDropReveal] = useState(false);
  const navigate = useNavigate();
  const keyBufferRef = useRef('');
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

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

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=2000&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/95" />
        </div>
        
        <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
          {/* Hero headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-[0.3em] text-phileon-ivory leading-tight">
            TIMELESS ELEGANCE
          </h1>
          
          {/* Hero subtext */}
          <p className="mt-6 text-sm md:text-base text-phileon-ivory-muted tracking-[0.15em] opacity-75">
            Crafted for you
          </p>
          
          {/* SHOP DROP button */}
          <Link 
            to="/shop-drop"
            className="inline-block mt-10 px-10 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.25em] uppercase font-medium transition-all duration-300 hover:shadow-[0_0_0_1px_#1e5bff]"
            data-testid="shop-drop-btn"
          >
            Shop Drop
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-60">
          <ChevronDown className="text-phileon-gold" size={28} />
        </div>
      </section>

      {/* Introduction - Calm, intentional spacing */}
      <section className="py-24 lg:py-32 px-8 bg-phileon-black">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-phileon-ivory">
            The Art of <span className="text-phileon-gold">Meaningful</span> Jewelry
          </h2>
          <div className="w-16 h-px bg-phileon-gold mx-auto my-10" />
          <p className="text-phileon-ivory-muted leading-relaxed text-base">
            At Phileon, we believe that the most precious jewelry isn't just worn—it's lived. 
            Each piece we create is a collaboration between our master artisans and your vision, 
            resulting in heirloom-quality jewelry that captures your most meaningful moments.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      {!loading && collections.length > 0 && (
        <section className="py-24 lg:py-32 px-8 bg-phileon-near-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Discover</p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-phileon-ivory">
                Our Collections
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {collections.map((collection, index) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.slug}`}
                  className={`group relative overflow-hidden ${
                    index === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-[4/3]'
                  }`}
                  data-testid={`collection-card-${collection.slug}`}
                >
                  <img
                    src={collection.image_url || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1200&q=80'}
                    alt={collection.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="font-serif text-2xl md:text-3xl tracking-[0.08em] text-phileon-ivory group-hover:text-phileon-gold transition-colors duration-300">
                      {collection.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-14">
              <Link 
                to="/collections" 
                className="px-10 py-4 border border-phileon-gold text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold hover:text-phileon-black"
              >
                View All Collections
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Pieces */}
      {!loading && featuredProducts.length > 0 && (
        <section className="py-24 lg:py-32 px-8 bg-phileon-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Featured</p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-phileon-ivory">
                Signature Pieces
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/piece/${product.slug}`}
                  className="group"
                  data-testid={`featured-product-${product.slug}`}
                >
                  <div className="aspect-square overflow-hidden bg-phileon-charcoal">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="font-serif text-lg tracking-[0.08em] text-phileon-ivory group-hover:text-phileon-gold transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-sm text-phileon-ivory-muted mt-2">
                      {product.materials?.join(' · ')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* Testimonials */}
      {!loading && testimonials.length > 0 && (
        <section className="py-24 lg:py-32 px-8 bg-phileon-near-black">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Stories</p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-phileon-ivory">
                Client Experiences
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="bg-phileon-charcoal/50 p-10"
                >
                  <p className="text-phileon-ivory-muted italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-8 pt-6 border-t border-phileon-charcoal">
                    <p className="font-serif text-phileon-gold tracking-wider">
                      {testimonial.client_name}
                    </p>
                    {testimonial.client_location && (
                      <p className="text-xs text-phileon-ivory-muted mt-1">
                        {testimonial.client_location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA - Calm */}
      <section className="py-24 lg:py-32 px-8 bg-phileon-black border-t border-phileon-charcoal/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl tracking-[0.08em] text-phileon-ivory">
            Ready to Begin?
          </h2>
          <p className="mt-6 text-phileon-ivory-muted">
            Schedule a consultation with our design team.
          </p>
          <Link 
            to="/contact" 
            className="inline-block mt-10 px-10 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/90 hover:scale-[1.02]"
          >
            Book a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
