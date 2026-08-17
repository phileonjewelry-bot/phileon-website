import React, { useEffect, useRef, useState } from "react";

// ROUGE SIREN — PHILEON FINE JEWELRY collection page.
// Product #3 of 6. Name is merchant-approved (no longer a working name).
// Three coordinated expressions in solid 10K Rose Gold:
//   • Earring + Anklet Set — $6,995 CAD
//   • Pendant                — $2,495 CAD  (chain sold separately)
//   • Complete Collection    — $8,995 CAD
// Non-purchasable placeholder. Trusted backend catalog untouched (still 84).

const ART = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts";
const ROUGE_SIREN_VIDEO = `${ART}/ydb0dad6_XiaoYing_Video_1786931681853_HD.mp4`;
const IMG = {
  set:       `${ART}/t4zwoen5_1000171127.png`,        // complete set composite
  earPair:   `${ART}/d53p1y31_1000171117.png`,        // earring pair front
  earMacro:  `${ART}/s6bi9wst_1000171115.png`,        // earring sculptural macro
  earHoop:   `${ART}/9bc4bl98_1000171116.png`,        // hoop-and-drop macro
  medallion: `${ART}/k47r3m0z_1000171114.png`,        // single medallion openwork
  pendant:   `${ART}/y96fmfub_1000171223.png`,        // pendant on chain macro
  onBody:    `${ART}/z2bfdgj2_1000171222.png`,        // model wearing full set (ear + neck + ankle)
  earWorn:   `${ART}/dfdtcf05_1000171241.png`,        // side profile — model wearing rose-gold earring
};

const EXPRESSIONS = {
  earrings: {
    id: "earrings",
    name: "EARRINGS",
    price: "$2,995 CAD",
    hero: IMG.earWorn,
    included: ["Earring Pair"],
  },
  set: {
    id: "set",
    name: "EARRING + ANKLET SET",
    price: "$5,995 CAD",
    hero: IMG.set,
    included: ["Earring Pair", "Anklet"],
  },
  pendant: {
    id: "pendant",
    name: "PENDANT",
    price: "$2,195 CAD",
    hero: IMG.pendant,
    included: ["Pendant"],
    chainNote: true,
  },
  complete: {
    id: "complete",
    name: "COMPLETE COLLECTION",
    price: "$7,495 CAD",
    hero: IMG.onBody,
    included: ["Earring Pair", "Anklet", "Pendant"],
    chainNote: true,
  },
};

