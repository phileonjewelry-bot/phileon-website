import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

/**
 * ATELIER — Custom & Bespoke Intake
 *
 * /atelier
 *
 * This is the ONLY page in the experience where consultation /
 * collaborative language lives. Finished PHILEON objects route to
 * Add to Cart. Custom / bespoke / heirloom / VIP work routes here.
 *
 * Tone: atelier-driven, collaborative, personal, restrained.
 * Visual: low-light studio — warm ink + champagne gold accents.
 * Posts to /api/consultations/private with product_slug="atelier-<projectType>".
 */

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PROJECT_TYPES = [
  {
    id: "custom_commission",
    label: "Custom Commission",
    blurb: "A new piece, designed and built for you from a blank page.",
  },
  {
    id: "customize_old_gold",
    label: "Customize Your Old Gold",
    blurb: "Bring your existing gold or stones — we'll reset, reshape, or reimagine.",
  },
  {
    id: "heirloom_rebuild",
    label: "Heirloom Rebuild",
    blurb: "A piece carried through generations, restored or rebuilt with intention.",
  },
  {
    id: "vip_private_project",
    label: "VIP Private Project",
    blurb: "One-of-one couture work. Private, discreet, no public reference.",
  },
];

const TIMELINE_OPTIONS = [
  { id: "flexible", label: "Flexible — design-led timeline" },
  { id: "8_12_weeks", label: "8–12 weeks" },
  { id: "4_8_weeks", label: "4–8 weeks (rush)" },
  { id: "specific_date", label: "Tied to a specific date" },
];

const BUDGET_OPTIONS = [
  { id: "5_15k", label: "$5,000 – $15,000 USD" },
  { id: "15_50k", label: "$15,000 – $50,000 USD" },
  { id: "50_150k", label: "$50,000 – $150,000 USD" },
  { id: "150k_plus", label: "$150,000+ USD" },
  { id: "discuss", label: "Prefer to discuss in private" },
];

