/* ==========================================================================
   PHILEON — VAULT ROUTE BADGE  (Layer 5)

   Route-aware customer availability badge. Mounts once (inside the
   customer layout in App.js) and automatically detects the current
   Inspiration Vault piece from the URL path. Renders exactly one of
   READY TO SHIP / SOLD OUT / CURRENTLY UNAVAILABLE — never
   MADE TO ORDER, because a Vault piece is never made-to-order under
   PHILEON's owner-locked business rule.

   This gives all 14 Vault PDPs the availability signal from a single
   mount point — no per-PDP edits required.

   Frontend is UX only. The server independently re-validates at
   POST /api/checkout/session via inventory_service.try_reserve.
   ========================================================================== */
import React from "react";
import { useLocation } from "react-router-dom";
import { useAvailability } from "./AvailabilityBadge";

// Public URL slug → this component's badge display trigger. Only the
// 14 canonical Vault pieces are listed. Editorial/legacy studies that
// don't have an inventory identity are intentionally NOT here.
export const VAULT_PUBLIC_ROUTES = {
  "altar": "iv-altar",
  "caged-wings": "iv-caged-wings",
  "driven": "iv-driven",
  "echelle": "iv-echelle",
  "lucent": "iv-lucent",
  "monaco": "iv-monaco",
  "nightfang-set": "iv-nightfang-set",
  "nova": "iv-nova",
  "oriel": "iv-oriel",
  "parabola-atelier": "iv-parabola-atelier",
  "parallax-drop-earrings": "iv-parallax-drop-earrings",
  "ribbon-regale": "iv-ribbon-regale",
  "gold-theory-ribbon": "iv-ribbon-regale",  // legacy alias
  "roseline": "iv-roseline",
  "stampede-set": "iv-stampede-set",
};

const LABELS = {
  ready_to_ship:  "READY TO SHIP",
  sold_out:       "SOLD OUT",
  unavailable:    "CURRENTLY UNAVAILABLE",
  made_to_order:  "MADE TO ORDER",  // never rendered for Vault
};

export default function VaultRouteBadge() {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/inspiration-vault\/([^/?#]+)/);
  const alias = match ? match[1] : null;
  const canonicalSlug = alias ? VAULT_PUBLIC_ROUTES[alias] : null;
  // Only render on canonical Vault PDPs — editorial-only pages are
  // intentionally excluded (no availability commitment).
  if (!canonicalSlug) return null;

  return <VaultBadgeInner slug={canonicalSlug} />;
}


function VaultBadgeInner({ slug }) {
  const { availability } = useAvailability({ slug });
  if (!availability) return null;

  // Under the PHILEON owner rule a Vault PDP must never show
  // MADE TO ORDER — that state can only arise for a non-Vault slug.
  // If the backend ever returned made_to_order for a Vault piece the
  // resolver would already be wrong. Defensive fallback shows the
  // safest customer copy.
  let label = LABELS[availability.state];
  if (availability.is_inspiration_vault && availability.state === "made_to_order") {
    label = LABELS.unavailable;
  }
  if (!label) return null;

  const isSoldOut = availability.state === "sold_out";
  const isUnavail = availability.state === "unavailable" || label === LABELS.unavailable;
  const isReady = availability.state === "ready_to_ship";

  const tone = isSoldOut || isUnavail
    ? "border-phileon-cream/30 text-phileon-cream/60 bg-black/40"
    : isReady
      ? "border-phileon-gold text-phileon-gold bg-black/40"
      : "border-phileon-cream/25 text-phileon-cream/75 bg-black/40";

  return (
    <div
      className={`fixed top-24 right-4 sm:right-6 z-40 border px-3 py-1 text-[11px] tracking-[0.24em] uppercase backdrop-blur-sm ${tone}`}
      data-testid={`vault-route-badge-${slug}`}
      data-availability-state={availability.state}
      data-purchasable={availability.available ? "true" : "false"}
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  );
}
