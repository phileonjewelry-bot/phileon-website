import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";
import { useAddToCart } from "@/hooks/useAddToCart";

const HERO         = "/inspiration-vault/nightfang-set/hero-marble-set.png";
const ON_BODY      = "/inspiration-vault/nightfang-set/on-body.png";
const RING_DETAIL1 = "/inspiration-vault/nightfang-set/ring-detail-01.png";
const RING_DETAIL2 = "/inspiration-vault/nightfang-set/ring-detail-02.png";
const RING_DETAIL3 = "/inspiration-vault/nightfang-set/ring-detail-03.png";
const RING_DETAIL4 = "/inspiration-vault/nightfang-set/ring-detail-04.png";
const BANGLE_PROFILE      = "/inspiration-vault/nightfang-set/bangle-full-profile.png";
const BANGLE_CONSTRUCTION = "/inspiration-vault/nightfang-set/bangle-construction.png";
const VIDEO_1 = "/inspiration-vault/nightfang-set/video-1.mp4";
const VIDEO_2 = "/inspiration-vault/nightfang-set/video-2.mp4";
const VIDEO_3 = "/inspiration-vault/nightfang-set/video-3.mp4";
const VIDEO_4 = "/inspiration-vault/nightfang-set/video-4.mp4";
const PRICE = 185;

// Vertical stack — one item per row, in confirmed order.
const GALLERY = [
  { type: "image", src: HERO,                alt: "NIGHTFANG SET black enamel panther ring and bangle displayed together on a black-and-gold marble platform" },
  { type: "image", src: ON_BODY,             alt: "NIGHTFANG SET panther ring worn on the hand alongside the matching panther bangle around the wrist" },
  { type: "image", src: RING_DETAIL1,        alt: "NIGHTFANG SET black enamel panther ring — three-quarter close-up with green synthetic emerald eye" },
  { type: "image", src: RING_DETAIL2,        alt: "NIGHTFANG SET black enamel panther ring — side profile detail with green synthetic emerald eye" },
  { type: "image", src: RING_DETAIL3,        alt: "NIGHTFANG SET black enamel panther ring — reverse view highlighting the sculpted head and pavé stones" },
  { type: "image", src: RING_DETAIL4,        alt: "NIGHTFANG SET black enamel panther ring — angled side view of the panther head" },
  { type: "image", src: BANGLE_PROFILE,      alt: "NIGHTFANG SET full-profile panther bangle upright against dark marble" },
  { type: "image", src: BANGLE_CONSTRUCTION, alt: "NIGHTFANG SET panther bangle horizontal on a glossy black rectangular platform — construction detail" },
  { type: "video", src: VIDEO_1, alt: "NIGHTFANG SET silent product motion — study one" },
  { type: "video", src: VIDEO_2, alt: "NIGHTFANG SET silent product motion — study two" },
  { type: "video", src: VIDEO_3, alt: "NIGHTFANG SET silent product motion — study three" },
  { type: "video", src: VIDEO_4, alt: "NIGHTFANG SET silent product motion — study four" },
];

