import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LuxuryMotionStyles, useLuxuryMotionObserver } from "@/components/LuxuryMotion";

/**
 * PHILEON TRIBUTE SERIES — Index
 *
 * A separate surface from the Inspiration Vault and the Fine Jewelry
 * catalogue. Tribute Series pieces are architectural, non-commercial
 * homages. There is NO commerce on this surface.
 *
 * Palette is drawn from the first piece (NEIGHBORHOOD NIP):
 *   Midnight Asphalt  #03060C
 *   Deep Sapphire     #071B46
 *   Victory Blue      #123E8A
 *   Electric Sapphire #2D63C8
 *
 * New tribute pieces append to `TRIBUTES`, newest first.
 */

const TRIBUTES = [
  {
    slug: "neighborhood-nip",
    title: "NEIGHBORHOOD NIP",
    subtitle: "A blueprint carved in blue.",
    href: "/tribute-series/neighborhood-nip",
    posterImage: "/tribute-series/neighborhood-nip/hero-front.png",
    releasedAt: "2026-07-19",
  },
];

export default function TributeSeriesPage() {
  useLuxuryMotionObserver();

  useEffect(() => {
    document.title = "Tribute Series | PHILEON";
    const upsertMeta = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    upsertMeta("name", "description",
      "The PHILEON Tribute Series — architectural, non-commercial homages. Independent design studies presented for viewing only.");
  }, []);

  return (
    <div className="ts-page" data-testid="tribute-series-page">
      <LuxuryMotionStyles />
      <style>{`
        .ts-page {
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
            radial-gradient(circle at 15% 0%, rgba(18,62,138,.16), transparent 55%),
            radial-gradient(circle at 85% 100%, rgba(45,99,200,.10), transparent 60%),
            linear-gradient(180deg, var(--asphalt) 0%, #05091a 60%, var(--asphalt) 100%);
          color:var(--ink);
          font-family:'Cormorant Garamond', serif;
          min-height:100vh;
          overflow-x:hidden;
        }

        .ts-return {
          display:inline-flex; align-items:center; gap:10px;
          padding:18px 26px;
          font-family:'Cinzel', serif; font-size:11px; letter-spacing:.42em;
          color:var(--ink-muted); text-decoration:none; text-transform:uppercase;
          transition:color 280ms ease, gap 280ms ease;
        }
        .ts-return:hover { color:var(--electric); gap:16px; }

        .ts-header {
          max-width:1180px; margin:0 auto;
          padding:clamp(48px, 6vw, 96px) clamp(20px, 4vw, 60px) clamp(24px, 3vw, 44px);
          text-align:center;
        }
        .ts-eyebrow {
          font-family:'Cinzel', serif; font-size:11px; letter-spacing:.6em;
          color:var(--electric); text-transform:uppercase; margin:0 0 20px;
        }
        .ts-title {
          font-family:'Cinzel', serif; font-weight:500;
          font-size:clamp(30px, 5.6vw, 78px);
          letter-spacing:.14em; color:var(--ink-strong);
          margin:0 0 22px; text-transform:uppercase;
        }
        @media (max-width:420px){
          .ts-title { font-size:30px; letter-spacing:.08em; }
        }
        .ts-intro {
          max-width:720px; margin:0 auto;
          font-family:'Cormorant Garamond', serif; font-style:italic;
          font-size:clamp(18px, 1.6vw, 22px);
          line-height:1.7; color:var(--ink);
        }
        .ts-rule {
          width:56px; height:1px; margin:clamp(32px, 4vw, 56px) auto 0;
          background:var(--electric);
        }

        /* GRID */
        .ts-grid-wrap {
          max-width:1180px; margin:0 auto;
          padding:clamp(24px, 3vw, 44px) clamp(20px, 4vw, 60px) clamp(80px, 8vw, 130px);
        }
        .ts-grid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:clamp(20px, 2.4vw, 36px);
        }
        @media (max-width:768px){
          .ts-grid { grid-template-columns:1fr; gap:24px; }
        }

        .ts-card {
          position:relative; display:block; text-decoration:none;
          background:var(--asphalt);
          border:1px solid var(--rule-strong);
          overflow:hidden;
          color:inherit;
          transition:border-color 380ms ease, transform 380ms ease;
        }
        .ts-card:hover { border-color:var(--electric); transform:translateY(-3px); }
        .ts-card-media {
          position:relative;
          width:100%; aspect-ratio:1 / 1;
          background:
            radial-gradient(circle at 50% 40%, rgba(45,99,200,.22), transparent 60%),
            linear-gradient(180deg, var(--sapphire-deep) 0%, #04102b 100%);
          display:flex; align-items:center; justify-content:center;
          overflow:hidden;
        }
        .ts-card-media img {
          display:block;
          width:100%; height:100%;
          object-fit:contain; object-position:center;
          transition:transform 900ms cubic-bezier(.22,.61,.36,1);
        }
        .ts-card:hover .ts-card-media img { transform:scale(1.03); }

        .ts-card-body {
          padding:clamp(20px, 2vw, 30px) clamp(20px, 2vw, 30px) clamp(24px, 2.4vw, 34px);
          border-top:1px solid var(--rule-soft);
        }
        .ts-card-eyebrow {
          font-family:'Cinzel', serif; font-size:10px; letter-spacing:.5em;
          color:var(--electric); text-transform:uppercase; margin:0 0 12px;
        }
        .ts-card-title {
          font-family:'Cinzel', serif; font-weight:500;
          font-size:clamp(22px, 2.2vw, 30px);
          letter-spacing:.12em; color:var(--ink-strong);
          margin:0 0 10px; text-transform:uppercase;
        }
        .ts-card-sub {
          font-family:'Playfair Display', serif; font-style:italic;
          font-size:clamp(16px, 1.4vw, 20px);
          color:var(--ink); margin:0 0 22px;
        }
        .ts-card-cta {
          display:inline-flex; align-items:center; gap:10px;
          font-family:'Cinzel', serif; font-size:11px; letter-spacing:.42em;
          color:var(--electric); text-transform:uppercase;
          transition:gap 280ms ease;
        }
        .ts-card:hover .ts-card-cta { gap:16px; }

        /* NOTICE FOOTER */
        .ts-notice {
          text-align:center;
          padding:clamp(60px, 6vw, 100px) clamp(20px, 4vw, 60px);
          background:var(--asphalt);
          border-top:1px solid var(--rule-strong);
        }
        .ts-notice-title {
          font-family:'Cinzel', serif; font-size:12px; letter-spacing:.5em;
          color:var(--electric); text-transform:uppercase; margin:0 0 20px;
        }
        .ts-notice-body {
          max-width:720px; margin:0 auto;
          font-family:'Cormorant Garamond', serif; font-style:italic;
          font-size:clamp(15px, 1.3vw, 19px);
          line-height:1.7; color:var(--ink-muted);
        }
      `}</style>

      <Link to="/" className="ts-return" data-testid="ts-return-home">
        <ArrowLeft size={14} /> RETURN HOME
      </Link>

      <header className="ts-header" data-testid="ts-header">
        <p className="ts-eyebrow">PHILEON</p>
        <h1 className="ts-title" data-testid="ts-title">Tribute Series</h1>
        <p className="ts-intro">
          Architectural, non-commercial homages. Each piece is an independent
          design study &mdash; a work of respect, published for viewing only.
        </p>
        <div className="ts-rule" aria-hidden="true" />
      </header>

      <div className="ts-grid-wrap">
        <div className="ts-grid" data-testid="ts-grid">
          {TRIBUTES.map((t) => (
            <Link
              key={t.slug}
              to={t.href}
              className="ts-card"
              data-testid={`ts-card-${t.slug}`}
              aria-label={`Open ${t.title} tribute page`}
            >
              <div className="ts-card-media">
                <img
                  src={t.posterImage}
                  alt={`${t.title} — PHILEON Tribute Series`}
                  loading="lazy"
                  data-testid={`ts-card-image-${t.slug}`}
                />
              </div>
              <div className="ts-card-body">
                <p className="ts-card-eyebrow">Tribute · {new Date(t.releasedAt).getFullYear()}</p>
                <h2 className="ts-card-title">{t.title}</h2>
                <p className="ts-card-sub">{t.subtitle}</p>
                <span className="ts-card-cta">
                  Enter Tribute <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <section className="ts-notice" data-testid="ts-notice">
        <p className="ts-notice-title">On the Series</p>
        <p className="ts-notice-body">
          Tribute Series pieces are not for sale. They are independent
          architectural studies created by PHILEON, unaffiliated with and
          unendorsed by any third party. No likenesses, logos, or protected
          marks are used.
        </p>
      </section>
    </div>
  );
}
