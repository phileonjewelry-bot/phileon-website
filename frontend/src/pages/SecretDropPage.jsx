import { useRef, useState } from "react";
import "../styles/secret-drop.css";

export default function SecretDropPage() {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [denied, setDenied] = useState(false);
  const denyTimerRef = useRef(null);

  const handleUnlock = () => {
    if (code.trim().toLowerCase() === "phileon") {
      setUnlocked(true);
      setDenied(false);
      // Clear any existing timer
      if (denyTimerRef.current) {
        clearTimeout(denyTimerRef.current);
        denyTimerRef.current = null;
      }
    } else {
      setDenied(true);
      // Clear any existing timer before setting new one
      if (denyTimerRef.current) {
        clearTimeout(denyTimerRef.current);
      }
      // Set timer to clear denied state after 2 seconds
      denyTimerRef.current = setTimeout(() => {
        setDenied(false);
        denyTimerRef.current = null;
      }, 2000);
    }
  };

  const handleInputChange = (e) => {
    setCode(e.target.value);
    setDenied(false);
    // Clear the timer when user starts typing
    if (denyTimerRef.current) {
      clearTimeout(denyTimerRef.current);
      denyTimerRef.current = null;
    }
  };

  return (
    <div className={`secret-shell ${unlocked ? "sketchpad" : ""}`}>
      {!unlocked ? (
        <div className={`lock-card ${denied ? "deny-glitch" : ""}`}>
          <div className="secret-top-right">SECRET ACCESS</div>

          <h1 className="classified">CLASSIFIED</h1>
          <p className="sub">This drop requires an access code.</p>

          <input
            className="code-input"
            placeholder="ENTER CODE"
            value={code}
            onChange={handleInputChange}
          />

          <button className="unlock-btn" onClick={handleUnlock}>
            UNLOCK
          </button>

          {denied && <p className="access-denied">ACCESS DENIED</p>}
        </div>
      ) : (
        <div className="unlocked-wrap glitch-once">
          <div className="level-unlocked">ACCESS GRANTED</div>
          <h2>SECRET DROP UNLOCKED</h2>
        </div>
      )}
    </div>
  );
}
