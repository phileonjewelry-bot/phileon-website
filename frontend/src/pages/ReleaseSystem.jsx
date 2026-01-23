/* =========================================================
PHILEON — ONE-OBJECT RELEASE SYSTEM
Option C: One object at a time, every 6–8 weeks
========================================================= */

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { publicApi } from '@/lib/api';
import { toast } from 'sonner';

/** ====== CONFIG ====== */
const LOGO_SRC = '/logo.png';

const RELEASE = {
  id: 'PHILEON_008',
  metal: '18K Yellow Gold',
  weight: '11.2g',
  released: 'March 2026',
  status: 'Available',
};

const ARCHIVE = [
  { id: 'PHILEON_007', released: 'January 2026', status: 'Archived' },
  { id: 'PHILEON_006', released: 'November 2025', status: 'Archived' },
  { id: 'PHILEON_005', released: 'September 2025', status: 'Archived' },
];

/** ====== COPY ====== */
const COPY = {
  landing: {
    title: 'PHILEON',
    lines: ['One object.', 'Released every 6–8 weeks.'],
    cta: 'ENTER',
  },
  release: {
    pageTitle: 'CURRENT RELEASE',
    footer: 'When it\'s gone, it\'s archived.',
    cta: 'CLAIM',
  },
  claim: {
    intro: [
      'This object is released in limited quantity.',
      'Claim requests are reviewed individually.',
    ],
    headingPrefix: 'Claim',
    labels: {
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone (optional)',
      location: 'Location',
      intent: 'Tell us why this piece is meant for you.',
    },
    submit: 'SUBMIT CLAIM',
    confirmation: [
      'Your claim has been received.',
      'If approved, you will be contacted directly.',
    ],
    foot: 'Claims are not guaranteed.',
  },
  archive: {
    pageTitle: 'ARCHIVE',
    foot: 'Archived objects are not restocked.',
  },
  about: {
    body: [
      'PHILEON is a jewelry studio focused on singular releases.',
      'We do not operate on collections or seasonal catalogs.',
      'Each object is designed, released, and archived on its own terms.',
    ],
  },
  micro: [
    'This is not a catalog.',
    'Released without compromise.',
    'Archived, not sold out.',
    'Objects, not inventory.',
  ],
  interaction: {
    load: 'New object incoming.',
    claimHover: 'Proceed with intent.',
    claimClick: 'Claim initiated.',
  },
};

/** ====== HOOKS ====== */
function useElectricBlueMoments() {
  const [toastMsg, setToastMsg] = useState(null);

  function blueScan() {
    const el = document.createElement('div');
    el.className = 'ph-blue-scan';
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  function bluePulse() {
    const el = document.createElement('div');
    el.className = 'ph-blue-pulse';
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  function showToast(msg, ms = 1400) {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), ms);
  }

  return { blueScan, bluePulse, toastMsg, showToast };
}

/** ====== SHELL ====== */
function ReleaseShell({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="ph-app">
      <header className="ph-header">
        <Link to="/" className="ph-brand" aria-label="Phileon home">
          <img className="ph-logo" src={LOGO_SRC} alt="Phileon" />
          <span className="ph-wordmark">PHILEON</span>
        </Link>

        <nav className="ph-nav" aria-label="Primary">
          <Link 
            className={`ph-navlink ${pathname === '/release' ? 'is-active' : ''}`} 
            to="/release"
          >
            RELEASE
          </Link>
          <Link 
            className={`ph-navlink ${pathname === '/archive' ? 'is-active' : ''}`} 
            to="/archive"
          >
            ARCHIVE
          </Link>
          <Link 
            className={`ph-navlink ${pathname === '/about' ? 'is-active' : ''}`} 
            to="/about"
          >
            ABOUT
          </Link>
        </nav>
      </header>

      <main className="ph-main">{children}</main>

      <footer className="ph-footer-release">
        <div className="ph-footerline">{COPY.micro[0]}</div>
      </footer>
    </div>
  );
}

/** ====== PAGES ====== */

