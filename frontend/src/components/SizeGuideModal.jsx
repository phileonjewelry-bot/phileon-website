import { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZE_DIAGRAM =
  'https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/l43g78jv_1000147430.png';
// Placeholder — swap with /images/phileon-size-diagram.jpg once uploaded

export function SizeGuideContent({ showLogo = true }) {
  return (
    <div className="space-y-10">
      {showLogo && (
        <div className="text-center">
          <p
            className="text-[11px] tracking-[0.4em]"
            style={{ color: 'rgba(60, 44, 31, 0.55)' }}
          >
            PHILEON
          </p>
          <h2
            className="font-serif text-2xl md:text-3xl tracking-wide mt-3"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#2c1f14',
            }}
          >
            RING SIZE GUIDE
          </h2>
        </div>
      )}

      {/* Diagram image */}
      <div className="w-full flex justify-center">
        <img
          src={SIZE_DIAGRAM}
          alt="Phileon ring size diagram"
          className="max-h-[180px] md:max-h-[220px] w-auto object-contain opacity-90"
          loading="lazy"
        />
      </div>

      {/* Size Ranges */}
      <div>
        <p
          className="text-[10px] tracking-[0.3em] mb-3 font-medium"
          style={{ color: 'rgba(60, 44, 31, 0.6)' }}
        >
          SIZE RANGES
        </p>
        <div className="space-y-1.5 text-sm leading-relaxed" style={{ color: '#3c2c1f' }}>
          <p>Ladies — Sizes 4–9 (half sizes)</p>
          <p>Gents — Sizes 6–12 (half sizes)</p>
          <p>Custom — Available on request</p>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <p
          className="text-[10px] tracking-[0.3em] mb-3 font-medium"
          style={{ color: 'rgba(60, 44, 31, 0.6)' }}
        >
          HOW TO MEASURE
        </p>
        <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#3c2c1f' }}>
          <p>
            Measure your finger at the end of the day.
            <br />
            Avoid measuring when hands are cold or warm.
          </p>
          <p>
            Wrap a strip of paper or ribbon around the base of your finger.
            <br />
            Mark where the ends meet.
          </p>
          <p>
            Measure the length in millimeters.
            <br />
            Match this measurement to your size.
          </p>
          <p>
            If between sizes, choose the larger.
            <br />
            Wider rings should be worn slightly looser for comfort.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SizeGuideModal({ open, onClose }) {
  // Body scroll lock + Escape key
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
      data-testid="size-guide-modal"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.58)' }}
      />

      {/* Panel */}
      <div
        className={`
          relative z-10 w-full md:max-w-[520px] md:w-[520px]
          max-h-[90vh] md:max-h-[85vh]
          overflow-y-auto
          md:rounded-[10px]
          shadow-2xl
          animate-[sizeGuideIn_280ms_ease-out]
        `}
        style={{
          backgroundColor: '#f3ebdf',
          color: '#3c2c1f',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          data-testid="size-guide-close-btn"
          className="absolute top-4 right-4 md:top-5 md:right-5 p-2 rounded-full hover:bg-black/5 transition-colors z-20"
          style={{ color: '#3c2c1f' }}
          aria-label="Close size guide"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <div className="px-6 md:px-10 pt-10 md:pt-12 pb-12 md:pb-14">
          <SizeGuideContent />
        </div>
      </div>

      {/* Enter animation */}
      <style>{`
        @keyframes sizeGuideIn {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