export default function VolutaPage() {
  const [expression, setExpression] = useState("complete");
  const active = EXPRESSIONS[expression];
  const heroVideoRef = useRef(null);
  const onBodyVideoRef = useRef(null);

  // Nudge playback after mount — some mobile browsers pause autoplay until
  // the element is fully ready. Muted + playsInline satisfies mobile policy.
  useEffect(() => {
    const nudge = (el) => { if (el && el.paused) el.play().catch(() => {}); };
    const t = setTimeout(() => { nudge(heroVideoRef.current); nudge(onBodyVideoRef.current); }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="voluta-page" data-testid="voluta-page">
      {/* Hero — full-bleed cinematic video band, copy stack below. */}
      <section className="voluta-hero" data-testid="voluta-hero">
        <div className="voluta-hero-video-wrap" data-testid="voluta-hero-media">
          <video
            ref={heroVideoRef}
            className="voluta-hero-video-el"
            data-testid="voluta-hero-video"
            src={ROUGE_SIREN_VIDEO}
            poster={active.hero}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={`ROUGE SIREN — ${active.name.toLowerCase()} in 10K Rose Gold, hero motion`}
          />
        </div>

        <div className="voluta-hero-inner">
          <div className="voluta-hero-copy">
            <p className="voluta-eyebrow" data-testid="voluta-eyebrow">PHILEON FINE JEWELRY</p>
            <h1 className="voluta-title" data-testid="voluta-title">ROUGE SIREN</h1>
            <p className="voluta-subline" data-testid="voluta-subline">EAR · NECK · ANKLE</p>
            <p className="voluta-material" data-testid="voluta-material">10K ROSE GOLD</p>

            <div className="voluta-price-row">
              <span className="voluta-price" data-testid="voluta-price">{active.price}</span>
              <span className="voluta-price-pill" data-testid="voluta-price-status">
                Chain sold separately
              </span>
            </div>

            <p className="voluta-campaign" data-testid="voluta-campaign">
              THREE POINTS.<br />ONE PULL.
            </p>
            <p className="voluta-secondary">
              A single sculptural language, drawn from ear to neck to ankle.
            </p>

            <button type="button" className="voluta-cta-disabled" disabled aria-disabled="true" data-testid="voluta-cta-coming-soon">
              COMING SOON
            </button>
            <p className="voluta-cta-note">In final development · Reserve intent will open on production sign-off.</p>
          </div>
        </div>
      </section>

      {/* Collection statement */}
      <section className="voluta-intro" data-testid="voluta-intro">
        <div className="voluta-container">
          <p className="voluta-intro-lead">ROUGE SIREN moves through the body in one continuous language.</p>
          <p className="voluta-intro-body">
            Sculpted in solid 10K rose gold, its openwork curves repeat at the ear,
            the neck and the ankle — three points connected by one unmistakable form.
          </p>
          <p className="voluta-intro-tag">No stones. No interruption. Only metal, movement and repetition.</p>
        </div>
      </section>

      {/* On-body editorial — hero motion loop. Falls back to the on-body
          still via `poster` if the browser blocks autoplay. */}
      <section className="voluta-on-body" data-testid="voluta-on-body">
        <div className="voluta-on-body-frame">
          <video
            ref={onBodyVideoRef}
            data-testid="voluta-on-body-video"
            src={ROUGE_SIREN_VIDEO}
            poster={IMG.onBody}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="ROUGE SIREN on body — earrings, pendant and anklet in 10K Rose Gold, editorial motion"
          />
        </div>
      </section>

      {/* Piece-by-piece */}
      <section className="voluta-pieces" data-testid="voluta-pieces">
        <div className="voluta-container">
          <p className="voluta-section-eyebrow">The Three Pieces</p>

          <div className="voluta-piece" data-testid="voluta-piece-earrings">
            <div className="voluta-piece-media"><img src={IMG.earWorn} alt="ROUGE SIREN earring on ear — side profile, 10K Rose Gold" loading="lazy" /></div>
            <div className="voluta-piece-copy">
              <h3>Earrings</h3>
              <p>Matching pair of sculptural drops. Polished hoop connection. Circular openwork medallion.</p>
              <ul><li>Solid 10K Rose Gold</li><li>Matching Pair</li><li>No stones</li></ul>
            </div>
          </div>

          <div className="voluta-piece voluta-piece-reverse" data-testid="voluta-piece-pendant">
            <div className="voluta-piece-media"><img src={IMG.pendant} alt="ROUGE SIREN pendant on chain — 10K Rose Gold" loading="lazy" /></div>
            <div className="voluta-piece-copy">
              <h3>Pendant</h3>
              <p>An enlarged expression of the ROUGE SIREN medallion. Substantial polished rose-gold bail. Openwork architecture.</p>
              <ul>
                <li>Solid 10K Rose Gold</li>
                <li>Body: 25.0 × 22.0 mm</li>
                <li>Reference weight: approx. 8.5 g</li>
                <li>No stones</li>
                <li data-testid="pendant-chain-note">Chain sold separately</li>
              </ul>
            </div>
          </div>

          <div className="voluta-piece" data-testid="voluta-piece-anklet">
            <div className="voluta-piece-media"><img src={IMG.medallion} alt="ROUGE SIREN medallion detail — 10K Rose Gold" loading="lazy" /></div>
            <div className="voluta-piece-copy">
              <h3>Anklet</h3>
              <p>A procession of repeating ROUGE SIREN medallions ending in a central hanging medallion.</p>
              <ul>
                <li>Solid 10K Rose Gold</li>
                <li data-testid="voluta-anklet-length">Length: 25 cm / 9.8 in</li>
                <li>No stones</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Expression selector */}
      <section className="voluta-select" data-testid="voluta-select-expression">
        <div className="voluta-container">
          <p className="voluta-section-eyebrow">Select Your Expression</p>
          <div className="voluta-select-grid">
            {Object.values(EXPRESSIONS).map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setExpression(e.id)}
                aria-pressed={expression === e.id}
                data-testid={`voluta-expression-${e.id}`}
                className={`voluta-select-card ${expression === e.id ? "is-active" : ""}`}
              >
                <div className="voluta-select-media"><img src={e.hero} alt={`ROUGE SIREN ${e.name.toLowerCase()}`} loading="lazy" /></div>
                <p className="voluta-select-name">{e.name}</p>
                <p className="voluta-select-price">{e.price}</p>
                {e.chainNote && <p className="voluta-select-chain">Chain sold separately</p>}
              </button>
            ))}
          </div>

          {/* Dynamic detail for the selected expression */}
          <div className="voluta-detail" data-testid="voluta-detail">
            <p className="voluta-section-eyebrow">Selected</p>
            <h3 className="voluta-detail-title" data-testid="voluta-detail-title">ROUGE SIREN — {active.name}</h3>
            <ul className="voluta-detail-list">
              <li>Metal: Solid 10K Rose Gold</li>
              <li>Includes: {active.included.join(", ")}</li>
              {expression === "earrings" && <li>Working medallion diameter: approx. 34 mm</li>}
              {expression === "earrings" && <li>Working overall drop: approx. 45–50 mm</li>}
              {(expression === "set" || expression === "complete") && <li>Anklet: 25 cm / 9.8 in</li>}
              {(expression === "pendant" || expression === "complete") && <li>Pendant: 25 × 22 mm · approx. 8.5 g reference</li>}
              <li>Gemstones: None</li>
              {active.chainNote && <li data-testid={`chain-note-${expression}`}>Chain sold separately</li>}
              <li className="voluta-detail-price" data-testid="voluta-detail-price">Price: {active.price}</li>
              <li className="voluta-detail-status">Status: Final Production Specification Pending</li>
            </ul>
            <button type="button" className="voluta-cta-disabled voluta-cta-wide" disabled aria-disabled="true" data-testid="voluta-cta-coming-soon-bottom">
              IN FINAL DEVELOPMENT
            </button>
          </div>
        </div>
      </section>

      <p className="voluta-pending-line" data-testid="voluta-pending-line">
        Final Weight · Medallion Dimensions · Clasp Specification — To Be Confirmed
      </p>

      <style>{`
        .voluta-page { background: #050505; color: #efe6d5; font-family: ui-serif, "Cormorant Garamond", Georgia, serif; padding-top: 64px; }
        .voluta-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .voluta-hero { padding: 0 0 64px; background: #050505; }
        /* Full-bleed cinematic hero. Video is width:100% with object-fit: cover
           so no letterboxing regardless of viewport aspect. */
        .voluta-hero-video-wrap {
          position: relative; width: 100%;
          height: 78vh; min-height: 560px; max-height: 900px;
          background: #000; overflow: hidden;
          border-bottom: 1px solid rgba(196,131,105,0.15);
        }
        @media (max-width: 900px) {
          .voluta-hero-video-wrap { height: 68svh; min-height: 460px; }
        }
        @media (max-width: 480px) {
          .voluta-hero-video-wrap { height: 62svh; min-height: 420px; }
        }
        .voluta-hero-video-el {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center center; display: block;
        }
        @media (prefers-reduced-motion: reduce) {
          .voluta-hero-video-el { animation: none; }
        }
        .voluta-hero-inner { max-width: 1200px; margin: 0 auto; padding: 48px 24px 0; }
        @media (max-width: 900px) { .voluta-hero-inner { padding: 32px 20px 0; } }
        .voluta-eyebrow, .voluta-section-eyebrow { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 10px; letter-spacing: 0.42em; text-transform: uppercase; color: #c48369; margin: 0; }
        .voluta-title { font-size: clamp(48px, 7vw, 84px); font-weight: 300; line-height: 0.9; letter-spacing: 0.02em; margin: 18px 0 0; color: #f2e6c8; }
        .voluta-subline, .voluta-material { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 12px; letter-spacing: 0.36em; text-transform: uppercase; margin: 16px 0 0; color: rgba(239,230,213,0.75); }
        .voluta-material { color: rgba(196,131,105,0.9); margin-top: 8px; }
        .voluta-price-row { margin-top: 28px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .voluta-price { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 22px; letter-spacing: 0.10em; color: #f2e6c8; }
        .voluta-price-pill { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 9px; letter-spacing: 0.36em; text-transform: uppercase; color: #c48369; border: 1px solid rgba(196,131,105,0.35); padding: 5px 10px; border-radius: 2px; }
        .voluta-campaign { margin-top: 32px; font-size: clamp(18px, 2vw, 22px); letter-spacing: 0.05em; line-height: 1.25; color: rgba(239,230,213,0.9); }
        .voluta-secondary { margin-top: 12px; font-size: 14px; line-height: 1.55; color: rgba(239,230,213,0.65); max-width: 460px; }
        .voluta-cta-disabled { font-family: "Helvetica Neue", Arial, sans-serif; display: inline-block; margin-top: 28px; padding: 16px 32px; background: transparent; color: rgba(196,131,105,0.6); border: 1px solid rgba(196,131,105,0.35); border-radius: 2px; font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase; cursor: not-allowed; }
        .voluta-cta-wide { width: 100%; max-width: 320px; margin-top: 16px; }
        .voluta-cta-note { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 10px; letter-spacing: 0.14em; color: rgba(239,230,213,0.4); margin-top: 12px; max-width: 360px; }

        .voluta-intro { padding: 72px 0; border-top: 1px solid rgba(196,131,105,0.15); }
        .voluta-intro-lead { font-size: clamp(20px, 2.4vw, 28px); color: #f2e6c8; margin: 0; max-width: 720px; }
        .voluta-intro-body { margin-top: 18px; font-size: 15px; line-height: 1.65; color: rgba(239,230,213,0.75); max-width: 620px; }
        .voluta-intro-tag { margin-top: 24px; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 11px; letter-spacing: 0.36em; text-transform: uppercase; color: #c48369; }

        .voluta-on-body { background: #060404; padding: 32px 0; }
        .voluta-on-body-frame { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
        .voluta-on-body-frame img, .voluta-on-body-frame video { width: 100%; height: auto; display: block; border-radius: 2px; border: 1px solid rgba(196,131,105,0.15); }

        .voluta-pieces { padding: 72px 0; }
        .voluta-piece { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; margin: 48px 0; }
        .voluta-piece-reverse { direction: rtl; }
        .voluta-piece-reverse > * { direction: ltr; }
        @media (max-width: 900px) { .voluta-piece, .voluta-piece-reverse { grid-template-columns: 1fr; direction: ltr; gap: 20px; } }
        .voluta-piece-media { background: #000; border: 1px solid rgba(196,131,105,0.15); border-radius: 2px; aspect-ratio: 1/1; overflow: hidden; }
        .voluta-piece-media img { width: 100%; height: 100%; object-fit: contain; object-position: center; padding: 4%; }
        .voluta-piece-copy h3 { font-size: clamp(26px, 3.5vw, 40px); font-weight: 300; margin: 0; color: #f2e6c8; }
        .voluta-piece-copy p { margin: 16px 0; font-size: 15px; line-height: 1.6; color: rgba(239,230,213,0.75); }
        .voluta-piece-copy ul { list-style: none; padding: 0; margin: 0; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 12px; letter-spacing: 0.14em; color: rgba(239,230,213,0.7); }
        .voluta-piece-copy li { padding: 6px 0; border-bottom: 1px solid rgba(196,131,105,0.10); }

        .voluta-select { padding: 72px 0; background: #060404; border-top: 1px solid rgba(196,131,105,0.15); }
        .voluta-select-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 28px 0; }
        @media (max-width: 900px) { .voluta-select-grid { grid-template-columns: 1fr; } }
        .voluta-select-card { background: #050303; border: 1px solid rgba(196,131,105,0.15); border-radius: 2px; padding: 18px; cursor: pointer; text-align: left; transition: border-color 200ms, background-color 200ms; color: inherit; font: inherit; }
        .voluta-select-card:hover { border-color: rgba(196,131,105,0.5); }
        .voluta-select-card.is-active { border-color: #c48369; background: #0a0605; }
        .voluta-select-media { aspect-ratio: 1/1; overflow: hidden; background: #000; margin-bottom: 12px; }
        .voluta-select-media img { width: 100%; height: 100%; object-fit: contain; object-position: center; padding: 6%; }
        .voluta-select-name { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 11px; letter-spacing: 0.28em; margin: 0; color: #f2e6c8; }
        .voluta-select-price { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 16px; margin: 6px 0 0; color: #c48369; letter-spacing: 0.08em; }
        .voluta-select-chain { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase; margin: 6px 0 0; color: rgba(239,230,213,0.4); }

        .voluta-detail { margin-top: 40px; padding: 28px; border: 1px solid rgba(196,131,105,0.15); border-radius: 2px; background: #050303; }
        .voluta-detail-title { font-weight: 300; font-size: clamp(24px, 3vw, 32px); margin: 12px 0 20px; color: #f2e6c8; }
        .voluta-detail-list { list-style: none; padding: 0; margin: 0; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 13px; color: rgba(239,230,213,0.8); }
        .voluta-detail-list li { padding: 8px 0; border-bottom: 1px solid rgba(196,131,105,0.10); }
        .voluta-detail-price { font-size: 18px !important; color: #f2e6c8 !important; letter-spacing: 0.08em; }
        .voluta-detail-status { color: #c48369 !important; text-transform: uppercase; letter-spacing: 0.24em; font-size: 11px !important; }

        .voluta-pending-line { max-width: 1200px; margin: 40px auto 128px; padding: 14px 16px; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 10px; letter-spacing: 0.36em; text-transform: uppercase; color: #c48369; border: 1px dashed rgba(196,131,105,0.45); border-radius: 2px; text-align: center; }
      `}</style>
    </div>
  );
}
