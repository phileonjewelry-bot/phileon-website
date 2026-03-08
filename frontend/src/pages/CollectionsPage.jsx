import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '@/lib/api';

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await publicApi.getCollections();
        setCollections(response.data);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen pt-24" data-testid="collections-page">
      {/* Header */}
      <section className="section-padding bg-phileon-black text-center">
        <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Explore</p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-[0.1em] text-phileon-ivory">
          Our Collections
        </h1>
        <div className="luxury-line mx-auto my-8" />
        <p className="max-w-2xl mx-auto text-phileon-ivory-muted">
          Each collection represents a distinct chapter in our story—curated with 
          intention, crafted with precision, and designed to become part of yours.
        </p>
      </section>

      {/* Collections Grid */}
      <section className="section-padding bg-phileon-near-black">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner" />
            </div>
          ) : collections.length > 0 ? (
            <div className="space-y-16">
              {collections.map((collection, index) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.slug}`}
                  className={`group grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                    index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                  }`}
                  data-testid={`collection-item-${collection.slug}`}
                >
                  <div className={`overflow-hidden img-hover-zoom ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    <div className="aspect-[4/3]">
                      <img
                        src={collection.image_url || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1200&q=80'}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:text-right' : ''} py-8`}>
                    <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Collection</p>
                    <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory group-hover:text-phileon-gold transition-colors">
                      {collection.name}
                    </h2>
                    <p className="mt-6 text-phileon-ivory-muted leading-relaxed max-w-md">
                      {collection.description}
                    </p>
                    <span className="inline-block mt-6 text-phileon-gold text-sm tracking-wider border-b border-phileon-gold pb-1 group-hover:border-phileon-ivory group-hover:text-phileon-ivory transition-colors">
                      Explore Collection
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-phileon-ivory-muted text-lg">Collections are being curated</p>
              <p className="text-phileon-ivory-muted text-sm mt-2">Check back soon for our exquisite pieces</p>
            </div>
          )}
        </div>
      </section>

      {/* Custom Design CTA */}
      <section className="section-padding bg-phileon-black text-center border-t border-phileon-charcoal">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl tracking-[0.1em] text-phileon-ivory">
            Don't See What You're Looking For?
          </h2>
          <p className="mt-4 text-phileon-ivory-muted">
            Our bespoke service allows you to create a piece that's uniquely yours.
          </p>
          <Link to="/custom-design" className="btn-primary mt-8 inline-block" data-testid="collections-custom-cta">
            Design Your Own
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CollectionsPage;
