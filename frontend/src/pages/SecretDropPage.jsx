import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/secret-drop.css";

export default function SecretDropPage() {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [denied, setDenied] = useState(false);
  const [unlockFlash, setUnlockFlash] = useState(false);
  const navigate = useNavigate();

  const denyTimerRef = useRef(null);

  // Analytics function
  const logEvent = (type) => {
    const event = {
      type,
      ts: Date.now(),
      path: window.location.pathname
    };
    
    // Log to console
    console.log('Phileon Analytics:', event);
    
    // Save to localStorage
    const events = JSON.parse(localStorage.getItem('phileon_events') || '[]');
    events.push(event);
    localStorage.setItem('phileon_events', JSON.stringify(events));
  };

  const handleInputChange = (e) => {
    setCode(e.target.value);

    // clear denial immediately on typing
    setDenied(false);
    if (denyTimerRef.current) {
      clearTimeout(denyTimerRef.current);
      denyTimerRef.current = null;
    }
  };

  const handleUnlock = () => {
    // Log unlock attempt
    logEvent('unlock_attempt');
    
    const ok = code.trim().toLowerCase() === "phileon";

    if (ok) {
      // Log success
      logEvent('unlock_success');
      
      // success: clear timers + deny state
      if (denyTimerRef.current) {
        clearTimeout(denyTimerRef.current);
        denyTimerRef.current = null;
      }
      setDenied(false);

      // ✅ Trigger flash FIRST, then unlock after delay
      setUnlockFlash(true);
      setTimeout(() => { 
        setUnlocked(true); 
        setUnlockFlash(false);
        
        // After showing unlocked state, redirect to /shop-drop
        setTimeout(() => {
          navigate('/shop-drop');
        }, 1200);
      }, 450);
      return;
    }

    // Log failure
    logEvent('unlock_fail');

    // wrong code
    setDenied(true);
    if (denyTimerRef.current) clearTimeout(denyTimerRef.current);
    denyTimerRef.current = setTimeout(() => setDenied(false), 2000);
  };

  return (
    <div
      className={`secret-shell ${
        unlocked ? "sketchpad" : ""
      } ${unlockFlash ? "unlock-flash" : ""}`}
    >
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
          <p className="hint">Hint: The unlock code is case-insensitive</p>
        </div>
      ) : (
        <div className="unlocked-wrap">
          <div className="level-unlocked">ACCESS GRANTED</div>
          <h2 className="drop-title">SECRET DROP UNLOCKED</h2>
          <p className="drop-sub">You just unlocked a hidden level.</p>

          {/* put your secret drop content here */}
        </div>
      )}
    </div>
  );
}
