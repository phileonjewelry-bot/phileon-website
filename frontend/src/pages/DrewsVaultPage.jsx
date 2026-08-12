import { useEffect } from "react";
import { Navigate } from "react-router-dom";

// DREW'S VAULT — retired as a customer-facing landing.
// The single canonical private/vault destination is `/secret-drop`
// (THE PHILEON VAULT). This component now redirects any legacy hit on
// `/drews-vault` into that experience, preserving the existing unlock
// state (`phileon_events > unlock_success` in localStorage).
export default function DrewsVaultPage() {
  useEffect(() => {
    // noindex/nofollow on the redirect target as well.
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);
  return <Navigate to="/secret-drop" replace />;
}
