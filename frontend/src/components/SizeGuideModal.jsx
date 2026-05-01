import { useEffect } from 'react';
import { X } from 'lucide-react';

// Single user-provided reference photo — used for both Step 1 and Step 2
// until dedicated ring-size-wrap.jpg and ring-size-measure.jpg are uploaded.
const SIZE_PHOTO =
  'https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/18v679um_1000148270.png';

const STEP_WRAP_IMG = SIZE_PHOTO;
const STEP_MEASURE_IMG = SIZE_PHOTO;

export function SizeGuideContent({ showLogo = true }) {
  return (
    <div>
      {/* Title */}
      {showLogo && (
        <div className="text-center mb-10 md:mb-12">
          <p
            className="text-[10px] tracking-[0.4em] mb-2"
            style={{ color: 'rgba(60, 44, 31, 0.7)' }}
          >
            PHILEON
          </p>
          <h1
            className="font-serif text-2xl md:text-3xl tracking-wide"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#2c1f14',
            }}
          >
            RING SIZE GUIDE
          </h1>
        </div>
      )}

      {/* STEP 1 */}
      <div className="mb-12 text-center">
        <p
          className="text-[11px] tracking-[0.3em] mb-5"
          style={{ color: 'rgba(60, 44, 31, 0.7)' }}
        >
          STEP 1
        </p>
        <img
          src={STEP_WRAP_IMG}
          alt="Wrap paper around the base of your finger"
          className="w-full max-w-[320px] mx-auto mb-6 rounded-sm"
          loading="lazy"
          data-testid="size-guide-step1-img"
        />
        <p
          className="text-sm leading-relaxed max-w-[360px] mx-auto"
          style={{ color: '#3c2c1f' }}
        >
          Wrap a strip of paper or ribbon around the base of your finger.
          <br />
          Mark where the ends meet.
        </p>
      </div>

      {/* STEP 2 */}
      <div className="mb-12 text-center">
        <p
          className="text-[11px] tracking-[0.3em] mb-5"
          style={{ color: 'rgba(60, 44, 31, 0.7)' }}
        >
          STEP 2
        </p>
        <img
          src={STEP_MEASURE_IMG}
          alt="Measure the strip in millimeters"
          className="w-full max-w-[320px] mx-auto mb-6 rounded-sm"
          loading="lazy"
          data-testid="size-guide-step2-img"
        />
        <p
          className="text-sm leading-relaxed max-w-[360px] mx-auto"
          style={{ color: '#3c2c1f' }}
        >
          Measure the length in millimeters.
          <br />
          Match this measurement to your size.
        </p>
      </div>

      {/* Size Ranges */}
      <div
        className="text-center pt-8 space-y-3"
        style={{ borderTop: '1px solid rgba(60, 44, 31, 0.18)' }}
      >
        <p className="text-sm" style={{ color: '#3c2c1f' }}>
          Ladies — Sizes 4–9 (half sizes)
        </p>
        <p className="text-sm" style={{ color: '#3c2c1f' }}>
          Gents — Sizes 6–12 (half sizes)
        </p>
        <p className="text-sm" style={{ color: '#3c2c1f' }}>
          Custom — Available on request
        </p>
      </div>

      {/* Notes */}
      <div
        className="mt-10 text-center text-xs leading-relaxed space-y-1.5"
        style={{ color: 'rgba(60, 44, 31, 0.7)' }}
      >
        <p>Measure your finger at the end of the day.</p>
        <p>Avoid measuring when hands are cold or warm.</p>
        <p>If between sizes, choose the larger.</p>
        <p>Wider rings should be worn slightly looser for comfort.</p>
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
          relative z-10 w-full md:max-w-[560px] md:w-[560px]
          max-h-[92vh] md:max-h-[88vh]
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
