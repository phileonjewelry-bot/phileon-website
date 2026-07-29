import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO           = "/inspiration-vault/parallax-drop-earrings/hero-bust-pair.png";
const DETAIL_CLOSE   = "/inspiration-vault/parallax-drop-earrings/detail-close.png";
const ON_EAR         = "/inspiration-vault/parallax-drop-earrings/on-ear-profile.png";
const PAIR_SUSPENDED = "/inspiration-vault/parallax-drop-earrings/pair-suspended.png";
const WORN_DAYTIME   = "/inspiration-vault/parallax-drop-earrings/worn-daytime.png";
const WORN_EVENING   = "/inspiration-vault/parallax-drop-earrings/worn-evening.png";
const FILM_ONE       = "/inspiration-vault/parallax-drop-earrings/film-one.mp4";
const FILM_TWO       = "/inspiration-vault/parallax-drop-earrings/film-two.mp4";
const PRICE = 70;

const GALLERY = [
  { type: "image", src: HERO,           alt: "PARALLAX gold-plated silver drop earrings displayed as a pair" },
  { type: "image", src: DETAIL_CLOSE,   alt: "PARALLAX synthetic bi-colour drop earring close-up" },
  { type: "image", src: ON_EAR,         alt: "PARALLAX long geometric drop earring shown on a black display bust" },
  { type: "image", src: PAIR_SUSPENDED, alt: "PARALLAX pair suspended on a display arc — full length silhouette" },
  { type: "image", src: WORN_DAYTIME,   alt: "PARALLAX drop earring worn — daytime restaurant editorial" },
  { type: "image", src: WORN_EVENING,   alt: "PARALLAX drop earring worn — evening dining editorial" },
  { type: "video", src: FILM_ONE, alt: "PARALLAX drop earrings — silent product motion, study one" },
  { type: "video", src: FILM_TWO, alt: "PARALLAX drop earrings — silent product motion, study two" },
];

