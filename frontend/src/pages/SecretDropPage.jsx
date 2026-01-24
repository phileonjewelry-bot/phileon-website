import { useState } from "react";
import "../styles/secret-drop.css";

export default function SecretDropPage() {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [denied, setDenied] = useState(false);

  const handleUnlock = () => {
    if (code.trim().toLowerCase() === "phileon") {
      setUnlocked(true);
      setDenied(false);
    } else {
      setDenied(true);
      setTimeout(() => setDenied(false), 2000);
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
            onChange={(e) => {
              setCode(e.target.value);
              setDenied(false);
            }}
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
