import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO_IMG = "/lady-boss-knot/hero.jpg";
const HERO_ALT = "LADY BOSS KNOT — gold woven tie pendant on Cuban-link chain, worn over black tuxedo and fedora.";

const PRICE_MATRIX = { silver: 3200, gold10k_yellow: 8500, gold10k_white: 8500 };
const METAL_CHOICES = [
  { id: "silver",         label: "Sterling Silver",  sub: "925 · Solid Cast",      price: 3200, swatch: "is-silver" },
  { id: "gold10k_yellow", label: "10K Yellow Gold",  sub: "Solid · Hand-Finished", price: 8500, swatch: "is-yellow" },
  { id: "gold10k_white",  label: "10K White Gold",   sub: "Solid · High Polish",   price: 8500, swatch: "is-white-gold" },
];
const LABEL_FOR = { silver: "Sterling Silver", gold10k_yellow: "10K Yellow Gold", gold10k_white: "10K White Gold" };
const SHORT_FOR = { silver: "SLV", gold10k_yellow: "10Y", gold10k_white: "10W" };
const formatUsd = (n) => `$${n.toLocaleString("en-US")} USD`;

export default function LadyBossKnotPage() {
  const [scrollY, setScrollY] = useState(0);
  const [metalChoice, setMetalChoice] = useState("gold10k_yellow");
  const [hasUserSelected, setHasUserSelected] = useState(false);
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "LADY BOSS KNOT — PHILEON · The Collective";
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const tierKey = metalChoice;
  const priceUsd = PRICE_MATRIX[metalChoice];
  const heroParallax = Math.min(scrollY * 0.18, 120);
  const metalLabel = LABEL_FOR[metalChoice];
  const pickMetal = (id) => { setMetalChoice(id); setHasUserSelected(true); };
  const isSilverTone = metalChoice === "silver" || metalChoice === "gold10k_white";
  const dotClass = metalChoice === "gold10k_yellow" ? "is-yellow"
    : metalChoice === "gold10k_white" ? "is-white-gold"
    : metalChoice === "silver" ? "is-silver" : "is-rose";

  const onAddToCart = () => {
    handleAddToCart({
      id: `lady-boss-knot-${tierKey}`, name: `LADY BOSS KNOT — ${LABEL_FOR[tierKey]}`,
      price: priceUsd, productKey: "ladyBossKnot", tierKey, metal: LABEL_FOR[tierKey],
      sku: `LBK-${SHORT_FOR[tierKey]}`, quantity: 1, image: HERO_IMG,
    }, 1, LABEL_FOR[tierKey]);
  };

  return (
    <div className="lbk-page" data-testid="lady-boss-knot-page">
      <style>{`
        .lbk-page { --bg:#050505;--bg-deep:#020202;--ink:#e8e3d8;--ink-strong:#faf2eb;--ink-muted:#8a8378;
          --gold:#d4af37;--gold-light:#f0d98c;--gold-dim:#8a7027;--rule:rgba(212,175,55,.22);--rule-soft:rgba(212,175,55,.08);
          background:var(--bg);color:var(--ink);font-family:'Cormorant Garamond',serif;min-height:100vh; }
        .lbk-return { font-family:'Cinzel',serif;font-size:11px;letter-spacing:.35em;color:var(--ink-muted);
          text-decoration:none;display:inline-flex;align-items:center;gap:10px;padding:28px 0 14px 60px;transition:color 220ms; }
        .lbk-return:hover { color:var(--gold); }
        @media (max-width:720px){ .lbk-return{padding:24px 0 12px 20px;} }
        .lbk-section { max-width:1180px;margin:0 auto;padding:clamp(56px,8vw,112px) clamp(20px,4vw,60px); }
        .lbk-eyebrow { font-family:'Cinzel',serif;font-size:11px;letter-spacing:.45em;color:var(--gold);text-transform:uppercase;margin:0 0 22px; }
        .lbk-h2 { font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(34px,4.4vw,56px);line-height:1.08;letter-spacing:-.01em;color:var(--ink-strong);margin:0 0 28px; }
        .lbk-p { font-size:clamp(17px,1.45vw,21px);line-height:1.62;color:var(--ink);margin:0 0 18px; }
        .lbk-p em { font-style:italic;color:var(--ink-strong); }
        .lbk-divider { width:64px;height:1px;background:var(--rule);margin:56px 0; }
        .lbk-hero { position:relative;padding:56px 0 104px;
          background:radial-gradient(ellipse 60% 50% at 50% 35%,rgba(212,175,55,.08),transparent 70%),var(--bg-deep);overflow:hidden; }
        .lbk-hero-grid { display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(40px,6vw,96px);max-width:1380px;margin:0 auto;padding:0 clamp(20px,4vw,60px);align-items:center; }
        @media (max-width:880px){ .lbk-hero-grid{grid-template-columns:1fr;gap:40px;} }
        .lbk-hero-img-wrap { position:relative;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;will-change:transform; }
        .lbk-hero-img { width:100%;height:100%;object-fit:cover;filter:drop-shadow(0 30px 60px rgba(0,0,0,.85)) drop-shadow(0 0 24px rgba(212,175,55,.18)); }
        .lbk-collection { font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.42em;color:var(--gold);text-transform:uppercase;margin:0 0 14px; }
        .lbk-hero-title { font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(40px,6.4vw,80px);line-height:.98;letter-spacing:.04em;color:var(--gold-light);margin:0 0 14px;text-transform:uppercase; }
        .lbk-subtitle { font-family:'Cinzel',serif;font-size:11px;letter-spacing:.34em;color:var(--ink-muted);text-transform:uppercase;margin:0 0 18px; }
        .lbk-tagline { font-style:italic;font-size:clamp(18px,1.7vw,24px);color:var(--ink);margin:0;line-height:1.4; }
        .lbk-metal-pill { position:absolute;left:50%;bottom:24px;transform:translateX(-50%);display:inline-flex;align-items:center;gap:10px;padding:8px 14px;
          border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.35);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
          color:#f5f5f5;font-family:'Cinzel',serif;font-size:10px;letter-spacing:.18em;text-transform:uppercase;border-radius:999px;white-space:nowrap;pointer-events:none;z-index:4; }
        .lbk-metal-pill-dot { width:6px;height:6px;border-radius:999px;flex-shrink:0; }
        .lbk-metal-pill-dot.is-yellow { background:linear-gradient(135deg,#f0d98c 0%,#d4af37 100%); box-shadow:0 0 0 1px rgba(255,255,255,.12),0 0 6px rgba(212,175,55,.50); }
        .lbk-metal-pill-dot.is-silver { background:linear-gradient(135deg,#f0f1f3 0%,#c9cdd2 100%); box-shadow:0 0 0 1px rgba(255,255,255,.14),0 0 6px rgba(216,221,226,.45); }
        .lbk-metal-pill-dot.is-white-gold { background:linear-gradient(135deg,#fff 0%,#d8dde2 100%); box-shadow:0 0 0 1px rgba(255,255,255,.18),0 0 6px rgba(232,235,239,.50); }
        @keyframes lbk-fade-in { 0%{opacity:0;} 100%{opacity:1;} }
        .lbk-fade-in { animation:lbk-fade-in 200ms ease both; }
        .lbk-comp-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(28px,3.5vw,50px);margin-top:28px; }
        @media (max-width:880px){ .lbk-comp-grid{grid-template-columns:1fr 1fr;} }
        @media (max-width:520px){ .lbk-comp-grid{grid-template-columns:1fr;} }
        .lbk-comp-num { font-family:'Cinzel',serif;font-size:11px;color:var(--gold-dim);letter-spacing:.32em;margin-bottom:16px; }
        .lbk-comp-h { font-family:'Cinzel',serif;font-size:14px;letter-spacing:.28em;color:var(--gold-light);margin-bottom:14px;font-weight:500;text-transform:uppercase; }
        .lbk-comp-p { font-size:16px;line-height:1.7;color:var(--ink-muted);margin:0; }
        .lbk-config { max-width:880px;margin:0 auto;padding:clamp(56px,8vw,96px) clamp(20px,4vw,60px) clamp(48px,6vw,72px);text-align:center; }
        .lbk-price-line { font-family:'Cinzel',serif;font-size:clamp(20px,2.2vw,28px);letter-spacing:.22em;color:var(--gold);margin:12px 0 0; }
        .lbk-config-group { margin-top:32px;text-align:left; }
        .lbk-config-label { display:block;font-family:'Cinzel',serif;font-size:11px;letter-spacing:.38em;color:var(--ink-muted);text-transform:uppercase;margin-bottom:14px; }
        .lbk-opt-row { display:grid;gap:12px;grid-template-columns:1fr 1fr 1fr; }
        @media (max-width:640px){ .lbk-opt-row{grid-template-columns:1fr;} }
        .lbk-opt { background:transparent;color:var(--ink-muted);border:1px solid var(--rule-soft);padding:18px 14px 16px;cursor:pointer;text-align:center;font-family:'Cinzel',serif;transition:all 220ms; }
        .lbk-opt:hover { border-color:var(--rule);color:var(--ink); }
        .lbk-opt.is-active { border-color:var(--gold);color:var(--ink-strong);background:rgba(212,175,55,.06);box-shadow:0 0 0 1px var(--gold) inset,0 12px 32px -16px rgba(212,175,55,.5); }
        .lbk-opt-label { font-size:12px;letter-spacing:.28em;margin:0;text-transform:uppercase; }
        .lbk-opt-sub { font-style:italic;font-size:12px;color:var(--ink-muted);margin:6px 0 0; }
        .lbk-opt-price { font-family:'Cinzel',serif;font-size:11px;letter-spacing:.18em;color:var(--gold);margin:8px 0 0; }
        .lbk-opt-swatch { display:inline-block;width:4px;height:4px;border-radius:999px;margin:0 8px 2px 0;vertical-align:middle;flex-shrink:0; }
        .lbk-opt-swatch.is-yellow { background:linear-gradient(135deg,#f0d98c 0%,#d4af37 100%);box-shadow:0 0 0 1px rgba(255,255,255,.10),0 0 4px rgba(212,175,55,.55); }
        .lbk-opt-swatch.is-silver { background:linear-gradient(135deg,#f0f1f3 0%,#c9cdd2 100%);box-shadow:0 0 0 1px rgba(255,255,255,.12),0 0 4px rgba(216,221,226,.45); }
        .lbk-opt-swatch.is-white-gold { background:linear-gradient(135deg,#fff 0%,#d9dde2 100%);box-shadow:0 0 0 1px rgba(255,255,255,.18),0 0 4px rgba(232,235,239,.55); }
        .lbk-purchase { margin-top:56px;text-align:center;border-top:1px solid var(--rule-soft);padding-top:40px; }
        .lbk-btn { font-family:'Cinzel',serif;font-size:12px;letter-spacing:.42em;color:var(--ink-strong);background:transparent;border:1px solid var(--gold);padding:18px 44px;cursor:pointer;text-transform:uppercase;transition:all 280ms; }
        .lbk-btn:hover { background:var(--gold);color:var(--bg-deep);letter-spacing:.48em; }
        .lbk-btn:disabled { opacity:.55;cursor:not-allowed; }
        .lbk-final { background:var(--bg-deep);padding:clamp(72px,9vw,128px) clamp(20px,4vw,60px);text-align:center;border-top:1px solid var(--rule-soft); }
        .lbk-archive-line { font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(22px,2.2vw,30px);color:var(--gold-light);line-height:1.5;max-width:680px;margin:0 auto; }
        .lbk-archive-grid { display:grid;grid-template-columns:1fr 1fr;gap:clamp(14px,1.6vw,22px);margin-top:36px; }
        .lbk-archive-cell { position:relative;aspect-ratio:1/1;overflow:hidden;background:#0a0a0a;border:1px solid var(--rule-soft); }
        .lbk-archive-cell.full { grid-column:1 / -1;aspect-ratio:16/10; }
        .lbk-archive-cell img { width:100%;height:100%;object-fit:cover;transition:transform 900ms cubic-bezier(.22,.61,.36,1),opacity 200ms ease;display:block; }
        .lbk-archive-cell:hover img { transform:scale(1.02); }
        @media (max-width:640px){ .lbk-archive-grid{grid-template-columns:1fr;} .lbk-archive-cell.full{aspect-ratio:4/5;} }
        /* HIS COUNTERPART — His & Hers cross-sell */
        .lbk-counterpart { background:var(--bg-deep);border-top:1px solid var(--rule);
          padding:clamp(72px,8vw,120px) clamp(20px,4vw,60px); }
        .lbk-counterpart-grid { max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(40px,5vw,80px);align-items:center; }
        @media (max-width:880px){ .lbk-counterpart-grid{grid-template-columns:1fr;gap:40px;} }
        .lbk-counterpart-img-wrap { position:relative;aspect-ratio:4/5;overflow:hidden;background:#0a0a0a;border:1px solid var(--rule-soft);
          transition:transform 600ms cubic-bezier(.22,.61,.36,1),box-shadow 600ms ease;display:block; }
        .lbk-counterpart-img-wrap:hover { transform:translateY(-6px);box-shadow:0 32px 60px -28px rgba(212,175,55,.35),0 0 0 1px var(--rule); }
        .lbk-counterpart-img { width:100%;height:100%;object-fit:cover;display:block;transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .lbk-counterpart-img-wrap:hover .lbk-counterpart-img { transform:scale(1.03); }
        .lbk-counterpart-title { font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(36px,4.6vw,60px);line-height:1.04;letter-spacing:.02em;color:var(--ink-strong);margin:0 0 28px;text-transform:uppercase; }
        .lbk-counterpart-body { font-family:'Cormorant Garamond',serif;font-size:clamp(17px,1.4vw,21px);line-height:1.62;color:var(--ink);margin:0 0 14px; }
        .lbk-counterpart-body em { font-style:italic;color:var(--ink-strong); }
        .lbk-counterpart-cta { display:inline-flex;align-items:center;gap:14px;margin-top:36px;font-family:'Cinzel',serif;font-size:11.5px;letter-spacing:.42em;color:var(--gold);text-transform:uppercase;text-decoration:none;padding-bottom:8px;position:relative;transition:color 280ms ease,gap 280ms ease; }
        .lbk-counterpart-cta::after { content:'';position:absolute;left:0;bottom:0;height:1px;width:32px;background:var(--gold);transition:width 380ms cubic-bezier(.22,.61,.36,1); }
        .lbk-counterpart-cta:hover { color:var(--gold-light);gap:22px; }
        .lbk-counterpart-cta:hover::after { width:100%; }
        .lbk-counterpart-arrow { display:inline-block;transition:transform 280ms ease; }
        .lbk-counterpart-cta:hover .lbk-counterpart-arrow { transform:translateX(6px); }
      `}</style>

      <Link to="/shop" className="lbk-return" data-testid="lbk-return"><ArrowLeft size={14} /> RETURN</Link>

      <section className="lbk-hero" data-testid="lbk-hero">
        <div className="lbk-hero-grid">
          <div className="lbk-hero-img-wrap" style={{ transform: `translateY(${heroParallax * 0.25}px)` }}>
            <img key={HERO_IMG} src={HERO_IMG} alt={HERO_ALT} className="lbk-hero-img lbk-fade-in" data-testid="lbk-hero-img" />
            {hasUserSelected && (
              <span key={`pill-${metalChoice}`} className="lbk-metal-pill lbk-fade-in" data-testid="lbk-metal-badge">
                <span className={`lbk-metal-pill-dot ${dotClass}`} aria-hidden="true" />
                Currently Viewing · {metalLabel}
              </span>
            )}
          </div>
          <div>
            <p className="lbk-collection">THE COLLECTIVE · LADIES FIRST</p>
            <h1 className="lbk-hero-title" data-testid="lbk-hero-title">LADY BOSS KNOT</h1>
            <p className="lbk-subtitle">Executive Statement Pendant</p>
            <p className="lbk-tagline" data-testid="lbk-tagline">She doesn&apos;t wear power. She ties it around her neck.</p>
          </div>
        </div>
      </section>

      <section className="lbk-section" data-testid="lbk-opening">
        <p className="lbk-eyebrow">THE PIECE</p>
        <p className="lbk-p">The Lady Boss Knot transforms one of the oldest symbols of authority into something entirely her own.</p>
        <p className="lbk-p"><em>A woven knot anchors a sculptural necktie silhouette, suspended from a bold chain and reimagined through the lens of feminine power.</em></p>
        <div className="lbk-divider" />
        <p className="lbk-p">Not borrowed.</p>
        <p className="lbk-p">Not inherited.</p>
        <p className="lbk-p"><em>Claimed.</em></p>
      </section>

      <section className="lbk-section" data-testid="lbk-archive">
        <p className="lbk-eyebrow">THE ARCHIVE</p>
        <h2 className="lbk-h2">Worn in her world.</h2>
        <div className="lbk-archive-grid">
          <div className="lbk-archive-cell full" data-testid="lbk-archive-cell-1">
            <img src="/lady-boss-knot/archive-1.jpg" alt="LADY BOSS KNOT — editorial portrait, the tie reimagined as her crown." loading="lazy" />
          </div>
          <div className="lbk-archive-cell" data-testid="lbk-archive-cell-2">
            <img src="/lady-boss-knot/archive-2.jpg" alt="LADY BOSS KNOT — woven knot architecture detail, sculptural close-up." loading="lazy" />
          </div>
          <div className="lbk-archive-cell" data-testid="lbk-archive-cell-3">
            <img src="/lady-boss-knot/archive-3.jpg" alt="LADY BOSS KNOT — worn with intention, Cuban-link chain at the collar." loading="lazy" />
          </div>
          <div className="lbk-archive-cell full" data-testid="lbk-archive-cell-4">
            <img src="/lady-boss-knot/archive-4.jpg" alt="LADY BOSS KNOT — close macro of the woven knot pendant suspended from the Cuban-link chain." loading="lazy" />
          </div>
        </div>
      </section>

      <section className="lbk-section" data-testid="lbk-composition">
        <p className="lbk-eyebrow">COMPOSITION</p>
        <h2 className="lbk-h2">Four notes. One arrival.</h2>
        <div className="lbk-comp-grid">
          <div><p className="lbk-comp-num">01</p><p className="lbk-comp-h">Form</p><p className="lbk-comp-p">Sculptural necktie pendant with handwoven knot architecture.</p></div>
          <div><p className="lbk-comp-num">02</p><p className="lbk-comp-h">Chain</p><p className="lbk-comp-p">Statement Cuban-link presentation. Included with every piece.</p></div>
          <div><p className="lbk-comp-num">03</p><p className="lbk-comp-h">Metal</p><p className="lbk-comp-p">Solid Sterling Silver, 10K Yellow Gold, or 10K White Gold.</p></div>
          <div><p className="lbk-comp-num">04</p><p className="lbk-comp-h">Process</p><p className="lbk-comp-p">Made to order. 3–4 weeks production. Insured shipping.</p></div>
        </div>
        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <p className="lbk-archive-line">&ldquo;Power looks different when it&apos;s hers.&rdquo;</p>
        </div>
      </section>

      <section className="lbk-config" data-testid="lbk-configurator">
        <p className="lbk-eyebrow">CRAFT YOUR LADY BOSS KNOT</p>
        <h2 className="lbk-h2">Three metals. One verdict.</h2>
        <p className="lbk-price-line" data-testid="lbk-price">{formatUsd(priceUsd)}</p>
        <p style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--ink-muted)', margin: '8px 0 0' }}>Includes matching statement chain</p>

        <div className="lbk-config-group">
          <label className="lbk-config-label">Metal</label>
          <div className="lbk-opt-row" role="radiogroup" aria-label="Metal">
            {METAL_CHOICES.map((opt) => (
              <button key={opt.id} type="button" role="radio" aria-checked={metalChoice === opt.id}
                className={`lbk-opt${metalChoice === opt.id ? " is-active" : ""}`}
                data-testid={`lbk-metal-${opt.id}`} onClick={() => pickMetal(opt.id)}>
                <p className="lbk-opt-label"><span className={`lbk-opt-swatch ${opt.swatch}`} aria-hidden="true" />{opt.label}</p>
                <p className="lbk-opt-sub">{opt.sub}</p>
                <p className="lbk-opt-price">{formatUsd(opt.price)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lbk-purchase">
          <p style={{ fontFamily:"'Cinzel',serif",fontSize:10.5,letterSpacing:'.46em',color:'var(--ink-muted)',margin:'0 0 6px' }}>MADE TO ORDER</p>
          <p style={{ fontStyle:'italic',fontSize:15,color:'var(--ink-muted)',margin:'0 0 24px' }}>Includes matching statement chain · Made to order · Allow 3–4 weeks for production</p>
          <button type="button" className="lbk-btn" data-testid="lbk-add-to-cart" onClick={onAddToCart} disabled={isAdding}>{buttonText}</button>
        </div>
      </section>

      {/* HER COUNTERPART — Cross-sell to Boss Knot (Lady Boss Knot's pairing) */}
      <section className="lbk-counterpart" data-testid="lbk-counterpart">
        <div className="lbk-counterpart-grid">
          <Link to="/boss-knot" className="lbk-counterpart-img-wrap" aria-label="View Boss Knot" data-testid="lbk-counterpart-image-link">
            <img
              src="/boss-knot/hero.jpg"
              alt="BOSS KNOT — his counterpart, woven mesh executive pendant."
              className="lbk-counterpart-img"
              loading="lazy"
              data-testid="lbk-counterpart-image"
            />
          </Link>
          <div>
            <p className="lbk-eyebrow" data-testid="lbk-counterpart-eyebrow">HER COUNTERPART</p>
            <h2 className="lbk-counterpart-title" data-testid="lbk-counterpart-title">BOSS KNOT</h2>
            <p className="lbk-counterpart-body">The original statement.</p>
            <p className="lbk-counterpart-body"><em>Built for the room.</em></p>
            <p className="lbk-counterpart-body"><em>Built for the arrival.</em></p>
            <p className="lbk-counterpart-body"><em>Built for the man who never needed an introduction.</em></p>
            <Link to="/boss-knot" className="lbk-counterpart-cta" data-testid="lbk-counterpart-cta">
              HE WEARS IT TOO <span className="lbk-counterpart-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="lbk-final" data-testid="lbk-final-word">
        <p className="lbk-eyebrow">ARCHIVE</p>
        <p className="lbk-archive-line">The boardroom never owned the tie.<br /><em>She does now.</em></p>
      </section>
    </div>
  );
}
