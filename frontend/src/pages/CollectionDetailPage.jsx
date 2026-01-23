import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { publicApi } from '@/lib/api';

const CollectionDetailPage = () => {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collectionRes = await publicApi.getCollection(slug);
        setCollection(collectionRes.data);
        
        const productsRes = await publicApi.getProducts({ collection_id: collectionRes.data.id });
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Error fetching collection:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-phileon-ivory text-lg">Collection not found</p>
          <Link to="/collections" className="btn-outline mt-6 inline-block">
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24" data-testid="collection-detail-page">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${collection.image_url || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=2000&q=80'}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <Link 
            to="/collections" 
            className="absolute top-8 left-8 flex items-center gap-2 text-phileon-ivory-muted hover:text-phileon-gold transition-colors text-sm"
          >
            <ArrowLeft size={16} /> All Collections
          </Link>
          <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">Collection</p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-[0.15em] text-phileon-ivory">
            {collection.name}
          </h1>
          <p className="mt-6 max-w-2xl text-phileon-ivory-muted">
            {collection.description}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding bg-phileon-black">
        <div className="max-w-7xl mx-auto">
          {products.length > 0 ? (
            <>
              <p className="text-center text-phileon-ivory-muted mb-12">
                {products.length} {products.length === 1 ? 'piece' : 'pieces'} in this collection
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/piece/${product.slug}`}
                    className="group"
                    data-testid={`product-card-${product.slug}`}
                  >
                    <div className="aspect-square overflow-hidden img-hover-zoom bg-phileon-charcoal">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-6">
                      <h3 className="font-serif text-xl tracking-[0.08em] text-phileon-ivory group-hover:text-phileon-gold transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-phileon-ivory-muted mt-2">
                        {product.materials?.join(' • ')}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        {product.price_range && (
                          <span className="text-phileon-gold text-sm">{product.price_range}</span>
                        )}
                        <span className={`text-xs px-3 py-1 ${
                          product.availability === 'available' 
                            ? 'bg-green-900/30 text-green-400' 
                            : product.availability === 'made_to_order'
                            ? 'bg-phileon-gold/20 text-phileon-gold'
                            : 'bg-phileon-charcoal text-phileon-ivory-muted'
                        }`}>
                          {product.availability === 'available' && 'Available'}
                          {product.availability === 'made_to_order' && 'Made to Order'}
                          {product.availability === 'inquiry_only' && 'Inquiry Only'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-phileon-ivory-muted">Pieces in this collection are coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Inquiry CTA */}
      <section className="section-padding bg-phileon-near-black text-center border-t border-phileon-charcoal">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl tracking-[0.1em] text-phileon-ivory">
            Interested in This Collection?
          </h2>
          <p className="mt-4 text-phileon-ivory-muted">
            Contact us to discuss customization options or schedule a private viewing.
          </p>
          <Link to="/contact" className="btn-primary mt-8 inline-block" data-testid="collection-inquiry-cta">
            Make an Inquiry
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CollectionDetailPage;
