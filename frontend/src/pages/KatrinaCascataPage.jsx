import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

// Soft sacred luxury — cream + warm gold + sand
const HERO_IMG = "/katrina-cascata/main.jpg";
const HERO_ALT = "KATRINA CASCATA — drop earrings, woven 18K gold cord cascading from bar to open hoop.";

const METAL_TIERS = [
  {
    key: "vermeil",
    label: "Vermeil",
    sku: "KCC-VER",
    price: 495,
    swatch: "linear-gradient(135deg,#f5d99a 0%,#e8c275 45%,#b9913e 100%)",
  },
  {
    key: "gold10kYellow",
    label: "10K Yellow Gold",
    sku: "KCC-10Y",
    price: 2950,
    swatch: "linear-gradient(135deg,#f4d27a 0%,#d6a93a 45%,#a07514 100%)",
  },
];

export default function KatrinaCascataPage() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedTier, setSelectedTier] = useState(METAL_TIERS[0]);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "KATRINA CASCATA — PHILEON · A Tribute";
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroRise = Math.max(0, 48 - scrollY * 0.12);

  const onAddToCart = () => {
    handleAddToCart({
      id: `katrina-cascata-${selectedTier.key}`,
      name: `KATRINA CASCATA — ${selectedTier.label}`,
      price: selectedTier.price,
      productKey: "katrinaCascata",
      tierKey: selectedTier.key,
      metal: selectedTier.label,
      sku: selectedTier.sku,
      quantity: 1,
      image: HERO_IMG,
    }, 1, selectedTier.label);
  };

  return (
    <div className="kcc-page" data-testid="katrina-cascata-page">
      <style>{`
        .kcc-page {
          --bg:#f6f0e7;--bg-deep:#efe7d8;--sand:#e8dcc6;--cream:#fbf6ec;
          --ink:#3b332a;--ink-strong:#1d1813;--ink-muted:#8a7e6c;
          --gold:#b08838;--gold-light:#dcc188;--gold-deep:#8c6a23;
          --rule:rgba(176,136,56,.32);--rule-soft:rgba(176,136,56,.14);
          background: linear-gradient(180deg,var(--cream) 0%,var(--bg) 38%,var(--bg-deep) 100%);
          color:var(--ink);font-family:'Cormorant Garamond',serif;min-height:100vh;overflow-x:hidden;
        }
        .kcc-page .kcc-return {
          display:inline-flex;align-items:center;gap:10px;padding:18px 26px;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-muted);text-decoration:none;text-transform:uppercase;
          transition:color 280ms ease,gap 280ms ease;
        }
        .kcc-page .kcc-return:hover { color:var(--gold-deep);gap:16px; }
        .kcc-page .kcc-eyebrow {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.44em;
          color:var(--gold-deep);text-transform:uppercase;margin:0 0 18px;
        }
        .kcc-page .kcc-h1 {
          font-family:'Playfair Display',serif;font-weight:400;
          font-size:clamp(48px,7vw,96px);line-height:1;letter-spacing:.02em;
          color:var(--ink-strong);margin:0 0 18px;text-transform:uppercase;
        }
        .kcc-page .kcc-tagline {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(20px,2vw,26px);color:var(--gold-deep);margin:0;
        }
        .kcc-page .kcc-section {
          max-width:1180px;margin:0 auto;padding:clamp(72px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0;transform:translateY(24px);animation:kccReveal 1.1s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes kccReveal { to { opacity:1;transform:translateY(0); } }
        .kcc-section.delay-1 { animation-delay:.18s; }
        .kcc-section.delay-2 { animation-delay:.32s; }
        .kcc-section.delay-3 { animation-delay:.46s; }

        /* HERO */
        .kcc-hero {
          position:relative;padding:clamp(40px,6vw,90px) clamp(20px,4vw,60px) clamp(60px,8vw,120px);
          display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(48px,6vw,96px);
          align-items:center;max-width:1320px;margin:0 auto;
        }
        @media (max-width:880px){ .kcc-hero { grid-template-columns:1fr;gap:48px; } }
        .kcc-hero-img-wrap {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:var(--cream);
          border:1px solid var(--rule-soft);box-shadow:0 36px 80px -32px rgba(176,136,56,.35);
        }
        .kcc-hero-img-wrap::before {
          content:'';position:absolute;inset:-40px;
          background:radial-gradient(60% 60% at 50% 50%,rgba(220,193,136,.55) 0%,transparent 70%);
          z-index:0;filter:blur(40px);
        }
        .kcc-hero-img {
          position:relative;z-index:1;width:100%;height:100%;object-fit:cover;display:block;
          animation:kccRise 1.4s cubic-bezier(.22,.61,.36,1) both;
        }
        @keyframes kccRise { from { transform:translateY(48px);opacity:0; } to { transform:translateY(0);opacity:1; } }
        .kcc-hero-copy { position:relative;z-index:1; }
        /* Cascade thread motif behind hero copy */
        .kcc-cascade {
          position:absolute;left:50%;top:0;bottom:0;width:1px;
          background:linear-gradient(180deg,transparent 0%,var(--gold) 12%,var(--gold-light) 50%,var(--gold) 88%,transparent 100%);
          opacity:.18;pointer-events:none;transform:translateX(-50%);
          animation:kccThread 6s ease-in-out infinite;
        }
        @keyframes kccThread {
          0%,100% { transform:translateX(-50%) scaleY(1);opacity:.18; }
          50%     { transform:translateX(-50%) scaleY(1.04);opacity:.28; }
        }

        /* SCRIPTURE */
        .kcc-scripture {
          background:linear-gradient(180deg,var(--bg) 0%,var(--cream) 100%);
          border-top:1px solid var(--rule-soft);border-bottom:1px solid var(--rule-soft);
          text-align:center;
        }
        .kcc-scripture-verse {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(22px,2.6vw,34px);line-height:1.55;color:var(--gold-deep);
          max-width:780px;margin:0 auto 22px;letter-spacing:.005em;
        }
        .kcc-scripture-attr {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-muted);text-transform:uppercase;
        }

        /* STORY */
        .kcc-story-h2 {
          font-family:'Playfair Display',serif;font-weight:400;
          font-size:clamp(38px,4.8vw,64px);line-height:1.04;color:var(--ink-strong);
          margin:0 0 36px;text-transform:uppercase;letter-spacing:.015em;
        }
        .kcc-story-body p {
          font-family:'Cormorant Garamond',serif;font-size:clamp(18px,1.5vw,22px);
          line-height:1.72;color:var(--ink);margin:0 0 22px;max-width:680px;
        }
        .kcc-story-body p em { font-style:italic;color:var(--ink-strong); }

        /* CRAFT */
        .kcc-craft { background:var(--cream); border-top:1px solid var(--rule-soft); }
        .kcc-craft-grid {
          display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(40px,5vw,80px);align-items:start;
        }
        @media (max-width:880px){ .kcc-craft-grid { grid-template-columns:1fr;gap:36px; } }
        .kcc-craft-img-wrap {
          aspect-ratio:4/5;overflow:hidden;background:var(--bg-deep);border:1px solid var(--rule-soft);
        }
        .kcc-craft-img { width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .kcc-craft-img-wrap:hover .kcc-craft-img { transform:scale(1.03); }
        .kcc-craft-list { list-style:none;padding:0;margin:24px 0 0; }
        .kcc-craft-list li {
          display:grid;grid-template-columns:140px 1fr;gap:18px;padding:14px 0;
          border-bottom:1px solid var(--rule-soft);
        }
        .kcc-craft-list dt {
          font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.36em;
          color:var(--gold-deep);text-transform:uppercase;padding-top:2px;
        }
        .kcc-craft-list dd { margin:0;font-size:17px;line-height:1.5;color:var(--ink); }

        /* ARCHIVE GALLERY */
        .kcc-archive { background: linear-gradient(180deg,var(--bg-deep) 0%,var(--cream) 100%); }
        .kcc-archive-grid {
          display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,1.8vw,24px);margin-top:36px;
        }
        .kcc-archive-cell {
          position:relative;aspect-ratio:1/1;overflow:hidden;background:var(--cream);
          border:1px solid var(--rule-soft);
        }
        .kcc-archive-cell.full { grid-column:1 / -1;aspect-ratio:16/10; }
        .kcc-archive-cell img {
          width:100%;height:100%;object-fit:cover;display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1);
        }
        .kcc-archive-cell:hover img { transform:scale(1.02); }
        @media (max-width:640px){ .kcc-archive-grid{ grid-template-columns:1fr; }
          .kcc-archive-cell.full{ aspect-ratio:4/5; } }

        /* CTA / ADD TO CART */
        .kcc-cta { text-align:center; }
        .kcc-cta-line {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(22px,2.4vw,32px);color:var(--gold-deep);
          margin:0 auto 36px;max-width:640px;line-height:1.5;
        }
        .kcc-price-display {
          font-family:'Cinzel',serif;font-size:18px;letter-spacing:.32em;
          color:var(--ink-strong);margin:0 0 8px;
        }
        .kcc-price-note {
          font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14px;
          color:var(--ink-muted);margin:0 0 36px;
        }
        .kcc-add-btn {
          display:inline-flex;align-items:center;justify-content:center;gap:12px;
          padding:18px 56px;border:1.5px solid var(--gold);background:transparent;
          font-family:'Cinzel',serif;font-size:12px;letter-spacing:.42em;
          color:var(--gold-deep);text-transform:uppercase;cursor:pointer;
          transition:background 380ms ease,color 380ms ease,border-color 380ms ease,transform 280ms ease;
        }
        .kcc-add-btn:hover { background:var(--gold);color:var(--cream);transform:translateY(-2px); }
        .kcc-add-btn:disabled { opacity:.6;cursor:wait; }
        /* CONFIGURATOR — 2 metal tiers */
        .kcc-tiers { display:flex;justify-content:center;gap:14px;margin:0 auto 24px;flex-wrap:wrap; }
        .kcc-tier-btn {
          display:inline-flex;align-items:center;gap:12px;padding:14px 26px;
          background:transparent;border:1px solid var(--rule);cursor:pointer;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.36em;
          color:var(--ink);text-transform:uppercase;
          transition:all 320ms cubic-bezier(.22,.61,.36,1);
        }
        .kcc-tier-btn:hover { border-color:var(--gold);color:var(--gold-deep); }
        .kcc-tier-btn[aria-pressed="true"] {
          background:var(--cream);border-color:var(--gold);color:var(--gold-deep);
          box-shadow:0 8px 24px -12px rgba(176,136,56,.4);
        }
        .kcc-tier-swatch {
          width:14px;height:14px;border-radius:50%;
          box-shadow:0 0 0 1px rgba(0,0,0,.06) inset,0 1px 2px rgba(0,0,0,.12);
        }
        .kcc-tier-price-line {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.32em;
          color:var(--ink-muted);text-transform:uppercase;margin:0 0 8px;
        }
        /* CUSTOM ATELIER */
        .kcc-atelier { background:var(--cream);border-top:1px solid var(--rule-soft); text-align:center; }
        .kcc-atelier-body {
          font-family:'Cormorant Garamond',serif;font-size:clamp(17px,1.4vw,21px);
          line-height:1.66;color:var(--ink);max-width:680px;margin:0 auto 16px;
        }
        .kcc-atelier-body em { font-style:italic;color:var(--ink-strong); }
        .kcc-atelier-list {
          list-style:none;padding:0;margin:20px auto 28px;display:inline-flex;flex-direction:column;
          font-family:'Playfair Display',serif;font-size:18px;color:var(--ink-strong);text-align:left;
        }
        .kcc-atelier-list li { padding:6px 0;letter-spacing:.01em; }
        .kcc-atelier-list li::before { content:'·';color:var(--gold);margin-right:14px; }
        .kcc-atelier-cta {
          display:inline-flex;align-items:center;gap:12px;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--gold-deep);text-transform:uppercase;text-decoration:none;
          padding:14px 32px;border:1px solid var(--gold);
          transition:background 320ms ease,color 320ms ease,gap 320ms ease;
        }
        .kcc-atelier-cta:hover { background:var(--gold);color:var(--cream);gap:18px; }

        /* FINAL WORD */
        .kcc-final {
          text-align:center;padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px);
          background:var(--cream);border-top:1px solid var(--rule);
        }
        .kcc-final-line {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(24px,2.8vw,38px);line-height:1.5;color:var(--gold-deep);
          max-width:720px;margin:0 auto;
        }

        @media (prefers-reduced-motion: reduce){
          .kcc-section,.kcc-hero-img,.kcc-cascade { animation:none !important;transform:none !important;opacity:1 !important; }
          .kcc-archive-cell:hover img,.kcc-craft-img-wrap:hover .kcc-craft-img { transform:none; }
        }
      `}</style>

      {/* RETURN */}
      <Link to="/shop" className="kcc-return" data-testid="kcc-return">
        <ArrowLeft size={14} /> RETURN
      </Link>

      {/* HERO */}
      <section className="kcc-hero" data-testid="kcc-hero" style={{ transform: `translateY(${heroRise * 0.05}px)` }}>
        <div className="kcc-hero-img-wrap">
          <img src={HERO_IMG} alt={HERO_ALT} className="kcc-hero-img" data-testid="kcc-hero-img" />
        </div>
        <div className="kcc-hero-copy">
          <span className="kcc-cascade" aria-hidden="true" />
          <p className="kcc-eyebrow" data-testid="kcc-eyebrow">PHILEON — Tribute</p>
          <h1 className="kcc-h1" data-testid="kcc-title">Katrina Cascata</h1>
          <p className="kcc-tagline" data-testid="kcc-tagline">Living water, woven in gold.</p>
        </div>
      </section>

      {/* SCRIPTURE */}
      <section className="kcc-section kcc-scripture delay-1" data-testid="kcc-scripture">
        <p className="kcc-scripture-verse">
          “Out of his heart will flow rivers of living water.”
        </p>
        <p className="kcc-scripture-attr">— John 7:38</p>
      </section>

      {/* STORY */}
      <section className="kcc-section delay-2" data-testid="kcc-story">
        <p className="kcc-eyebrow">THE TRIBUTE</p>
        <h2 className="kcc-story-h2">For Katrina</h2>
        <div className="kcc-story-body">
          <p>Grace doesn't sit still in the people who carry it. It moves — through a word said at the right time, a hand on a shoulder, a prayer offered in someone else's name before they even asked for it. That's the kind of sister Katrina is.</p>
          <p>Katrina Cascata takes its name and its shape from that same overflow. A single cord of gold, wound and woven like rope, never broken — falling from the bar at the top to the open hoop below in one unbroken line. It doesn't sit flat. It moves downward and outward, caught mid-fall, the way grace moves through someone who has more of it than she needs for herself.</p>
          <p><em>Named for the sister by marriage who became a sister in Christ — and never once just received a blessing without pouring it forward.</em></p>
        </div>
      </section>

      {/* CRAFT */}
      <section className="kcc-section kcc-craft delay-3" data-testid="kcc-craft">
        <div className="kcc-craft-grid">
          <div className="kcc-craft-img-wrap">
            <img src="/katrina-cascata/detail-3.jpg" alt="KATRINA CASCATA — macro of the woven 18K gold cord, coiled rope detail." className="kcc-craft-img" loading="lazy" />
          </div>
          <div>
            <p className="kcc-eyebrow">THE CRAFT</p>
            <h2 className="kcc-story-h2">Hand-wound. Unbroken.</h2>
            <dl className="kcc-craft-list">
              <li><dt>Metal</dt><dd>Vermeil &nbsp;·&nbsp; 10K Yellow Gold</dd></li>
              <li><dt>Construction</dt><dd>Hand-wound sculptural woven design — coiled cord, bar-to-hoop drop</dd></li>
              <li><dt>Closure</dt><dd>Post with secure butterfly back</dd></li>
              <li><dt>Dimensions</dt><dd>28.5 mm H · 16.8 mm W &nbsp;<span style={{ color: 'var(--ink-muted)' }}>(1.12" × 0.66")</span></dd></li>
              <li><dt>Fit</dt><dd>Lightweight for everyday wear · sold as a pair</dd></li>
            </dl>
          </div>
        </div>
      </section>

      {/* ARCHIVE */}
      <section className="kcc-section kcc-archive" data-testid="kcc-archive">
        <p className="kcc-eyebrow" style={{ textAlign: 'center' }}>THE ARCHIVE</p>
        <h2 className="kcc-story-h2" style={{ textAlign: 'center' }}>Caught mid-fall.</h2>
        <div className="kcc-archive-grid">
          <div className="kcc-archive-cell full" data-testid="kcc-archive-cell-lifestyle-1">
            <img src="/katrina-cascata/lifestyle-1.jpg" alt="KATRINA CASCATA — worn through laughter in a softly-lit lounge, the woven gold drop catching warm light." loading="lazy" />
          </div>
          <div className="kcc-archive-cell" data-testid="kcc-archive-cell-lifestyle-2">
            <img src="/katrina-cascata/lifestyle-2.jpg" alt="KATRINA CASCATA — worn on the grand staircase, woven gold drop against the wrought-iron banister." loading="lazy" />
          </div>
          <div className="kcc-archive-cell" data-testid="kcc-archive-cell-2">
            <img src="/katrina-cascata/detail-2.jpg" alt="KATRINA CASCATA — pair presented in a black velvet jewellery case." loading="lazy" />
          </div>
          <div className="kcc-archive-cell full" data-testid="kcc-archive-cell-1">
            <img src="/katrina-cascata/detail-1.jpg" alt="KATRINA CASCATA — angled studio macro of both earrings, woven gold bar dropping into open hoop." loading="lazy" />
          </div>
          <div className="kcc-archive-cell" data-testid="kcc-archive-cell-3">
            <img src="/katrina-cascata/detail-4.jpg" alt="KATRINA CASCATA — close-up of the open coiled-wreath hoop." loading="lazy" />
          </div>
          <div className="kcc-archive-cell" data-testid="kcc-archive-cell-4">
            <img src="/katrina-cascata/detail-3.jpg" alt="KATRINA CASCATA — macro of the woven 18K gold cord, coiled rope detail." loading="lazy" />
          </div>
        </div>
      </section>

      {/* CTA — Configurator + ADD TO CART */}
      <section className="kcc-section kcc-cta" data-testid="kcc-cta">
        <p className="kcc-cta-line">Some grace overflows.<br /><em>This one's gold.</em></p>

        <p className="kcc-tier-price-line">Choose your metal</p>
        <div className="kcc-tiers" role="radiogroup" aria-label="Choose metal" data-testid="kcc-tiers">
          {METAL_TIERS.map((tier) => (
            <button
              key={tier.key}
              type="button"
              role="radio"
              aria-pressed={selectedTier.key === tier.key}
              aria-checked={selectedTier.key === tier.key}
              onClick={() => setSelectedTier(tier)}
              className="kcc-tier-btn"
              data-testid={`kcc-tier-${tier.key}`}
            >
              <span className="kcc-tier-swatch" aria-hidden="true" style={{ background: tier.swatch }} />
              <span>{tier.label} · ${tier.price.toLocaleString()}</span>
            </button>
          ))}
        </div>

        <p
          className="kcc-price-display"
          data-testid="kcc-price"
          style={{ marginTop: 24, marginBottom: 8 }}
        >
          ${selectedTier.price.toLocaleString()} USD
        </p>
        <p className="kcc-price-note">{selectedTier.label} · Sold as a pair</p>
        <button
          onClick={onAddToCart}
          disabled={isAdding}
          className="kcc-add-btn"
          data-testid="kcc-add-to-cart"
          aria-label={`Add Katrina Cascata earrings in ${selectedTier.label} to cart`}
        >
          {buttonText || "ADD TO CART"}
        </button>
      </section>

      {/* CUSTOM ATELIER — Bespoke availability */}
      <section className="kcc-section kcc-atelier" data-testid="kcc-atelier">
        <p className="kcc-eyebrow">PHILEON — Custom Atelier</p>
        <h2 className="kcc-story-h2">Made by request.</h2>
        <p className="kcc-atelier-body">
          Katrina Cascata is intentionally offered in only two standard editions:
        </p>
        <ul className="kcc-atelier-list">
          <li>Vermeil</li>
          <li>10K Yellow Gold</li>
        </ul>
        <p className="kcc-atelier-body">
          Interested in <em>White Gold</em>, <em>Rose Gold</em>, <em>14K</em>, <em>18K</em>, or <em>Platinum</em>?
        </p>
        <p className="kcc-atelier-body" style={{ marginBottom: 32 }}>
          Every Katrina Cascata can be handcrafted through the <em>PHILEON Custom Atelier</em> by special request.
        </p>
        <Link
          to="/contact?subject=Katrina%20Cascata%20Custom%20Atelier"
          className="kcc-atelier-cta"
          data-testid="kcc-atelier-cta"
        >
          REQUEST A BESPOKE PAIR <span aria-hidden="true">→</span>
        </Link>
      </section>

      {/* FINAL WORD */}
      <section className="kcc-final" data-testid="kcc-final-word">
        <p className="kcc-final-line">
          A single cord. <em>An unbroken line.</em><br />
          The shape of grace that doesn't sit still.
        </p>
      </section>
    </div>
  );
}