export default function ParallaxDropEarringsPage() {
  useLuxuryMotionObserver();
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "PARALLAX Drop Earrings | PHILEON Inspiration Vault";
    const upsert = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    upsert("name", "description",
      "Discover PARALLAX, gold-plated silver drop earrings featuring synthetic bi-colour rectangular stones and clear synthetic accents. Sold as a pair.");
    upsert("property", "og:title", "PARALLAX Drop Earrings | PHILEON Inspiration Vault");
    upsert("property", "og:image", `${window.location.origin}${HERO}`);
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-parallax-drop-earrings",
      productName: "PARALLAX DROP EARRINGS",
      name: "PARALLAX DROP EARRINGS — Geometric Bi-Colour Drops",
      category: "Inspiration Vault — Earrings",
      includes: "Pair",
      price: PRICE,
      productKey: "inspirationVaultParallaxDropEarrings",
      tierKey: "default",
      sku: "IV-PARALLAX-DROPS",
      quantity: 1,
      image: HERO,
    }, 1, "Pair · Geometric Bi-Colour Drops");
  };

  return (
    <div className="pdx-page" data-testid="parallax-drop-earrings-page">
      <LuxuryMotionStyles />
      <style>{`
        .pdx-page { background:#0a0908; color:#e8e0cf; font-family:'Cormorant Garamond',serif; min-height:100vh; }
        .pdx-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em;
          color:rgba(232,224,207,.55); text-decoration:none; text-transform:uppercase;
          transition:color 220ms ease,gap 220ms ease; }
        .pdx-return:hover { color:#c8a24a; gap:16px; }
        .pdx-wrap { max-width:1180px; margin:0 auto; padding:32px clamp(20px,4vw,60px) 120px; }
        .pdx-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.6em;
          color:#c8a24a; text-transform:uppercase; margin:0 0 16px; text-align:center; }
        .pdx-title { font-family:'Cinzel',serif; font-weight:500;
          font-size:clamp(36px,5.6vw,72px); letter-spacing:.16em; text-align:center;
          margin:0 0 12px; color:#f4ecd6; text-transform:uppercase; }
        .pdx-subtitle { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(18px,2vw,26px); text-align:center; color:#c8a24a; margin:0 0 40px; }
        .pdx-stack { max-width:900px; margin:0 auto 40px; display:flex; flex-direction:column; gap:clamp(18px,2.4vw,32px); }
        .pdx-frame { position:relative; width:100%; aspect-ratio:1/1; background:#111;
          border:1px solid rgba(200,162,74,.22); display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .pdx-frame img, .pdx-frame video { width:100%; height:100%; object-fit:contain; object-position:center; display:block; background:#111; }
        .pdx-body { max-width:720px; margin:56px auto 0; text-align:center; }
        .pdx-body h2 { font-family:'Playfair Display',serif; font-size:clamp(24px,3vw,36px); margin:0 0 20px; color:#f4ecd6; }
        .pdx-body p { font-size:clamp(17px,1.5vw,20px); line-height:1.7; color:#d6cdb6; margin:0 0 16px; }
        .pdx-material { display:block; max-width:600px; margin:24px auto 0;
          font-family:'Cormorant Garamond',serif; font-size:15px; letter-spacing:.08em; color:rgba(232,224,207,.7); }
        .pdx-includes { display:inline-block; margin-top:24px; padding:12px 26px;
          border:1px solid rgba(200,162,74,.35);
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.34em; color:#c8a24a; text-transform:uppercase; }
        .pdx-notice { max-width:640px; margin:44px auto 0; text-align:center;
          font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:15px; color:rgba(232,224,207,.55); line-height:1.6; }
        .pdx-cta { text-align:center; max-width:520px; margin:56px auto 0;
          padding-top:44px; border-top:1px solid rgba(200,162,74,.18); }
        .pdx-price { font-family:'Cinzel',serif; font-size:clamp(22px,2.4vw,32px); letter-spacing:.28em; color:#f4ecd6; margin:0 0 8px; }
        .pdx-price-note { font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:14px; letter-spacing:.06em; color:rgba(232,224,207,.55); margin:0 0 26px; }
        .pdx-add-btn { display:inline-flex; align-items:center; justify-content:center;
          padding:18px 64px; border:1.5px solid #c8a24a; background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:#f4ecd6; text-transform:uppercase; cursor:pointer;
          transition:background 320ms ease,color 320ms ease,transform 220ms ease; }
        .pdx-add-btn:hover:not(:disabled) { background:#c8a24a; color:#0a0908; transform:translateY(-2px); }
        .pdx-add-btn:disabled { opacity:.6; cursor:wait; }
      `}</style>

      <Link to="/inspiration-vault?category=earrings" className="pdx-return" data-testid="pdx-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <div className="pdx-wrap">
        <p className="pdx-eyebrow">Inspiration Vault · Earrings</p>
        <h1 className="pdx-title" data-testid="pdx-title">PARALLAX DROP EARRINGS</h1>
        <p className="pdx-subtitle">Geometric Bi-Colour Drops</p>

        <div className="pdx-stack" data-testid="pdx-gallery">
          {GALLERY.map((g, i) => (
            <figure key={i} className="pdx-frame" data-testid={`pdx-frame-${i + 1}`}>
              {g.type === "video" ? (
                <video
                  src={g.src}
                  autoPlay loop muted playsInline controls={false}
                  disablePictureInPicture disableRemotePlayback
                  preload="auto"
                  aria-label={g.alt}
                  data-testid={`pdx-video-${i + 1}`}
                  ref={(v) => {
                    if (!v) return;
                    try { v.muted = true; v.defaultMuted = true; v.volume = 0; v.playsInline = true; } catch (_e) { /* no-op */ }
                    if (v.dataset.ioAttached === "1") return;
                    v.dataset.ioAttached = "1";
                    // Force the browser to begin fetching this file now so it's
                    // buffered before the user scrolls into view. Without this,
                    // longer clips (~4 MB+) can arrive at the play() call with
                    // readyState=0 and silently stall.
                    try { v.load(); } catch (_e) { /* no-op */ }
                    const kick = () => {
                      if (v.ended || v.currentTime >= (v.duration || 0) - 0.05) { try { v.currentTime = 0; } catch (_e) { /* no-op */ } }
                      const p = v.play();
                      if (p && typeof p.catch === "function") {
                        p.catch(() => setTimeout(() => { try { v.play().catch(() => {}); } catch (_e) { /* no-op */ } }, 400));
                      }
                    };
                    v.addEventListener("ended", () => { try { v.currentTime = 0; v.play().catch(() => {}); } catch (_e) { /* no-op */ } });
                    // If buffering finishes AFTER the frame has scrolled into
                    // view, `canplay` fires and we kick playback then.
                    v.addEventListener("canplay", kick, { once: false });
                    // Large rootMargin so slower clips get a head-start.
                    const io = new IntersectionObserver((entries) => {
                      entries.forEach((e) => { if (e.isIntersecting) kick(); else { try { v.pause(); } catch (_e) { /* no-op */ } } });
                    }, { rootMargin: "600px 0px", threshold: 0.05 });
                    io.observe(v);
                    kick();
                  }}
                />
              ) : (
                <img src={g.src} alt={g.alt} loading={i === 0 ? "eager" : "lazy"} data-testid={`pdx-image-${i + 1}`} />
              )}
            </figure>
          ))}
        </div>

        <div className="pdx-body">
          <h2>PARALLAX moves through colour and geometry.</h2>
          <p>
            Two synthetic bi-colour rectangular stones anchor each elongated
            drop, divided by a clear square accent and a slender line of clear
            synthetic stones. Crafted in gold-plated silver and sold as a
            complete pair.
          </p>
          <p><em>The colour shifts. The line remains.</em></p>
          <span className="pdx-material" data-testid="pdx-material">
            Gold-Plated Silver · Synthetic Bi-Colour Stones · Clear Synthetic Accents
          </span>
          <p className="pdx-includes" data-testid="pdx-includes">Sold as a Pair</p>
        </div>

        <p className="pdx-notice" data-testid="pdx-notice">
          Part of the PHILEON Inspiration Vault. Crafted in gold-plated silver
          with synthetic stones. This piece is not part of the PHILEON Fine
          Jewelry collection.
        </p>

        <div className="pdx-cta" data-testid="pdx-cta">
          <p className="pdx-price" data-testid="pdx-price">${PRICE} USD</p>
          <p className="pdx-price-note">Inspiration Vault · Pair</p>
          <button type="button" onClick={onAddToCart} disabled={isAdding}
            className="pdx-add-btn" aria-label="Add PARALLAX DROP EARRINGS to cart"
            data-testid="pdx-add-to-cart">
            {buttonText || "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
}
