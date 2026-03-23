import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Filter, Eye, EyeOff } from 'lucide-react';
import { publicApi } from '../lib/api';
import { useWishlist } from '@/contexts/WishlistContext';
import StockBadge from '@/components/StockBadge';
import ProductActionButton from '@/components/ProductActionButton';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import '../styles/shop-drop.css';

// Core collection products - Always shown first
// Each product has category (rings, earrings, pendants, bracelets) and audience (ladies, gentlemens-club, collective)
const CORE_PRODUCTS = [
  {
    id: 'la-marva',
    name: 'La Marva',
    slug: 'la-marva',
    materialLine: 'Signature Ring · Dynamic Pricing',
    imageUrl: 'https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg',
    href: '/products/la-marva',
    price_range: 'From $3,400',
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: 'ladies',
  },
  {
    id: 'annie-rose',
    name: 'Annie Rose',
    slug: 'annie-rose',
    materialLine: 'Lab & Natural Diamonds · 10K-18K Gold',
    imageUrl: 'https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg',
    href: '/products/annie-rose',
    price_range: 'From $6,400',
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: 'ladies',
  },
  {
    id: 'monika-couture',
    name: 'Monika Couture Earrings',
    slug: 'monika-couture',
    materialLine: 'Statement Earrings · Silver & Gold Options',
    imageUrl: 'https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg',
    href: '/products/monika-couture',
    price_range: 'From $1,400',
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: 'ladies',
  },
  {
    id: 'alejandra-heels',
    name: 'Alejandra Heels Earrings',
    slug: 'alejandra-heels',
    materialLine: 'Statement Earrings · Silver & Solid Gold',
    imageUrl: 'https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/0y3jefc5_1000140400.jpg',
    href: '/products/alejandra-heels',
    price_range: 'From $1,250',
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: 'ladies',
  },
  {
    id: 'ptp-cuff',
    name: 'PTP Cuff',
    slug: 'ptp-cuff',
    materialLine: 'Cuff Bracelet · Vermeil to 14K Gold',
    imageUrl: 'https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/n1f04383_1000140851.jpg',
    href: '/products/ptp-cuff',
    price_range: 'From $1,050 CAD',
    inventory_count: 100,
    is_core: true,
    category: 'bracelets',
    audience: 'gentlemens-club',
  },
  {
    id: 'rosaria',
    name: 'Rosaria Earrings',
    slug: 'rosaria',
    materialLine: 'Statement Earrings · 10K & 14K Rose Gold',
    imageUrl: 'https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/d15gu165_VideoCapture_20260312-012448.jpg',
    href: '/products/rosaria',
    price_range: 'From $2,950 CAD',
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: 'ladies',
  },
  {
    id: 'desir-corset',
    name: 'Désir Corset Pendant',
    slug: 'desir-corset',
    materialLine: 'Pendant · 10K Rose Gold',
    imageUrl: 'https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/sxr71rsz_1000141578.jpg',
    href: '/products/desir-corset',
    price_range: 'From $5,995 CAD',
    inventory_count: 100,
    is_core: true,
    category: 'pendants',
    audience: 'ladies',
  },
  {
    id: 'forme-cuff',
    name: 'Forme Cuff',
    slug: 'forme-cuff',
    materialLine: 'Cuff Bracelet · 10K Gold & Plated Silver',
    imageUrl: 'https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/k7kbqg47_1000142846.png',
    href: '/products/forme-cuff',
    price_range: 'From $1,250 CAD',
    inventory_count: 100,
    is_core: true,
    category: 'bracelets',
    audience: 'ladies',
  },
];

// Additional drop products as fallback
const DROP_PRODUCTS = [
  {
    id: '1',
    name: 'Eclipse Ring',
    slug: 'eclipse-ring',
    materialLine: 'Titanium · Black Diamond',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    href: '/piece/eclipse-ring',
    inventory_count: 0,
  },
  {
    id: '2',
    name: 'Celestial Band',
    slug: 'celestial-band',
    materialLine: 'White Gold · Star Sapphire',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
    href: '/piece/celestial-band',
    inventory_count: 0,
  },
  {
    id: '3',
    name: 'Serpent Coil',
    slug: 'serpent-coil',
    materialLine: '18K Rose Gold · Emerald Eyes',
    imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    href: '/piece/serpent-coil',
    inventory_count: 0,
  },
];

const ShopDropPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [hideSoldOut, setHideSoldOut] = useState(false); // DEFAULT OFF for hype
  const { has, toggle } = useWishlist();
  const { addToCart } = useCart();

  // Get filter params from URL
  const categoryParam = searchParams.get('category');
  const audienceParam = searchParams.get('audience');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await publicApi.getProducts({ featured: true });
        const apiProducts = response.data || [];
        
        // Always show core products first, then API products (excluding duplicates), then drop products
        const coreIds = CORE_PRODUCTS.map(p => p.id);
        const filteredApiProducts = apiProducts.filter(p => !coreIds.includes(p.id));
        
        const allProducts = [
          ...CORE_PRODUCTS,
          ...filteredApiProducts,
          ...DROP_PRODUCTS,
        ];
        
        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Show core products + drop products as fallback
        setProducts([...CORE_PRODUCTS, ...DROP_PRODUCTS]);
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
    
    // Filter by category if specified
    if (categoryParam) {
      // Exclude products without a category when filter is active
      if (!product.category) return false;
      if (product.category !== categoryParam) return false;
    }

    // Filter by audience if specified
    if (audienceParam) {
      // Exclude products without an audience when filter is active
      if (!product.audience) return false;
      if (product.audience !== audienceParam) return false;
    }

    return true;
  });

  // Stagger product reveal
  useEffect(() => {
    filteredProducts.forEach((_, index) => {
      setTimeout(() => {
        setVisibleProducts(prev => [...prev, index]);
      }, 150 * index);
    });
  }, [filteredProducts]);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price_range?.split(' - ')[0]?.replace('$', '').replace(',', '') || '0'),
      images: product.images || [product.imageUrl],
      quantity: 1
    });
  };

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
        <div className="shop-drop__grid">
          {filteredProducts.map((product, index) => {
            const inventoryCount = product.inventory_count || product.stock || 0;
            const lowStockThreshold = product.low_stock_threshold || 2;
            const isSoldOut = inventoryCount === 0;
            const isLowStock = inventoryCount > 0 && inventoryCount <= lowStockThreshold;
            
            return (
              <article 
                key={product.id}
                className={`shop-drop__card ${visibleProducts.includes(index) ? 'is-visible' : ''} ${isSoldOut ? 'shop-drop__card--sold-out' : ''}`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="relative">
                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggle(product.id);
                    }}
                    className="absolute top-3 right-3 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
                    title={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart 
                      className={`w-4 h-4 ${has(product.id) ? 'fill-current text-red-400' : ''}`} 
                    />
                  </button>
                  
                  <Link to={product.href || `/piece/${product.slug}`} className="shop-drop__card-link">
                    <div className="shop-drop__card-image relative">
                      {/* DROP MODE BADGES - PROMINENTLY DISPLAYED */}
                      <div className="absolute top-3 left-3 z-10 space-y-2">
                        {/* SOLD OUT BADGE - Most Prominent */}
                        {isSoldOut && (
                          <div className="badge badge-soldout bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm animate-pulse">
                            SOLD OUT
                          </div>
                        )}
                        
                        {/* LOW STOCK BADGE */}
                        {isLowStock && !isSoldOut && (
                          <div className="badge badge-warning bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm animate-pulse">
                            ONLY {inventoryCount} LEFT
                          </div>
                        )}
                        
                        {/* BESTSELLER */}
                        {product.is_bestseller && (
                          <div className="badge badge-gold bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-sm">
                            BESTSELLER
                          </div>
                        )}
                      </div>
                      
                      {/* Sold Out Overlay */}
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                          <div className="bg-red-600/90 text-white px-6 py-3 rounded-lg font-bold text-lg backdrop-blur-sm">
                            SOLD OUT
                          </div>
                        </div>
                      )}
                      
                      <img 
                        src={product.images?.[0] || product.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'} 
                        alt={product.name}
                        loading="lazy"
                        className={isSoldOut ? 'grayscale' : ''}
                      />
                    </div>
                  </Link>
                  
                  <div className="shop-drop__card-info">
                    <h3 className="shop-drop__card-name">{product.name}</h3>
                    <p className="shop-drop__card-material">{product.materials?.join(' · ') || product.materialLine}</p>
                    {product.price_range && (
                      <p className="shop-drop__card-price">{product.price_range}</p>
                    )}
                    
                    {/* DROP MODE Action Button */}
                    <div className="mt-3">
                      <ProductActionButton
                        product={product}
                        onAddToCart={handleAddToCart}
                        size="sm"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ShopDropPage;