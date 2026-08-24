import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddToCart } from "@/hooks/useAddToCart";
import VaultHero from "@/components/VaultHero";
import VaultArchiveNotice from "@/components/VaultArchiveNotice";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

// GOLDEN HOUR CUFFS — Inspiration Vault · $90 USD · Gold Vermeil
// Ornate Dubai-style stacked cuff set. Vault-only archive; not in Fine
// Jewelry, The Collective, Ladies, Gentleman's Club, or trusted checkout.

const ART = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts";
const HERO   = `${ART}/jiq8mpbd_1000172722.jpg`; // dramatic dark-bg stacked hero
const IMG_2  = `${ART}/atbbdsk0_1000172719.jpg`; // overhead study
const IMG_3  = `${ART}/5i21514l_1000172720.jpg`; // nested profile
const IMG_4  = `${ART}/160hkaji_1000172721.jpg`; // construction / open view
const IMG_5  = `${ART}/0r7y839o_1000172718.jpg`; // filigree macro
const PRICE = 90;

const GALLERY = [
  { src: HERO,  alt: "GOLDEN HOUR CUFFS — dramatic stacked hero, warm gold vermeil on dark reflective surface." },
  { src: IMG_2, alt: "GOLDEN HOUR CUFFS — overhead study revealing sculptural wave silhouette and ornate filigree." },
  { src: IMG_3, alt: "GOLDEN HOUR CUFFS — nested side-profile view of the stacked set." },
  { src: IMG_4, alt: "GOLDEN HOUR CUFFS — construction view showing the open cuff shape and pierced botanical detail." },
  { src: IMG_5, alt: "GOLDEN HOUR CUFFS — filigree macro of the leaf-inspired motifs and granulated texture." },
];

