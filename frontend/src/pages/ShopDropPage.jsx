import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, Filter, Eye, EyeOff } from 'lucide-react';
import { publicApi } from '../lib/api';
import { useWishlist } from '@/contexts/WishlistContext';
import StockBadge from '@/components/StockBadge';
import { Button } from '@/components/ui/button';
import { products, catalogProducts } from '@/data/products';
import { LiveFromPrice } from '@/components/LiveFromPrice';
import BapeShopCard from '@/components/shop/BapeShopCard';
import '../styles/shop-drop.css';

// SHOP COLLECTION ASSIGNMENT
// Maps each product slug to one of: 'sacred' | 'signature' | 'editorial' | 'collective'
// Used by the top-of-page chip filter and the grouped section layout.
// Pieces tagged audience='collective' (multi-audience cross-cut) primarily live in COLLECTIVE.
const SHOP_COLLECTION_MAP = {
  // SIGNATURE — gentlemen's flagship pieces
  'the-don-gorgon': 'signature',
  'the-carapace': 'signature',

  // SACRED — scripture/faith driven
  'galatians-614': 'sacred',
  'corinthians-15-14': 'sacred',
  // SIGNATURE — flagship craft / heirloom / single-audience couture
  'la-marva': 'signature',
  'annie-rose': 'signature',
  'lady-bamburgh': 'signature',
  'cypher': 'signature',
  'morso': 'signature',
  'labete': 'signature',
  'tola-ii': 'signature',
  'prise-de-couronne': 'signature',

  // EDITORIAL — sculptural / object-driven / fashion-forward
  'rosaria': 'editorial',
  'desir-corset': 'editorial',
  'apex': 'editorial',
  'homage': 'editorial',
  'trace': 'editorial',
  'monika-couture': 'editorial',
  'alejandra-heels': 'editorial',
  'fondo-curvo': 'editorial',
  'bound': 'editorial',
  'forme-cuff': 'editorial',
  'ptp-cuff': 'editorial',
  'rhythm-mesh-ring': 'editorial',
  'le-cocktail-de-jessica': 'editorial',
  'nervatura': 'editorial',
  'midweek': 'editorial',
  'la-madonna': 'editorial',
  'la-scarpa-della-regina': 'editorial',
  'lisa': 'signature',
  'lady-jay': 'editorial',
  'parabola': 'signature',

  // COLLECTIVE — multi-audience pieces (his + hers + collective)
  'coogi-i': 'collective',
  'blessed': 'collective',
  'the-bamburgh': 'collective',
  'bamburgh': 'collective',
  'drape': 'collective',
  'bape': 'collective',
  'the-true-vine': 'collective',
  'porta-aurea': 'collective',
  'coogi-dna-tag': 'collective',
  'battenti-della-villa': 'collective',
  'gent': 'collective',
  'stackrats': 'collective',
  'wynette-palette': 'collective',
  'veyron-noir': 'collective',
  'rose-of-sharon': 'collective',
  'boss-knot': 'collective',
  'lady-boss-knot': 'collective',
  'neighborhood-nip': 'collective',
};

const SHOP_COLLECTIONS = [
  { key: 'sacred',     label: 'Sacred Collection' },
  { key: 'signature',  label: 'Signature' },
  { key: 'editorial',  label: 'Editorial' },
  { key: 'collective', label: 'Collective' },
];


const ShopDropPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [hideSoldOut, setHideSoldOut] = useState(false); // DEFAULT OFF for hype
  const { has, toggle } = useWishlist();

  // Get filter params from URL
  const categoryParam = searchParams.get('category');
  const audienceParam = searchParams.get('audience');
  const collectionParam = searchParams.get('collection'); // 'sacred' | 'signature' | 'editorial' | 'collective' | null = All

  const setCollection = (key) => {
    const next = new URLSearchParams(searchParams);
    if (key) next.set('collection', key);
    else next.delete('collection');
    setSearchParams(next, { replace: true });
    setVisibleProducts([]);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await publicApi.getProducts({ featured: true });
        const apiProducts = response.data || [];

        // Always show catalog products first, then any non-duplicate API products.
        // Source of truth for the catalog lives in /data/products.js (catalogProducts).
        const catalogIds = catalogProducts.map((p) => p.id);
        const extraApiProducts = apiProducts.filter((p) => !catalogIds.includes(p.id));

        setProducts([...catalogProducts, ...extraApiProducts]);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback: render the static catalog only.
        setProducts([...catalogProducts]);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on category, audience, and sold out visibility
  const filteredProducts = products.filter(product => {
    // Filter by sold out
    if (hideSoldOut) {
      const inventoryCount = product.inventory_count || product.stock || 0;
      if (inventoryCount === 0) return false;
    }

    // If category or audience filter is active, only show products that have those fields defined
    const hasFilters = categoryParam || audienceParam;
    
    // Filter by category if specified (supports both string and array)
    if (categoryParam) {
      // Exclude products without a category when filter is active
      if (!product.category) return false;
      // Support array categories (e.g., ["gents", "ladies", "collective"])
      if (Array.isArray(product.category)) {
        if (!product.category.includes(categoryParam)) return false;
      } else {
        if (product.category !== categoryParam) return false;
      }
    }

    // Filter by audience if specified (supports both string and array)
    if (audienceParam) {
      // Exclude products without an audience when filter is active
      if (!product.audience) return false;
      
      // Support array audiences
      if (Array.isArray(product.audience)) {
        if (!product.audience.includes(audienceParam)) return false;
      } else {
        // Allow unisex products to show in both ladies and gentlemens-club collections
        if (product.audience === 'unisex') {
          // Unisex shows in ladies and gentlemens-club, but not in other specific filters
          if (audienceParam !== 'ladies' && audienceParam !== 'gentlemens-club') return false;
        } else if (product.audience !== audienceParam) {
          return false;
        }
      }
    }

    // Filter by shop collection if specified (sacred / signature / editorial / collective)
    if (collectionParam) {
      const productCollection = SHOP_COLLECTION_MAP[product.slug];
      if (productCollection !== collectionParam) return false;
    }

    return true;
  });

  // Group filtered products by their shop collection (used when no specific chip is active)
  const groupedByCollection = SHOP_COLLECTIONS.reduce((acc, { key }) => {
    acc[key] = filteredProducts.filter(p => SHOP_COLLECTION_MAP[p.slug] === key);
    return acc;
  }, {});

  // Determine if grouped sections should render (only on the "All" view with no category/audience filter active)
  const showGroupedSections = !collectionParam && !categoryParam && !audienceParam;

  // Stagger product reveal
  useEffect(() => {
    filteredProducts.forEach((_, index) => {
      setTimeout(() => {
        setVisibleProducts(prev => [...prev, index]);
      }, 150 * index);
    });
  }, [filteredProducts]);

  const soldOutCount = products.filter(product => {
    const inventoryCount = product.inventory_count || product.stock || 0;
    return inventoryCount === 0;
  }).length;

  return (
    <div className="shop-drop" data-testid="shop-drop-page">
      {/* Hero */}
      <section className="shop-drop__hero">
        <div className="shop-drop__hero-inner">
          <span className="shop-drop__hero-badge">EXCLUSIVE ACCESS</span>
          <h1 className="shop-drop__hero-title">SHOP DROP</h1>
          <p className="shop-drop__hero-description">
            Curated pieces available for immediate inquiry. Each creation represents 
            months of development and reflects our commitment to exceptional craftsmanship.
          </p>
          <div className="shop-drop__hero-line" />
        </div>
      </section>

      {/* COLLECTION CHIPS — Sacred / Signature / Editorial / Collective */}
      <section className="mb-6 mt-2" data-testid="shop-collection-chips">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-white text-xl tracking-[0.2em] uppercase font-light">SHOP</h2>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button
                onClick={() => setCollection(null)}
                data-testid="shop-chip-all"
                className={`px-4 py-2 text-[11px] tracking-[0.25em] uppercase border transition-all ${
                  !collectionParam
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white'
                    : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                }`}
              >
                All
              </button>
              {SHOP_COLLECTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCollection(key)}
                  data-testid={`shop-chip-${key}`}
                  className={`px-4 py-2 text-[11px] tracking-[0.25em] uppercase border transition-all ${
                    collectionParam === key
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Controls - DROP MODE */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-yellow-500" />
              <span className="text-white font-medium">
                {filteredProducts.length} pieces available
                {soldOutCount > 0 && (
                  <span className="text-gray-400 ml-2">
                    ({soldOutCount} sold out {hideSoldOut ? 'hidden' : 'shown'})
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={hideSoldOut}
                  onChange={(e) => {
                    setHideSoldOut(e.target.checked);
                    setVisibleProducts([]); // Reset animation
                  }}
                  className="w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                />
                {hideSoldOut ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm">Hide sold out</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="shop-drop__section">
        {/* Special Editorial Layout for Ladies Bracelets/Cuffs */}
        {categoryParam === 'bracelets' && audienceParam === 'ladies' ? (
          <>
            {/* BOUND - Featured Anchor Product */}
            {filteredProducts.filter(p => p.id === 'bound').map((product) => {
              const productUrl = product.href || `/products/${product.slug}`;
              return (
                <div key={product.id} className="bound-featured-section mb-16">
                  <a 
                    href={productUrl}
                    className="block group"
                    data-testid="featured-bound-card"
                  >
                    <div className="max-w-5xl mx-auto px-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Image */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#0a0a0a] rounded-sm">
                          <img 
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-[6s] ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>
                        
                        {/* Info */}
                        <div className="text-center lg:text-left py-8 lg:py-0">
                          <p className="text-[#C6A25D]/50 text-[10px] tracking-[0.4em] uppercase mb-4">
                            FEATURED PIECE
                          </p>
                          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white/90 tracking-wide font-light">
                            {product.name}
                          </h2>
                          <p className="text-white/40 text-lg tracking-[0.1em] mt-2">
                            The Bustier Bangle
                          </p>
                          <p className="text-white/30 text-sm mt-4 max-w-md mx-auto lg:mx-0">
                            Form, held in tension. A study in restraint and release — 
                            engineered to move with the body, yet command the eye.
                          </p>
                          <p className="text-[#C6A25D] text-2xl mt-6 tracking-wide">
                            <LiveFromPrice slug={product.slug} fallback={product.price_range} />
                          </p>
                          <div className="mt-8">
                            <span className="inline-block px-8 py-3 border border-white/20 text-white/80 text-sm tracking-[0.2em] uppercase transition-all duration-300 group-hover:border-[#C6A25D]/60 group-hover:shadow-[0_0_20px_rgba(198,162,93,0.15)]">
                              VIEW PIECE
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                  
                  {/* Wishlist button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggle(product.id);
                    }}
                    className="absolute top-6 right-6 z-10 p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
                    title={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-5 h-5 ${has(product.id) ? 'fill-current text-red-400' : ''}`} />
                  </button>
                </div>
              );
            })}
            
            {/* Divider */}
            <div className="max-w-4xl mx-auto px-6 mb-12">
              <div className="flex items-center gap-6">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase">
                  MORE BRACELETS & CUFFS
                </span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
            
            {/* Other Products Grid */}
            <div className="shop-drop__grid">
              {filteredProducts.filter(p => p.id !== 'bound').map((product, index) => {
                const inventoryCount = product.inventory_count || product.stock || 0;
                const isSoldOut = inventoryCount === 0;
                const productUrl = product.href || `/products/${product.slug}`;
                
                // Use clean product shot for non-BOUND items
                const cardImage = product.imageUrl;
                
                if (product.customCard === 'bape') {
                  return (
                    <div
                      key={product.id}
                      className={`shop-drop__card-wrapper ${visibleProducts.includes(index) ? 'is-visible' : ''}`}
                      style={{ position: 'relative', transitionDelay: `${index * 80}ms` }}
                    >
                      <BapeShopCard />
                    </div>
                  );
                }

                return (
                  <div 
                    key={product.id}
                    className={`shop-drop__card-wrapper ${visibleProducts.includes(index) ? 'is-visible' : ''}`}
                    style={{ 
                      position: 'relative',
                      transitionDelay: `${index * 80}ms` 
                    }}
                  >
                    {/* Wishlist */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggle(product.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        zIndex: 100,
                        padding: '8px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: 'none',
                        borderRadius: '50%',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                      title={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-4 h-4 ${has(product.id) ? 'fill-current text-red-400' : ''}`} />
                    </button>

                    <a 
                      href={productUrl}
                      style={{
                        display: 'block',
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                      }}
                      data-testid={`product-card-${product.slug}`}
                    >
                      <div style={{
                        position: 'relative',
                        aspectRatio: product.category === 'earrings' ? 'auto' : '1/1',
                        minHeight: product.category === 'earrings' ? '300px' : 'auto',
                        maxHeight: product.category === 'earrings' ? '80vh' : 'none',
                        overflow: 'hidden',
                        background: product.category === 'earrings' ? '#fff' : '#0a0a0a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: product.category === 'rings' ? '16px' : '0',
                      }}>
                        <img 
                          src={cardImage} 
                          alt={product.name}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: isSoldOut ? 'grayscale(1)' : 'none',
                          }}
                          draggable="false"
                        />
                      </div>
                      
                      <div style={{ padding: '12px 0 8px' }}>
                        <h3 className="shop-drop__card-name">{product.name}</h3>
                        <p className="shop-drop__card-material">{product.materials?.join(' · ') || product.materialLine}</p>
                        {product.price_range && (
                          <p className="shop-drop__card-price"><LiveFromPrice slug={product.slug} fallback={product.price_range} /></p>
                        )}
                        {product.slug === 'the-true-vine' && (
                          <p
                            data-testid="vine-card-inscription-badge"
                            style={{
                              fontSize: '10px',
                              letterSpacing: '0.18em',
                              textTransform: 'uppercase',
                              color: 'rgba(201,169,110,0.62)',
                              marginTop: '6px',
                              marginBottom: 0,
                            }}
                          >
                            + Sacred Inscription available
                          </p>
                        )}
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Standard Grid for other categories */
          (() => {
            // Reusable card grid renderer
            const renderGrid = (productList, sectionIdx = 0) => (
              <div className="shop-drop__grid">
                {productList.map((product, index) => {
                  const globalIndex = sectionIdx * 100 + index;
                  const inventoryCount = product.inventory_count || product.stock || 0;
                  const isSoldOut = inventoryCount === 0;
                  const productUrl = product.href || `/products/${product.slug}`;

                  const cardImage =
                    product.audienceImages?.[audienceParam] ||
                    product.audienceImages?.[audienceParam === 'gentlemens-club' ? 'gentlemensClub' : audienceParam] ||
                    product.lifestyleImages?.[audienceParam] ||
                    product.lifestyleImages?.[audienceParam === 'gentlemens-club' ? 'gentlemensClub' : audienceParam] ||
                    product.images?.[0] ||
                    product.imageUrl ||
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80';

                  if (product.customCard === 'bape') {
                    return (
                      <div
                        key={product.id}
                        className={`shop-drop__card-wrapper ${visibleProducts.includes(globalIndex) ? 'is-visible' : ''}`}
                        style={{ position: 'relative', transitionDelay: `${index * 80}ms` }}
                      >
                        <BapeShopCard />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={product.id}
                      className={`shop-drop__card-wrapper ${visibleProducts.includes(globalIndex) ? 'is-visible' : ''}`}
                      style={{ position: 'relative', transitionDelay: `${index * 80}ms` }}
                    >
                      {!product.is_tribute && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
                          style={{
                            position: 'absolute', top: '12px', right: '12px', zIndex: 100,
                            padding: '8px', background: 'rgba(0, 0, 0, 0.4)', border: 'none',
                            borderRadius: '50%', color: 'white', cursor: 'pointer',
                          }}
                          title={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart className={`w-4 h-4 ${has(product.id) ? 'fill-current text-red-400' : ''}`} />
                        </button>
                      )}

                      {product.is_tribute && (
                        <span
                          data-testid={`tribute-pill-${product.slug}`}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            zIndex: 100,
                            padding: '6px 10px',
                            background: 'rgba(3, 6, 12, 0.78)',
                            border: '1px solid rgba(45, 99, 200, 0.55)',
                            color: '#2D63C8',
                            fontFamily: 'Cinzel, serif',
                            fontSize: '9px',
                            letterSpacing: '0.32em',
                            textTransform: 'uppercase',
                            pointerEvents: 'none',
                          }}
                        >
                          {product.tributeLabel || 'TRIBUTE · NOT FOR SALE'}
                        </span>
                      )}

                      <a
                        href={productUrl}
                        className="group"
                        style={{ display: 'block', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                        data-testid={`product-card-${product.slug}`}
                      >
                        <div style={{
                          position: 'relative',
                          aspectRatio: product.category === 'earrings' ? 'auto' : '1/1',
                          minHeight: product.category === 'earrings' ? '300px' : 'auto',
                          maxHeight: product.category === 'earrings' ? '80vh' : 'none',
                          overflow: 'hidden',
                          background: product.category === 'earrings' ? '#fff' : '#0a0a0a',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: product.category === 'rings' ? '16px' : '0',
                        }}>
                          <img
                            src={cardImage}
                            alt={product.name}
                            loading="lazy"
                            className={`transition-all ease-out ${(product.slug === 'drape' || product.slug === 'le-cocktail-de-jessica') ? 'duration-500 group-hover:scale-[1.04] group-hover:opacity-0' : `duration-300 ${product.hoverImage ? 'group-hover:opacity-0' : ''}`}`}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: isSoldOut ? 'grayscale(1)' : 'none' }}
                            draggable="false"
                          />
                          {product.hoverImage && (
                            <img
                              src={product.hoverImage}
                              alt={`${product.name} alternate view`}
                              loading="lazy"
                              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all ease-out ${(product.slug === 'drape' || product.slug === 'le-cocktail-de-jessica') ? 'duration-500 group-hover:scale-[1.04]' : 'duration-300'}`}
                              style={{
                                width: '100%', height: '100%', objectFit: 'contain',
                                filter: isSoldOut ? 'grayscale(1)' : 'none',
                                padding: product.category === 'rings' ? '16px' : '0',
                              }}
                              draggable="false"
                            />
                          )}

                          {/* DRAPE — "SEE IT WORN" hover overlay */}
                          {product.slug === 'drape' && (
                            <div
                              className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                              style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
                                padding: '12px 16px 14px',
                              }}
                            >
                              <p className="text-white text-[10px] tracking-[0.3em] text-center uppercase">
                                See it worn
                              </p>
                            </div>
                          )}

                          {/* LE COCKTAIL DE JESSICA — "EXPRESSION IN MOTION" hover overlay */}
                          {product.slug === 'le-cocktail-de-jessica' && (
                            <div
                              className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                              style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.60), transparent)',
                                padding: '12px 16px 14px',
                              }}
                            >
                              <p className="text-white text-[10px] tracking-[0.3em] text-center uppercase">
                                Expression in motion
                              </p>
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '12px 0 8px' }}>
                          <h3 className="shop-drop__card-name">{product.name}</h3>
                          <p className="shop-drop__card-material">{product.materials?.join(' · ') || product.materialLine}</p>
                          {Array.isArray(product.metals) && product.metals.length > 0 && (
                            <div
                              className="shop-drop__card-metals"
                              data-testid={`card-metals-${product.slug}`}
                              aria-label="Available metals"
                            >
                              {product.metals.map((m) => (
                                <span
                                  key={m}
                                  className={`shop-drop__metal-chip is-${m === 'white' ? 'white-gold' : m}`}
                                  data-testid={`card-metal-${product.slug}-${m}`}
                                  title={
                                    m === 'silver' ? 'Sterling Silver'
                                    : m === 'yellow' ? '10K Yellow Gold'
                                    : m === 'white'  ? '10K White Gold'
                                    : m === 'rose'   ? 'Rose Gold'
                                    : m
                                  }
                                />
                              ))}
                            </div>
                          )}
                          {product.price_range && !product.is_tribute && (
                            <p className="shop-drop__card-price">{product.price_range}</p>
                          )}
                          {product.slug === 'the-true-vine' && (
                            <p
                              data-testid="vine-card-inscription-badge"
                              style={{
                                fontSize: '10px',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: 'rgba(201,169,110,0.62)',
                                marginTop: '6px',
                                marginBottom: 0,
                              }}
                            >
                              + Sacred Inscription available
                            </p>
                          )}
                        </div>
                      </a>
                    </div>
                  );
                })}
              </div>
            );

            // GROUPED LAYOUT — only when "All" chip + no other filter active
            if (showGroupedSections) {
              return (
                <div className="space-y-16">
                  {SHOP_COLLECTIONS.map(({ key, label }, sectionIdx) => {
                    const items = groupedByCollection[key] || [];
                    if (items.length === 0) return null;
                    return (
                      <div key={key} data-testid={`shop-section-${key}`}>
                        <div className="max-w-7xl mx-auto px-6 mb-6">
                          <h2 className="text-white text-lg tracking-[0.35em] uppercase font-light">
                            {label}
                          </h2>
                          <div className="w-12 h-px bg-[#D4AF37]/30 mt-3" />
                        </div>
                        {renderGrid(items, sectionIdx)}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // SINGLE GRID — chip selected, or category/audience filter active
            return renderGrid(filteredProducts);
          })()
        )}
      </section>
    </div>
  );
};

export default ShopDropPage;