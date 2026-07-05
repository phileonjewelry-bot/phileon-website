import { Link } from "react-router-dom";

/**
 * ParabolaFamilyNav — compact editorial navigation strip shared ONLY by the
 * three PARABOLA family pages:
 *   • PARABOLA ATELIER     (Inspiration Vault archive study)
 *   • PARABOLA             (Ladies First production)
 *   • PARABOLA HERITAGE    (Gentleman's Club production)
 *
 * Displays a thin gold rule, the collection title, and three siblings labels
 * separated by · dots. The `active` member renders in solid warm gold and is
 * not clickable; the other two render at 70% opacity with a thin gold
 * underline that lifts to 60% on hover.
 *
 * Do not render this component anywhere else on the site.
 *
 * @param {"atelier" | "ladies-first" | "heritage"} active
 */

const MEMBERS = [
  { key: "atelier",      label: "Atelier",      to: "/parabola-atelier"  },
  { key: "ladies-first", label: "Ladies First", to: "/parabola"          },
  { key: "heritage",     label: "Heritage",     to: "/parabola-heritage" },
];

const CINZEL = { fontFamily: "'Cinzel', serif" };

const BASE_LABEL = {
  ...CINZEL,
  fontSize: 11,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  paddingBottom: 2,
  display: "inline-block",
  transition: "opacity 260ms ease, color 260ms ease, border-color 260ms ease",
  textDecoration: "none",
};

const INACTIVE = {
  ...BASE_LABEL,
  color: "rgba(200, 162, 74, 0.7)",
  borderBottom: "1px solid rgba(200, 162, 74, 0.25)",
};

const ACTIVE = {
  ...BASE_LABEL,
  color: "#C8A24A",
  borderBottom: "1px solid transparent",
  cursor: "default",
};

export default function ParabolaFamilyNav({ active }) {
  return (
    <section
      data-testid="parabola-family-nav"
      style={{
        background: "#000",
        padding: "clamp(72px,8vw,120px) clamp(20px,4vw,60px)",
        textAlign: "center",
      }}
    >
      <style>{`
        .pfn-inactive:hover { border-bottom-color: rgba(200,162,74,0.6) !important; color: rgba(200,162,74,1) !important; }
      `}</style>

      {/* Thin gold divider above the strip */}
      <div
        aria-hidden="true"
        style={{
          width: 120,
          height: 1,
          background: "rgba(200, 162, 74, 0.25)",
          margin: "0 auto 40px",
        }}
      />

      {/* Collection title */}
      <p
        data-testid="parabola-family-nav-title"
        style={{
          ...CINZEL,
          fontSize: 11,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "rgba(200, 162, 74, 0.85)",
          margin: "0 0 28px",
        }}
      >
        The PARABOLA Collection
      </p>

      {/* Siblings row */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "clamp(14px, 2.2vw, 26px)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {MEMBERS.map((m, i) => (
          <span key={m.key} style={{ display: "inline-flex", alignItems: "center", gap: "clamp(14px, 2.2vw, 26px)" }}>
            {m.key === active ? (
              <span
                data-testid={`parabola-family-nav-${m.key}-active`}
                aria-current="page"
                style={ACTIVE}
              >
                {m.label}
              </span>
            ) : (
              <Link
                to={m.to}
                data-testid={`parabola-family-nav-${m.key}`}
                className="pfn-inactive"
                style={INACTIVE}
              >
                {m.label}
              </Link>
            )}

            {/* Dot separator between siblings (not after the last) */}
            {i < MEMBERS.length - 1 ? (
              <span
                aria-hidden="true"
                style={{
                  ...CINZEL,
                  fontSize: 10,
                  color: "rgba(200, 162, 74, 0.4)",
                  userSelect: "none",
                }}
              >
                &middot;
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </section>
  );
}
