import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

// ────────────────────────────────────────────────────────────────────────────────
// VAULT MANIFEST — single source of truth for the archive index.
// Future Inspiration Vault pieces append HERE, newest first.
// The index auto-renders any piece with: title · subtitle · price · href ·
//   posterImage · heroVideo? (optional · falls back to posterImage when absent) ·
//   category (one of: "Earrings", "Rings", "Bangles & Bracelets",
//   "Pendants & Necklaces").
// No layout changes required for new releases.
// ────────────────────────────────────────────────────────────────────────────────
const VAULT_PIECES = [
  {
    slug: "altar",
    title: "ALTAR",
    subtitle: "Architectural Cross Cuff",
    price: 40,
    href: "/altar",
    heroVideo: "/inspiration-vault/altar/hero-film.mp4",
    posterImage: "/inspiration-vault/altar/lifestyle-desk.jpg",
    releasedAt: "2026-07-10",
    category: "Bangles & Bracelets",
  },
  {
    slug: "roseline",
    title: "ROSELINE",
    subtitle: "Rose-Gold Pavé Safety-Pin Cuff Bangle",
    price: 50,
    href: "/roseline",
    heroVideo: "/inspiration-vault/roseline/hero-film.mp4",
    posterImage: "/inspiration-vault/roseline/hero-still.jpg",
    releasedAt: "2026-07-09",
    category: "Bangles & Bracelets",
  },
  {
    slug: "lucent",
    title: "LUCENT",
    subtitle: "Articulated Pavé Chain-Link Hoop Earrings",
    price: 70,
    href: "/lucent",
    heroVideo: "/inspiration-vault/lucent/hero-film.mp4",
    posterImage: "/inspiration-vault/lucent/still-02-pair.jpg",
    releasedAt: "2026-07-07",
    category: "Earrings",
  },
  {
    slug: "echelle",
    title: "ÉCHELLE",
    subtitle: "Architectural Three-Tone Gold Ribbon Hoops",
    price: 115,
    href: "/echelle",
    heroVideo: "/inspiration-vault/echelle/hero-square.mp4",
    posterImage: "/inspiration-vault/echelle/still-01-bust.jpg",
    releasedAt: "2026-07-06",
    category: "Earrings",
  },
  {
    slug: "parabola-atelier",
    title: "PARABOLA ATELIER",
    subtitle: "Architectural Concave Study · The Idea Before the Icon",
    price: 100,
    href: "/parabola-atelier",
    heroVideo: "/inspiration-vault/parabola-atelier/hero-film.mp4",
    posterImage: "/inspiration-vault/parabola-atelier/still-01-topdown.jpg",
    releasedAt: "2026-07-05",
    category: "Rings",
  },
  {
    slug: "deco-eventail",
    title: "Deco Éventail",
    subtitle: "Art Deco Fan Cocktail Ring",
    price: 60,
    href: "/deco-eventail",
    heroVideo: "/inspiration-vault/deco-eventail/hero.mp4",
    posterImage: "/inspiration-vault/deco-eventail/hero.jpg",
    releasedAt: "2026-07-01",
    category: "Rings",
  },
  {
    slug: "orbit-lumiere",
    title: "Orbit Lumière",
    subtitle: "Oversized Architectural Pavé Hoop Earrings",
    price: 175,
    href: "/orbit-lumiere",
    heroVideo: null,
    posterImage: "/inspiration-vault/orbit-lumiere/hero.jpg",
    releasedAt: "2026-06-30",
    category: "Earrings",
  },
  {
    slug: "viridian-teardrops",
    title: "Viridian Teardrops",
    subtitle: "Emerald Pavé Pear-Cut Drop Earrings",
    price: 120,
    href: "/viridian-teardrops",
    heroVideo: "/inspiration-vault/viridian-teardrops/hero-video.mp4",
    posterImage: "/inspiration-vault/viridian-teardrops/hero.jpg",
    releasedAt: "2026-02-17",
    category: "Earrings",
  },
  {
    slug: "prismatic-laurel",
    title: "Prismatic Laurel",
    subtitle: "Multicolour Emerald-Cut Sculptural Earrings",
    price: 70,
    href: "/prismatic-laurel",
    heroVideo: "/inspiration-vault/prismatic-laurel/hero-video.mp4",
    posterImage: "/inspiration-vault/prismatic-laurel/hero.jpg",
    releasedAt: "2026-02-16",
    category: "Earrings",
  },
  {
    slug: "noir-tide",
    title: "Noir Tide",
    subtitle: "Black & White Pavé Sculptural Earrings",
    price: 100,
    href: "/noir-tide",
    heroVideo: null,
    posterImage: "/inspiration-vault/noir-tide/hero.jpg",
    releasedAt: "2026-02-15",
    category: "Earrings",
  },
  {
    slug: "liaison",
    title: "Liaison",
    subtitle: "Infinity Link Earrings",
    price: 50,
    href: "/liaison",
    heroVideo: "/inspiration-vault/liaison/hero-video.mp4",
    posterImage: "/inspiration-vault/liaison/hero.jpg",
    releasedAt: "2026-02-14",
    category: "Earrings",
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
    category: "Earrings",
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
    category: "Earrings",
  },
];