export default function GoldenHourCuffsPage() {
  const { isAdding, handleAddToCart, buttonText } = useAddToCart();
  useLuxuryMotionObserver();

  useEffect(() => {
    document.title = "Golden Hour Cuffs | PHILEON Inspiration Vault";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", "Golden Hour Cuffs by PHILEON — Dubai-style gold-vermeil cuffs with sculptural wave forms, ornate filigree and botanical detailing. $90 USD.");
    if (!meta.parentNode) document.head.appendChild(meta);
  }, []);

  const onAddToCart = () => {
    handleAddToCart({
      id: "inspiration-vault-golden-hour-cuffs",
      name: "GOLDEN HOUR CUFFS — Dubai-Style Cuff Set",
      price: PRICE,
      productKey: "inspirationVaultGoldenHourCuffs",
      tierKey: "default",
      metal: "Gold Vermeil",
      sku: "IV-GHC-CUFF",
      quantity: 1,
      image: HERO,
    }, 1, "Gold Vermeil");
  };

  return (
    <div className="ghc-page" data-testid="golden-hour-cuffs-page">
      <LuxuryMotionStyles />
      <style>{`
        .ghc-page { --bg:#050505; --bg-deep:#020202; --ink:#cfc8be; --ink-strong:#f4ede0;
          --ink-muted:#7a716a; --gold:#c8a24a; --rule-soft:rgba(200,162,74,.12);
          background:linear-gradient(180deg,var(--bg-deep) 0%,var(--bg) 60%,#000 100%);
          color:var(--ink); font-family:'Cormorant Garamond',serif; min-height:100vh; overflow-x:hidden;
        }
        .ghc-return { display:inline-flex; align-items:center; gap:10px; padding:18px 26px;
          font-family:'Cinzel',serif; font-size:11px; letter-spacing:.42em; color:var(--ink-muted);
          text-decoration:none; text-transform:uppercase; transition:color 280ms ease,gap 280ms ease; }
        .ghc-return:hover { color:var(--gold); gap:16px; }
        .ghc-eyebrow { font-family:'Cinzel',serif; font-size:11px; letter-spacing:.46em;
          color:var(--gold); text-transform:uppercase; margin:0 0 18px; }
        .ghc-section { max-width:1180px; margin:0 auto; padding:clamp(56px,7vw,110px) clamp(20px,4vw,60px); }
        .ghc-desc { text-align:center; }
        .ghc-desc p { font-size:clamp(18px,1.5vw,22px); line-height:1.7; color:var(--ink);
          margin:0 auto 16px; max-width:720px; }
        .ghc-desc p.lead { font-family:'Playfair Display',serif; font-style:italic;
          font-size:clamp(22px,2.2vw,30px); color:var(--gold); margin-bottom:24px; }
        .ghc-h2 { font-family:'Playfair Display',serif; font-weight:400; font-size:clamp(28px,3.4vw,44px);
          color:var(--ink-strong); margin:0 0 24px; text-transform:uppercase; letter-spacing:.02em; text-align:center; }
        .ghc-cta { text-align:center; }
        .ghc-price { font-family:'Cinzel',serif; font-size:22px; letter-spacing:.32em;
          color:var(--ink-strong); margin:0 0 10px; }
        .ghc-note { font-style:italic; font-size:15px; color:var(--ink-muted); margin:0 0 24px; }
        .ghc-add-btn { display:inline-flex; align-items:center; justify-content:center; gap:12px;
          padding:18px 56px; border:1.5px solid var(--gold); background:transparent;
          font-family:'Cinzel',serif; font-size:12px; letter-spacing:.42em;
          color:var(--gold); text-transform:uppercase; cursor:pointer;
          transition:background 380ms ease,color 380ms ease,transform 280ms ease; }
        .ghc-add-btn:hover { background:var(--gold); color:var(--bg-deep); transform:translateY(-2px); }
        .ghc-add-btn:disabled { opacity:.6; cursor:wait; }
        .ghc-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(14px,1.8vw,22px); margin-top:32px; }
        .ghc-cell { aspect-ratio:1/1; overflow:hidden; background:#050505;
          border:1px solid var(--rule-soft); }
        .ghc-cell.full { grid-column:1/-1; aspect-ratio:16/10; }
        .ghc-cell img { width:100%; height:100%; object-fit:contain; padding:3%; display:block;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1); }
        .ghc-cell:hover img { transform:scale(1.02); }
        @media (max-width:640px){
          .ghc-grid { grid-template-columns:1fr; }
          .ghc-cell.full { aspect-ratio:4/5; }
        }
        .ghc-list { list-style:none; padding:0; margin:0 auto; max-width:720px; }
        .ghc-list li { position:relative; padding:9px 0 9px 24px; font-size:17px; line-height:1.6; color:var(--ink); }
        .ghc-list li::before { content:''; position:absolute; left:0; top:18px; width:8px; height:1px; background:var(--gold); }
      `}</style>

      <Link to="/inspiration-vault" className="ghc-return" data-testid="ghc-return">
        <ArrowLeft size={14} /> RETURN TO VAULT
      </Link>

      <VaultHero
        image={HERO}
        prominent
        altText="GOLDEN HOUR CUFFS — dramatic stacked Dubai-style gold-vermeil cuffs on dark reflective surface."
        eyebrow="Inspiration Vault"
        title="GOLDEN HOUR CUFFS"
        subhead="Ornament turned architecture."
      />

      <section className="ghc-section ghc-desc" data-testid="ghc-desc">
        <p className="ghc-eyebrow">Editorial</p>
        <p className="lead">Dubai-Style Cuff Set · Gold Vermeil</p>
        <p>Golden Hour Cuffs capture the visual excess of Dubai-style gold ornament through sculpted waves, pierced filigree and repeating botanical detail. Layered together, the cuffs create a continuous field of warm gold — intricate up close, commanding from across the room.</p>
        <p>This is an Inspiration Vault piece: decorative, expressive and built for impact.</p>
      </section>

      <section className="ghc-section ghc-cta" data-testid="ghc-cta">
        <p className="ghc-eyebrow">Vault Access</p>
        <p className="ghc-price" data-testid="ghc-price">${PRICE} USD</p>
        <p className="ghc-note">Gold Vermeil · Dubai-Style Cuffs · Inspiration Vault</p>
        <button onClick={onAddToCart} disabled={isAdding} className="ghc-add-btn"
          data-testid="ghc-add-to-cart" aria-label="Add Golden Hour Cuffs Vault access to cart">
          {buttonText && buttonText !== "ADD TO CART" ? buttonText : "UNLOCK VAULT ACCESS"}
        </button>
      </section>

      <section className="ghc-section" data-testid="ghc-study">
        <p className="ghc-eyebrow" style={{ textAlign:"center" }}>Design Study</p>
        <h2 className="ghc-h2">A continuous field of warm gold.</h2>
        <ul className="ghc-list">
          <li>Warm gold-vermeil finish over sculptural silhouette</li>
          <li>Sculpted wave-shaped cuff profile</li>
          <li>Ornate open filigree construction with pierced geometric detail</li>
          <li>Repeating botanical / leaf-inspired motifs</li>
          <li>Intricate granulated texture across the surface</li>
          <li>Architectural centre sections for stacked impact</li>
          <li>Designed to stack together as a layered set</li>
        </ul>

        <div className="ghc-grid">
          {GALLERY.map((g, i) => (
            <div key={i} className={`ghc-cell ${i === 0 ? "full" : ""}`} data-testid={`ghc-cell-${i + 1}`}>
              <img src={g.src} alt={g.alt} loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
      </section>

      <VaultArchiveNotice />
    </div>
  );
}
