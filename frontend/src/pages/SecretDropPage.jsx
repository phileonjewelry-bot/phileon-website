import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../styles/secret-drop.css";

// SECRET DROP · THE PHILEON VAULT
// ─────────────────────────────────────────────────────────────────────────
// Single source of truth for the private/vault experience. `/drews-vault`
// now redirects into this page — one gate, one vault. RETRO BRED lives
// INSIDE the unlocked state of this page as the first private release.
// Unlock is controlled by the SAME `phileon_events > unlock_success` event
// used everywhere else. No second passphrase, no second localStorage key.

const RETRO_BRED_HERO = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/8odwy75b_1000170617.png";
const RETRO_BRED_MARK = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/1g1vg86d_1000170620.png";

function readUnlocked() {
  try {
    const events = JSON.parse(localStorage.getItem("phileon_events") || "[]");
    return events.some((e) => e && e.type === "unlock_success");
  } catch (_e) { return false; }
}

export default function SecretDropPage() {
  const [code, setCode] = useState("");
  // Persist unlock across refreshes — read localStorage on first mount.
  const [unlocked, setUnlocked] = useState(() => readUnlocked());
  const [denied, setDenied] = useState(false);
  const [unlockFlash, setUnlockFlash] = useState(false);

  const denyTimerRef = useRef(null);

  // noindex/nofollow — never expose the vault to public search or sitemap.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = "Secret Drop · PHILEON";
    return () => {
      document.head.removeChild(meta);
      document.title = prevTitle;
    };
  }, []);

  // Re-check unlock on focus / storage — supports fresh refresh with prior
  // unlock, and multi-tab consistency.
  useEffect(() => {
    const recheck = () => setUnlocked(readUnlocked());
    window.addEventListener("focus", recheck);
    window.addEventListener("storage", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      window.removeEventListener("storage", recheck);
    };
  }, []);

  const logEvent = (type) => {
    const event = { type, ts: Date.now(), path: window.location.pathname };
    console.log("Phileon Analytics:", event);
    const events = JSON.parse(localStorage.getItem("phileon_events") || "[]");
    events.push(event);
    localStorage.setItem("phileon_events", JSON.stringify(events));
  };

  const handleInputChange = (e) => {
    setCode(e.target.value);
    setDenied(false);
    if (denyTimerRef.current) {
      clearTimeout(denyTimerRef.current);
      denyTimerRef.current = null;
    }
  };

  const handleUnlock = () => {
    logEvent("unlock_attempt");
    const ok = code.trim().toLowerCase() === "phileon";
    if (ok) {
      logEvent("unlock_success");
      if (denyTimerRef.current) {
        clearTimeout(denyTimerRef.current);
        denyTimerRef.current = null;
      }
      setDenied(false);
      setUnlockFlash(true);
      // Reveal the unlocked vault IN-PLACE (no more redirect to /shop-drop).
      setTimeout(() => {
        setUnlocked(true);
        setUnlockFlash(false);
      }, 450);
      return;
    }
    logEvent("unlock_fail");
    setDenied(true);
    if (denyTimerRef.current) clearTimeout(denyTimerRef.current);
    denyTimerRef.current = setTimeout(() => setDenied(false), 2000);
  };

  // ── LOCKED VIEW ─────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className={`secret-shell ${unlockFlash ? "unlock-flash" : ""}`}>
        <div className={`lock-card ${denied ? "deny-glitch" : ""}`}>
          <div className="secret-top-right">SECRET ACCESS</div>
          <h1 className="classified">CLASSIFIED</h1>
          <p className="sub">This drop requires an access code.</p>

          <input
            className="code-input"
            placeholder="ENTER CODE"
            value={code}
            onChange={handleInputChange}
            data-testid="secret-drop-code-input"
          />

          <button className="unlock-btn" onClick={handleUnlock} data-testid="secret-drop-unlock-btn">
            UNLOCK
          </button>

          {denied && <p className="access-denied" data-testid="secret-drop-denied">ACCESS DENIED</p>}
          <p className="hint">Hint: The unlock code is case-insensitive</p>
        </div>
      </div>
    );
  }

  // ── UNLOCKED VIEW · THE PHILEON VAULT ───────────────────────────────────
  return (
    <div className="secret-shell sketchpad" data-testid="phileon-vault-unlocked">
      {/* Vault intro — preserves the existing Secret Drop / PHILEON identity */}
      <div className="unlocked-wrap" data-testid="phileon-vault-intro">
        <div className="level-unlocked">ACCESS GRANTED</div>
        <h2 className="drop-title" data-testid="phileon-vault-title">THE PHILEON VAULT</h2>
        <p className="drop-sub">A private archive. What appears here is limited. When a run closes, it closes.</p>
      </div>

      {/* RETRO BRED editorial feature — the first private release inside
          the vault. Reuses the trusted product record and the existing
          `/drews-vault/retro-bred` private product route. */}
      <section
        aria-labelledby="vault-retro-bred-title"
        data-testid="vault-retro-bred-feature"
        className="vault-retro-section"
      >
        <div className="vault-retro-inner">
          <div className="vault-retro-grid">
            {/* Product photography — obsidian-framed, full pendant visible,
                red central silhouette centered. No object-fit: cover. */}
            <Link
              to="/drews-vault/retro-bred"
              className="vault-retro-image-link"
              data-testid="vault-retro-bred-image-link"
              aria-label="Enter RETRO BRED private release"
            >
              <div className="vault-retro-image-wrap">
                <img
                  src={RETRO_BRED_HERO}
                  alt="RETRO BRED pavé pendant — black and white pavé silhouette with ruby-set central figure"
                  loading="eager"
                  data-testid="vault-retro-bred-image"
                  className="vault-retro-image"
                />
                <div className="vault-retro-meta vault-retro-meta-tl">Private Release</div>
                <div className="vault-retro-meta vault-retro-meta-tr">Limited Run</div>
                <div className="vault-retro-meta vault-retro-meta-bl">One of Few</div>
              </div>
            </Link>

            {/* Editorial copy */}
            <div className="vault-retro-copy">
              <p className="vault-eyebrow" data-testid="vault-retro-bred-eyebrow">PRIVATE RELEASE</p>

              <h2 id="vault-retro-bred-title" className="vault-retro-title" data-testid="vault-retro-bred-title">
                RETRO <span className="vault-retro-red">BRED</span>
              </h2>

              <p className="vault-retro-campaign" data-testid="vault-retro-bred-campaign">
                THE SOLE THAT BUILT A RELIGION,<br />RECAST IN STONE.
              </p>

              <p className="vault-retro-secondary" data-testid="vault-retro-bred-secondary">
                Rubber wears down. Stone doesn&apos;t.
              </p>

              {/* THE MARK — macro of the central red silhouette, image-first. */}
              <div className="vault-mark-block" data-testid="vault-mark-block">
                <div className="vault-mark-macro">
                  <img
                    src={RETRO_BRED_MARK}
                    alt="Macro detail of the ruby-set central silhouette"
                    loading="lazy"
                    data-testid="vault-mark-macro-image"
                  />
                </div>
                <div className="vault-mark-text">
                  <p className="vault-mark-eyebrow" data-testid="vault-mark-eyebrow">The Mark</p>
                  <p className="vault-mark-lead">A familiar form, recast in stone.</p>
                  <p className="vault-mark-body">
                    No borrowed name. No borrowed throne. Only the mark that changed the floor beneath it.
                  </p>
                </div>
              </div>

              <Link
                to="/drews-vault/retro-bred"
                className="vault-retro-cta"
                data-testid="vault-retro-bred-cta"
              >
                Enter RETRO BRED <ArrowRight size={14} />
              </Link>
              <p className="vault-retro-fineprint">Three tiers · CAD · Chain sold separately</p>
            </div>
          </div>
        </div>
      </section>

      <div className="vault-footnote" data-testid="vault-footnote">
        THE PHILEON VAULT · Private Archive · Not linked from public collections
      </div>

      {/* Scoped styling for the unlocked vault. Kept inline so it never leaks
          into the public site. Preserves the existing Secret Drop dark
          aesthetic while giving RETRO BRED a proper editorial reveal. */}
      <style>{`
        .vault-retro-section {
          background: radial-gradient(ellipse at 20% 15%, rgba(210,27,61,0.10) 0%, rgba(0,0,0,0) 55%), #050505;
          border-top: 1px solid rgba(255,255,255,0.08);
          color: #f2e6c8;
        }
        .vault-retro-inner { max-width: 1400px; margin: 0 auto; padding: 64px 24px 96px; }
        .vault-retro-grid {
          display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; align-items: center;
        }
        @media (max-width: 900px) {
          .vault-retro-grid { grid-template-columns: 1fr; gap: 32px; }
          .vault-retro-inner { padding: 40px 20px 64px; }
        }
        .vault-retro-image-link { display: block; }
        .vault-retro-image-wrap {
          position: relative; width: 100%; aspect-ratio: 1 / 1; background: #000;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;
        }
        .vault-retro-image {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: contain; object-position: center; padding: 4%;
          transition: transform 900ms ease-out;
        }
        .vault-retro-image-link:hover .vault-retro-image { transform: scale(1.02); }
        .vault-retro-meta {
          position: absolute; font-size: 9px; letter-spacing: 0.42em;
          text-transform: uppercase; color: rgba(255,255,255,0.7);
        }
        .vault-retro-meta-tl { top: 14px; left: 14px; color: rgba(255,255,255,0.75); }
        .vault-retro-meta-tr { top: 14px; right: 14px; color: #d21b3d; }
        .vault-retro-meta-bl { bottom: 14px; left: 14px; color: rgba(255,255,255,0.6); }

        .vault-retro-copy { color: #f2e6c8; }
        .vault-eyebrow {
          font-size: 10px; letter-spacing: 0.42em; text-transform: uppercase;
          color: rgba(242,230,200,0.6); margin: 0;
        }
        .vault-retro-title {
          margin: 16px 0 0; font-weight: 300; line-height: 0.94; letter-spacing: 0.01em;
          font-size: clamp(38px, 6vw, 64px); color: #f2e6c8;
          font-family: ui-serif, "Cormorant Garamond", Georgia, serif;
        }
        .vault-retro-red { color: #d21b3d; }
        .vault-retro-campaign {
          margin: 24px 0 0; font-size: clamp(17px, 2vw, 22px); line-height: 1.22;
          letter-spacing: 0.02em; color: rgba(242,230,200,0.9); max-width: 520px;
        }
        .vault-retro-secondary {
          margin: 14px 0 0; font-size: 13px; letter-spacing: 0.32em;
          text-transform: uppercase; color: rgba(242,230,200,0.55);
        }

        .vault-mark-block {
          margin-top: 40px; padding-top: 32px; max-width: 560px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: grid; grid-template-columns: 132px 1fr; gap: 24px; align-items: start;
        }
        @media (max-width: 480px) {
          .vault-mark-block { grid-template-columns: 1fr; gap: 16px; }
        }
        .vault-mark-macro {
          width: 100%; aspect-ratio: 1 / 1; background: #000;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;
        }
        .vault-mark-macro img {
          width: 100%; height: 100%; object-fit: contain; object-position: center; padding: 6%;
        }
        .vault-mark-eyebrow {
          font-size: 10px; letter-spacing: 0.42em; text-transform: uppercase;
          color: rgba(242,230,200,0.6); margin: 0;
        }
        .vault-mark-lead {
          margin: 10px 0 0; font-size: 15px; line-height: 1.55; color: rgba(242,230,200,0.85);
        }
        .vault-mark-body {
          margin: 10px 0 0; font-size: 13px; line-height: 1.55; color: rgba(242,230,200,0.55);
        }

        .vault-retro-cta {
          display: inline-flex; align-items: center; gap: 10px; margin-top: 36px;
          padding: 16px 30px; border: 1px solid rgba(255,255,255,0.28);
          color: rgba(242,230,200,0.96); text-decoration: none;
          font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase;
          border-radius: 2px; transition: background-color 200ms, border-color 200ms;
        }
        .vault-retro-cta:hover {
          border-color: #fff; background: rgba(255,255,255,0.04);
        }
        .vault-retro-fineprint {
          margin: 14px 0 0; font-size: 10px; letter-spacing: 0.32em;
          text-transform: uppercase; color: rgba(242,230,200,0.35);
        }

        .vault-footnote {
          max-width: 1400px; margin: 0 auto; padding: 40px 24px 96px;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 9px; letter-spacing: 0.42em; text-transform: uppercase;
          color: rgba(242,230,200,0.3);
        }
      `}</style>
    </div>
  );
}
