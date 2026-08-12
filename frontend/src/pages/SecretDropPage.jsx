import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/secret-drop.css";

// SECRET DROP — the CLASSIFIED lock gate for THE PHILEON VAULT.
// After a successful unlock, the customer is taken into the existing
// unlocked experience at `/vault/drews-world` (VaultPage.jsx) which owns
// the Drew's World artwork + THE PHILEON VAULT title + the EXCLUSIVE DROPS
// grid (where RETRO BRED lives as the second live drop).
//
// If a previous unlock already succeeded (recorded in localStorage as
// `phileon_events > unlock_success`) we skip the lock card and forward
// straight into the vault.
export default function SecretDropPage() {
  const [code, setCode] = useState("");
  const [unlockFlash, setUnlockFlash] = useState(false);
  const [denied, setDenied] = useState(false);
  const navigate = useNavigate();
  const denyTimerRef = useRef(null);

  const logEvent = (type) => {
    const event = { type, ts: Date.now(), path: window.location.pathname };
    console.log("Phileon Analytics:", event);
    const events = JSON.parse(localStorage.getItem("phileon_events") || "[]");
    events.push(event);
    localStorage.setItem("phileon_events", JSON.stringify(events));
  };

  // Fast-forward past the lock card if unlock has already been captured.
  useEffect(() => {
    try {
      const events = JSON.parse(localStorage.getItem("phileon_events") || "[]");
      if (events.some((e) => e && e.type === "unlock_success")) {
        navigate("/vault/drews-world", { replace: true });
      }
    } catch (_e) { /* noop */ }
  }, [navigate]);

  const handleInputChange = (e) => {
    setCode(e.target.value);
    setDenied(false);
    if (denyTimerRef.current) {
      clearTimeout(denyTimerRef.current);
      denyTimerRef.current = null;
    }
  };

  const handleUnlock = () => {
    logEvent("unlock_attempt");
    const ok = code.trim().toLowerCase() === "phileon";
    if (ok) {
      logEvent("unlock_success");
      if (denyTimerRef.current) {
        clearTimeout(denyTimerRef.current);
        denyTimerRef.current = null;
      }
      setDenied(false);
      setUnlockFlash(true);
      // Reveal briefly, then hand off to the real vault (Drew's World + Exclusive Drops).
      setTimeout(() => {
        setUnlockFlash(false);
        navigate("/vault/drews-world");
      }, 700);
      return;
    }
    logEvent("unlock_fail");
    setDenied(true);
    if (denyTimerRef.current) clearTimeout(denyTimerRef.current);
    denyTimerRef.current = setTimeout(() => setDenied(false), 2000);
  };

  return (
    <div className={`secret-shell ${unlockFlash ? "unlock-flash" : ""}`}>
      <div className={`lock-card ${denied ? "deny-glitch" : ""}`}>
        <div className="secret-top-right">SECRET ACCESS</div>
        <h1 className="classified">CLASSIFIED</h1>
        <p className="sub">This drop requires an access code.</p>

        <input
          className="code-input"
          placeholder="ENTER CODE"
          value={code}
          onChange={handleInputChange}
          data-testid="secret-drop-code-input"
        />

        <button className="unlock-btn" onClick={handleUnlock} data-testid="secret-drop-unlock-btn">
          UNLOCK
        </button>

        {denied && <p className="access-denied" data-testid="secret-drop-denied">ACCESS DENIED</p>}
        <p className="hint">Hint: The unlock code is case-insensitive</p>
      </div>
    </div>
  );
}
