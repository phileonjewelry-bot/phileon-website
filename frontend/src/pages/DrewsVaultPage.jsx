import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// DREW'S VAULT — private access. Reachable only after /secret-drop unlock.
// Not linked from public navigation, homepage, or shop. noindex/nofollow.
// Uses existing RETRO BRED product; does NOT duplicate the product object.
// No third-party brand terminology anywhere in visible copy.
const RETRO_BRED_HERO = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/g0vtj6qb_1000170753.png";
const RETRO_BRED_MARK = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/1g1vg86d_1000170620.png";

function readUnlocked() {
  try {
    const events = JSON.parse(localStorage.getItem("phileon_events") || "[]");
    return events.some((e) => e && e.type === "unlock_success");
  } catch (_e) { return false; }
}

export default function DrewsVaultPage() {
  const navigate = useNavigate();
  // Track unlock state in React state so we render correctly on:
  //   - direct refresh with prior unlock in localStorage
  //   - navigation back from /secret-drop after unlock
  //   - storage events fired from another tab
  const [unlocked, setUnlocked] = useState(() => readUnlocked());

  // noindex/nofollow — never surface in public search or sitemap crawlers.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = "Drew's Vault · PHILEON";
    return () => {
      document.head.removeChild(meta);
      document.title = prevTitle;
    };
  }, []);

  // Re-evaluate unlock on mount, tab focus, and storage change so a fresh
  // refresh after a successful unlock still renders the private content.
  useEffect(() => {
    const recheck = () => setUnlocked(readUnlocked());
    recheck();
    window.addEventListener("focus", recheck);
    window.addEventListener("storage", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      window.removeEventListener("storage", recheck);
    };
  }, []);

  // If not unlocked, send visitor back to /secret-drop.
  useEffect(() => {
    if (!unlocked) {
      const t = setTimeout(() => navigate("/secret-drop", { replace: true }), 120);
      return () => clearTimeout(t);
    }
  }, [unlocked, navigate]);

  if (!unlocked) {
    return (
      <div
        className="min-h-screen bg-black text-white/50 flex items-center justify-center text-[10px] tracking-[0.42em]"
        data-testid="drews-vault-locked-notice"
      >
        VAULT ACCESS REQUIRED
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" data-testid="drews-vault-page">
      {/* Vault header */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-4">
        <p className="text-[10px] tracking-[0.42em] text-white/45 uppercase">Private Archive</p>
        <h1
          className="text-[44px] md:text-[64px] leading-[0.98] tracking-[0.01em] font-light text-white/95 mt-3"
          data-testid="drews-vault-title"
        >
          DREW&apos;S VAULT
        </h1>
        <p className="text-white/55 text-[14px] leading-relaxed mt-4 max-w-[600px]">
          A private archive of collectible objects. Each release is limited.
          When a run closes, it closes.
        </p>
      </div>

      {/* Editorial RETRO BRED feature — this is the primary reveal.
          NOTE: no borrowed brand names, no third-party marks. */}
      <section
        aria-labelledby="drews-vault-retro-bred-title"
        data-testid="drews-vault-retro-bred-feature"
        className="relative mt-10 border-t border-white/[0.08]"
        style={{
          background:
            "radial-gradient(ellipse at 20% 15%, rgba(210,27,61,0.10) 0%, rgba(0,0,0,0) 55%), #050505",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr,1fr] gap-10 md:gap-16 items-center">
            {/* Product photography — large, obsidian-framed */}
            <Link
              to="/drews-vault/retro-bred"
              className="group block relative"
              data-testid="drews-vault-card-retro-bred"
              aria-label="Enter RETRO BRED private release"
            >
              <div
                className="relative overflow-hidden rounded-[2px] border border-white/[0.08] bg-black"
                style={{ aspectRatio: "4 / 5" }}
              >
                <img
                  src={RETRO_BRED_HERO}
                  alt="RETRO BRED pavé pendant — black and white pavé silhouette with ruby-set central figure"
                  loading="eager"
                  className="w-full h-full object-contain transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]"
                  data-testid="drews-vault-retro-bred-image"
                />
                {/* Corner meta plates */}
                <div className="absolute top-4 left-4 text-[9px] tracking-[0.42em] text-white/70 uppercase">
                  Drew&apos;s Vault
                </div>
                <div className="absolute top-4 right-4 text-[9px] tracking-[0.42em] text-[#d21b3d] uppercase">
                  Private Release
                </div>
                <div className="absolute bottom-4 left-4 text-[9px] tracking-[0.42em] text-white/60 uppercase">
                  Limited Run · One of Few
                </div>
              </div>
            </Link>

            {/* Editorial copy stack */}
            <div className="pt-2 lg:pt-0">
              <p
                className="text-[10px] tracking-[0.42em] text-white/60 uppercase"
                data-testid="drews-vault-retro-bred-eyebrow"
              >
                DREW&apos;S VAULT · PRIVATE RELEASE
              </p>

              <h2
                id="drews-vault-retro-bred-title"
                data-testid="drews-vault-retro-bred-title"
                className="mt-4 text-[44px] md:text-[64px] leading-[0.94] tracking-[0.01em] font-light text-white/95"
              >
                RETRO <span className="text-[#d21b3d]">BRED</span>
              </h2>

              <p
                className="mt-6 text-[18px] md:text-[22px] leading-[1.22] tracking-[0.02em] text-white/85 max-w-[520px]"
                data-testid="drews-vault-retro-bred-campaign"
              >
                THE SOLE THAT BUILT A RELIGION,<br />RECAST IN STONE.
              </p>

              <p
                className="mt-4 text-[13px] tracking-[0.32em] text-white/50 uppercase"
                data-testid="drews-vault-retro-bred-secondary"
              >
                Rubber wears down. Stone doesn&apos;t.
              </p>

              {/* THE MARK — editorial detail block on the Vault feature itself */}
              <div className="mt-10 border-t border-white/[0.08] pt-8 max-w-[560px]">
                <div className="flex items-start gap-6">
                  <div className="hidden md:block shrink-0 w-[112px] h-[112px] border border-white/[0.08] bg-black rounded-[2px] overflow-hidden">
                    <img
                      src={RETRO_BRED_MARK}
                      alt="Macro detail of the ruby-set central silhouette"
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.42em] text-white/55 uppercase" data-testid="drews-vault-retro-bred-mark-eyebrow">
                      The Mark
                    </p>
                    <p className="mt-3 text-white/78 text-[15px] leading-relaxed">
                      A familiar form, recast in stone.
                    </p>
                    <p className="mt-3 text-white/50 text-[13px] leading-relaxed">
                      No borrowed name. No borrowed throne. Only the mark that
                      changed the floor beneath it.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10">
                <Link
                  to="/drews-vault/retro-bred"
                  className="inline-flex items-center gap-3 border border-white/25 hover:border-white text-white/95 hover:bg-white/[0.04] px-8 py-4 rounded-[2px] text-[11px] tracking-[0.32em] uppercase transition-colors"
                  data-testid="drews-vault-retro-bred-cta"
                >
                  Enter RETRO BRED <ArrowRight size={14} />
                </Link>
                <p className="mt-4 text-[10px] tracking-[0.32em] text-white/35 uppercase">
                  Three tiers · CAD · Chain sold separately
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trailing note */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24 pt-10 border-t border-white/[0.06]">
        <p className="text-[9px] tracking-[0.42em] text-white/30 uppercase">
          Drew&apos;s Vault · Private Archive · Not linked from public collections
        </p>
      </div>
    </div>
  );
}
