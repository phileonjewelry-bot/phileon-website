import { useState, useRef, useCallback, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// PHILEON — Concierge Agent (Phase 9).
//
// Intake experience for product / bespoke / redesign / sizing questions.
// Natural-language message + optional images + optional details. All
// uploads route through /api/concierge/attachments → Emergent Object
// Storage under phileon/concierge/{reference}/…  Then POST /api/concierge/
// inquiries persists the structured record.
//
// The agent is intake only — it does not quote, promise timelines, or
// finalize CAD/stone/production. Confirmation copy is always "typically
// respond within 24 hours" (never "guaranteed").
// ─────────────────────────────────────────────────────────────────────────────

const API = process.env.REACT_APP_BACKEND_URL;
const MAX_IMAGES = 5;
const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp';

function generateClientReference() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const pick = (n) => Array.from({ length: n }, () => abc[Math.floor(Math.random() * abc.length)]).join('');
  return `PHL-${pick(4)}-${pick(3)}`;
}

export default function ConciergeAgent({ open, onClose, productContext, source = 'concierge', bespoke = false }) {
  // Phase 2 analytics: fire ONE `concierge_open` event per (session, source)
  // when the agent transitions from closed → open. sessionStorage keeps the
  // anonymous id session-scoped; no localStorage, no fingerprinting.
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    try {
      let sid = window.sessionStorage.getItem('phileon_session_id');
      if (!sid) {
        sid = (window.crypto && window.crypto.randomUUID)
          ? window.crypto.randomUUID()
          : String(Math.random()).slice(2) + Date.now();
        window.sessionStorage.setItem('phileon_session_id', sid);
      }
      // Resolve normalized source: prefer explicit product/journal, else
      // fall back to the plain `source` prop.
      let normalized = source;
      if (bespoke) normalized = 'bespoke:custom-jewelry';
      else if (productContext && productContext.slug) normalized = `product:${productContext.slug}`;
      else if (source && !source.includes(':')) {
        // Legacy `pdp:<slug>` and `journal:<slug>` already pass through
        // untouched; other bare strings are also passed through and the
        // backend will decide whether to accept them.
        normalized = source;
      }
      const body = JSON.stringify({ event: 'concierge_open', source: normalized, session_id: sid });
      const url = `${API}/api/events`;
      // navigator.sendBeacon is fire-and-forget and cannot block the modal.
      if (navigator && typeof navigator.sendBeacon === 'function') {
        try {
          navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
          return;
        } catch (_) { /* fall through to fetch */ }
      }
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
        .catch(() => {});
    } catch (_) {
      // Analytics must never block Concierge.
    }
    // Only fire on close→open transition, not on every prop change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState('email');
  const [budget, setBudget] = useState('');
  const [ringSize, setRingSize] = useState('');
  const [metal, setMetal] = useState('');
  const [stone, setStone] = useState('');
  const [timeline, setTimeline] = useState('');
  const [images, setImages] = useState([]); // {file, previewUrl, uploading, storagePath?, error?}
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null); // {reference, attachmentCount, product}
  const [formError, setFormError] = useState(null);
  const referenceRef = useRef(generateClientReference());
  const fileInputRef = useRef(null);

  const resetForm = useCallback(() => {
    setMessage(''); setName(''); setEmail(''); setPhone('');
    setPreferredContact('email'); setBudget(''); setRingSize(''); setMetal('');
    setStone(''); setTimeline(''); setImages([]); setFormError(null);
    setConfirmation(null); referenceRef.current = generateClientReference();
  }, []);

  const handleClose = () => { resetForm(); onClose?.(); };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const file of files) {
      if (images.length >= MAX_IMAGES) break;
      if (!ACCEPT.split(',').includes(file.type)) {
        setFormError(`${file.name}: unsupported type. Use JPG, PNG or WEBP.`); continue;
      }
      if (file.size > MAX_BYTES) {
        setFormError(`${file.name}: exceeds 8 MB.`); continue;
      }
      const previewUrl = URL.createObjectURL(file);
      const entry = { file, previewUrl, uploading: true };
      setImages((prev) => [...prev, entry]);
      try {
        const fd = new FormData();
        fd.append('reference', referenceRef.current);
        fd.append('file', file);
        const resp = await fetch(`${API}/api/concierge/attachments`, { method: 'POST', body: fd });
        if (!resp.ok) throw new Error(`Upload failed (${resp.status})`);
        const data = await resp.json();
        setImages((prev) => prev.map((it) => (it === entry ? { ...it, uploading: false, storagePath: data.storagePath, contentType: data.contentType } : it)));
      } catch (err) {
        setImages((prev) => prev.map((it) => (it === entry ? { ...it, uploading: false, error: err.message || 'Upload failed' } : it)));
      }
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      const next = prev.slice();
      const [rm] = next.splice(idx, 1);
      if (rm?.previewUrl) URL.revokeObjectURL(rm.previewUrl);
      return next;
    });
  };

  const submit = async () => {
    setFormError(null);
    if (!name.trim() || !email.trim() || !email.includes('@')) {
      setFormError('Please share your name and a valid email.'); return;
    }
    if (!message.trim()) {
      setFormError('Please describe what you\u2019re looking for.'); return;
    }
    if (images.some((i) => i.uploading)) {
      setFormError('One or more images are still uploading — please wait.'); return;
    }
    const attachments = images
      .filter((i) => i.storagePath)
      .map((i) => ({ storagePath: i.storagePath, contentType: i.contentType }));
    setSubmitting(true);
    try {
      const body = {
        reference: referenceRef.current,
        source,
        product: productContext || {},
        customer: { name: name.trim(), email: email.trim(), phone: phone.trim(), preferred_contact: preferredContact },
        message: message.trim(),
        optional_details: { budget, ring_size: ringSize, metal, stone, desired_timeline: timeline },
        attachments,
      };
      const resp = await fetch(`${API}/api/concierge/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.detail || 'Submission failed');
      setConfirmation({
        reference: data.reference,
        attachmentCount: data.attachmentCount,
        product: productContext,
      });
      // Fire lightweight local analytics event (no PII, no message contents)
      try {
        const key = 'phileon_events';
        const events = JSON.parse(localStorage.getItem(key) || '[]');
        events.push({ t: Date.now(), name: 'concierge_submit', source, hasProduct: !!productContext?.slug, attachmentCount: data.attachmentCount });
        localStorage.setItem(key, JSON.stringify(events.slice(-200)));
      } catch (_e) { /* noop */ }
    } catch (err) {
      setFormError(err.message || 'Could not submit right now — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="PHILEON Concierge">
      <div style={styles.sheet} data-testid="concierge-modal">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          style={styles.close}
          data-testid="concierge-close"
        >
          ×
        </button>
        {!confirmation ? (
          <>
            <p style={styles.eyebrow}>{bespoke ? 'PHILEON · Bespoke Conversation' : 'PHILEON · Concierge'}</p>
            <h2 style={styles.h2}>
              {bespoke ? 'Start a Bespoke Conversation' : productContext?.name ? `Ask PHILEON about ${productContext.name}` : 'Ask PHILEON'}
            </h2>
            <p style={styles.lede}>
              {productContext?.name
                ? `Questions about sizing, stones, metals, or a custom version of ${productContext.name}? Share what you\u2019re thinking below — a PHILEON concierge will typically respond within 24 hours.`
                : 'Share what you\u2019re thinking below — a PHILEON concierge will typically respond within 24 hours.'}
            </p>

            {productContext?.name && (
              <div style={styles.contextChip} data-testid="concierge-product-context">
                <span style={styles.chipLabel}>Piece</span>
                <span style={styles.chipValue}>{productContext.name}</span>
                {productContext.variant && <span style={styles.chipValue}>· {productContext.variant}</span>}
              </div>
            )}

            <label style={styles.field}>
              <span style={styles.label}>What are you thinking?</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={4000}
                placeholder={bespoke
                  ? 'Describe the piece you have in mind — inspiration, materials, stones, or an existing piece you\u2019d like to redesign.'
                  : 'For example: “Can this be made in 14K rose gold with a longer drop?” or “Is this available in size 12?”'}
                style={styles.textarea}
                data-testid="concierge-message"
              />
            </label>

            <div style={styles.rowTwo}>
              <label style={styles.field}>
                <span style={styles.label}>Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} style={styles.input} data-testid="concierge-name" />
              </label>
              <label style={styles.field}>
                <span style={styles.label}>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} data-testid="concierge-email" />
              </label>
            </div>

            <div style={styles.rowTwo}>
              <label style={styles.field}>
                <span style={styles.label}>Phone (optional)</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input} data-testid="concierge-phone" />
              </label>
              <label style={styles.field}>
                <span style={styles.label}>Preferred contact</span>
                <select value={preferredContact} onChange={(e) => setPreferredContact(e.target.value)} style={styles.input} data-testid="concierge-contact-method">
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </label>
            </div>

            <details style={styles.optional}>
              <summary style={styles.optionalSummary}>Add optional details</summary>
              <div style={styles.optionalGrid}>
                <label style={styles.field}>
                  <span style={styles.label}>Budget (optional)</span>
                  <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. C$4,000\u2013C$7,000" style={styles.input} />
                </label>
                <label style={styles.field}>
                  <span style={styles.label}>Ring size (optional)</span>
                  <input value={ringSize} onChange={(e) => setRingSize(e.target.value)} style={styles.input} />
                </label>
                <label style={styles.field}>
                  <span style={styles.label}>Preferred metal (optional)</span>
                  <input value={metal} onChange={(e) => setMetal(e.target.value)} placeholder="14K rose gold, sterling, \u2026" style={styles.input} />
                </label>
                <label style={styles.field}>
                  <span style={styles.label}>Preferred stone (optional)</span>
                  <input value={stone} onChange={(e) => setStone(e.target.value)} placeholder="Lab-grown diamond, sapphire, \u2026" style={styles.input} />
                </label>
                <label style={styles.field}>
                  <span style={styles.label}>Desired timeline (optional)</span>
                  <input value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="Occasion or date if any" style={styles.input} />
                </label>
              </div>
            </details>

            <div style={styles.uploadWrap}>
              <div style={styles.uploadRow}>
                <span style={styles.label}>Reference images (optional — up to {MAX_IMAGES})</span>
                <button
                  type="button"
                  style={styles.attachBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= MAX_IMAGES}
                  data-testid="concierge-attach"
                >
                  Attach image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT}
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
              </div>
              {images.length > 0 && (
                <ul style={styles.thumbs} data-testid="concierge-attachments">
                  {images.map((img, i) => (
                    <li key={i} style={styles.thumb}>
                      <img src={img.previewUrl} alt="" style={styles.thumbImg} />
                      {img.uploading && <span style={styles.thumbNote}>Uploading\u2026</span>}
                      {img.error && <span style={styles.thumbError}>{img.error}</span>}
                      <button type="button" onClick={() => removeImage(i)} style={styles.thumbRemove} aria-label="Remove image">×</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {formError && <p style={styles.error} role="alert" data-testid="concierge-error">{formError}</p>}

            <p style={styles.footnote}>
              PHILEON will use these details only to help with your inquiry. Uploaded photos are stored privately and never used for public marketing without your permission. See our{' '}
              <a href="/privacy" style={styles.link}>Privacy Policy</a>.
            </p>

            <button
              type="button"
              style={submitting ? { ...styles.submit, ...styles.submitBusy } : styles.submit}
              disabled={submitting}
              onClick={submit}
              data-testid="concierge-submit"
            >
              {submitting ? 'Sending\u2026' : bespoke ? 'Start Conversation' : 'Send to Concierge'}
            </button>
            <p style={styles.slaLine}>A PHILEON concierge will typically respond within 24 hours.</p>
          </>
        ) : (
          <div data-testid="concierge-confirmation">
            <p style={styles.eyebrow}>PHILEON · Received</p>
            <h2 style={styles.h2}>Your request is with PHILEON.</h2>
            <p style={styles.lede}>A concierge will typically respond within 24 hours.</p>

            <dl style={styles.confDl}>
              <div style={styles.confRow}>
                <dt style={styles.confDt}>Reference</dt>
                <dd style={styles.confDd} data-testid="concierge-reference">{confirmation.reference}</dd>
              </div>
              {confirmation.product?.name && (
                <div style={styles.confRow}>
                  <dt style={styles.confDt}>Piece</dt>
                  <dd style={styles.confDd}>{confirmation.product.name}</dd>
                </div>
              )}
              {confirmation.attachmentCount > 0 && (
                <div style={styles.confRow}>
                  <dt style={styles.confDt}>Reference images</dt>
                  <dd style={styles.confDd}>{confirmation.attachmentCount}</dd>
                </div>
              )}
              <div style={styles.confRow}>
                <dt style={styles.confDt}>Reply by</dt>
                <dd style={styles.confDd}>{preferredContact === 'phone' ? 'Phone' : 'Email'}</dd>
              </div>
            </dl>

            <button type="button" style={styles.submit} onClick={handleClose} data-testid="concierge-done">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const rose = '#c48369';
const ink = '#f4e4dc';
const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
    zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '48px 16px', overflowY: 'auto',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  sheet: {
    background: '#0d0d0d', color: ink, width: '100%', maxWidth: 620,
    border: '1px solid rgba(196,131,105,0.16)',
    padding: '40px 28px 32px', position: 'relative', boxSizing: 'border-box',
  },
  close: {
    position: 'absolute', top: 12, right: 14, background: 'transparent',
    border: 'none', color: 'rgba(244,228,220,0.6)', fontSize: 26, cursor: 'pointer',
    width: 44, height: 44, minWidth: 44, minHeight: 44,
  },
  eyebrow: { letterSpacing: '0.32em', fontSize: 10, color: rose, textTransform: 'uppercase', margin: '0 0 14px' },
  h2: { fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 300, letterSpacing: '0.04em', margin: '0 0 12px' },
  lede: { fontSize: 15, lineHeight: 1.65, color: 'rgba(244,228,220,0.82)', fontStyle: 'italic', margin: '0 0 24px' },
  contextChip: {
    display: 'inline-flex', alignItems: 'baseline', gap: 8, padding: '8px 14px',
    background: 'rgba(196,131,105,0.06)', border: '1px solid rgba(196,131,105,0.18)',
    marginBottom: 20, flexWrap: 'wrap',
  },
  chipLabel: { letterSpacing: '0.24em', fontSize: 10, color: rose, textTransform: 'uppercase' },
  chipValue: { fontSize: 13, color: ink },
  field: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1, marginBottom: 14 },
  label: { letterSpacing: '0.18em', fontSize: 10, color: 'rgba(196,131,105,0.9)', textTransform: 'uppercase' },
  textarea: {
    background: 'rgba(255,255,255,0.02)', color: ink, border: '1px solid rgba(196,131,105,0.22)',
    padding: 12, fontSize: 15, fontFamily: 'inherit', minHeight: 120, resize: 'vertical',
  },
  input: {
    background: 'rgba(255,255,255,0.02)', color: ink, border: '1px solid rgba(196,131,105,0.22)',
    padding: 12, fontSize: 15, fontFamily: 'inherit', minHeight: 44, boxSizing: 'border-box',
  },
  rowTwo: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 },
  optional: { border: '1px dashed rgba(196,131,105,0.16)', padding: '10px 14px', margin: '10px 0 16px' },
  optionalSummary: { cursor: 'pointer', letterSpacing: '0.2em', fontSize: 11, color: rose, textTransform: 'uppercase', padding: 4 },
  optionalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 },
  uploadWrap: { margin: '4px 0 20px' },
  uploadRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  attachBtn: {
    background: 'transparent', color: rose, border: `1px solid ${rose}`,
    padding: '10px 18px', letterSpacing: '0.2em', textTransform: 'uppercase',
    fontSize: 11, cursor: 'pointer', minHeight: 44,
  },
  thumbs: { listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexWrap: 'wrap', gap: 10 },
  thumb: {
    position: 'relative', width: 80, height: 80, overflow: 'hidden',
    border: '1px solid rgba(196,131,105,0.24)',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbNote: { position: 'absolute', bottom: 4, left: 4, fontSize: 9, color: rose, background: 'rgba(0,0,0,0.5)', padding: '2px 4px' },
  thumbError: { position: 'absolute', bottom: 4, left: 4, fontSize: 9, color: '#e88', background: 'rgba(0,0,0,0.5)', padding: '2px 4px' },
  thumbRemove: {
    position: 'absolute', top: 2, right: 2, width: 24, height: 24, border: 'none',
    background: 'rgba(0,0,0,0.62)', color: '#fff', cursor: 'pointer', fontSize: 16, lineHeight: 1,
  },
  submit: {
    width: '100%', background: rose, color: '#0a0a0a', border: 'none',
    padding: '16px 24px', letterSpacing: '0.28em', textTransform: 'uppercase',
    fontSize: 12, cursor: 'pointer', minHeight: 52, marginTop: 4,
    fontFamily: 'inherit',
  },
  submitBusy: { opacity: 0.6, cursor: 'wait' },
  slaLine: { fontSize: 12, color: 'rgba(244,228,220,0.6)', textAlign: 'center', margin: '14px 0 0', letterSpacing: '0.06em' },
  footnote: { fontSize: 12, lineHeight: 1.6, color: 'rgba(244,228,220,0.58)', margin: '4px 0 16px' },
  link: { color: rose, textDecoration: 'none' },
  error: { color: '#f4a89a', fontSize: 13, margin: '6px 0 12px' },
  confDl: { margin: '18px 0 28px', padding: 0 },
  confRow: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(196,131,105,0.10)' },
  confDt: { letterSpacing: '0.22em', fontSize: 10, color: rose, textTransform: 'uppercase' },
  confDd: { margin: 0, fontSize: 14, color: ink },
};
