import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

const HERO_IMG = "/inspiration-vault/orbit-lumiere/hero.jpg";
const MACRO_IMG = "/inspiration-vault/orbit-lumiere/macro.png";
const ON_EAR_IMG = "/inspiration-vault/orbit-lumiere/on-ear.jpg";
const ON_EAR_PROFILE_IMG = "/inspiration-vault/orbit-lumiere/on-ear-profile.jpg";
const LIFESTYLE_IMG = "/inspiration-vault/orbit-lumiere/lifestyle.jpg";
const DETAIL_01_IMG = "/inspiration-vault/orbit-lumiere/new-02.png";
const DETAIL_02_IMG = "/inspiration-vault/orbit-lumiere/new-03.png";
const EDITORIAL_WIDE_IMG = "/inspiration-vault/orbit-lumiere/new-04.png";
const STUDIO_02_IMG = "/inspiration-vault/orbit-lumiere/new-01.jpg";

// Multicolour finish (yellow, rose and white) — supplied set
const MC_IMG_01 = "/inspiration-vault/orbit-lumiere/multicolour/multi-01.jpg";
const MC_IMG_02 = "/inspiration-vault/orbit-lumiere/multicolour/multi-02.jpg";
const MC_IMG_03 = "/inspiration-vault/orbit-lumiere/multicolour/multi-03.jpg";
const MC_IMG_04 = "/inspiration-vault/orbit-lumiere/multicolour/multi-04.jpg";
const MC_IMG_05 = "/inspiration-vault/orbit-lumiere/multicolour/multi-05.jpg";
const MC_IMG_06 = "/inspiration-vault/orbit-lumiere/multicolour/multi-06-lifestyle-portrait.jpg";

const PRICE = 175;

// ── Silver gallery (original, unchanged) ────────────────────────────
const SILVER_GALLERY = [
  { src: HERO_IMG,           span: "full", alt: "ORBIT LUMIÈRE silver earrings — editorial studio pair, oversized pavé hoops on a black acrylic stand with mirror reflection." },
  { src: MACRO_IMG,          span: "full", alt: "ORBIT LUMIÈRE silver earrings — macro detail of the pavé arcs and floating crystal spheres." },
  { src: ON_EAR_IMG,         span: "half", alt: "ORBIT LUMIÈRE silver earrings — on-ear bust, 3/4 angle showing scale and silhouette." },
  { src: ON_EAR_PROFILE_IMG, span: "half", alt: "ORBIT LUMIÈRE silver earrings — on-ear bust, profile angle catching light through the open cage." },
  { src: LIFESTYLE_IMG,      span: "full", alt: "ORBIT LUMIÈRE silver earrings — lifestyle portrait, worn in a softly lit boutique mirror." },
  { src: DETAIL_01_IMG,      span: "half", alt: "ORBIT LUMIÈRE silver earrings — close detail of the pavé arc and floating crystal, captured against deep shadow." },
  { src: DETAIL_02_IMG,      span: "half", alt: "ORBIT LUMIÈRE silver earrings — alternate detail of the open cage and concentric crystal arcs." },
  { src: EDITORIAL_WIDE_IMG, span: "full", alt: "ORBIT LUMIÈRE silver earrings — wide editorial composition emphasising volume and light play." },
  { src: STUDIO_02_IMG,      span: "full", alt: "ORBIT LUMIÈRE silver earrings — secondary studio portrait, the pair seen as wearable sculpture." },
];

// ── Multicolour gallery (yellow, rose and white finishes) ───────────
const MULTICOLOUR_GALLERY = [
  { src: MC_IMG_06, span: "full", alt: "ORBIT LUMIÈRE multicolour earrings in yellow, rose and white finishes — worn lifestyle portrait, three-tone pavé hoops catching warm café light against the wearer's smile." },
  { src: MC_IMG_01, span: "full", alt: "ORBIT LUMIÈRE multicolour earrings in yellow, rose and white finishes — editorial pair on dark velvet, three-tone pavé arcs catching light." },
  { src: MC_IMG_03, span: "half", alt: "ORBIT LUMIÈRE multicolour earrings in yellow, rose and white finishes — on-ear silhouette study, three-tone concentric hoops framing the face." },
  { src: MC_IMG_04, span: "half", alt: "ORBIT LUMIÈRE multicolour earrings in yellow, rose and white finishes — macro on ear, showing the yellow, rose and white finish layers within the open-cage architecture." },
  { src: MC_IMG_05, span: "full", alt: "ORBIT LUMIÈRE multicolour earrings in yellow, rose and white finishes — lifestyle composition with the matching set on a dark marble surface." },
  { src: MC_IMG_02, span: "full", alt: "ORBIT LUMIÈRE multicolour earrings in yellow, rose and white finishes — companion set portrait on light marble, revealing the tri-tone pavé craftsmanship in full detail." },
];

