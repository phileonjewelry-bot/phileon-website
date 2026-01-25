import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Filter, Eye, EyeOff } from 'lucide-react';
import { publicApi } from '../lib/api';
import { useWishlist } from '@/contexts/WishlistContext';
import StockBadge from '@/components/StockBadge';
import ProductActionButton from '@/components/ProductActionButton';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

// Hardcoded products as fallback
const HARDCODED_PRODUCTS = [
  {
    id: '1',
    name: 'Eclipse Ring',
    materialLine: 'Titanium · Black Diamond',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    href: '/piece/eclipse-ring',
  },
  {
    id: '2',
    name: 'Celestial Band',
    materialLine: 'White Gold · Star Sapphire',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
    href: '/piece/celestial-band',
  },
  {
    id: '3',
    name: 'Serpent Coil',
    materialLine: '18K Rose Gold · Emerald Eyes',
    imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    href: '/piece/serpent-coil',
  },
  {
    id: '4',
    name: 'Monarch Signet',
    materialLine: '22K Gold · Hand Engraved',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
    href: '/piece/monarch-signet',
  },
  {
    id: '5',
    name: 'Infinity Embrace',
    materialLine: 'White Gold · VS1 Diamonds',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    href: '/piece/infinity-embrace',
  },
  {
    id: '6',
    name: 'Noir Statement',
    materialLine: 'Black Rhodium · Onyx',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    href: '/piece/noir-statement',
  },
];

const ShopDropPage = () => {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [hideSoldOut, setHideSoldOut] = useState(false); // DEFAULT OFF for hype
  const { has, toggle } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await publicApi.getProducts({ featured: true });
        const apiProducts = response.data || [];
        
        // Use API products if available, otherwise fallback to hardcoded
        if (apiProducts.length > 0) {
          setProducts(apiProducts);
        } else {
          setProducts(HARDCODED_PRODUCTS);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Keep the hardcoded products as fallback
        setProducts(HARDCODED_PRODUCTS);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on sold out visibility setting
  const filteredProducts = hideSoldOut 
    ? products.filter(product => {
        const inventoryCount = product.inventory_count || product.stock || 0;
        return inventoryCount > 0; // Hide if sold out
      })
    : products; // Show all products (including sold out) for HYPE

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

      {/* Products Grid */}
      <section className="shop-drop__section">
        <div className="shop-drop__grid">
          {products.map((product, index) => (
            <article 
              key={product.id}
              className={`shop-drop__card ${visibleProducts.includes(index) ? 'is-visible' : ''}`}
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
                  className="absolute top-3 right-3 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
                  title={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart 
                    className={`w-4 h-4 ${has(product.id) ? 'fill-current text-red-400' : ''}`} 
                  />
                </button>
                
                <Link to={`/piece/${product.slug}`} className="shop-drop__card-link">
                <div className="shop-drop__card-image relative">
                  {/* BESTSELLER */}
                  {product.is_bestseller && (
                    <span className="badge badge-gold">BESTSELLER</span>
                  )}
                  
                  {/* LOW STOCK */}
                  {product.stock > 0 && product.stock <= product.low_stock_threshold && (
                    <span className="badge badge-warning">LOW STOCK</span>
                  )}
                  
                  {/* SOLD OUT */}
                  {product.stock === 0 && (
                    <span className="badge badge-soldout">SOLD OUT</span>
                  )}
                  
                  <img 
                    src={product.images?.[0] || product.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'} 
                    alt={product.name}
                    loading="lazy"
                  />
                  <div className="shop-drop__card-overlay">
                    <span className="shop-drop__card-cta">Request This Piece</span>
                  </div>
                </div>
                <div className="shop-drop__card-info">
                  <h3 className="shop-drop__card-name">{product.name}</h3>
                  <p className="shop-drop__card-material">{product.materials?.join(' · ') || product.materialLine}</p>
                </div>
              </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ShopDropPage;