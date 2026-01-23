import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
      toast.success('Inquiry sent successfully! We\'ll be in touch soon.');
      setInquiryOpen(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Failed to send inquiry. Please try again.');
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
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Back Link */}
        <Link 
          to="/collections" 
          className="inline-flex items-center gap-2 text-phileon-ivory-muted hover:text-phileon-gold transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} /> Back to Collections
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-phileon-charcoal overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white hover:bg-black/70 transition-colors"
                    data-testid="prev-image-btn"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white hover:bg-black/70 transition-colors"
                    data-testid="next-image-btn"
                  >
                    <ChevronRight size={24} />
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
                    className={`w-20 h-20 overflow-hidden border-2 transition-colors ${
                      idx === currentImageIndex ? 'border-phileon-gold' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:py-8">
            <p className="text-phileon-gold text-xs tracking-[0.3em] uppercase mb-4">
              {product.availability === 'available' && 'Available Now'}
              {product.availability === 'made_to_order' && 'Made to Order'}
              {product.availability === 'inquiry_only' && 'By Inquiry'}
            </p>
            
            <h1 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-phileon-ivory">
              {product.name}
            </h1>
            
            {product.price_range && (
              <p className="text-phileon-gold text-xl mt-4">{product.price_range}</p>
            )}

            <div className="luxury-line-left my-8" />

            <p className="text-phileon-ivory-muted leading-relaxed">
              {product.description}
            </p>

            {/* Materials */}
            {product.materials?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs tracking-[0.2em] uppercase text-phileon-ivory-muted mb-3">
                  Materials
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material, idx) => (
                    <span 
                      key={idx}
                      className="px-4 py-2 bg-phileon-charcoal text-phileon-ivory text-sm"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            {product.details && Object.keys(product.details).length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs tracking-[0.2em] uppercase text-phileon-ivory-muted mb-3">
                  Details
                </h3>
                <div className="space-y-2">
                  {Object.entries(product.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-phileon-ivory-muted capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-phileon-ivory">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="mt-12 space-y-4">
              <button 
                onClick={() => setInquiryOpen(true)}
                className="btn-primary w-full"
                data-testid="inquire-btn"
              >
                Inquire About This Piece
              </button>
              <Link 
                to="/contact" 
                className="btn-outline w-full block text-center"
                data-testid="consultation-btn"
              >
                Book a Consultation
              </Link>
            </div>

            {/* Note */}
            <p className="mt-8 text-xs text-phileon-ivory-muted text-center">
              Each piece is handcrafted. Customization options available upon request.
            </p>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
        <DialogContent className="bg-phileon-near-black border-phileon-charcoal text-phileon-ivory max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl tracking-wider">
              Inquire About {product.name}
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
                placeholder="Your message or questions about this piece..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={4}
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory placeholder:text-phileon-ivory-muted/50 resize-none"
                data-testid="inquiry-message"
              />
            </div>
            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full btn-primary"
              data-testid="submit-inquiry"
            >
              {submitting ? 'Sending...' : 'Send Inquiry'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetailPage;
