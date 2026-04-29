import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ChainsComingSoonPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-24" data-testid="chains-coming-soon-page">
      <div className="max-w-[560px] mx-auto text-center space-y-8">
        {/* Eyebrow */}
        <p className="text-[11px] tracking-[0.4em] text-white/45">
          PHILEON
        </p>

        {/* Title */}
        <h1
          className="font-serif text-4xl md:text-5xl tracking-wide"
          data-testid="chains-coming-soon-title"
        >
          PHILEON CHAINS
        </h1>

        {/* Subtitle */}
        <p className="text-white/70 text-lg italic">
          Built to carry the weight.
        </p>

        <div className="w-12 h-px bg-[#D4AF37]/40 mx-auto my-8" />

        {/* Body */}
        <p className="text-white/65 text-sm md:text-base leading-relaxed max-w-[440px] mx-auto">
          Chains are being prepared as a dedicated category. For now,
          {' '}<span className="text-white/85">DRAPE</span>{' '}
          is sold as pendant only.
        </p>

        {/* CTA */}
        <div className="pt-6">
          <Link
            to="/products/drape"
            data-testid="chains-return-to-drape-btn"
            className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C19B2E] text-black px-8 py-4 text-[12px] tracking-[0.25em] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO DRAPE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
