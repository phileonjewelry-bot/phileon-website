import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import RingSizeSelector, {
  DEFAULT_RING_SIZE,
  ringSizeLabel,
} from "@/components/RingSizeSelector";

/**
 * LADY JAY — Private Consultation
 *
 * /consult/lady-jay
 *
 * Tone: private luxury appointment. Not a contact form.
 * Visual: deep navy + sapphire accents + black glass + soft gold.
 * Posts to /api/consultations/private with product_slug="lady-jay".
 */

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const METAL_OPTIONS = [
  { id: "sterling-silver", label: "Sterling Silver" },
  { id: "10k-white-gold", label: "10K White Gold" },
  { id: "14k-white-gold", label: "14K White Gold" },
  { id: "18k-white-gold", label: "18K White Gold" },
];

const CONSULT_TYPES = [
  { id: "virtual", label: "Virtual Consultation" },
  { id: "in_person", label: "In-Person Appointment" },
  { id: "sizing", label: "Sizing Assistance" },
  { id: "collector", label: "Collector Inquiry" },
];

export default function LadyJayConsultPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    preferred_metal: "18K White Gold",
    ring_size: DEFAULT_RING_SIZE,
    consultation_type: "virtual",
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
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) return "Please enter a valid email address.";
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
        product_slug: "lady-jay",
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        preferred_metal: form.preferred_metal,
        ring_size: form.ring_size,
        consultation_type: form.consultation_type,
        message: form.message.trim() || null,
      });
      setStatus("success");
    } catch (e2) {
      setStatus("error");
      setErrorMsg("Something prevented the submission. Please try again.");
    }
  };

  return (
    <section
      className={`ljc-room${isMounted ? " ljc-loaded" : ""}`}
      data-page="lady-jay-consult"
      data-testid="lady-jay-consult-page"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .ljc-room {
          position: relative;
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(35, 60, 120, 0.35), transparent 60%),
            radial-gradient(circle at 80% 90%, rgba(15, 28, 56, 0.55), transparent 65%),
            #050810;
          color: #e4eaf2;
          padding: 96px 24px 140px;
          opacity: 0;
          transition: opacity 900ms ease;
        }
        .ljc-room.ljc-loaded { opacity: 1; }

        .ljc-stadium-grain::before {
          content: "";
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.05'/></svg>");
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        .ljc-back {
          position: absolute; top: 28px; left: 28px; z-index: 5;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Inter', sans-serif; font-size: 11px;
          letter-spacing: 0.36em; text-transform: uppercase;
          color: rgba(228, 234, 242, 0.65);
          text-decoration: none;
          transition: color 320ms ease;
        }
        .ljc-back:hover { color: rgba(228, 234, 242, 0.95); }

        .ljc-shell {
          position: relative;
          max-width: 760px;
          margin: 0 auto;
          padding: 60px clamp(20px, 4vw, 56px) 64px;
          background: linear-gradient(180deg, rgba(10, 16, 32, 0.62) 0%, rgba(6, 10, 22, 0.78) 100%);
          border: 1px solid rgba(99, 144, 220, 0.16);
          backdrop-filter: blur(14px);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(150, 190, 240, 0.04) inset;
        }

        .ljc-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(150, 190, 240, 0.78);
          margin: 0 0 22px;
          text-align: center;
        }
        .ljc-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          letter-spacing: 0.06em;
          color: #f0f4fb;
          margin: 0 0 16px;
          text-align: center;
        }
        .ljc-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: clamp(1.05rem, 1.5vw, 1.25rem);
          line-height: 1.55;
          color: rgba(228, 234, 242, 0.85);
          text-align: center;
          margin: 0 auto 30px;
          max-width: 520px;
        }
        .ljc-meta {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.95rem;
          line-height: 1.6;
          color: rgba(180, 205, 240, 0.6);
          text-align: center;
          margin: 0 0 56px;
        }
        .ljc-meta span { display: block; }

        .ljc-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(150, 190, 240, 0.32) 50%, transparent 100%);
          margin: 0 0 44px;
        }

        .ljc-form { display: grid; gap: 28px; }
        .ljc-row { display: grid; gap: 28px; grid-template-columns: 1fr 1fr; }
        @media (max-width: 700px) { .ljc-row { grid-template-columns: 1fr; } }

        .ljc-field { display: flex; flex-direction: column; gap: 10px; }
        .ljc-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(150, 190, 240, 0.68);
        }
        .ljc-input,
        .ljc-textarea,
        .ljc-select {
          width: 100%;
          padding: 16px 18px;
          background: rgba(6, 12, 26, 0.55);
          border: 1px solid rgba(99, 144, 220, 0.22);
          color: #f0f4fb;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem;
          font-weight: 300;
          letter-spacing: 0.01em;
          transition: border-color 280ms ease, background 280ms ease;
          appearance: none;
        }
        .ljc-input:focus,
        .ljc-textarea:focus,
        .ljc-select:focus {
          outline: none;
          border-color: rgba(150, 190, 240, 0.85);
          background: rgba(10, 18, 35, 0.7);
        }
        .ljc-input::placeholder,
        .ljc-textarea::placeholder { color: rgba(228, 234, 242, 0.35); }
        .ljc-textarea { min-height: 130px; resize: vertical; font-family: 'Cormorant Garamond', serif; }

        /* Native select chevron */
        .ljc-select-wrap { position: relative; }
        .ljc-select {
          padding-right: 44px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%237fa8e6' stroke-width='1.5'><polyline points='6 9 12 15 18 9'/></svg>");
          background-repeat: no-repeat;
          background-position: right 18px center;
          background-size: 12px;
          font-family: 'Cinzel', serif;
          font-size: 0.98rem;
          letter-spacing: 0.06em;
        }
        .ljc-select option { background: #060a14; color: #f0f4fb; }

        /* Submit */
        .ljc-submit {
          margin-top: 12px;
          padding: 22px 32px;
          background: rgba(60, 100, 180, 0.92);
          color: #f0f4fb;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.46em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 320ms ease, letter-spacing 320ms ease;
        }
        .ljc-submit:hover {
          background: rgba(80, 130, 215, 1);
          letter-spacing: 0.52em;
        }
        .ljc-submit:disabled { opacity: 0.55; cursor: default; letter-spacing: 0.46em !important; }

        .ljc-microcopy {
          margin: 28px 0 0;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 0.95rem;
          line-height: 1.6;
          color: rgba(180, 205, 240, 0.65);
          text-align: center;
        }

        .ljc-error {
          margin-top: 18px;
          padding: 14px 18px;
          background: rgba(140, 30, 60, 0.18);
          border-left: 2px solid rgba(220, 120, 130, 0.8);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 0.95rem;
          color: rgba(245, 200, 210, 0.92);
        }

        /* Success state */
        .ljc-success {
          padding: 60px 0 20px;
          text-align: center;
        }
        .ljc-success-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(150, 190, 240, 0.78);
          margin: 0 0 26px;
        }
        .ljc-success-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(1.6rem, 2.6vw, 2.1rem);
          line-height: 1.4;
          color: #f0f4fb;
          margin: 0 0 24px;
        }
        .ljc-success-body {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.65;
          color: rgba(228, 234, 242, 0.82);
          max-width: 500px;
          margin: 0 auto 36px;
        }
        .ljc-success-return {
          display: inline-block;
          padding: 16px 36px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(228, 234, 242, 0.85);
          border: 1px solid rgba(150, 190, 240, 0.45);
          text-decoration: none;
          transition: color 320ms ease, border-color 320ms ease;
        }
        .ljc-success-return:hover { color: #f0f4fb; border-color: rgba(180, 205, 240, 0.85); }
      `}</style>

      <Link to="/lady-jay" className="ljc-back" data-testid="ljc-back-btn">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN TO LADY JAY</span>
      </Link>

      <div className="ljc-shell ljc-stadium-grain">
        {status === "success" ? (
          <div className="ljc-success" data-testid="ljc-success">
            <p className="ljc-success-eyebrow">REQUEST RECEIVED</p>
            <p className="ljc-success-title">
              Thank you, {form.full_name.split(" ")[0] || "and welcome"}.
            </p>
            <p className="ljc-success-body">
              A member of the PHILEON atelier will contact you directly regarding
              availability, sizing, and production timelines for LADY JAY.
            </p>
            <Link to="/lady-jay" className="ljc-success-return" data-testid="ljc-success-return">
              RETURN TO LADY JAY
            </Link>
          </div>
        ) : (
          <>
            <p className="ljc-eyebrow" data-testid="ljc-eyebrow">PHILEON · PRIVATE CONSULTATION</p>
            <h1 className="ljc-title" data-testid="ljc-title">LADY JAY</h1>
            <p className="ljc-tagline">
              A private commissioning experience for the 2026 Tribute Series.
            </p>
            <p className="ljc-meta">
              <span>Available for the 2026 season only.</span>
              <span>Retired at season's end.</span>
              <span>No reissue.</span>
            </p>

            <div className="ljc-divider" aria-hidden="true" />

            <form className="ljc-form" onSubmit={onSubmit} noValidate data-testid="ljc-form">
              <div className="ljc-field">
                <label className="ljc-label" htmlFor="ljc-name">Full Name</label>
                <input
                  id="ljc-name"
                  type="text"
                  className="ljc-input"
                  value={form.full_name}
                  onChange={update("full_name")}
                  placeholder="Your full name"
                  required
                  data-testid="ljc-name-input"
                />
              </div>

              <div className="ljc-row">
                <div className="ljc-field">
                  <label className="ljc-label" htmlFor="ljc-email">Email Address</label>
                  <input
                    id="ljc-email"
                    type="email"
                    className="ljc-input"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    required
                    data-testid="ljc-email-input"
                  />
                </div>
                <div className="ljc-field">
                  <label className="ljc-label" htmlFor="ljc-phone">Phone Number <span style={{ textTransform: "lowercase", letterSpacing: "0.06em", opacity: 0.55 }}>(optional)</span></label>
                  <input
                    id="ljc-phone"
                    type="tel"
                    className="ljc-input"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="+1 555 0123"
                    data-testid="ljc-phone-input"
                  />
                </div>
              </div>

              <div className="ljc-row">
                <div className="ljc-field">
                  <label className="ljc-label" htmlFor="ljc-metal">Preferred Composition</label>
                  <div className="ljc-select-wrap">
                    <select
                      id="ljc-metal"
                      className="ljc-select"
                      value={form.preferred_metal}
                      onChange={update("preferred_metal")}
                      data-testid="ljc-metal-select"
                    >
                      {METAL_OPTIONS.map((m) => (
                        <option key={m.id} value={m.label}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="ljc-field">
                  <label className="ljc-label" htmlFor="ljc-consult-type">Preferred Consultation Type</label>
                  <div className="ljc-select-wrap">
                    <select
                      id="ljc-consult-type"
                      className="ljc-select"
                      value={form.consultation_type}
                      onChange={update("consultation_type")}
                      data-testid="ljc-consult-type-select"
                    >
                      {CONSULT_TYPES.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="ljc-field">
                <RingSizeSelector
                  value={form.ring_size}
                  onChange={(v) => setForm((f) => ({ ...f, ring_size: v }))}
                  bandWidthMm={22}
                  testIdPrefix="ljc-ringsize"
                  style={{
                    "--ring-accent": "#7fa8e6",
                    "--ring-bg": "rgba(6, 12, 26, 0.55)",
                    "--ring-fg": "#f0f4fb",
                    "--ring-muted": "rgba(180, 205, 240, 0.6)",
                  }}
                />
              </div>

              <div className="ljc-field">
                <label className="ljc-label" htmlFor="ljc-message">Message / Notes</label>
                <textarea
                  id="ljc-message"
                  className="ljc-textarea"
                  value={form.message}
                  onChange={update("message")}
                  placeholder="Tell us anything we should know — the occasion, your timeline, sizing context, or whether this is for a collection."
                  data-testid="ljc-message-input"
                />
              </div>

              {status === "error" && errorMsg && (
                <div className="ljc-error" data-testid="ljc-error">{errorMsg}</div>
              )}

              <button
                type="submit"
                className="ljc-submit"
                disabled={status === "submitting"}
                data-testid="ljc-submit-btn"
              >
                {status === "submitting" ? "SENDING…" : "REQUEST PRIVATE CONSULTATION"}
              </button>

              <p className="ljc-microcopy">
                A member of the PHILEON atelier will contact you directly regarding
                availability, sizing, and production timelines.
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

// noop reference to silence linters about unused import in some configurations
void ringSizeLabel;
