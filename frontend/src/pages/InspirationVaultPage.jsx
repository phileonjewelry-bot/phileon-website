import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";

// ────────────────────────────────────────────────────────────────────────────────
// VAULT MANIFEST — single source of truth for the archive index.
// Future Inspiration Vault pieces append HERE, newest first.
// The index auto-renders any piece with: title · subtitle · price · href ·
//   posterImage · heroVideo? (optional · falls back to posterImage when absent).
// No layout changes required for new releases.
// ────────────────────────────────────────────────────────────────────────────────
const VAULT_PIECES = [
  {
    slug: "noir-tide",
    title: "Noir Tide",
    subtitle: "Black & White Pavé Sculptural Earrings",
    price: 100,
    href: "/noir-tide",
    heroVideo: null,
    posterImage: "/inspiration-vault/noir-tide/hero.jpg",
    releasedAt: "2026-02-15",
  },
  {
    slug: "liaison",
    title: "Liaison",
    subtitle: "Infinity Link Earrings",
    price: 50,
    href: "/liaison",
    heroVideo: null,
    posterImage: "/inspiration-vault/liaison/hero.jpg",
    releasedAt: "2026-02-14",
  },
  {
    slug: "noir-cadence",
    title: "Noir Cadence",
    subtitle: "Black Stone Pavé-Set Hoop Earrings",
    price: 100,
    href: "/noir-cadence",
    heroVideo: "/inspiration-vault/noir-cadence/hero-video.mp4",
    posterImage: "/inspiration-vault/noir-cadence/hero.jpg",
    releasedAt: "2026-02-13",
  },
  {
    slug: "first-discovery",
    title: "Prima Wave",
    subtitle: "Rose Gold Vermeil Earrings",
    price: 75,
    href: "/prima-wave",
    heroVideo: null, // No video yet — gracefully falls back to poster image
    posterImage: "/inspiration-vault/first-discovery/hero.jpg",
    releasedAt: "2026-02-12",
  },
];

