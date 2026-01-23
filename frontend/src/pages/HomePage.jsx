import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { publicApi } from '@/lib/api';

const HomePage = () => {
  const [collections, setCollections] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-in">
          <div className="luxury-line mx-auto mb-8" />
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-[0.15em] text-phileon-ivory leading-tight">
            Timeless Elegance,<br />
            <span className="text-gold-gradient">Crafted for You</span>
          </h1>
          <p className="mt-8 text-sm md:text-base text-phileon-ivory-muted tracking-widest uppercase">
            Bespoke Jewelry That Tells Your Story
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/collections" className="btn-primary" data-testid="hero-explore-btn">
              Explore Collections
            </Link>
            <Link to="/custom-design" className="btn-outline" data-testid="hero-custom-btn">
              Begin Your Design
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-phileon-gold" size={32} />
        </div>
      </section>

      {/* Introduction */}
      <section className="section-padding bg-phileon-black">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
            The Art of <span className="text-phileon-gold">Meaningful</span> Jewelry
          </h2>
          <div className="luxury-line mx-auto my-8" />
          <p className="text-phileon-ivory-muted leading-relaxed">
            At Phileon, we believe that the most precious jewelry isn't just worn—it's lived. 
            Each piece we create is a collaboration between our master artisans and your vision, 
            resulting in heirloom-quality jewelry that captures your most meaningful moments.
          </p>
          <Link 
            to="/about" 
            className="inline-flex items-center gap-2 mt-8 text-phileon-gold text-sm tracking-wider hover:gap-3 transition-all"
            data-testid="intro-learn-more"
          >
            Learn Our Story <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="section-padding bg-phileon-near-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Discover</p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
              Our Collections
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner" />
            </div>
          ) : collections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {collections.map((collection, index) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.slug}`}
                  className={`group relative overflow-hidden img-hover-zoom ${
                    index === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-[4/3]'
                  }`}
                  data-testid={`collection-card-${collection.slug}`}
                >
                  <img
                    src={collection.image_url || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1200&q=80'}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="font-serif text-2xl md:text-3xl tracking-[0.1em] text-phileon-ivory group-hover:text-phileon-gold transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-phileon-ivory-muted mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {collection.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-phileon-ivory-muted">Collections coming soon</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/collections" className="btn-outline" data-testid="view-all-collections">
              View All Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Pieces */}
      {featuredProducts.length > 0 && (
        <section className="section-padding bg-phileon-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Featured</p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
                Signature Pieces
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/piece/${product.slug}`}
                  className="group"
                  data-testid={`featured-product-${product.slug}`}
                >
                  <div className="aspect-square overflow-hidden img-hover-zoom bg-phileon-charcoal">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="font-serif text-lg tracking-[0.1em] text-phileon-ivory group-hover:text-phileon-gold transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-phileon-ivory-muted mt-2">
                      {product.materials?.join(' • ')}
                    </p>
                    {product.price_range && (
                      <p className="text-phileon-gold text-sm mt-2">{product.price_range}</p>
                    )}
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
          <div className="absolute inset-0 bg-black/70" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Bespoke</p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-[0.1em] text-phileon-ivory leading-tight">
            Create Something<br />Uniquely Yours
          </h2>
          <p className="mt-6 text-phileon-ivory-muted leading-relaxed">
            From engagement rings that capture your love story to heirloom pieces 
            that carry generations of meaning—our artisans bring your vision to life.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/custom-design" className="btn-primary" data-testid="cta-custom-design">
              Start Your Journey
            </Link>
            <Link to="/process" className="btn-outline" data-testid="cta-process">
              Our Process
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="section-padding bg-phileon-near-black">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Testimonials</p>
              <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
                Client Stories
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="bg-phileon-charcoal p-8 border border-phileon-charcoal"
                  data-testid={`testimonial-${testimonial.id}`}
                >
                  <p className="text-phileon-ivory-muted italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-6 pt-6 border-t border-phileon-charcoal">
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

            <div className="text-center mt-12">
              <Link to="/testimonials" className="btn-outline" data-testid="view-all-testimonials">
                Read More Stories
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="section-padding bg-phileon-black border-t border-phileon-charcoal">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
            Ready to Begin?
          </h2>
          <p className="mt-6 text-phileon-ivory-muted">
            Schedule a consultation with our design team to discuss your vision.
          </p>
          <Link to="/contact" className="btn-primary mt-8 inline-block" data-testid="final-cta-contact">
            Book a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
