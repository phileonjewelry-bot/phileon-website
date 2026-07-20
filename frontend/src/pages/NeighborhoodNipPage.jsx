import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * NEIGHBORHOOD NIP — PHILEON Tribute Series
 *
 * A non-commercial tribute piece. This page is intentionally free of
 * commerce elements: NO price, NO ADD TO CART, NO INQUIRE, NO mailto,
 * NO "coming soon" or price-pending language.
 *
 * Color palette (STRICT — no gold, red, or orange):
 *   Midnight Asphalt  #03060C
 *   Deep Sapphire     #071B46
 *   Victory Blue      #123E8A
 *   Electric Sapphire #2D63C8
 *
 * Copy guardrails:
 *   No gang imagery, palm trees, graffiti fonts.
 *   No Nipsey Hussle or Marathon Clothing likeness / logos.
 *   Center motif is called "Victory Lap flag and N tribute motif."
 *
 * Hero:
 *   Static `hero-front.png` presented uncropped (object-fit: contain) on a
 *   Deep Sapphire panel. No text overlay on the image.
 *
 * Gallery:
 *   Component and styles are scaffolded below but NOT rendered until the
 *   full asset set arrives. Add images to the `GALLERY` array and remove
 *   the `GALLERY_LIVE = false` guard to publish.
 */

const HERO_IMAGE = "/tribute-series/neighborhood-nip/hero-front.png";

// Placeholder scaffold — DO NOT publish until the full asset set arrives.
// When ready, populate this array with the final ordered images and set
// GALLERY_LIVE = true. No visible placeholders in the meantime.
const GALLERY = [];
const GALLERY_LIVE = false;