export default function OrbitLumierePage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  useLuxuryMotionObserver();

  // Finish selector — Silver is the default. Never null.
  const [selectedFinish, setSelectedFinish] = useState("silver");

  // Active gallery derives from the selected finish. Changing finish
  // atomically swaps the gallery source — no intermediate render of the
  // other finish's images can occur.
  const activeGallery = useMemo(
    () => (selectedFinish === "multicolour" ? MULTICOLOUR_GALLERY : SILVER_GALLERY),
    [selectedFinish]
  );
  const finishLabel = selectedFinish === "multicolour" ? "Multicolour" : "Silver";

  // Hero + specs inset track the selected finish so every visible
  // product image above the gallery reflects the current choice.
  const heroImage = selectedFinish === "multicolour" ? MC_IMG_01 : HERO_IMG;
  const specsImage = selectedFinish === "multicolour" ? MC_IMG_03 : ON_EAR_IMG;
  const heroAlt = selectedFinish === "multicolour"
    ? "ORBIT LUMIÈRE multicolour earrings in yellow, rose and white finishes — editorial pair on dark velvet, three-tone pavé arcs catching light."
    : "ORBIT LUMIÈRE silver earrings — editorial studio pair, oversized pavé hoops on a black acrylic stand with mirror reflection.";
  const specsAlt = selectedFinish === "multicolour"
    ? "ORBIT LUMIÈRE multicolour earrings in yellow, rose and white finishes — worn for scale and silhouette."
    : "ORBIT LUMIÈRE silver earrings — worn for scale + silhouette.";

  useEffect(() => {
    document.title = "ORBIT LUMIÈRE — Inspiration Vault · PHILEON";
  }, []);

  // Switching finish resets the visible gallery to image 1 without
  // touching the page scroll or triggering a navigation. The gallery
  // key change also forces the reveal-stagger to replay from index 0.
  const handleFinishChange = (nextFinish) => {
    if (nextFinish === selectedFinish) return;
    setSelectedFinish(nextFinish);
  };

  const onAddToCart = () => {
    const isMulti = selectedFinish === "multicolour";
    const variantLabel = isMulti ? "ORBIT LUMIÈRE — MULTICOLOUR" : "ORBIT LUMIÈRE — SILVER";
    const materialLabel = isMulti
      ? "Multicolour — Yellow, Rose and White Finishes"
      : "Rhodium-Plated Alloy — Silver";

    handleAddToCart({
      id: `inspiration-vault-orbit-lumiere-${selectedFinish}`,
      productName: "ORBIT LUMIÈRE",
      name: `ORBIT LUMIÈRE — ${finishLabel}`,
      variantLabel,
      finish: finishLabel,
      price: PRICE,
      productKey: "inspirationVaultOrbitLumiere",
      tierKey: selectedFinish,
      metal: materialLabel,
      sku: isMulti ? "IV-OL-MC" : "IV-OL-SV",
      quantity: 1,
      image: activeGallery[0].src,
    }, 1, `Finish: ${finishLabel}`);
  };

  return (
    <div className="ol-page" data-testid="orbit-lumiere-page">
      <LuxuryMotionStyles />
      <style>{`
        .ol-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .ol-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .ol-return:hover { color:var(--gold); gap:16px; }
        .ol-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .ol-section { max-width:1180px; margin:0 auto; padding:clamp(72px,8vw,140px) clamp(20px,4vw,60px);
          opacity:0; transform:translateY(20px); animation:olFade 1s cubic-bezier(.22,.61,.36,1) forwards; }
        @keyframes olFade { to { opacity:1; transform:translateY(0); } }
        .ol-section.d1 { animation-delay:.12s; } .ol-section.d2 { animation-delay:.24s; }
        .ol-section.d3 { animation-delay:.36s; } .ol-section.d4 { animation-delay:.48s; }
        .ol-desc { text-align:center; }
        .ol-desc-body p { font-family:'Cormorant Garamond',serif; font-size:clamp(19px,1.55vw,24px);
          line-height:1.7; color:var(--ink); margin:0 auto 18px; max-width:720px; }
        .ol-desc-body p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:30px; }
        .ol-specs { background:var(--bg-deep); border-top:1px solid var(--rule-soft); border-bottom:1px solid var(--rule-soft); }
        .ol-specs-grid { display:grid; grid-template-columns:.85fr 1.15fr; gap:clamp(40px,5vw,80px); align-items:start; }
        @media (max-width:880px){ .ol-specs-grid { grid-template-columns:1fr; gap:36px; } }
        .ol-specs-img-wrap { aspect-ratio:4/5; overflow:hidden; background:var(--bg); border:1px solid var(--rule-soft); }
        .ol-specs-img { width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .ol-specs-img-wrap:hover .ol-specs-img { transform:scale(1.02); }
        .ol-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(34px,4.4vw,54px);
          line-height:1.05; color:var(--ink-strong); margin:0 0 32px; text-transform:uppercase; letter-spacing:.018em; }
        .ol-specs-list { list-style:none; padding:0; margin:24px 0 0; }
        .ol-specs-list li { display:grid; grid-template-columns:200px 1fr; gap:18px; padding:14px 0;
          border-bottom:1px solid var(--rule-soft); }
        .ol-specs-list dt { font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.36em;
          color:var(--gold); text-transform:uppercase; padding-top:2px; }
        .ol-specs-list dd { margin:0; font-size:17px; line-height:1.5; color:var(--ink); }
        .ol-gallery-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,1.8vw,24px); margin-top:36px; }
        .ol-gallery-cell { position:relative; aspect-ratio:1/1; overflow:hidden;
          background:var(--bg-deep); border:1px solid var(--rule-soft); }
        .ol-gallery-cell.full { grid-column:1 / -1; aspect-ratio:16/10; }
        .ol-gallery-cell img { width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .ol-gallery-cell:hover img { transform:scale(1.03); }
        @media (max-width:640px){ .ol-gallery-grid { grid-template-columns:1fr; } .ol-gallery-cell.full { aspect-ratio:4/5; } }

        /* Multicolour cells preserve the full earring — no crop, centred, dark backdrop for reading */
        .ol-gallery-cell.mc img { object-fit:contain; background:var(--bg-deep); padding:6px; }

        /* ── Finish selector (inside purchase / configuration section) ─ */
        .ol-finish-wrap { max-width:520px; margin:0 auto 32px; text-align:left; }
        .ol-finish-label { font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; margin:0 0 12px; }
        .ol-finish-options { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media (max-width:520px){ .ol-finish-options { grid-template-columns:1fr; } }
        .ol-finish-btn { display:flex; flex-direction:column; gap:6px; padding:14px 16px; text-align:left;
          background:rgba(20,18,14,.55); border:1px solid var(--rule-soft); color:var(--ink);
          font-family:'Cormorant Garamond',serif; cursor:pointer;
          transition:border-color 220ms ease,background 220ms ease,transform 220ms ease; }
        .ol-finish-btn:hover { border-color:var(--gold); transform:translateY(-1px); }
        .ol-finish-btn:focus-visible { outline:2px solid var(--gold); outline-offset:3px; }
        .ol-finish-btn[aria-pressed="true"] { border-color:var(--gold);
          background:linear-gradient(180deg, rgba(200,162,74,.14) 0%, rgba(20,18,14,.55) 100%); }
        .ol-finish-btn-title { font-family:'Cinzel',serif; font-size:11.5px; letter-spacing:.34em;
          color:var(--ink-strong); text-transform:uppercase; }
        .ol-finish-btn-sub { font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:14px; color:var(--ink-muted); }
        .ol-finish-summary { font-family:'Cormorant Garamond',serif; font-size:15px;
          color:var(--ink); margin:14px 0 0; letter-spacing:.02em; }
        .ol-finish-summary strong { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.32em;
          color:var(--gold); font-weight:400; text-transform:uppercase; margin-right:6px; }
        .ol-cta { text-align:center; }
        .ol-price-display { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .ol-price-note { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:15px;
          color:var(--ink-muted); margin:0 0 38px; }
        .ol-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 64px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .ol-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .ol-add-btn:disabled { opacity:.6; cursor:wait; }
        .ol-final { text-align:center; padding:clamp(80px,9vw,140px) clamp(20px,4vw,60px); background:#000; border-top:1px solid rgba(200,162,74,.34); }
        .ol-final-line { font-family:'Playfair Display',serif; font-style:italic; font-weight:400;
          font-size:clamp(24px,2.8vw,38px); line-height:1.5; color:var(--gold); max-width:760px; margin:0 auto; }
        .ol-final-attr { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px; }
      `}</style>

      <Link to="/inspiration-vault" className="ol-return" data-testid="ol-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        key={`hero-${selectedFinish}`}
        image={heroImage}
        video={null}
        altText={heroAlt}
        eyebrow="Inspiration Vault"
        title="Orbit Lumière"
        subhead="Light doesn't decorate the design. It completes it."
      />

      <section className="ol-section ol-desc d1" data-testid="ol-desc">
        <p className="ol-eyebrow">Editorial</p>
        <div className="ol-desc-body">
          <p className="lead">Motion through light.</p>
          <p>Orbit Lumière explores motion through light. Concentric pavé-set arcs surround floating crystal spheres, creating a sculptural silhouette that shifts with every movement.</p>
          <p>Bold in scale yet refined in execution, it transforms the classic hoop into wearable architecture designed to catch light from every angle.</p>
        </div>
      </section>

      <section className="ol-section ol-specs d2" data-testid="ol-specs">
        <div className="ol-specs-grid">
          <div className="ol-specs-img-wrap">
            <img src={specsImage} alt={specsAlt} className="ol-specs-img" loading="lazy" data-testid="ol-specs-img" />
          </div>
          <div>
            <p className="ol-eyebrow">Specifications</p>
            <h2 className="ol-h2">Architecture, on the ear.</h2>
            <dl className="ol-specs-list">
              <li><dt>Material</dt><dd>Rhodium-Plated Alloy</dd></li>
              <li><dt>Finish</dt><dd data-testid="ol-spec-finish">{selectedFinish === "multicolour" ? "Multicolour — Yellow, Rose and White" : "White Pavé Crystal — Silver"}</dd></li>
              <li><dt>Form</dt><dd>Sculptural Open-Cage Design</dd></li>
              <li><dt>Detail</dt><dd>Floating Crystal Sphere Centres</dd></li>
              <li><dt>Scale</dt><dd>Oversized Statement Hoop</dd></li>
              <li><dt>Construction</dt><dd>Lightweight</dd></li>
              <li><dt>Closure</dt><dd>Hinged</dd></li>
              <li><dt>Collection</dt><dd>Inspiration Vault Exclusive</dd></li>
              <li><dt>Price</dt><dd>$175 USD</dd></li>
            </dl>
          </div>
        </div>
      </section>

      <section className="ol-section d3" data-testid="ol-gallery">
        <p className="ol-eyebrow" style={{ textAlign:'center' }}>The Look</p>
        <h2 className="ol-h2" style={{ textAlign:'center' }}>From every angle.</h2>
        {/* key forces a clean remount when the finish changes so the
            entire gallery swaps atomically — no residual images from the
            previously selected finish can appear. */}
        <div className="ol-gallery-grid" key={selectedFinish} data-testid={`ol-gallery-${selectedFinish}`}>
          {activeGallery.map((g, i) => (
            <div
              key={i}
              className={`ol-gallery-cell ${g.span === 'full' ? 'full' : ''} ${selectedFinish === 'multicolour' ? 'mc' : ''} lm-cell-reveal lm-stagger-${(i % 9) + 1}`}
              data-testid={`ol-gallery-cell-${i + 1}`}
            >
              <img src={g.src} alt={g.alt} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="ol-section ol-cta d4" data-testid="ol-cta">
        {/* FINISH SELECTOR — inside the purchase / configuration section */}
        <div className="ol-finish-wrap" data-testid="ol-finish-wrap">
          <p className="ol-finish-label">Select Finish</p>
          <div className="ol-finish-options" role="radiogroup" aria-label="Select finish">
            <button
              type="button"
              role="radio"
              aria-checked={selectedFinish === "silver"}
              aria-pressed={selectedFinish === "silver"}
              className="ol-finish-btn"
              onClick={() => handleFinishChange("silver")}
              data-testid="ol-finish-silver"
            >
              <span className="ol-finish-btn-title">Silver</span>
              <span className="ol-finish-btn-sub">Rhodium-plated white pavé</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={selectedFinish === "multicolour"}
              aria-pressed={selectedFinish === "multicolour"}
              className="ol-finish-btn"
              onClick={() => handleFinishChange("multicolour")}
              data-testid="ol-finish-multicolour"
            >
              <span className="ol-finish-btn-title">Multicolour</span>
              <span className="ol-finish-btn-sub">Yellow, rose and white finishes</span>
            </button>
          </div>
          <p className="ol-finish-summary" data-testid="ol-finish-summary">
            <strong>Finish:</strong>{finishLabel}
          </p>
        </div>

        <p className="ol-eyebrow">Price</p>
        <p className="ol-price-display" data-testid="ol-price">${PRICE} USD</p>
        <p className="ol-price-note">Inspiration Vault · In Stock</p>
        <button onClick={onAddToCart} disabled={isAdding} className="ol-add-btn"
          data-testid="ol-add-to-cart" aria-label={`Add Orbit Lumière ${finishLabel} to cart`}>
          {buttonText || "ADD TO CART"}
        </button>
      </section>

      <VaultArchiveNotice />

      <section className="ol-final" data-testid="ol-final-quote">
        <p className="ol-final-line">&ldquo;Light doesn&rsquo;t decorate the design. It completes it.&rdquo;</p>
        <p className="ol-final-attr">— PHILEON</p>
      </section>
    </div>
  );
}
