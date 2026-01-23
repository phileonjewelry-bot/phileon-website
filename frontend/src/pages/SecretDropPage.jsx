import React, { useEffect, useMemo, useState } from "react";
// if you use css modules, import styles from "./SecretDrop.module.css";

export default function SecretDropPage() {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleUnlock = () => {
    // TODO: replace with your real code check
    const ok = code.trim().toLowerCase() === "phileon"; // example
    if (!ok) return;

    setUnlocked(true);

    // one-time glitch "LEVEL UNLOCKED" flash
    setFlash(true);
    setTimeout(() => setFlash(false), 350);
  };

  // OPTIONAL: lock scroll + body bg only after unlock
  useEffect(() => {
    if (!unlocked) return;
    document.body.classList.add("secret-unlocked-body");
    return () => document.body.classList.remove("secret-unlocked-body");
  }, [unlocked]);

  return (
    <div className={unlocked ? `secret-shell sketchpad` : `secret-shell`}>
      {/* top right text stays visible */}
      <div className="secret-top-right">SECRET ACCESS</div>

      {!unlocked ? (
        <div className="lock-card">
          <div className="lock-icon">🔒</div>
          <h1 className="classified">CLASSIFIED</h1>
          <p className="sub">This drop requires an access code.</p>

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ENTER CODE"
            className="code-input"
          />

          <button onClick={handleUnlock} className="unlock-btn">
            UNLOCK
          </button>

          <div className="hint">Hint: The unlock code is case-insensitive</div>
        </div>
      ) : (
        <div className={`unlocked-wrap ${flash ? "glitch-once" : ""}`}>
          <div className="level-unlocked">LEVEL UNLOCKED</div>

          {/* ✅ PUT YOUR SECRET DROP CONTENT HERE */}
          <div className="secret-content">
            <h2 className="drop-title">Secret Drop</h2>
            <p className="drop-sub">Exclusive pieces now available.</p>
            {/* TODO: insert products/grid */}
          </div>
        </div>
      )}
    </div>
  );
}
