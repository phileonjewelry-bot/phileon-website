/* PHILEON — Layer 8 Privacy Choices.

   First-party consent surface. Essential storage runs by default;
   optional analytics is OFF until the user accepts. No dark patterns.
   ACCEPT and REJECT are equally accessible. Preference is changeable
   later from the site footer (see openPrivacyChoices below).

   Marketing-email consent is SEPARATE from analytics-storage consent.
   Accepting analytics does NOT subscribe to marketing.
*/
import { useCallback, useEffect, useRef, useState } from 'react';

export const CONSENT_KEY = 'phileon_privacy_consent_v1';

export function readAnalyticsConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.analytics === true;
  } catch (_e) {
    return null;
  }
}

function writeConsent(analytics) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      analytics: !!analytics,
      updated_at: new Date().toISOString(),
      version: 'v1',
    }));
    // Notify any in-page listeners (e.g. the useAnalytics hook).
    window.dispatchEvent(new CustomEvent('phileon:privacy-choices', {
      detail: { analytics: !!analytics },
    }));
  } catch (_e) {
    /* silent */
  }
}

/** Programmatic opener for the footer "Privacy Choices" link. */
export function openPrivacyChoices() {
  window.dispatchEvent(new CustomEvent('phileon:open-privacy-choices'));
}

export default function PrivacyChoices() {
  const [visible, setVisible] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const acceptRef = useRef(null);

  const openIfNeeded = useCallback((force) => {
    if (force) { setVisible(true); return; }
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) setVisible(true);
  }, []);

  useEffect(() => {
    openIfNeeded(false);
    const handler = () => openIfNeeded(true);
    window.addEventListener('phileon:open-privacy-choices', handler);
    return () => window.removeEventListener('phileon:open-privacy-choices', handler);
  }, [openIfNeeded]);

  useEffect(() => {
    if (visible && acceptRef.current) acceptRef.current.focus();
  }, [visible]);

  if (!visible) return null;

  const accept = () => { writeConsent(true); setVisible(false); };
  const reject = () => { writeConsent(false); setVisible(false); };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="privacy-choices-title"
      aria-describedby="privacy-choices-desc"
      data-testid="privacy-choices"
      style={{
        position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 3000,
        maxWidth: 640, margin: '0 auto',
        background: '#08070a', color: '#e8e0cf',
        border: '1px solid #33322a', padding: 20,
        fontFamily: "'Cormorant Garamond',serif",
      }}
    >
      <p id="privacy-choices-title"
         style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: '.32em',
                  color: '#c8a24a', textTransform: 'uppercase', margin: 0 }}>
        Privacy Choices
      </p>
      <p id="privacy-choices-desc"
         style={{ fontSize: 15, lineHeight: 1.5, marginTop: 10, marginBottom: 0 }}>
        PHILEON uses first-party storage to keep your cart, wishlist and
        site preferences working. With your permission, we would also
        like to collect anonymous information about product views, cart
        activity, checkout starts and searches so we can improve the
        PHILEON experience. This is optional and off by default.
        Marketing email is a separate choice and is never enabled by
        accepting analytics. You can change your Privacy Choices at any
        time.
      </p>

      {detailOpen && (
        <ul style={{ marginTop: 10, marginBottom: 0, paddingLeft: 18,
                     fontSize: 14, lineHeight: 1.5, color: '#c9c1ae' }}>
          <li><strong>Essential (always on)</strong> — cart, wishlist,
              secure session, checkout functionality, security controls.</li>
          <li><strong>Optional analytics (choose)</strong> — first-party
              product-view · add-to-cart · checkout-start · search events.
              No third-party pixels. No advertising trackers.</li>
        </ul>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
        <button ref={acceptRef} onClick={accept}
                data-testid="privacy-accept"
                style={{ fontFamily: "'Cinzel',serif", fontSize: 11,
                          letterSpacing: '.28em', textTransform: 'uppercase',
                          padding: '10px 18px', background: '#c8a24a',
                          color: '#08070a', border: '1px solid #c8a24a',
                          cursor: 'pointer' }}>
          Accept optional
        </button>
        <button onClick={reject}
                data-testid="privacy-reject"
                style={{ fontFamily: "'Cinzel',serif", fontSize: 11,
                          letterSpacing: '.28em', textTransform: 'uppercase',
                          padding: '10px 18px', background: 'transparent',
                          color: '#e8e0cf',
                          border: '1px solid rgba(232,224,207,.4)',
                          cursor: 'pointer' }}>
          Reject optional
        </button>
        <button onClick={() => setDetailOpen((v) => !v)}
                data-testid="privacy-details"
                aria-expanded={detailOpen}
                style={{ fontFamily: "'Cinzel',serif", fontSize: 11,
                          letterSpacing: '.28em', textTransform: 'uppercase',
                          padding: '10px 18px', background: 'transparent',
                          color: 'rgba(232,224,207,.6)',
                          border: '1px solid transparent',
                          cursor: 'pointer' }}>
          {detailOpen ? 'Hide details' : 'What is essential?'}
        </button>
      </div>
    </div>
  );
}
