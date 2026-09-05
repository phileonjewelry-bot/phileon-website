import { useEffect } from 'react';
import { X } from 'lucide-react';

// Dedicated step images (generated to match the luxury warm-neutral aesthetic)
const STEP_WRAP_IMG = "/images/ring-size-wrap.jpg";
const STEP_MEASURE_IMG = "/images/ring-size-measure.jpg";

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

      {/* OPENING NOTE */}
      <p
        className="text-center text-sm mb-10 max-w-[420px] mx-auto leading-relaxed"
        style={{ color: '#3c2c1f' }}
      >
        The most accurate method is to have your finger measured at a local jeweller.
        <br />
        For at-home sizing, follow the steps below.
      </p>

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
          Wrap a strip of paper or measuring tape around the base of your finger.
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
          Measure the length in millimetres.
          <br />
          Compare your measurement to the chart below.
        </p>
      </div>

      {/* METHOD B — MEASURE AN EXISTING RING */}
      <div className="mb-12 text-center">
        <p
          className="text-[11px] tracking-[0.3em] mb-5"
          style={{ color: 'rgba(60, 44, 31, 0.7)' }}
        >
          ALTERNATE METHOD · MEASURE AN EXISTING RING
        </p>
        <p
          className="text-sm leading-relaxed max-w-[360px] mx-auto"
          style={{ color: '#3c2c1f' }}
        >
          Take a ring that already fits the intended finger. Measure the
          <em> inside diameter</em> in millimetres — edge to edge, across
          the widest point. Compare that measurement against the chart below.
        </p>
      </div>

      {/* PHILEON GLOBAL SIZING CHART — US · EU · UK · Inside Diameter */}
      <div
        className="pt-8 pb-2"
        style={{ borderTop: '1px solid rgba(60, 44, 31, 0.18)' }}
      >
        <p
          className="text-center text-[11px] tracking-[0.3em] mb-6"
          style={{ color: 'rgba(60, 44, 31, 0.7)' }}
        >
          PHILEON GLOBAL SIZING CHART
        </p>
        <div className="max-w-[440px] mx-auto" data-testid="ring-size-chart">
          <div
            className="grid grid-cols-4 text-[10px] tracking-[0.18em] uppercase pb-3 mb-2"
            style={{ color: 'rgba(60, 44, 31, 0.6)', borderBottom: '1px solid rgba(60, 44, 31, 0.18)' }}
          >
            <span>US</span>
            <span className="text-center">EU</span>
            <span className="text-center">UK</span>
            <span className="text-right">Ø mm</span>
          </div>
          {[
            ['5',  '49',   'J½', '15.7'],
            ['6',  '51¾',  'L½', '16.5'],
            ['7',  '54½',  'N½', '17.3'],
            ['8',  '57',   'P½', '18.1'],
            ['9',  '59½',  'R½', '18.9'],
            ['10', '62¼',  'T½', '19.8'],
            ['11', '64¾',  'V½', '20.6'],
            ['12', '67½',  'X½', '21.4'],
            ['13', '70',   'Z+1','22.2'],
          ].map(([us, eu, uk, mm]) => (
            <div
              key={us}
              className="grid grid-cols-4 text-sm py-2"
              style={{ color: '#3c2c1f', borderBottom: '1px solid rgba(60, 44, 31, 0.08)' }}
              data-testid={`ring-size-row-${us}`}
            >
              <span>{us}</span>
              <span className="text-center" style={{ fontVariantNumeric: 'tabular-nums' }}>{eu}</span>
              <span className="text-center">{uk}</span>
              <span className="text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{mm}</span>
            </div>
          ))}
        </div>
        <p
          className="text-xs italic mt-4 text-center max-w-[420px] mx-auto"
          style={{ color: 'rgba(60, 44, 31, 0.65)' }}
        >
          US sizing is PHILEON's primary reference. EU and UK equivalents are provided as a directional guide.
        </p>
      </div>

      {/* BEFORE YOU ORDER */}
      <div className="mt-12">
        <p
          className="text-center text-[11px] tracking-[0.3em] mb-5"
          style={{ color: 'rgba(60, 44, 31, 0.7)' }}
        >
          BEFORE YOU ORDER
        </p>
        <ul
          className="text-sm leading-relaxed max-w-[420px] mx-auto space-y-2"
          style={{ color: '#3c2c1f' }}
        >
          <li>Measure at the end of the day when fingers are at their largest.</li>
          <li>Finger size can vary with temperature and time of day — avoid measuring when your hands are unusually cold, warm, or immediately after exercise.</li>
          <li>Wider bands typically fit tighter than narrow bands.</li>
          <li>If you are between sizes, choose the larger size.</li>
          <li>Custom-sized pieces may not be eligible for return or exchange.</li>
        </ul>
      </div>

      {/* NEED HELP */}
      <div className="mt-10 text-center">
        <p
          className="text-[11px] tracking-[0.3em] mb-3"
          style={{ color: 'rgba(60, 44, 31, 0.7)' }}
        >
          NEED HELP?
        </p>
        <p
          className="text-sm leading-relaxed max-w-[420px] mx-auto"
          style={{ color: '#3c2c1f' }}
        >
          If you&apos;re unsure of your size, email our team before ordering — we&apos;re here to help.
        </p>
        <p
          className="text-sm italic leading-relaxed max-w-[420px] mx-auto mt-4"
          style={{ color: 'rgba(60, 44, 31, 0.78)' }}
        >
          A properly fitted ring should slide over the knuckle with slight resistance and sit comfortably without spinning excessively.
        </p>
      </div>

      {/* SIGN-OFF */}
      <div
        className="mt-12 pt-8 text-center"
        style={{ borderTop: '1px solid rgba(60, 44, 31, 0.18)' }}
      >
        <p
          className="text-[10px] tracking-[0.4em] mb-1"
          style={{ color: 'rgba(60, 44, 31, 0.7)' }}
        >
          PHILEON
        </p>
        <p
          className="text-xs italic"
          style={{ color: 'rgba(60, 44, 31, 0.7)' }}
        >
          Not Jewelry. Identity.
        </p>
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
