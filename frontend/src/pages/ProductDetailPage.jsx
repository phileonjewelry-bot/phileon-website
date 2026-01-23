import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, ZoomIn } from 'lucide-react';
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
import RingTryOn from '@/components/RingTryOn';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

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
            <h1 className="font-serif text-3xl md:text-4xl tracking-[0.08em] text-phileon-ivory">
              {product.name}
            </h1>

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
              {/* Ring Try-On - optional */}
              {isRing && (
                <button 
                  onClick={() => setTryOnOpen(true)}
                  className="w-full px-8 py-4 border border-phileon-gold text-phileon-gold text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold hover:text-phileon-black flex items-center justify-center gap-3"
                  data-testid="try-on-btn"
                >
                  <Sparkles size={16} />
                  Virtual Try-On
                </button>
              )}
              
              {/* Primary CTA - Request This Design */}
              <button 
                onClick={() => setInquiryOpen(true)}
                className="w-full px-8 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-phileon-gold/90"
                data-testid="inquire-btn"
              >
                Request This Design
              </button>
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

      {/* Ring Try-On Modal with disclaimer */}
      {tryOnOpen && (
        <RingTryOn 
          ringImage={images[currentImageIndex]}
          ringName={product.name}
          onClose={() => setTryOnOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
