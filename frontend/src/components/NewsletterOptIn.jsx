/* PHILEON — Newsletter opt-in
   Explicit affirmative consent (unchecked by default). Client sends
   { email, consent (must be true), session_id } to backend, which
   writes the trusted marketing_consent row. Legacy Customer.marketing_
   consent=true (default) is NOT sufficient — the customer must
   actively check this box.

   No pre-checked consent. No dark-pattern wording. No fake urgency.
*/
import React, { useEffect, useState } from "react";
const API = process.env.REACT_APP_BACKEND_URL;

function useSessionId() {
  const [sid, setSid] = useState("");
  useEffect(() => {
    let v = localStorage.getItem("phi_session_id") || "";
    if (!v) {
      // 128-bit random hex, ASCII-safe.
      const buf = new Uint8Array(16);
      (window.crypto || window.msCrypto).getRandomValues(buf);
      v = "sess-" + Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
      localStorage.setItem("phi_session_id", v);
    }
    setSid(v);
  }, []);
  return sid;
}

export default function NewsletterOptIn() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);   // <-- unchecked by default
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);      // "ok" | {error:string}
  const sessionId = useSessionId();

  async function submit(e) {
    e.preventDefault();
    if (!consent) {
      setStatus({ error: "Please check the box to confirm you'd like to receive PHILEON emails." });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const resp = await fetch(`${API}/api/behavior/newsletter/subscribe`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, session_id: sessionId }),
      });
      if (resp.status === 200) {
        setStatus("ok");
        setEmail("");
        setConsent(false);
      } else if (resp.status === 400) {
        setStatus({ error: "Please enter a valid email address." });
      } else {
        setStatus({ error: "We couldn't process that. Please try again shortly." });
      }
    } catch (_) {
      setStatus({ error: "Network error. Please try again shortly." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="phi-newsletter"
      data-testid="newsletter-optin-form"
    >
      <style>{`
        .phi-newsletter { max-width:520px; margin:0 auto; text-align:left;
          color:#e8e0cf; font-family:'Cormorant Garamond',serif; }
        .phi-newsletter h3 { font-family:'Cinzel',serif; letter-spacing:.32em;
          font-size:12px; text-transform:uppercase; color:#c8a24a;
          margin:0 0 20px; text-align:center; }
        .phi-newsletter p { font-size:14px; line-height:1.55;
          color:rgba(232,224,207,.72); margin:0 0 22px; text-align:center; }
        .phi-newsletter input[type=email] {
          width:100%; padding:14px 16px; background:transparent;
          color:#e8e0cf; border:1px solid #33322a; font-size:14px;
          font-family:'Cormorant Garamond',serif; outline:none;
        }
        .phi-newsletter input[type=email]:focus { border-color:#c8a24a; }
        .phi-consent-row { display:flex; gap:12px; margin:16px 0 24px;
          align-items:flex-start; }
        .phi-consent-row input { margin-top:4px; accent-color:#c8a24a;
          transform:scale(1.1); }
        .phi-consent-row label { font-size:13px; line-height:1.5;
          color:rgba(232,224,207,.75); cursor:pointer; }
        .phi-consent-row a { color:#c8a24a; text-decoration:underline;
          text-underline-offset:2px; }
        .phi-newsletter button {
          width:100%; padding:14px 22px; background:transparent;
          border:1.5px solid #c8a24a; color:#e8e0cf;
          font-family:'Cinzel',serif; letter-spacing:.4em; font-size:11px;
          text-transform:uppercase; cursor:pointer;
          transition:background 200ms ease, color 200ms ease, letter-spacing 200ms ease;
        }
        .phi-newsletter button:hover:not(:disabled) {
          background:#c8a24a; color:#08070a; letter-spacing:.5em;
        }
        .phi-newsletter button:disabled { opacity:.4; cursor:not-allowed; }
        .phi-error { color:#e08282; font-size:13px; margin-top:12px; text-align:center; }
        .phi-ok    { color:#c8a24a; font-size:13px; margin-top:12px; text-align:center;
          font-style:italic; font-family:'Playfair Display',Georgia,serif; }
      `}</style>

      <h3>PHILEON DISPATCH</h3>
      <p>New pieces, atelier updates, quiet stories from PHILEON — delivered when there&apos;s something worth saying.</p>

      <input
        type="email"
        inputMode="email"
        required
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        maxLength={200}
        data-testid="newsletter-email-input"
      />

      <div className="phi-consent-row">
        <input
          id="phi-nl-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          data-testid="newsletter-consent-checkbox"
        />
        <label htmlFor="phi-nl-consent" data-testid="newsletter-consent-label">
          I&apos;d like to receive PHILEON emails about new pieces, releases, and
          atelier updates. I understand I can unsubscribe at any time from the
          link in every email.
        </label>
      </div>

      <button
        type="submit"
        disabled={busy || !email || !consent}
        data-testid="newsletter-submit-btn"
      >
        {busy ? "Sending…" : "Subscribe"}
      </button>

      {status === "ok" && (
        <p className="phi-ok" data-testid="newsletter-ok">
          Thank you. You&apos;re on the PHILEON dispatch list.
        </p>
      )}
      {status && status.error && (
        <p className="phi-error" data-testid="newsletter-error">{status.error}</p>
      )}
    </form>
  );
}
