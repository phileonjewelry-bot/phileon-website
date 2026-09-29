/*
  PHILEON — Shared Policy Snippet.

  Single frontend surface for policy text. Fetches from
  GET /api/concierge/policy/{topic}, which reads from the same
  `backend/services/phileon_policies.py` module that the AI concierge's
  `get_phileon_policy` tool reads from — so the site copy and the AI
  cannot drift apart.

  Usage:
      <PhileonPolicySnippet topic="SHIPPING" />
      <PhileonPolicySnippet topic="RETURNS" variant="line" />
*/
import React, { useEffect, useState } from "react";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "";

export default function PhileonPolicySnippet({ topic, variant = "block", className }) {
  const [policy, setPolicy] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/api/concierge/policy/${encodeURIComponent(topic)}`);
        if (!r.ok) { if (!cancelled) setError(true); return; }
        const d = await r.json();
        if (!cancelled) setPolicy(d && d.policy ? d.policy : null);
      } catch (_e) {
        if (!cancelled) setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [topic]);

  if (error || !policy) {
    // Fail-safe: render nothing rather than a stale/wrong hardcoded fallback.
    return null;
  }

  if (variant === "line") {
    return (
      <span className={className} data-testid={`phileon-policy-${topic}-line`}>
        {policy.summary}
      </span>
    );
  }

  return (
    <div className={className} data-testid={`phileon-policy-${topic}`}>
      <p>{policy.summary}</p>
      {Array.isArray(policy.notes) && policy.notes.length > 0 && (
        <ul>
          {policy.notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      )}
      {policy.full_reference_path && (
        <p>
          <a href={policy.full_reference_path}
             data-testid={`phileon-policy-${topic}-link`}>
            Read the full policy
          </a>
        </p>
      )}
    </div>
  );
}