// Landing Page
export function LandingPage() {
  const nav = useNavigate();
  const { blueScan, toastMsg, showToast } = useElectricBlueMoments();

  useEffect(() => {
    blueScan();
    showToast(COPY.interaction.load, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ReleaseShell>
      <section className="ph-landing" data-testid="landing-page">
        <h1 className="ph-h1">{COPY.landing.title}</h1>
        <p className="ph-lead">
          {COPY.landing.lines[0]}
          <br />
          {COPY.landing.lines[1]}
        </p>

        <button
          className="ph-cta-release"
          onClick={() => nav('/release')}
          data-testid="enter-btn"
        >
          {COPY.landing.cta}
        </button>

        {toastMsg && <div className="ph-toast">{toastMsg}</div>}
      </section>
    </ReleaseShell>
  );
}

// Release Page
export function ReleasePage() {
  const nav = useNavigate();
  const { bluePulse, toastMsg, showToast } = useElectricBlueMoments();

  const objectBlock = useMemo(() => {
    return [
      RELEASE.id,
      '',
      RELEASE.metal,
      RELEASE.weight,
      '',
      `Released: ${RELEASE.released}`,
      `Status: ${RELEASE.status}`,
    ];
  }, []);

  return (
    <ReleaseShell>
      <section className="ph-pageblock" data-testid="release-page">
        <div className="ph-kicker">{COPY.release.pageTitle}</div>

        <div className="ph-object">
          {objectBlock.map((line, idx) =>
            line === '' ? (
              <div className="ph-spacerline" key={idx} />
            ) : (
              <div className={idx === 0 ? 'ph-objectid' : 'ph-objectline'} key={idx}>
                {line}
              </div>
            )
          )}
        </div>

        <button
          className="ph-cta-release ph-cta-release--outline"
          style={{ marginTop: '24px' }}
          onMouseEnter={() => showToast(COPY.interaction.claimHover, 900)}
          onClick={() => {
            bluePulse();
            showToast(COPY.interaction.claimClick, 900);
            window.setTimeout(() => nav('/claim'), 300);
          }}
          data-testid="claim-btn"
        >
          {COPY.release.cta}
        </button>

        <div className="ph-micro">{COPY.release.footer}</div>

        {toastMsg && <div className="ph-toast">{toastMsg}</div>}
      </section>
    </ReleaseShell>
  );
}

// Claim Page
export function ClaimPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    intent: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await publicApi.createInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        inquiry_type: 'claim',
        message: `Location: ${form.location}\n\nIntent: ${form.intent}\n\nRelease: ${RELEASE.id}`,
      });
      setSubmitted(true);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ReleaseShell>
      <section className="ph-pageblock" data-testid="claim-page">
        {!submitted ? (
          <>
            <div className="ph-kicker">{COPY.claim.headingPrefix} {RELEASE.id}</div>

            <p className="ph-par">
              {COPY.claim.intro[0]}
              <br />
              {COPY.claim.intro[1]}
            </p>

            <form className="ph-form" onSubmit={handleSubmit}>
              <label className="ph-label">
                <span>{COPY.claim.labels.name}</span>
                <input
                  className="ph-input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  data-testid="claim-name"
                />
              </label>

              <label className="ph-label">
                <span>{COPY.claim.labels.email}</span>
                <input
                  className="ph-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  data-testid="claim-email"
                />
              </label>

              <label className="ph-label">
                <span>{COPY.claim.labels.phone}</span>
                <input
                  className="ph-input"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  data-testid="claim-phone"
                />
              </label>

              <label className="ph-label">
                <span>{COPY.claim.labels.location}</span>
                <input
                  className="ph-input"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  required
                  data-testid="claim-location"
                />
              </label>

              <label className="ph-label">
                <span>{COPY.claim.labels.intent}</span>
                <textarea
                  className="ph-textarea"
                  value={form.intent}
                  onChange={(e) => setForm((f) => ({ ...f, intent: e.target.value }))}
                  required
                  rows={5}
                  data-testid="claim-intent"
                />
              </label>

              <button 
                className="ph-cta-release" 
                type="submit"
                disabled={submitting}
                data-testid="submit-claim"
              >
                {submitting ? 'SUBMITTING...' : COPY.claim.submit}
              </button>

              <div className="ph-micro">{COPY.claim.foot}</div>
            </form>
          </>
        ) : (
          <>
            <div className="ph-kicker">{COPY.claim.headingPrefix} {RELEASE.id}</div>
            <div className="ph-confirm">
              <div className="ph-confirmline">{COPY.claim.confirmation[0]}</div>
              <div className="ph-confirmline">{COPY.claim.confirmation[1]}</div>
            </div>
            <div className="ph-micro">{COPY.claim.foot}</div>
            <Link className="ph-link" to="/archive">
              Go to Archive →
            </Link>
          </>
        )}
      </section>
    </ReleaseShell>
  );
}

// Archive Page
export function ArchivePage() {
  return (
    <ReleaseShell>
      <section className="ph-pageblock" data-testid="archive-page">
        <div className="ph-kicker">{COPY.archive.pageTitle}</div>

        <div className="ph-archive">
          {ARCHIVE.map((a) => (
            <div className="ph-archiveitem" key={a.id}>
              <div className="ph-archiveid">{a.id}</div>
              <div className="ph-archiveline">Released: {a.released}</div>
              <div className="ph-archiveline">Status: {a.status}</div>
            </div>
          ))}
        </div>

        <div className="ph-micro">{COPY.archive.foot}</div>
      </section>
    </ReleaseShell>
  );
}

// About Page
export function ReleaseAboutPage() {
  return (
    <ReleaseShell>
      <section className="ph-pageblock" data-testid="about-page">
        <div className="ph-kicker">ABOUT</div>
        <div className="ph-about">
          {COPY.about.body.map((l, i) => (
            <p className="ph-par" key={i}>
              {l}
            </p>
          ))}
        </div>
      </section>
    </ReleaseShell>
  );
}
