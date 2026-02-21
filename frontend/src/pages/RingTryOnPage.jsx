import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Info } from 'lucide-react';
import RingTryOn from '@/components/RingTryOn';
import { Button } from '@/components/ui/button';

const RingTryOnPage = () => {
  const [showTryOn, setShowTryOn] = useState(false);

  return (
    <div className="min-h-screen bg-phileon-black" data-testid="ring-tryon-page">
      {/* Header */}
      <section className="pt-32 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/collections" 
            className="inline-flex items-center gap-2 text-phileon-ivory-muted hover:text-phileon-gold transition-colors text-sm tracking-wider mb-8"
          >
            <ArrowLeft size={16} />
            Back to Collections
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="text-phileon-gold" size={24} />
              <h1 className="font-serif text-4xl md:text-5xl tracking-[0.08em] text-phileon-ivory uppercase">
                Virtual Ring Try-On
              </h1>
              <Sparkles className="text-phileon-gold" size={24} />
            </div>
            
            <p className="text-phileon-ivory-muted max-w-2xl mx-auto leading-relaxed">
              Experience our rings before visiting our showroom. Our AR technology uses your camera 
              to place a virtual ring on your finger, helping you envision how each design might look.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24 px-8">
        <div className="max-w-4xl mx-auto">
          {!showTryOn ? (
            <div className="text-center">
              {/* Preview Image */}
              <div className="relative aspect-video bg-phileon-near-black border border-phileon-charcoal mb-10 overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80"
                  alt="Ring preview"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={() => setShowTryOn(true)}
                    className="bg-phileon-gold text-phileon-black px-10 py-6 text-sm tracking-[0.15em] uppercase hover:bg-phileon-gold/90 transition-all hover:scale-105"
                    data-testid="start-tryon-btn"
                  >
                    <Sparkles className="mr-2" size={18} />
                    Start Virtual Try-On
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="bg-phileon-near-black border border-phileon-charcoal p-6">
                  <div className="text-phileon-gold text-2xl font-serif mb-4">01</div>
                  <h3 className="font-serif text-lg text-phileon-ivory tracking-wider mb-2">Allow Camera Access</h3>
                  <p className="text-sm text-phileon-ivory-muted">
                    Grant camera permission when prompted. Your video is processed locally and never stored.
                  </p>
                </div>
                
                <div className="bg-phileon-near-black border border-phileon-charcoal p-6">
                  <div className="text-phileon-gold text-2xl font-serif mb-4">02</div>
                  <h3 className="font-serif text-lg text-phileon-ivory tracking-wider mb-2">Position Your Hand</h3>
                  <p className="text-sm text-phileon-ivory-muted">
                    Hold your hand in front of the camera with fingers spread. The ring will appear on your selected finger.
                  </p>
                </div>
                
                <div className="bg-phileon-near-black border border-phileon-charcoal p-6">
                  <div className="text-phileon-gold text-2xl font-serif mb-4">03</div>
                  <h3 className="font-serif text-lg text-phileon-ivory tracking-wider mb-2">Capture & Share</h3>
                  <p className="text-sm text-phileon-ivory-muted">
                    Take a photo of your virtual try-on to save or share with friends and family.
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-12 flex items-start gap-3 p-4 bg-phileon-charcoal/30 border border-phileon-charcoal text-left">
                <Info className="text-phileon-gold flex-shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-phileon-ivory-muted leading-relaxed">
                  <strong className="text-phileon-ivory">Disclaimer:</strong> This virtual try-on feature provides an 
                  approximate visualization only. Actual ring appearance, size, and fit may vary. For precise sizing 
                  and to experience the true beauty of our pieces, we recommend visiting our showroom or scheduling 
                  a consultation.
                </p>
              </div>
            </div>
          ) : (
            <RingTryOn 
              ringImage={null}
              ringName="Virtual Ring Preview"
              onClose={() => setShowTryOn(false)}
            />
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-phileon-near-black border-t border-phileon-charcoal">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-3xl tracking-[0.08em] text-phileon-ivory mb-6">
            Ready to See It In Person?
          </h2>
          <p className="text-phileon-ivory-muted mb-8">
            Schedule a private consultation to try on our pieces and discuss your perfect ring.
          </p>
          <Link
            to="/contact"
            className="inline-block px-10 py-4 bg-phileon-gold text-phileon-black text-xs tracking-[0.2em] uppercase font-medium hover:bg-phileon-gold/90 transition-all"
          >
            Book a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default RingTryOnPage;