export default function NeighborhoodNipPage() {
  useLuxuryMotionObserver();

  useEffect(() => {
    document.title = "NEIGHBORHOOD NIP | Tribute Series | PHILEON";
    const upsertMeta = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    upsertMeta("name", "description",
      "NEIGHBORHOOD NIP — an architectural tribute ring in blue, from the PHILEON Tribute Series. Independent tribute. Not for sale.");
    const ogImage = `${window.location.origin}${HERO_IMAGE}`;
    upsertMeta("property", "og:title",     "NEIGHBORHOOD NIP | Tribute Series | PHILEON");
    upsertMeta("property", "og:image",     ogImage);
    upsertMeta("property", "og:type",      "article");
    upsertMeta("name",     "twitter:card", "summary_large_image");
    upsertMeta("name",     "twitter:image", ogImage);
  }, []);

  return (
    <div className="nip-page" data-testid="neighborhood-nip-page">
      <LuxuryMotionStyles />
      <style>{`
        .nip-page {
          --asphalt:#03060C;
          --sapphire-deep:#071B46;
          --victory:#123E8A;
          --electric:#2D63C8;
          --ink:#c5d2ea;
          --ink-strong:#eef2fb;
          --ink-muted:#6a7ba0;
          --rule-soft:rgba(45,99,200,.16);
          --rule-strong:rgba(45,99,200,.34);
          background:
            radial-gradient(circle at 20% 0%, rgba(18,62,138,.18), transparent 55%),
            radial-gradient(circle at 80% 100%, rgba(45,99,200,.10), transparent 60%),
            linear-gradient(180deg, var(--asphalt) 0%, #05091a 60%, var(--asphalt) 100%);
          color:var(--ink);
          font-family:'Cormorant Garamond', serif;
          min-height:100vh;
          overflow-x:hidden;
        }

        .nip-return {
          display:inline-flex; align-items:center; gap:10px;
          padding:18px 26px;
          font-family:'Cinzel', serif; font-size:11px; letter-spacing:.42em;
          color:var(--ink-muted); text-decoration:none; text-transform:uppercase;
          transition:color 280ms ease, gap 280ms ease;
        }
        .nip-return:hover { color:var(--electric); gap:16px; }

        .nip-eyebrow {
          font-family:'Cinzel', serif; font-size:11px; letter-spacing:.5em;
          color:var(--electric); text-transform:uppercase; margin:0 0 18px;
        }

        .nip-section {
          max-width:1180px; margin:0 auto;
          padding:clamp(64px, 7vw, 120px) clamp(20px, 4vw, 60px);
          opacity:0; transform:translateY(20px);
          animation:nipFade 1s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes nipFade { to { opacity:1; transform:translateY(0); } }
        .nip-section.d1 { animation-delay:.12s; }
        .nip-section.d2 { animation-delay:.24s; }
        .nip-section.d3 { animation-delay:.36s; }
        .nip-section.d4 { animation-delay:.48s; }
        .nip-section.d5 { animation-delay:.60s; }

        /* ── HERO ─────────────────────────────────────────────────────── */
        .nip-hero-wrap {
          max-width:1180px; margin:clamp(12px, 2vw, 24px) auto 0;
          padding:0 clamp(20px, 4vw, 60px);
        }
        .nip-hero-panel {
          position:relative;
          width:100%;
          background:
            radial-gradient(circle at 50% 40%, rgba(45,99,200,.22), transparent 60%),
            linear-gradient(180deg, var(--sapphire-deep) 0%, #04102b 100%);
          border:1px solid var(--rule-strong);
          display:flex; align-items:center; justify-content:center;
          aspect-ratio:1 / 1;
          max-height:82vh;
        }
        .nip-hero-panel img {
          display:block;
          width:100%; height:100%;
          object-fit:contain; object-position:center;
        }
        .nip-hero-caption {
          max-width:1180px; margin:clamp(24px, 3vw, 42px) auto 0;
          padding:0 clamp(20px, 4vw, 60px);
          text-align:center;
        }
        .nip-hero-eyebrow {
          font-family:'Cinzel', serif; font-size:11px; letter-spacing:.6em;
          color:var(--electric); text-transform:uppercase; margin:0 0 18px;
        }
        .nip-hero-title {
          font-family:'Cinzel', serif; font-weight:500;
          font-size:clamp(30px, 5.6vw, 78px);
          letter-spacing:.16em; color:var(--ink-strong);
          margin:0 0 18px; text-transform:uppercase;
        }
        @media (max-width:420px){
          .nip-hero-title { font-size:28px; letter-spacing:.08em; }
        }
        .nip-hero-sub {
          font-family:'Playfair Display', serif; font-style:italic; font-weight:400;
          font-size:clamp(20px, 2vw, 28px);
          color:var(--electric); margin:0;
        }

        /* ── EDITORIAL BLOCKS ─────────────────────────────────────────── */
        .nip-h2 {
          font-family:'Playfair Display', serif; font-weight:400;
          font-size:clamp(30px, 4vw, 50px);
          line-height:1.05; color:var(--ink-strong);
          margin:0 0 28px; text-transform:uppercase; letter-spacing:.02em;
          text-align:center;
        }
        .nip-body {
          max-width:720px; margin:0 auto; text-align:center;
        }
        .nip-body p {
          font-family:'Cormorant Garamond', serif;
          font-size:clamp(19px, 1.55vw, 24px);
          line-height:1.75; color:var(--ink); margin:0 auto 18px;
        }
        .nip-body p.lead {
          font-family:'Playfair Display', serif; font-style:italic;
          font-size:clamp(22px, 2.2vw, 30px);
          color:var(--electric); margin-bottom:30px;
        }

        /* ── SPECS ────────────────────────────────────────────────────── */
        .nip-specs {
          background:linear-gradient(180deg, rgba(7,27,70,.55) 0%, rgba(3,6,12,.85) 100%);
          border-top:1px solid var(--rule-soft);
          border-bottom:1px solid var(--rule-soft);
        }
        .nip-specs-grid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:clamp(20px, 2.4vw, 36px) clamp(28px, 3.4vw, 56px);
          max-width:820px; margin:0 auto;
        }
        .nip-spec-row {
          display:flex; flex-direction:column; gap:6px;
          padding:14px 0;
          border-bottom:1px solid var(--rule-soft);
        }
        .nip-spec-label {
          font-family:'Cinzel', serif; font-size:10px; letter-spacing:.44em;
          color:var(--ink-muted); text-transform:uppercase;
        }
        .nip-spec-value {
          font-family:'Cormorant Garamond', serif; font-size:18px;
          color:var(--ink-strong); line-height:1.45;
        }
        @media (max-width:640px){
          .nip-specs-grid { grid-template-columns:1fr; }
        }

        /* ── TRIBUTE NOTICE ───────────────────────────────────────────── */
        .nip-notice {
          text-align:center;
          padding:clamp(64px, 7vw, 110px) clamp(20px, 4vw, 60px);
          background:var(--asphalt);
          border-top:1px solid var(--rule-strong);
        }
        .nip-notice-title {
          font-family:'Cinzel', serif; font-size:12px; letter-spacing:.5em;
          color:var(--electric); text-transform:uppercase; margin:0 0 22px;
        }
        .nip-notice-body {
          max-width:720px; margin:0 auto;
          font-family:'Cormorant Garamond', serif; font-style:italic;
          font-size:clamp(16px, 1.4vw, 20px);
          line-height:1.7; color:var(--ink-muted);
        }

        /* ── FINAL LINE ───────────────────────────────────────────────── */
        .nip-final {
          text-align:center;
          padding:clamp(80px, 9vw, 140px) clamp(20px, 4vw, 60px);
          background:#020408;
          border-top:1px solid var(--rule-soft);
        }
        .nip-final-line {
          font-family:'Playfair Display', serif; font-style:italic;
          font-size:clamp(24px, 2.8vw, 38px);
          line-height:1.55; color:var(--electric);
          max-width:760px; margin:0 auto;
        }
        .nip-final-attr {
          font-family:'Cinzel', serif; font-size:11px; letter-spacing:.46em;
          color:var(--ink-muted); text-transform:uppercase; margin-top:22px;
        }

        /* ── GALLERY (scaffold — visually hidden until GALLERY_LIVE) ──── */
        .nip-gallery {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:clamp(16px, 1.8vw, 24px);
          margin-top:36px;
        }
        .nip-gallery-cell {
          position:relative; width:100%; height:auto; min-height:0;
          overflow:hidden; background:var(--asphalt);
          border:1px solid var(--rule-soft);
          display:flex; align-items:center; justify-content:center;
        }
        .nip-gallery-cell img {
          display:block; width:100%; height:auto; max-height:80vh;
          object-fit:contain; object-position:center;
          background:var(--asphalt);
          transition:transform 900ms cubic-bezier(.22,.61,.36,1);
        }
        .nip-gallery-cell:hover img { transform:scale(1.02); }
        @media (max-width:768px){
          .nip-gallery { grid-template-columns:1fr; gap:20px; }
          .nip-gallery-cell img { max-height:none; }
        }

        @media (prefers-reduced-motion: reduce){
          .nip-section { animation:none; opacity:1; transform:none; }
          .nip-gallery-cell img { transition:none; }
          .nip-gallery-cell:hover img { transform:none; }
        }
      `}</style>

      <Link to="/tribute-series" className="nip-return" data-testid="nip-return">
        <ArrowLeft size={14} /> RETURN TO TRIBUTE SERIES
      </Link>

      {/* HERO — static, uncropped, no overlay text on image */}
      <div className="nip-hero-wrap" data-testid="nip-hero">
        <div className="nip-hero-panel">
          <img
            src={HERO_IMAGE}
            alt="NEIGHBORHOOD NIP tribute ring — front view. Architectural blue signet with a central Victory Lap flag and N tribute motif set against a deep sapphire panel."
            data-testid="nip-hero-image"
          />
        </div>
      </div>

      {/* HERO TYPOGRAPHY — beneath the image, per spec (no text on image) */}
      <div className="nip-hero-caption" data-testid="nip-hero-caption">
        <p className="nip-hero-eyebrow">PHILEON · Tribute Series</p>
        <h1 className="nip-hero-title" data-testid="nip-hero-title">NEIGHBORHOOD NIP</h1>
        <p className="nip-hero-sub">A blueprint carved in blue.</p>
      </div>

      {/* THE BLOCK BECAME THE BLUEPRINT */}
      <section className="nip-section d1" data-testid="nip-block-blueprint">
        <p className="nip-eyebrow" style={{ textAlign:"center" }}>I</p>
        <h2 className="nip-h2">The Block Became the Blueprint</h2>
        <div className="nip-body">
          <p className="lead">A street became a discipline. A discipline became a shape.</p>
          <p>NEIGHBORHOOD NIP is a signet drawn with architectural restraint. Its lines answer to a corner, a curb, a doorway &mdash; the ordinary geometry of a neighborhood taken seriously enough to be measured.</p>
          <p>Nothing about the piece is decorative. Each edge is a decision. Each surface is a plane held to a straight edge. The ring reads as a plan drawing set into metal &mdash; a blueprint you can wear.</p>
        </div>
      </section>

      {/* THE BLUE MEANS EVERYTHING */}
      <section className="nip-section d2" data-testid="nip-blue-means-everything">
        <p className="nip-eyebrow" style={{ textAlign:"center" }}>II</p>
        <h2 className="nip-h2">The Blue Means Everything</h2>
        <div className="nip-body">
          <p className="lead">Not a color choice. A commitment.</p>
          <p>The palette is drawn from four blues, held in strict order:</p>
          <p>Midnight Asphalt for the ground the ring stands on. Deep Sapphire for the volume of the shank. Victory Blue for the field at the crown. Electric Sapphire for the light that runs across every polished edge.</p>
          <p>Read together, they are not decoration. They are the neighborhood at four different hours of the same night.</p>
        </div>
      </section>

      {/* THE VICTORY LAP */}
      <section className="nip-section d3" data-testid="nip-victory-lap">
        <p className="nip-eyebrow" style={{ textAlign:"center" }}>III</p>
        <h2 className="nip-h2">The Victory Lap</h2>
        <div className="nip-body">
          <p className="lead">The center is not an emblem. It is a finish line.</p>
          <p>At the crown of the ring is the Victory Lap flag and N tribute motif &mdash; a single, contained mark placed exactly on the axis of the piece.</p>
          <p>It is not a badge. It is not a logo. It is a small architectural moment: a checkered field held inside a raised frame, aligned to the geometry of the shank so that the whole ring reads as a single continuous idea.</p>
          <p>The mark is a period at the end of a long sentence. A quiet way of saying: the work was finished.</p>
        </div>
      </section>

      {/* TECHNICAL SPECS — no commerce fields */}
      <section className="nip-section nip-specs d4" data-testid="nip-specs">
        <p className="nip-eyebrow" style={{ textAlign:"center" }}>Specification</p>
        <h2 className="nip-h2">Drawn, then Built.</h2>
        <div className="nip-specs-grid" data-testid="nip-specs-grid">
          <div className="nip-spec-row">
            <span className="nip-spec-label">Series</span>
            <span className="nip-spec-value">PHILEON Tribute Series</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Silhouette</span>
            <span className="nip-spec-value">Architectural Signet Ring</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Center Motif</span>
            <span className="nip-spec-value">Victory Lap flag and N tribute motif</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Palette</span>
            <span className="nip-spec-value">Midnight Asphalt · Deep Sapphire · Victory Blue · Electric Sapphire</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Construction</span>
            <span className="nip-spec-value">Solid shank · Raised crown · Hand-finished edges</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Finish</span>
            <span className="nip-spec-value">Polished field · Matte inlay · High-polish rim</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Category</span>
            <span className="nip-spec-value">Non-Commercial Tribute Piece</span>
          </div>
          <div className="nip-spec-row">
            <span className="nip-spec-label">Status</span>
            <span className="nip-spec-value">Independent Tribute · Not for Sale</span>
          </div>
        </div>
      </section>

      {/* INDEPENDENT TRIBUTE NOTICE */}
      <section className="nip-notice" data-testid="nip-tribute-notice">
        <p className="nip-notice-title">Independent Tribute</p>
        <p className="nip-notice-body">
          NEIGHBORHOOD NIP is an independent design tribute created by PHILEON.
          It is not affiliated with, endorsed by, or licensed by any estate,
          brand, or organization. No likenesses, logos, or protected marks are
          used. The piece exists as an architectural study &mdash; a work of
          respect, published for viewing only.
        </p>
      </section>

      {/* GALLERY — scaffolded but not published */}
      {GALLERY_LIVE && GALLERY.length > 0 && (
        <section className="nip-section d5" data-testid="nip-gallery-section">
          <p className="nip-eyebrow" style={{ textAlign:"center" }}>Study</p>
          <h2 className="nip-h2">Eleven Angles. One Idea.</h2>
          <div className="nip-gallery" data-testid="nip-gallery">
            {GALLERY.map((g, i) => (
              <div key={i} className="nip-gallery-cell" data-testid={`nip-gallery-cell-${i + 1}`}>
                <img src={g.src} alt={g.alt} loading="lazy" data-testid={`nip-gallery-image-${i + 1}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FINAL LINE */}
      <section className="nip-final" data-testid="nip-final">
        <p className="nip-final-line">
          &ldquo;The block became the blueprint.<br />
          The blueprint became the ring.&rdquo;
        </p>
        <p className="nip-final-attr">— PHILEON Tribute Series</p>
      </section>
    </div>
  );
}