// Fixed display order — drives the "EXPLORE THE ARCHIVE" pill nav.
const CATEGORIES = ["All", "Earrings", "Rings", "Bangles & Bracelets", "Pendants & Necklaces"];

export default function InspirationVaultPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  useLuxuryMotionObserver([activeCategory]);

  useEffect(() => {
    document.title = "INSPIRATION VAULT — The Archive · PHILEON";
  }, []);

  // Sort newest-first, then filter by category. Memoised so the fade animation
  // only re-runs when the user explicitly toggles a pill.
  const pieces = useMemo(() => {
    const sorted = [...VAULT_PIECES].sort((a, b) => (a.releasedAt < b.releasedAt ? 1 : -1));
    if (activeCategory === "All") return sorted;
    return sorted.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="iv-index" data-testid="inspiration-vault-index">
      <LuxuryMotionStyles />
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
        .iv-hero-signature {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.18em;
          color:var(--gold);text-align:center;margin:1.5rem auto 0;
          font-weight:400;font-style:normal;
        }
        .iv-hero-price-range {
          display:inline-flex;align-items:center;gap:10px;
          margin:1.25rem auto 0;padding:7px 16px;
          border:1px solid rgba(200,162,74,.32);
          font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.42em;
          color:rgba(200,162,74,.78);text-transform:uppercase;
          background:rgba(0,0,0,.35);
        }
        .iv-hero-price-range::before {
          content:'';width:5px;height:5px;border-radius:50%;
          background:var(--gold);box-shadow:0 0 8px rgba(200,162,74,.55);
        }

        /* CATEGORY NAV — "EXPLORE THE ARCHIVE" */
        .iv-category-nav {
          max-width:1180px;margin:0 auto;
          padding:clamp(40px,5vw,72px) clamp(20px,4vw,60px) clamp(20px,3vw,40px);
          text-align:center;
          opacity:0;animation:ivFade 1s ease .35s forwards;
        }
        .iv-category-title {
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.5em;
          color:var(--gold);text-transform:uppercase;margin:0 0 26px;
        }
        .iv-category-pills {
          display:inline-flex;flex-wrap:wrap;justify-content:center;
          gap:clamp(10px,1vw,14px);max-width:920px;
        }
        .iv-category-pill {
          appearance:none;cursor:pointer;
          padding:12px 24px;
          background:#000;border:1px solid var(--rule);
          color:var(--ink);
          font-family:'Cinzel',serif;font-size:11px;letter-spacing:.32em;
          text-transform:uppercase;
          transition:background 380ms ease,color 380ms ease,border-color 380ms ease,
            box-shadow 380ms ease,transform 240ms ease;
        }
        .iv-category-pill:hover {
          color:var(--gold);
          border-color:var(--gold);
          box-shadow:0 0 24px -4px rgba(200,162,74,.45),inset 0 0 24px -8px rgba(200,162,74,.18);
        }
        .iv-category-pill.is-active {
          background:var(--gold);
          color:#050505;
          border-color:var(--gold);
          box-shadow:0 0 30px -6px rgba(200,162,74,.6);
        }
        .iv-category-pill.is-active:hover { transform:translateY(-1px); }
        @media (max-width:640px){
          .iv-category-pill { padding:10px 16px;font-size:10px;letter-spacing:.26em; }
        }

        /* COLLECTION fade — re-trigger on filter change */
        .iv-collection-fade {
          animation:ivCollectionFade .55s cubic-bezier(.22,.61,.36,1) both;
        }
        @keyframes ivCollectionFade {
          from { opacity:0;transform:translateY(12px); }
          to   { opacity:1;transform:translateY(0); }
        }
        .iv-empty {
          grid-column:1 / -1;text-align:center;padding:80px 20px;
          font-family:'Playfair Display',serif;font-style:italic;
          color:var(--ink-muted);font-size:clamp(20px,2vw,26px);line-height:1.6;
        }
        .iv-empty-note {
          display:block;margin-top:14px;
          font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:.42em;
          color:var(--gold-deep);text-transform:uppercase;font-style:normal;
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
        }
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
        /* EDITORIAL FILM badge — only on cards with motion/video assets */
        .iv-card-film-badge {
          position:absolute;top:14px;right:14px;z-index:3;
          display:inline-flex;align-items:center;gap:7px;
          padding:6px 10px 6px 9px;
          background:rgba(0,0,0,.55);
          border:1px solid rgba(200,162,74,.45);
          backdrop-filter:blur(6px);
          -webkit-backdrop-filter:blur(6px);
          font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:.32em;
          color:var(--gold);text-transform:uppercase;
          opacity:.62;
          transition:opacity 420ms ease,border-color 420ms ease,background 420ms ease;
          pointer-events:none;
        }
        .iv-card:hover .iv-card-film-badge {
          opacity:1;
          border-color:rgba(200,162,74,.85);
          background:rgba(0,0,0,.7);
        }
        .iv-card-film-glyph {
          width:7px;height:8px;
          clip-path:polygon(0 0,100% 50%,0 100%);
          background:var(--gold);
          flex-shrink:0;
        }
        @media (max-width:520px){
          .iv-card-film-badge { font-size:8.5px;padding:5px 8px;letter-spacing:.28em; }
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
        .iv-card-price-block {
          display:flex;flex-direction:column;align-items:flex-end;gap:6px;
        }
        .iv-card-archive-tag {
          font-family:'Cinzel',serif;font-size:9px;letter-spacing:.42em;
          color:var(--gold);text-transform:uppercase;opacity:.55;
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
          .iv-card-price-block { align-items:flex-start; }
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
          .iv-hero,.iv-divider { animation:none !important;transform:none !important;opacity:1 !important; }
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
        <p className="iv-hero-signature" data-testid="iv-curator-signature">— Curated by Phill Wilson</p>
        <div style={{ textAlign:'center' }}>
          <span className="iv-hero-price-range" data-testid="iv-vault-price-range">
            {(() => {
              const prices = VAULT_PIECES.map((p) => p.price).filter((n) => typeof n === 'number');
              if (!prices.length) return null;
              const min = Math.min(...prices);
              const max = Math.ceil(Math.max(...prices) / 25) * 25;
              return `Vault Range · $${min} – $${max} USD`;
            })()}
          </span>
        </div>
        <p className="iv-hero-tag">No countdowns. &nbsp;·&nbsp; No pressure. &nbsp;·&nbsp; Just inspiration.</p>
      </section>

      {/* CATEGORY NAVIGATION — drives the archive filter */}
      <section className="iv-category-nav" data-testid="iv-category-nav" aria-label="Explore the archive by category">
        <p className="iv-category-title">Explore the Archive</p>
        <div className="iv-category-pills" role="tablist">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const slug = cat.toLowerCase().replace(/\s*&\s*/g, "-and-").replace(/\s+/g, "-");
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={`iv-category-pill ${isActive ? 'is-active' : ''}`}
                data-testid={`iv-category-pill-${slug}`}
                data-active={isActive}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="iv-divider" aria-hidden="true">
        <span className="iv-divider-rule"></span>
        <span className="iv-divider-label">The Collection</span>
        <span className="iv-divider-rule"></span>
      </div>

      {/* COLLECTION */}
      <section className="iv-collection iv-collection-fade" key={activeCategory} data-testid="iv-collection" data-active-category={activeCategory}>
        {pieces.length === 0 ? (
          <p className="iv-empty" data-testid="iv-empty-state">
            The archive is quiet here — for now.
            <span className="iv-empty-note">More pieces arriving soon</span>
          </p>
        ) : pieces.map((piece, idx) => (
          <Link
            key={piece.slug}
            to={piece.href}
            className={`iv-card lm-cell-reveal lm-stagger-${(idx % 9) + 1}`}
            data-testid={`iv-card-${piece.slug}`}
            aria-label={`Enter ${piece.title} piece`}
          >
            <div className="iv-card-media">
              {/* Vault index cards are ALWAYS static images.
                  heroVideo is reserved for the product detail page hero. */}
              <img
                src={piece.posterImage}
                alt={`${piece.title} — ${piece.subtitle}`}
                className="iv-card-img"
                loading="lazy"
                data-testid={`iv-card-${piece.slug}-img`}
              />
              {/* Editorial-Film overlay intentionally removed — the Inspiration
                  Vault index is image-first. Motion assets live on the
                  individual product page only. */}
            </div>
            <div className="iv-card-meta">
              <div className="iv-card-title-block">
                <p className="iv-card-eyebrow">Inspiration Vault</p>
                <h2 className="iv-card-title" data-testid={`iv-card-${piece.slug}-title`}>{piece.title}</h2>
                <p className="iv-card-subtitle">{piece.subtitle}</p>
              </div>
              <div className="iv-card-side">
                <div className="iv-card-price-block">
                  <span className="iv-card-price" data-testid={`iv-card-${piece.slug}-price`}>${piece.price} USD</span>
                  <span className="iv-card-archive-tag" data-testid={`iv-card-${piece.slug}-archive-tag`}>Archive Piece</span>
                </div>
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
