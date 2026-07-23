import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

const WORN_SET   = "/inspiration-vault/stampede-set/worn-set.png";
const BANGLE_BLK = "/inspiration-vault/stampede-set/bangle-black.jpg";
const RING_BLK   = "/inspiration-vault/stampede-set/ring-black.jpg";

// Approved gallery order. The "bangle on white pedestal" slot is
// reserved between the two black-background images — insert its asset
// here when the customer supplies it. No stand-in image is used.
const GALLERY = [
  { src: WORN_SET,   alt: "STAMPEDE SET pavé ring and matching bangle worn together" },
  { src: BANGLE_BLK, alt: "STAMPEDE SET pavé hinged bangle on black background" },
  { src: RING_BLK,   alt: "STAMPEDE SET matching pavé statement ring on black background" },
];

export default function StampedeSetPage() {
  useLuxuryMotionObserver();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    document.title = "STAMPEDE SET | PHILEON Inspiration Vault";
    const upsert = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    upsert("name", "description",
      "Discover STAMPEDE SET in the PHILEON Inspiration Vault, a matching sculptural pavé ring and hinged bangle designed to be worn together.");
    upsert("property", "og:title", "STAMPEDE SET | PHILEON Inspiration Vault");
    upsert("property", "og:image", `${window.location.origin}${WORN_SET}`);
  }, []);

  const prev = () => setIdx((i) => (i - 1 + GALLERY.length) % GALLERY.length);
  const next = () => setIdx((i) => (i + 1) % GALLERY.length);

  return (
    <div className="ss-page" data-testid="stampede-set-page">
      <LuxuryMotionStyles />
      <style>{`
        .ss-page { background:#0a0908; color:#e8e0cf; font-family:'Cormorant Garamond',serif; min-height:100vh; }
        .ss-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em;
          color:rgba(232,224,207,.55); text-decoration:none; text-transform:uppercase;
          transition:color 220ms ease,gap 220ms ease; }
        .ss-return:hover { color:#c8a24a; gap:16px; }
        .ss-wrap { max-width:1180px; margin:0 auto; padding:32px clamp(20px,4vw,60px) 120px; }
        .ss-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.6em;
          color:#c8a24a; text-transform:uppercase; margin:0 0 16px; text-align:center; }
        .ss-title { font-family:'Cinzel',serif; font-weight:500;
          font-size:clamp(36px,5.6vw,72px); letter-spacing:.16em; text-align:center;
          margin:0 0 12px; color:#f4ecd6; text-transform:uppercase; }
        .ss-subtitle { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(18px,2vw,26px); text-align:center; color:#c8a24a;
          margin:0 0 40px; }
        .ss-gallery { position:relative; margin:0 auto 40px; max-width:900px; }
        .ss-main { position:relative; width:100%; aspect-ratio:1/1; background:#111;
          border:1px solid rgba(200,162,74,.22); display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .ss-main img { width:100%; height:100%; object-fit:contain; object-position:center; display:block; }
        .ss-nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(10,9,8,.75);
          border:1px solid rgba(200,162,74,.35); color:#f4ecd6; width:44px; height:44px;
          display:flex; align-items:center; justify-content:center; cursor:pointer;
          transition:background 220ms ease,color 220ms ease; }
        .ss-nav:hover { background:#c8a24a; color:#0a0908; }
        .ss-nav.prev { left:12px; } .ss-nav.next { right:12px; }
        .ss-thumbs { display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
          gap:12px; margin-top:14px; }
        .ss-thumb { border:1px solid rgba(200,162,74,.18); background:#111; padding:0;
          aspect-ratio:1/1; cursor:pointer; overflow:hidden;
          transition:border-color 220ms ease,transform 220ms ease; }
        .ss-thumb:hover { border-color:#c8a24a; transform:translateY(-2px); }
        .ss-thumb.active { border-color:#c8a24a; }
        .ss-thumb img { width:100%; height:100%; object-fit:contain; background:#111; }
        .ss-body { max-width:720px; margin:56px auto 0; text-align:center; }
        .ss-body h2 { font-family:'Playfair Display',serif; font-size:clamp(24px,3vw,36px);
          margin:0 0 20px; color:#f4ecd6; }
        .ss-body p { font-size:clamp(17px,1.5vw,20px); line-height:1.7; color:#d6cdb6; margin:0 0 16px; }
        .ss-includes { display:inline-block; margin-top:24px; padding:12px 26px;
          border:1px solid rgba(200,162,74,.35);
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.34em;
          color:#c8a24a; text-transform:uppercase; }
        .ss-notice { max-width:640px; margin:44px auto 0; text-align:center;
          font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:15px; color:rgba(232,224,207,.55); line-height:1.6; }
      `}</style>

      <Link to="/inspiration-vault?category=sets" className="ss-return" data-testid="ss-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <div className="ss-wrap">
        <p className="ss-eyebrow">Inspiration Vault · Sets</p>
        <h1 className="ss-title" data-testid="ss-title">STAMPEDE SET</h1>
        <p className="ss-subtitle">Pavé Ring &amp; Bangle Set</p>

        <div className="ss-gallery" data-testid="ss-gallery">
          <div className="ss-main" data-testid="ss-gallery-main">
            <img src={GALLERY[idx].src} alt={GALLERY[idx].alt} data-testid="ss-gallery-image" />
            <button type="button" className="ss-nav prev" onClick={prev} aria-label="Previous image" data-testid="ss-prev"><ChevronLeft size={20}/></button>
            <button type="button" className="ss-nav next" onClick={next} aria-label="Next image" data-testid="ss-next"><ChevronRight size={20}/></button>
          </div>
          <div className="ss-thumbs" data-testid="ss-gallery-thumbs">
            {GALLERY.map((g, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setIdx(i)}
                className={`ss-thumb ${i === idx ? "active" : ""}`}
                aria-label={`Show image ${i + 1}: ${g.alt}`}
                aria-pressed={i === idx}
                data-testid={`ss-thumb-${i + 1}`}
              >
                <img src={g.src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div className="ss-body">
          <h2>A sculptural two-piece pairing, worn in unison.</h2>
          <p>
            STAMPEDE SET combines a sweeping pavé hinged bangle with its matching
            statement ring, carrying the same raised silhouette and continuous
            brilliance across the hand and wrist.
          </p>
          <p><strong>Set includes:</strong> one matching ring and one hinged bangle.</p>
          <p className="ss-includes" data-testid="ss-includes">Includes · Ring &amp; Bangle</p>
        </div>

        <p className="ss-notice">
          Price, sizing, and full specifications will publish here when confirmed.
          Purchasing is disabled until then.
        </p>
      </div>
    </div>
  );
}
