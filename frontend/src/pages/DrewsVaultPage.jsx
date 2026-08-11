import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// DREW'S VAULT — private access. Reachable only after /secret-drop unlock.
// Not linked from public navigation, homepage, or shop. noindex/nofollow.
const RETRO_BRED_CARD_IMG = "https://customer-assets-jt897jd0.emergentagent.net/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/g0vtj6qb_1000170753.png";

function isVaultUnlocked() {
  try {
    const events = JSON.parse(localStorage.getItem("phileon_events") || "[]");
    return events.some((e) => e && e.type === "unlock_success");
  } catch (_e) { return false; }
}

const VAULT_PIECES = [
  {
    slug: "retro-bred",
    href: "/drews-vault/retro-bred",
    name: "RETRO BRED",
    subline: "The sole that built a religion, recast in stone.",
    image: RETRO_BRED_CARD_IMG,
    status: "PRIVATE RELEASE",
  },
];

export default function DrewsVaultPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  useEffect(() => {
    if (!isVaultUnlocked()) navigate("/secret-drop", { replace: true });
  }, [navigate]);

  if (!isVaultUnlocked()) {
    return (
      <div className="min-h-screen bg-black text-white/50 flex items-center justify-center text-[10px] tracking-[0.42em]" data-testid="drews-vault-locked-notice">
        VAULT ACCESS REQUIRED
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" data-testid="drews-vault-page">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-16 pb-24">
        <p className="text-[10px] tracking-[0.42em] text-white/45 uppercase">Private Collection</p>
        <h1 className="text-[44px] md:text-[64px] leading-[0.98] tracking-[0.01em] font-light text-white/95 mt-3" data-testid="drews-vault-title">
          DREW'S VAULT
        </h1>
        <p className="text-white/55 text-[14px] leading-relaxed mt-4 max-w-[600px]">
          A private archive of collectible objects. Each release is limited. When a run closes,
          it closes.
        </p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VAULT_PIECES.map((p) => (
            <Link key={p.slug} to={p.href}
              className="group block bg-black border border-white/[0.08] hover:border-white/25 transition-colors rounded-[2px] overflow-hidden"
              data-testid={`drews-vault-card-${p.slug}`}>
              <div className="aspect-[4/5] bg-black overflow-hidden">
                <img src={p.image} alt={`${p.name} pavé pendant front view`} loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" />
              </div>
              <div className="p-5">
                <p className="text-[9px] tracking-[0.42em] text-white/40 uppercase">Drew's Vault</p>
                <h3 className="text-white/95 text-[18px] tracking-[0.015em] mt-2">{p.name}</h3>
                <p className="text-white/55 text-[12px] mt-2 leading-relaxed">{p.subline}</p>
                <p className="text-[#d21b3d] text-[9px] tracking-[0.42em] mt-4 uppercase">{p.status}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