export default function NightfangSetPage() {
  useLuxuryMotionObserver();
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();

  useEffect(() => {
    document.title = "NIGHTFANG SET | Panther Ring & Bangle | PHILEON";
    const upsert = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    upsert("name", "description",
      "Discover NIGHTFANG, a coordinated black enamel panther ring and bangle set finished with black synthetic stones and green synthetic emerald eyes.");
    upsert("property", "og:title", "NIGHTFANG SET | Panther Ring & Bangle | PHILEON");
    upsert("property", "og:image", `${window.location.origin}${HERO}`);
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-nightfang-set",
      productName: "NIGHTFANG SET",
      name: "NIGHTFANG SET — Panther Ring & Panther Bangle",
      category: "Inspiration Vault — Sets",
      includes: "Ring & Bangle",
      price: PRICE,
      productKey: "inspirationVaultNightfangSet",
      tierKey: "default",
      sku: "IV-NIGHTFANG-SET",
      quantity: 1,
      image: HERO,
    }, 1, "Set of Two · Panther Ring & Panther Bangle");
  };

  return (
    <div className="nf-page" data-testid="nightfang-set-page">
      <LuxuryMotionStyles />
      <style>{`
        .nf-page { background:#0a0908; color:#e8e0cf; font-family:'Cormorant Garamond',serif; min-height:100vh; }
        .nf-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em;
          color:rgba(232,224,207,.55); text-decoration:none; text-transform:uppercase;
          transition:color 220ms ease,gap 220ms ease; }
        .nf-return:hover { color:#c8a24a; gap:16px; }
        .nf-wrap { max-width:1180px; margin:0 auto; padding:32px clamp(20px,4vw,60px) 120px; }
        .nf-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.6em;
          color:#c8a24a; text-transform:uppercase; margin:0 0 16px; text-align:center; }
        .nf-title { font-family:'Cinzel',serif; font-weight:500;
          font-size:clamp(36px,5.6vw,72px); letter-spacing:.16em; text-align:center;
          margin:0 0 12px; color:#f4ecd6; text-transform:uppercase; }
        .nf-subtitle { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(18px,2vw,26px); text-align:center; color:#c8a24a;
          margin:0 0 40px; }

        /* Vertical stack gallery */
        .nf-stack { max-width:900px; margin:0 auto 40px; display:flex; flex-direction:column; gap:clamp(18px,2.4vw,32px); }
        .nf-frame { position:relative; width:100%; aspect-ratio:1/1; background:#111;
          border:1px solid rgba(200,162,74,.22); display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .nf-frame img, .nf-frame video { width:100%; height:100%; object-fit:contain; object-position:center; display:block; background:#111; }
        .nf-frame-index { position:absolute; top:12px; left:14px; z-index:2;
          font-family:'Cinzel',serif; font-size:9px; letter-spacing:.32em;
          color:rgba(232,224,207,.55); background:rgba(10,9,8,.7);
          padding:5px 9px; border:1px solid rgba(200,162,74,.22);
          pointer-events:none; }
        .nf-frame-badge { position:absolute; top:12px; right:14px; z-index:2;
          font-family:'Cinzel',serif; font-size:9px; letter-spacing:.32em;
          color:#c8a24a; background:rgba(10,9,8,.7);
          padding:5px 9px; border:1px solid rgba(200,162,74,.4);
          pointer-events:none; }

        .nf-body { max-width:720px; margin:56px auto 0; text-align:center; }
        .nf-body h2 { font-family:'Playfair Display',serif; font-size:clamp(24px,3vw,36px);
          margin:0 0 20px; color:#f4ecd6; }
        .nf-body p { font-size:clamp(17px,1.5vw,20px); line-height:1.7; color:#d6cdb6; margin:0 0 16px; }
        .nf-material { display:block; max-width:600px; margin:24px auto 0;
          font-family:'Cormorant Garamond',serif; font-size:15px; letter-spacing:.08em;
          color:rgba(232,224,207,.7); }
        .nf-includes { display:inline-block; margin-top:24px; padding:12px 26px;
          border:1px solid rgba(200,162,74,.35);
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.34em;
          color:#c8a24a; text-transform:uppercase; }
        .nf-notice { max-width:640px; margin:44px auto 0; text-align:center;
          font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:15px; color:rgba(232,224,207,.55); line-height:1.6; }
        .nf-cta { text-align:center; max-width:520px; margin:56px auto 0;
          padding-top:44px; border-top:1px solid rgba(200,162,74,.18); }
        .nf-price { font-family:'Cinzel',serif; font-size:clamp(22px,2.4vw,32px);
          letter-spacing:.28em; color:#f4ecd6; margin:0 0 8px; }
        .nf-price-note { font-family:'Cormorant Garamond',serif; font-style:italic;
          font-size:14px; letter-spacing:.06em; color:rgba(232,224,207,.55); margin:0 0 26px; }
        .nf-add-btn { display:inline-flex; align-items:center; justify-content:center;
          padding:18px 64px; border:1.5px solid #c8a24a; background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:#f4ecd6; text-transform:uppercase; cursor:pointer;
          transition:background 320ms ease,color 320ms ease,transform 220ms ease; }
        .nf-add-btn:hover:not(:disabled) { background:#c8a24a; color:#0a0908; transform:translateY(-2px); }
        .nf-add-btn:disabled { opacity:.6; cursor:wait; }
      `}</style>

      <Link to="/inspiration-vault?category=sets" className="nf-return" data-testid="nf-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <div className="nf-wrap">
        <p className="nf-eyebrow">Inspiration Vault · Sets</p>
        <h1 className="nf-title" data-testid="nf-title">NIGHTFANG SET</h1>
        <p className="nf-subtitle">Panther Ring &amp; Bangle</p>

        <div className="nf-stack" data-testid="nf-gallery">
          {GALLERY.map((g, i) => (
            <figure
              key={i}
              className="nf-frame"
              data-testid={`nf-frame-${i + 1}`}
            >
              <span className="nf-frame-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {g.type === "video" ? (
                <>
                  <span className="nf-frame-badge" aria-hidden="true">FILM</span>
                  <video
                    src={g.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                    preload="metadata"
                    aria-label={g.alt}
                    data-testid={`nf-video-${i + 1}`}
                    ref={(v) => { if (v) { try { v.muted = true; v.defaultMuted = true; v.volume = 0; v.playsInline = true; v.play().catch(()=>{}); } catch(_e) { /* no-op */ } } }}
                  />
                </>
              ) : (
                <img
                  src={g.src}
                  alt={g.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  data-testid={`nf-image-${i + 1}`}
                />
              )}
            </figure>
          ))}
        </div>

        <div className="nf-body">
          <h2>A matched panther pairing, sealed in shadow.</h2>
          <p>
            NIGHTFANG enters as a matched panther ring and bangle set, finished
            in black enamel and covered in black synthetic stones. Green
            synthetic emerald eyes cut through the darkness, while the circular
            details connect both pieces through one unmistakable design
            language.
          </p>
          <p>
            <em>Created to be worn together. Sold only as a complete set.</em>
          </p>
          <span className="nf-material" data-testid="nf-material">
            Black Enamel-Finished Metal · Black Synthetic Stones · Green Synthetic Emerald Eyes
          </span>
          <p className="nf-includes" data-testid="nf-includes">Includes One Ring + One Bangle</p>
        </div>

        <p className="nf-notice" data-testid="nf-notice">
          Part of the PHILEON Inspiration Vault. Crafted in enamel-finished
          metal with synthetic stones. This set is not part of the PHILEON Fine
          Jewelry collection.
        </p>

        <div className="nf-cta" data-testid="nf-cta">
          <p className="nf-price" data-testid="nf-price">${PRICE} USD</p>
          <p className="nf-price-note">Inspiration Vault · Set of Two</p>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="nf-add-btn"
            aria-label="Add NIGHTFANG SET to cart"
            data-testid="nf-add-to-cart"
          >
            {buttonText || "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
}