export default function InspirationVaultPage() {
  useEffect(() => {
    document.title = "INSPIRATION VAULT — The Archive · PHILEON";
  }, []);

  // Sort newest first by released date — future-proof for chronological appends
  const pieces = [...VAULT_PIECES].sort((a, b) => (a.releasedAt < b.releasedAt ? 1 : -1));

  return (
    <div className="iv-index" data-testid="inspiration-vault-index">
      <style>{`
        .iv-index {
          --bg:#050505;--bg-soft:#0a0908;--ink:#cfc8be;--ink-strong:#f4ede0;
          --ink-muted:#7a716a;--gold:#c8a24a;--gold-deep:#8b7339;
          --rule:rgba(200,162,74,.34);--rule-soft:rgba(200,162,74,.12);
          background:var(--bg);color:var(--ink);
          font-family:'Cormorant Garamond',serif;min-height:100vh;overflow-x:hidden;
        }
        .iv-index .iv-return {
          display:inline-flex;align-items:center;gap:10px;padding:18px 26px;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-muted);text-decoration:none;text-transform:uppercase;
          transition:color 280ms ease,gap 280ms ease;
        }
        .iv-index .iv-return:hover { color:var(--gold);gap:16px; }
        .iv-eyebrow {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.48em;
          color:var(--gold);text-transform:uppercase;margin:0 0 24px;
        }
        /* HERO — museum entrance */
        .iv-hero {
          position:relative;text-align:center;
          padding:clamp(100px,12vw,200px) clamp(20px,4vw,60px) clamp(80px,10vw,160px);
          max-width:1080px;margin:0 auto;
          opacity:0;transform:translateY(20px);
          animation:ivFade 1.2s cubic-bezier(.22,.61,.36,1) forwards;
        }
        .iv-hero::before {
          content:'';position:absolute;left:50%;top:30%;
          width:880px;height:880px;transform:translateX(-50%);
          background:radial-gradient(50% 50% at 50% 50%,rgba(200,162,74,.10) 0%,transparent 70%);
          filter:blur(70px);pointer-events:none;z-index:0;
        }
        .iv-hero > * { position:relative;z-index:1; }
        @keyframes ivFade { to { opacity:1;transform:translateY(0); } }
        .iv-h1 {
          font-family:'Playfair Display',serif;font-weight:400;
          font-size:clamp(48px,7vw,104px);line-height:1.0;letter-spacing:.012em;
          color:var(--ink-strong);margin:0 0 44px;
        }
        .iv-h1 em { font-style:italic;color:var(--gold); }
        .iv-hero-body p {
          font-family:'Cormorant Garamond',serif;font-size:clamp(19px,1.55vw,24px);
          line-height:1.78;color:var(--ink);margin:0 auto 14px;max-width:680px;
        }
        .iv-hero-body p.lead {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(22px,2.2vw,28px);color:var(--gold);margin-bottom:28px;
        }
        .iv-hero-tag {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--ink-muted);text-transform:uppercase;margin-top:40px;line-height:2;
        }

        /* DIVIDER */
        .iv-divider {
          display:flex;align-items:center;justify-content:center;gap:30px;
          max-width:1080px;margin:0 auto;padding:0 clamp(20px,4vw,60px) 60px;
          opacity:0;animation:ivFade 1s ease .25s forwards;
        }
        .iv-divider-rule {
          flex:1;height:1px;
          background:linear-gradient(90deg,transparent 0%,var(--gold) 50%,transparent 100%);
          opacity:.5;
        }
        .iv-divider-label {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5em;
          color:var(--gold);text-transform:uppercase;white-space:nowrap;
        }

        /* COLLECTION GRID */
        .iv-collection {
          max-width:1400px;margin:0 auto;
          padding:clamp(40px,5vw,80px) clamp(20px,4vw,60px) clamp(120px,12vw,200px);
          display:grid;grid-template-columns:1fr;gap:clamp(80px,10vw,160px);
        }

        /* CARD */
        .iv-card {
          display:block;text-decoration:none;color:inherit;
          opacity:0;transform:translateY(28px);
          animation:ivFade 1.1s cubic-bezier(.22,.61,.36,1) forwards;
        }
        .iv-card.idx-1 { animation-delay:.42s; }
        .iv-card.idx-2 { animation-delay:.58s; }
        .iv-card.idx-3 { animation-delay:.74s; }
        .iv-card.idx-4 { animation-delay:.9s; }
        .iv-card-media {
          position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;
          background:#020100;border:1px solid var(--rule-soft);
          transition:box-shadow 700ms ease;
        }
        .iv-card:hover .iv-card-media {
          box-shadow:0 40px 100px -32px rgba(200,162,74,.4),0 0 0 1px var(--rule);
        }
        .iv-card-video,
        .iv-card-img {
          position:relative;z-index:1;width:100%;height:100%;object-fit:cover;
          object-position:center;display:block;
          transition:transform .7s ease;
          pointer-events:none;
        }
        .iv-card:hover .iv-card-video,
        .iv-card:hover .iv-card-img { transform:scale(1.03); }
        .iv-card-media::after {
          content:'';position:absolute;inset:-40px;
          background:radial-gradient(60% 60% at 50% 50%,rgba(200,162,74,.0) 0%,transparent 70%);
          z-index:0;filter:blur(50px);pointer-events:none;
          transition:background 700ms ease;
        }
        .iv-card:hover .iv-card-media::after {
          background:radial-gradient(60% 60% at 50% 50%,rgba(200,162,74,.28) 0%,transparent 70%);
        }
        .iv-card-meta {
          display:grid;grid-template-columns:1fr auto;align-items:end;gap:24px;
          padding:32px clamp(8px,1vw,16px) 0;
        }
        .iv-card-title-block .iv-card-eyebrow {
          font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.46em;
          color:var(--gold);text-transform:uppercase;margin:0 0 10px;
        }
        .iv-card-title {
          font-family:'Playfair Display',serif;font-weight:400;
          font-size:clamp(36px,4.6vw,64px);line-height:1.04;letter-spacing:.012em;
          color:var(--ink-strong);margin:0 0 10px;text-transform:uppercase;
          position:relative;display:inline-block;padding-bottom:8px;
        }
        .iv-card-title::after {
          content:'';position:absolute;left:0;bottom:0;
          height:1px;width:0;background:var(--gold);
          transition:width .7s cubic-bezier(.22,.61,.36,1);
        }
        .iv-card:hover .iv-card-title::after { width:100%; }
        .iv-card-subtitle {
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:clamp(18px,1.7vw,22px);color:var(--ink-muted);margin:0;
        }
        .iv-card-side {
          text-align:right;
          display:flex;flex-direction:column;align-items:flex-end;gap:18px;
        }
        .iv-card-price {
          font-family:'Cinzel',serif;font-size:14px;letter-spacing:.32em;
          color:var(--ink-strong);
        }
        .iv-card-cta {
          display:inline-flex;align-items:center;gap:10px;
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.42em;
          color:var(--gold);text-transform:uppercase;
          opacity:0;transform:translateX(-6px);
          transition:opacity .55s ease,transform .55s ease,gap .35s ease;
        }
        .iv-card:hover .iv-card-cta { opacity:1;transform:translateX(0);gap:16px; }

        @media (max-width:680px){
          .iv-card-meta { grid-template-columns:1fr;gap:18px;padding-top:24px; }
          .iv-card-side { text-align:left;align-items:flex-start; }
        }

        /* FINAL QUOTE */
        .iv-quote {
          text-align:center;padding:clamp(100px,12vw,180px) clamp(20px,4vw,60px);
          border-top:1px solid var(--rule-soft);background:#020100;
        }
        .iv-quote-text {
          font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
          font-size:clamp(22px,2.6vw,34px);line-height:1.5;color:var(--gold);
          max-width:780px;margin:0 auto 22px;
        }
        .iv-quote-attr {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.46em;
          color:var(--ink-muted);text-transform:uppercase;
        }

        @media (prefers-reduced-motion: reduce){
          .iv-hero,.iv-divider,.iv-card { animation:none !important;transform:none !important;opacity:1 !important; }
          .iv-card:hover .iv-card-video,.iv-card:hover .iv-card-img { transform:none; }
        }
      `}</style>

      <Link to="/" className="iv-return" data-testid="iv-index-return">
        <ArrowLeft size={14} /> RETURN
      </Link>

      {/* HERO */}
      <section className="iv-hero" data-testid="iv-index-hero">
        <p className="iv-eyebrow" data-testid="iv-index-eyebrow">Inspiration Vault</p>
        <h1 className="iv-h1" data-testid="iv-index-title">
          The Archive Is <em>Growing.</em>
        </h1>
        <div className="iv-hero-body">
          <p>The Inspiration Vault houses hand-picked pieces discovered while traveling through China, Tokyo, Greece, Dubai, Italy, Paris, and beyond.</p>
          <p className="lead">None of these are PHILEON creations.</p>
          <p>They&rsquo;re the pieces that inspired mine.</p>
          <p>Instead of collecting dust on a shelf, they&rsquo;re being released to inspire someone else&mdash;or to become the perfect finishing touch to an already amazing outfit.</p>
        </div>
        <p className="iv-hero-tag">No countdowns. &nbsp;·&nbsp; No pressure. &nbsp;·&nbsp; Just inspiration.</p>
      </section>

      {/* DIVIDER */}
      <div className="iv-divider" aria-hidden="true">
        <span className="iv-divider-rule"></span>
        <span className="iv-divider-label">The Collection</span>
        <span className="iv-divider-rule"></span>
      </div>

      {/* COLLECTION */}
      <section className="iv-collection" data-testid="iv-collection">
        {pieces.map((piece, idx) => (
          <Link
            key={piece.slug}
            to={piece.href}
            className={`iv-card idx-${idx + 1}`}
            data-testid={`iv-card-${piece.slug}`}
            aria-label={`Enter ${piece.title} piece`}
          >
            <div className="iv-card-media">
              {piece.heroVideo ? (
                <video
                  src={piece.heroVideo}
                  className="iv-card-video"
                  data-testid={`iv-card-${piece.slug}-video`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  controls={false}
                  poster={piece.posterImage}
                  aria-hidden="true"
                  onLoadedMetadata={(e) => { e.currentTarget.play().catch(() => {}); }}
                />
              ) : (
                <img
                  src={piece.posterImage}
                  alt={`${piece.title} — ${piece.subtitle}`}
                  className="iv-card-img"
                  loading="lazy"
                  data-testid={`iv-card-${piece.slug}-img`}
                />
              )}
            </div>
            <div className="iv-card-meta">
              <div className="iv-card-title-block">
                <p className="iv-card-eyebrow">Inspiration Vault</p>
                <h2 className="iv-card-title" data-testid={`iv-card-${piece.slug}-title`}>{piece.title}</h2>
                <p className="iv-card-subtitle">{piece.subtitle}</p>
              </div>
              <div className="iv-card-side">
                <span className="iv-card-price" data-testid={`iv-card-${piece.slug}-price`}>${piece.price} USD</span>
                <span className="iv-card-cta">Enter Piece <ArrowRight size={14} aria-hidden="true" /></span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* BOTTOM QUOTE */}
      <section className="iv-quote" data-testid="iv-index-quote">
        <p className="iv-quote-text">“The archive grows one idea at a time.”</p>
        <p className="iv-quote-attr">— PHILEON</p>
      </section>
    </div>
  );
}
