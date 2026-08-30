// PHILEON — Emergent preview boot loader.
//
// When the storefront is rendered inside an iframe (Emergent preview /
// design surface), inject the Emergent debug monitor and the tailwind
// CDN for the in-editor experience. For real visitors the page is not
// framed, so this file is a no-op.
//
// Moved here (from an inline <script> in public/index.html) as part of
// the Final Security Hardening pass — one fewer inline script on the
// served HTML. `'unsafe-inline'` remains in script-src only because
// Cloudflare's edge injects a per-request __CF$cv$params bootstrap
// script that cannot carry a nonce.
(function () {
  if (window.self === window.top) return;

  var debugMonitorScript = document.createElement('script');
  debugMonitorScript.src = 'https://assets.emergent.sh/scripts/debug-monitor.js';
  document.head.appendChild(debugMonitorScript);

  window.tailwind = window.tailwind || {};
  tailwind.config = {
    corePlugins: { preflight: false },
  };

  var tailwindScript = document.createElement('script');
  tailwindScript.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(tailwindScript);
})();
