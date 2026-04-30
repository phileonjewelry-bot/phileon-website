import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SizeGuideContent } from '@/components/SizeGuideModal';

export default function SizeGuidePage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#f3ebdf', color: '#3c2c1f' }}
      data-testid="size-guide-page"
    >
      {/* Back link */}
      <Link
        to="/shop"
        className="fixed top-20 left-6 z-20 flex items-center gap-2 text-[11px] tracking-[0.3em] transition-colors"
        style={{ color: 'rgba(60, 44, 31, 0.55)' }}
        data-testid="size-guide-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK</span>
      </Link>

      <section className="max-w-[640px] mx-auto px-6 md:px-8 py-24 md:py-32">
        <SizeGuideContent />
      </section>
    </div>
  );
}
