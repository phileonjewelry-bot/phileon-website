import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, ZoomIn, Scan, Camera } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TryOnModal from '@/components/TryOnModalSimple';
import InventoryBadges from '@/components/InventoryBadges';
import '@/styles/inventory-badges.css';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Heart, Share2 } from 'lucide-react';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [restockSubmitting, setRestockSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [restockData, setRestockData] = useState({
    name: '',
    email: '',
  });

  // Inventory state calculations
  const inv = Number(product?.inventory_count ?? 0);
  const soldOut = inv <= 0;

  // Context hooks
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await publicApi.getProduct(slug);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await publicApi.createInquiry({
        ...formData,
        inquiry_type: 'product_inquiry',
        product_id: product.id,
      });
      toast.success('Your request has been received. We\'ll be in touch soon.');
      setInquiryOpen(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const logTryOnAnalytics = async (eventType) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          product_id: product.id,
          user_agent: navigator.userAgent,
          device_info: {
            is_mobile: isMobile,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight
          },
          session_id: sessionStorage.getItem('phileon_session_id') || 'anonymous'
        })
      });
    } catch (error) {
      console.warn('Analytics logging failed:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Phileon Jewelry - ${product.name}`,
      text: `Check out this beautiful ${product.name} from Phileon Jewelry`,
      url: window.location.href
    };

    // Log analytics
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'share_click',
          product_id: product.id,
          session_id: sessionStorage.getItem('phileon_session_id') || 'anonymous'
        })
      });
    } catch (error) {
      console.warn('Analytics logging failed:', error);
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Unable to share product link');
      }
    }
  };

  const handleAddToCart = () => {
    if (!soldOut) {
      addToCart(product);
      toast.success('Added to cart!');
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    setRestockSubmitting(true);
    try {
      await publicApi.createInquiry({
        name: restockData.name,
        email: restockData.email,
        inquiry_type: 'restock_notification',
        product_id: product.id,
        message: `Please notify me when ${product.name} is back in stock.`,
      });
      
      toast.success('Thank you! We\'ll notify you when this piece is available again.');
      setRestockOpen(false);
      setRestockData({ name: '', email: '' });
    } catch (error) {
      console.error('Error submitting restock request:', error);
      toast.error('Unable to join restock list. Please try again.');
    } finally {
      setRestockSubmitting(false);
    }
  };

  const nextImage = () => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const isRing = product?.name?.toLowerCase().includes('ring') || 
                 product?.collection_id?.toLowerCase().includes('ring');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-phileon-ivory text-lg">Piece not found</p>
          <Link to="/collections" className="btn-outline mt-6 inline-block">
            Browse Collections
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="min-h-screen pt-24" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
        {/* Back Link */}
        <Link 
          to="/collections" 
          className="inline-flex items-center gap-2 text-phileon-ivory-muted hover:text-phileon-gold transition-colors text-sm mb-10"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
          {/* Large Hero Image with zoom */}
          <div>
            <div 
              className="relative aspect-square bg-phileon-charcoal overflow-hidden cursor-zoom-in group"
              onClick={() => setZoomOpen(true)}
            >
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4 p-2 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={20} />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white hover:bg-black/60 transition-colors"
                    data-testid="prev-image-btn"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white hover:bg-black/60 transition-colors"
                    data-testid="next-image-btn"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-20 h-20 overflow-hidden border transition-colors ${
                      idx === currentImageIndex ? 'border-phileon-gold' : 'border-transparent hover:border-phileon-charcoal'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:py-4">
            <div className="flex items-start justify-between">
              <h1 className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-phileon-ivory">
                {product.name}
              </h1>
              
              {/* Wishlist + Share Actions */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-2 text-phileon-gold hover:bg-phileon-gold/10 rounded-full transition-all duration-200"
                  title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart 
                    className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} 
                  />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-2 text-phileon-gold hover:bg-phileon-gold/10 rounded-full transition-all duration-200"
                  title="Share this product"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="w-12 h-px bg-phileon-gold my-8" />

            {/* Emotional description */}
            <p className="text-phileon-ivory-muted leading-relaxed text-base">
              {product.description}
            </p>

            {/* Materials */}
            {product.materials?.length > 0 && (
              <div className="mt-10">
                <p className="text-xs tracking-[0.2em] uppercase text-phileon-gold mb-4">
                  Materials
                </p>
                <p className="text-phileon-ivory">
                  {product.materials.join(' · ')}
                </p>
              </div>
            )}

            {/* Delivery timeframe */}
            <div className="mt-8">
              <p className="text-xs tracking-[0.2em] uppercase text-phileon-gold mb-4">
                Delivery
              </p>
              <p className="text-phileon-ivory-muted text-sm">
                Handcrafted to order. Please allow 6-8 weeks for creation.
              </p>
            </div>

            {/* Care instructions */}
            <div className="mt-8">
              <p className="text-xs tracking-[0.2em] uppercase text-phileon-gold mb-4">
                Care
              </p>
              <p className="text-phileon-ivory-muted text-sm leading-relaxed">
                Store in the provided pouch. Clean gently with a soft cloth. 
                Avoid contact with perfumes and chemicals. Professional cleaning recommended annually.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-12 space-y-4">
              {/* Inventory Status Badges */}
              <InventoryBadges product={product} />

              {/* Try-On Button Group - Show if ring product */}
              {isRing && (
                <div className="space-y-3">
                  <p className="text-xs tracking-[0.2em] uppercase text-phileon-gold mb-4 text-center flex items-center justify-center gap-2">
                    <Sparkles size={12} />
                    Try Before You Inquire
                    <Sparkles size={12} />
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 3D Try-On */}
                    <button 
                      onClick={() => {
                        setTryOnOpen(true);
                        logTryOnAnalytics('open_3d');
                      }}
                      className={`px-6 py-3 border border-phileon-gold/50 text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/10 flex items-center justify-center gap-2 ${soldOut ? 'ph-disabled' : ''}`}
                      data-testid="try-on-3d-btn"
                      disabled={soldOut}
                    >
                      <Scan size={14} />
                      Try On (3D)
                    </button>
                    
                    {/* Photo Try-On */}
                    <button 
                      onClick={() => {
                        setTryOnOpen(true);
                        logTryOnAnalytics('open_photo');
                      }}
                      className={`px-6 py-3 border border-phileon-gold/50 text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/10 flex items-center justify-center gap-2 ${soldOut ? 'ph-disabled' : ''}`}
                      data-testid="try-on-photo-btn"
                      disabled={soldOut}
                    >
                      <Camera size={14} />
                      Try On (Photo)
                    </button>
                    
                    {/* Live AR Try-On - Mobile Only */}
                    {isMobile && (
                      <button 
                        onClick={() => {
                          setTryOnOpen(true);
                          logTryOnAnalytics('open_ar');
                        }}
                        className={`px-6 py-3 border border-phileon-gold/50 text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/10 flex items-center justify-center gap-2 sm:col-span-2 ${soldOut ? 'ph-disabled' : ''}`}
                        data-testid="try-on-ar-btn"
                        disabled={soldOut}
                      >
                        <Camera size={14} />
                        Try On Live (AR)
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Add to Cart Button */}
              {!soldOut && (
                <button 
                  onClick={handleAddToCart}
                  className="w-full px-8 py-4 border border-phileon-gold text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold hover:text-phileon-black"
                  data-testid="add-to-cart-btn"
                >
                  Add to Cart
                </button>
              )}
              
              {/* Primary CTA */}
              {!soldOut ? (
                <button 
                  onClick={() => setInquiryOpen(true)}
                  className="w-full px-8 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/90"
                  data-testid="inquire-btn"
                >
                  Request This Design
                </button>
              ) : (
                <button 
                  onClick={() => setRestockOpen(true)}
                  className="w-full px-8 py-4 bg-gray-600 text-white text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-gray-500"
                  data-testid="restock-btn"
                >
                  Join Restock List
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="bg-phileon-black border-phileon-charcoal max-w-4xl p-0">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-auto"
          />
        </DialogContent>
      </Dialog>

      {/* Inquiry Modal */}
      <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
        <DialogContent className="bg-phileon-near-black border-phileon-charcoal text-phileon-ivory max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl tracking-wider">
              Request This Design
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInquiry} className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory placeholder:text-phileon-ivory-muted/50"
                data-testid="inquiry-name"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory placeholder:text-phileon-ivory-muted/50"
                data-testid="inquiry-email"
              />
            </div>
            <div>
              <Input
                type="tel"
                placeholder="Phone (Optional)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory placeholder:text-phileon-ivory-muted/50"
                data-testid="inquiry-phone"
              />
            </div>
            <div>
              <Textarea
                placeholder="Tell us about your interest in this piece..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory placeholder:text-phileon-ivory-muted/50 resize-none"
                data-testid="inquiry-message"
              />
            </div>
            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-phileon-gold text-phileon-black hover:bg-phileon-gold/90"
              data-testid="submit-inquiry"
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hybrid Try-On Modal */}
      {tryOnOpen && (
        <TryOnModal 
          isOpen={tryOnOpen}
          onClose={() => setTryOnOpen(false)}
          product={product}
        />
      )}

      {/* Restock Notification Modal */}
      <Dialog open={restockOpen} onOpenChange={setRestockOpen}>
        <DialogContent className="bg-phileon-near-black border-phileon-charcoal text-phileon-ivory max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl tracking-wider">
              Join Restock List
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRestock} className="space-y-4 mt-4">
            <p className="text-phileon-ivory-muted text-sm">
              We&apos;ll notify you as soon as this piece becomes available again.
            </p>
            <div>
              <Input
                placeholder="Your Name"
                value={restockData.name}
                onChange={(e) => setRestockData({ ...restockData, name: e.target.value })}
                required
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory placeholder:text-phileon-ivory-muted/50"
                data-testid="restock-name"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                value={restockData.email}
                onChange={(e) => setRestockData({ ...restockData, email: e.target.value })}
                required
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory placeholder:text-phileon-ivory-muted/50"
                data-testid="restock-email"
              />
            </div>
            <Button 
              type="submit" 
              disabled={restockSubmitting}
              className="w-full bg-phileon-gold text-phileon-black hover:bg-phileon-gold/90"
              data-testid="submit-restock"
            >
              {restockSubmitting ? 'Joining...' : 'Join Restock List'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetailPage;
