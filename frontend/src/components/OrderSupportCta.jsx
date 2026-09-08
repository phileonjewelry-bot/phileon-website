/* PHILEON — OrderSupportCta (Layer 6).

   Order-linked support intake shown on the customer Order Status page.
   Uses the SAME one-time status token that authenticated the page — the
   backend enforces cross-order isolation. Customer-safe status labels
   only; never surfaces priority, internal notes, or audit rows.
*/
import { useEffect, useState } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { value: 'order_status',      label: 'Order status' },
  { value: 'shipping',          label: 'Shipping question' },
  { value: 'return',            label: 'Return' },
  { value: 'warranty',          label: 'Warranty concern' },
  { value: 'product_question',  label: 'Product question' },
  { value: 'size_fit',          label: 'Size / fit' },
  { value: 'customization',     label: 'Customization request' },
  { value: 'payment',           label: 'Payment / billing' },
  { value: 'other',             label: 'Something else' },
];

const CUSTOMER_LABEL = {
  'new':                 'Request received',
  'open':                'PHILEON is reviewing',
  'waiting_on_customer': 'Waiting for your response',
  'waiting_on_phileon':  'PHILEON is reviewing',
  'resolved':            'Resolved',
  'closed':              'Closed',
};

export default function OrderSupportCta({ orderNumber, token }) {
  const [existing, setExisting] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('shipping');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [justCreated, setJustCreated] = useState(null);

  useEffect(() => {
    if (!orderNumber || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `${API}/api/concierge/order-support?order_number=${encodeURIComponent(orderNumber)}&token=${encodeURIComponent(token)}`
        );
        if (!cancelled && r.ok) {
          const data = await r.json();
          setExisting(data.items || []);
        }
      } catch (_e) { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [orderNumber, token]);

  const submit = async () => {
    setError('');
    if (!subject.trim() || !message.trim()) {
      setError('Please add a short subject and a message.'); return;
    }
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/concierge/order-support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber,
          token,
          category,
          subject: subject.trim().slice(0, 200),
          message: message.trim().slice(0, 4000),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const code = data?.detail?.code;
        setError(
          code === 'RATE_LIMITED'
            ? 'You have submitted several requests recently. Please wait a few minutes.'
            : code === 'INVALID_TOKEN' || code === 'NOT_FOUND'
              ? 'This link is no longer valid.'
              : 'Unable to submit. Please email concierge@getyourphileon.com.'
        );
        return;
      }
      setJustCreated(data);
      setExisting((cur) => [data, ...cur]);
      setShowForm(false);
      setSubject(''); setMessage('');
    } catch (_e) {
      setError('Network error. Please try again shortly.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="order-support-cta">
      <p className="os-eyebrow" style={{ textAlign: 'left', margin: 0 }}>
        Need help with this order?
      </p>

      {existing.length > 0 && (
        <div style={{ marginTop: 12 }} data-testid="order-support-list">
          {existing.map((c) => (
            <div key={c.case_id}
                 className="os-row"
                 style={{ display: 'flex', justifyContent: 'space-between',
                          gap: 16, padding: '10px 0',
                          borderBottom: '1px dotted rgba(200,162,74,.12)' }}
                 data-testid={`order-support-case-${c.case_id}`}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif",
                             fontSize: 15, color: '#e8e0cf', fontStyle: 'italic' }}>
                {c.subject}
              </span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11,
                             letterSpacing: '.24em', color: '#c8a24a',
                             textTransform: 'uppercase' }}>
                {CUSTOMER_LABEL[c.status] || 'Received'}
              </span>
            </div>
          ))}
        </div>
      )}

      {justCreated && (
        <p style={{ marginTop: 14, color: 'rgba(232,224,207,.85)',
                    fontFamily: "'Cormorant Garamond',serif",
                    fontStyle: 'italic', fontSize: 15 }}
           data-testid="order-support-created">
          Thank you. A member of the PHILEON concierge will follow up shortly.
          {justCreated.case_id ? ` Reference: ${justCreated.case_id}.` : ''}
        </p>
      )}

      {!showForm ? (
        <button onClick={() => setShowForm(true)}
                data-testid="order-support-open-btn"
                style={{
                  marginTop: 14, fontFamily: "'Cinzel',serif",
                  fontSize: 11, letterSpacing: '.32em',
                  textTransform: 'uppercase', padding: '12px 22px',
                  background: 'transparent', color: '#c8a24a',
                  border: '1px solid #c8a24a', cursor: 'pointer',
                }}>
          Contact Concierge
        </button>
      ) : (
        <div style={{ marginTop: 14 }} data-testid="order-support-form">
          <label style={{ display: 'block', marginBottom: 6,
                          fontFamily: "'Cinzel',serif", fontSize: 10.5,
                          letterSpacing: '.32em', textTransform: 'uppercase',
                          color: 'rgba(232,224,207,.55)' }}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
                  data-testid="order-support-category"
                  style={{ width: '100%', padding: '10px 12px',
                            background: '#08070a', color: '#e8e0cf',
                            border: '1px solid #33322a', fontFamily: 'inherit',
                            fontSize: 15 }}>
            {CATEGORIES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <label style={{ display: 'block', margin: '14px 0 6px',
                          fontFamily: "'Cinzel',serif", fontSize: 10.5,
                          letterSpacing: '.32em', textTransform: 'uppercase',
                          color: 'rgba(232,224,207,.55)' }}>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
                 maxLength={200} placeholder="A short summary"
                 data-testid="order-support-subject"
                 style={{ width: '100%', padding: '10px 12px',
                          background: '#08070a', color: '#e8e0cf',
                          border: '1px solid #33322a', fontFamily: 'inherit',
                          fontSize: 15 }} />

          <label style={{ display: 'block', margin: '14px 0 6px',
                          fontFamily: "'Cinzel',serif", fontSize: 10.5,
                          letterSpacing: '.32em', textTransform: 'uppercase',
                          color: 'rgba(232,224,207,.55)' }}>Message</label>
          <textarea rows={4} value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={4000}
                    data-testid="order-support-message"
                    placeholder="Please describe how we can help."
                    style={{ width: '100%', padding: '10px 12px',
                              background: '#08070a', color: '#e8e0cf',
                              border: '1px solid #33322a',
                              fontFamily: 'inherit', fontSize: 15,
                              resize: 'vertical' }} />

          {error ? (
            <p style={{ margin: '10px 0 0', color: '#e0c9c9', fontSize: 13.5 }}
               data-testid="order-support-error">{error}</p>
          ) : null}

          <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            <button onClick={submit} disabled={busy}
                    data-testid="order-support-submit-btn"
                    style={{ fontFamily: "'Cinzel',serif",
                              fontSize: 11, letterSpacing: '.32em',
                              textTransform: 'uppercase', padding: '12px 22px',
                              background: '#c8a24a', color: '#08070a',
                              border: '1px solid #c8a24a',
                              cursor: busy ? 'not-allowed' : 'pointer',
                              opacity: busy ? 0.5 : 1 }}>
              {busy ? 'Submitting…' : 'Send'}
            </button>
            <button onClick={() => { setShowForm(false); setError(''); }}
                    data-testid="order-support-cancel-btn"
                    style={{ fontFamily: "'Cinzel',serif",
                              fontSize: 11, letterSpacing: '.32em',
                              textTransform: 'uppercase', padding: '12px 22px',
                              background: 'transparent',
                              color: 'rgba(232,224,207,.6)',
                              border: '1px solid rgba(232,224,207,.15)',
                              cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
