/* ==========================================================================
   PHILEON — AVAILABILITY BADGE  (Layer 5)

   Restrained customer availability display for PDPs and CartDrawer.
   Consumes POST /api/availability/resolve and shows exactly one of:
     · MADE TO ORDER
     · READY TO SHIP
     · SOLD OUT
     · CURRENTLY UNAVAILABLE

   Never displays exact counts, "only N left", or fake urgency copy.
   Frontend UX only — the server independently re-validates on checkout.
   ========================================================================== */
import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_BACKEND_URL;

const LABELS = {
  made_to_order:     "MADE TO ORDER",
  ready_to_ship:     "READY TO SHIP",
  sold_out:          "SOLD OUT",
  unavailable:       "CURRENTLY UNAVAILABLE",
};

export function useAvailability({ slug, variant, karat, metalColour, ringSize }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API}/api/availability/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        variant: variant || null,
        karat: karat || null,
        metal_colour: metalColour || null,
        ring_size: ringSize || null,
      }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setState(d); })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug, variant, karat, metalColour, ringSize]);

  return { availability: state, loading, error };
}


export default function AvailabilityBadge(props) {
  const { availability, loading } = useAvailability(props);
  if (loading || !availability) return null;
  const label = LABELS[availability.state] || null;
  if (!label) return null;
  const isSoldOut = availability.state === "sold_out";
  const isUnavail = availability.state === "unavailable";
  const isReady = availability.state === "ready_to_ship";
  const isMto = availability.state === "made_to_order";

  const tone =
    isSoldOut || isUnavail
      ? "text-phileon-cream/50 border-phileon-cream/30"
      : isReady
        ? "text-phileon-gold border-phileon-gold"
        : "text-phileon-cream/75 border-phileon-cream/25";

  return (
    <div
      data-testid={`availability-badge-${availability.state}`}
      data-slug={availability.slug || props.slug || ""}
      data-vault={availability.is_inspiration_vault ? "true" : "false"}
      className={`inline-flex items-center gap-2 px-3 py-1 border text-[11px] tracking-[0.24em] uppercase ${tone}`}
    >
      {label}
    </div>
  );
}


/** Convenience for Vault PDPs — mounts the badge and disables the
 * children (Add-to-Cart CTAs) when the piece is not purchasable. Wraps
 * arbitrary content. Server-side reservation remains the authority. */
export function VaultAvailabilityGate({ slug, variant, karat, metalColour,
                                          ringSize, className = "",
                                          children }) {
  const { availability } = useAvailability({ slug, variant, karat,
                                                 metalColour, ringSize });
  const disabled = availability && !availability.available;
  return (
    <div
      className={className}
      data-testid={`vault-availability-gate-${slug}`}
      data-availability-state={availability?.state || "loading"}
      data-purchasable={disabled ? "false" : "true"}
    >
      <AvailabilityBadge slug={slug} variant={variant} karat={karat}
                              metalColour={metalColour} ringSize={ringSize} />
      {typeof children === "function"
        ? children({ availability, disabled })
        : children}
    </div>
  );
}