export default function AtelierPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    project_type: "custom_commission",
    timeline: "flexible",
    budget: "discuss",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setIsMounted(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    if (!form.full_name.trim()) return "Please share your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Please enter a valid email address.";
    if (!form.message.trim() || form.message.trim().length < 12)
      return "Tell us a little about the project so we can prepare for the conversation.";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setStatus("error"); setErrorMsg(err); return; }
    setStatus("submitting");
    setErrorMsg("");
    try {
      await axios.post(`${API}/consultations/private`, {
        product_slug: `atelier-${form.project_type}`,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        preferred_metal: null,
        ring_size: null,
        consultation_type: form.project_type,
        message: [
          `PROJECT: ${PROJECT_TYPES.find(p => p.id === form.project_type)?.label}`,
          `TIMELINE: ${TIMELINE_OPTIONS.find(t => t.id === form.timeline)?.label}`,
          `BUDGET: ${BUDGET_OPTIONS.find(b => b.id === form.budget)?.label}`,
          "",
          form.message.trim(),
        ].join("\n"),
      });
      setStatus("success");
    } catch (e2) {
      setStatus("error");
      setErrorMsg("Something prevented the submission. Please try again.");
    }
  };

  return (
    <section
      className={`atl-room${isMounted ? " atl-loaded" : ""}`}
      data-page="atelier"
      data-testid="atelier-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .atl-room {
          position: relative;
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(140, 110, 60, 0.18), transparent 60%),
            radial-gradient(circle at 80% 90%, rgba(60, 42, 18, 0.35), transparent 65%),
            #0a0905;
          color: #ece5d2;
          padding: 96px 24px 140px;
          opacity: 0;
          transition: opacity 900ms ease;
        }
        .atl-room.atl-loaded { opacity: 1; }

        .atl-room::before {
          content: "";
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.045'/></svg>");
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        .atl-back {
          position: absolute; top: 28px; left: 28px; z-index: 5;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Inter', sans-serif; font-size: 11px;
          letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(236, 229, 210, 0.6);
          text-decoration: none;
          transition: color 320ms ease;
        }
        .atl-back:hover { color: rgba(236, 229, 210, 0.95); }

        .atl-shell {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          padding: 64px clamp(20px, 4vw, 64px) 72px;
          background: linear-gradient(180deg, rgba(20, 16, 10, 0.6) 0%, rgba(12, 10, 6, 0.78) 100%);
          border: 1px solid rgba(198, 168, 107, 0.16);
          backdrop-filter: blur(14px);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(198, 168, 107, 0.04) inset;
        }

        .atl-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.82);
          margin: 0 0 22px;
          text-align: center;
        }
        .atl-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          letter-spacing: 0.06em;
          color: #f5efdf;
          margin: 0 0 18px;
          text-align: center;
        }
        .atl-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.1rem, 1.55vw, 1.32rem);
          line-height: 1.55;
          color: rgba(236, 229, 210, 0.82);
          text-align: center;
          margin: 0 auto 36px;
          max-width: 560px;
        }
        .atl-meta {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.95rem;
          line-height: 1.65;
          color: rgba(198, 168, 107, 0.55);
          text-align: center;
          margin: 0 0 56px;
        }

        .atl-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(198, 168, 107, 0.32) 50%, transparent 100%);
          margin: 0 0 48px;
        }

        .atl-form { display: grid; gap: 30px; }
        .atl-row { display: grid; gap: 30px; grid-template-columns: 1fr 1fr; }
        @media (max-width: 700px) { .atl-row { grid-template-columns: 1fr; } }

        .atl-field { display: flex; flex-direction: column; gap: 10px; }
        .atl-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.7);
        }
        .atl-input,
        .atl-textarea,
        .atl-select {
          width: 100%;
          padding: 16px 18px;
          background: rgba(10, 8, 4, 0.55);
          border: 1px solid rgba(198, 168, 107, 0.22);
          color: #f5efdf;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem;
          font-weight: 300;
          letter-spacing: 0.01em;
          transition: border-color 280ms ease, background 280ms ease;
          appearance: none;
        }
        .atl-input:focus,
        .atl-textarea:focus,
        .atl-select:focus {
          outline: none;
          border-color: rgba(220, 190, 130, 0.85);
          background: rgba(20, 16, 10, 0.7);
        }
        .atl-input::placeholder,
        .atl-textarea::placeholder { color: rgba(236, 229, 210, 0.32); }
        .atl-textarea { min-height: 160px; resize: vertical; font-family: 'Cormorant Garamond', serif; }

        .atl-select-wrap { position: relative; }
        .atl-select {
          padding-right: 44px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23c6a86b' stroke-width='1.5'><polyline points='6 9 12 15 18 9'/></svg>");
          background-repeat: no-repeat;
          background-position: right 18px center;
          background-size: 12px;
          font-family: 'Cinzel', serif;
          font-size: 0.98rem;
          letter-spacing: 0.06em;
        }
        .atl-select option { background: #0a0905; color: #f5efdf; }

        /* Project type radio cards */
        .atl-types {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (max-width: 640px) { .atl-types { grid-template-columns: 1fr; } }
        .atl-type {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 18px 20px;
          background: rgba(10, 8, 4, 0.45);
          border: 1px solid rgba(198, 168, 107, 0.18);
          cursor: pointer;
          text-align: left;
          color: inherit;
          transition: border-color 280ms ease, background 280ms ease;
        }
        .atl-type:hover {
          border-color: rgba(198, 168, 107, 0.5);
          background: rgba(20, 16, 10, 0.55);
        }
        .atl-type.is-selected {
          border-color: rgba(220, 190, 130, 0.85);
          background: rgba(28, 22, 14, 0.65);
        }
        .atl-type-name {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-size: 0.92rem;
          letter-spacing: 0.1em;
          color: #f5efdf;
        }
        .atl-type-blurb {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.92rem;
          line-height: 1.45;
          color: rgba(236, 229, 210, 0.62);
        }

        .atl-submit {
          margin-top: 12px;
          padding: 22px 32px;
          background: rgba(198, 168, 107, 0.92);
          color: #0a0905;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 320ms ease, letter-spacing 320ms ease;
        }
        .atl-submit:hover {
          background: rgba(220, 190, 130, 1);
          letter-spacing: 0.52em;
        }
        .atl-submit:disabled { opacity: 0.55; cursor: default; letter-spacing: 0.46em !important; }

        .atl-microcopy {
          margin: 30px 0 0;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.95rem;
          line-height: 1.6;
          color: rgba(198, 168, 107, 0.6);
          text-align: center;
        }

        .atl-error {
          margin-top: 18px;
          padding: 14px 18px;
          background: rgba(140, 50, 30, 0.18);
          border-left: 2px solid rgba(220, 130, 100, 0.8);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 0.95rem;
          color: rgba(245, 200, 180, 0.92);
        }

        .atl-success {
          padding: 60px 0 20px;
          text-align: center;
        }
        .atl-success-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(198, 168, 107, 0.82);
          margin: 0 0 26px;
        }
        .atl-success-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(1.7rem, 2.7vw, 2.25rem);
          line-height: 1.4;
          color: #f5efdf;
          margin: 0 0 24px;
        }
        .atl-success-body {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.65;
          color: rgba(236, 229, 210, 0.78);
          max-width: 520px;
          margin: 0 auto 36px;
        }
        .atl-success-return {
          display: inline-block;
          padding: 16px 36px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(236, 229, 210, 0.85);
          border: 1px solid rgba(220, 190, 130, 0.45);
          text-decoration: none;
          transition: color 320ms ease, border-color 320ms ease;
        }
        .atl-success-return:hover { color: #f5efdf; border-color: rgba(220, 190, 130, 0.85); }
      `}</style>

      <Link to="/" className="atl-back" data-testid="atl-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN TO PHILEON</span>
      </Link>

      <div className="atl-shell">
        {status === "success" ? (
          <div className="atl-success" data-testid="atl-success">
            <p className="atl-success-eyebrow">REQUEST RECEIVED</p>
            <p className="atl-success-title">
              Thank you, {form.full_name.split(" ")[0] || "and welcome"}.
            </p>
            <p className="atl-success-body">
              The atelier will be in touch within a few working days to begin
              the conversation. We treat every project as a private collaboration —
              no marketing, no auto-responders.
            </p>
            <Link to="/" className="atl-success-return" data-testid="atl-success-return">
              RETURN TO PHILEON
            </Link>
          </div>
        ) : (
          <>
            <p className="atl-eyebrow" data-testid="atl-eyebrow">PHILEON · ATELIER</p>
            <h1 className="atl-title" data-testid="atl-title">The Atelier</h1>
            <p className="atl-tagline">
              For pieces that don't yet exist — and for those that already do,
              waiting to be reimagined.
            </p>
            <p className="atl-meta">
              Custom commissions · Old gold rebuilt · Heirloom restoration · One-of-one couture
            </p>

            <div className="atl-divider" aria-hidden="true" />

            <form className="atl-form" onSubmit={onSubmit} noValidate data-testid="atl-form">
              {/* Project type */}
              <div className="atl-field">
                <span className="atl-label">Project</span>
                <div className="atl-types" role="radiogroup" aria-label="Project type" data-testid="atl-types">
                  {PROJECT_TYPES.map((p) => {
                    const isSel = form.project_type === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={isSel}
                        onClick={() => setForm((f) => ({ ...f, project_type: p.id }))}
                        className={`atl-type ${isSel ? "is-selected" : ""}`}
                        data-testid={`atl-type-${p.id}`}
                      >
                        <span className="atl-type-name">{p.label}</span>
                        <span className="atl-type-blurb">{p.blurb}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="atl-field">
                <label className="atl-label" htmlFor="atl-name">Full Name</label>
                <input
                  id="atl-name"
                  type="text"
                  className="atl-input"
                  value={form.full_name}
                  onChange={update("full_name")}
                  placeholder="Your full name"
                  required
                  data-testid="atl-name-input"
                />
              </div>

              <div className="atl-row">
                <div className="atl-field">
                  <label className="atl-label" htmlFor="atl-email">Email</label>
                  <input
                    id="atl-email"
                    type="email"
                    className="atl-input"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    required
                    data-testid="atl-email-input"
                  />
                </div>
                <div className="atl-field">
                  <label className="atl-label" htmlFor="atl-phone">Phone <span style={{ textTransform: "lowercase", letterSpacing: "0.06em", opacity: 0.55 }}>(optional)</span></label>
                  <input
                    id="atl-phone"
                    type="tel"
                    className="atl-input"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="+1 555 0123"
                    data-testid="atl-phone-input"
                  />
                </div>
              </div>

              <div className="atl-row">
                <div className="atl-field">
                  <label className="atl-label" htmlFor="atl-timeline">Timeline</label>
                  <div className="atl-select-wrap">
                    <select
                      id="atl-timeline"
                      className="atl-select"
                      value={form.timeline}
                      onChange={update("timeline")}
                      data-testid="atl-timeline-select"
                    >
                      {TIMELINE_OPTIONS.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="atl-field">
                  <label className="atl-label" htmlFor="atl-budget">Budget</label>
                  <div className="atl-select-wrap">
                    <select
                      id="atl-budget"
                      className="atl-select"
                      value={form.budget}
                      onChange={update("budget")}
                      data-testid="atl-budget-select"
                    >
                      {BUDGET_OPTIONS.map((b) => (
                        <option key={b.id} value={b.id}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="atl-field">
                <label className="atl-label" htmlFor="atl-message">Tell us about the project</label>
                <textarea
                  id="atl-message"
                  className="atl-textarea"
                  value={form.message}
                  onChange={update("message")}
                  placeholder="The story, the stones, the silhouette, the occasion — whatever you have. Sketches, references, and photos can be sent in the follow-up email."
                  required
                  data-testid="atl-message-input"
                />
              </div>

              {status === "error" && errorMsg && (
                <div className="atl-error" data-testid="atl-error">{errorMsg}</div>
              )}

              <button
                type="submit"
                className="atl-submit"
                disabled={status === "submitting"}
                data-testid="atl-submit-btn"
              >
                {status === "submitting" ? "SENDING…" : "REQUEST THE ATELIER"}
              </button>

              <p className="atl-microcopy">
                Every project begins with a private conversation. No timelines or
                quotes are issued until the brief is understood.
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
