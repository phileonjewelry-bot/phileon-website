/*
  PHILEON — AI Concierge Launcher (v1, preview only).

  Feature-gated by GET /api/concierge/config. When the backend returns
  { enabled: false }, this component renders NOTHING (hidden entirely).

  Never displays or reads OPENAI_API_KEY. Never posts customer PII.
  Only sends the current turn text and a bounded window of prior turns
  kept in browser memory (not localStorage — cleared on tab close).
*/
import React, { useCallback, useEffect, useRef, useState } from "react";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "";
const MAX_HISTORY_TURNS = 8;
const MAX_MESSAGE_CHARS = 1500;

const QUICK_PROMPTS = [
  { id: "mens-rings",    label: "Men's statement rings" },
  { id: "under-3000",    label: "Something under $3,000" },
  { id: "gift",          label: "Help me choose a gift" },
  { id: "custom",        label: "Custom jewelry" },
  { id: "shipping",      label: "Shipping & returns" },
];

const WELCOME =
  "Tell me what you're looking for — style, metal, stones, budget, occasion, or who you're shopping for.";

export default function PhileonAiConcierge() {
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState([
    { role: "assistant", content: WELCOME },
  ]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/api/concierge/config`);
        if (!r.ok) return;
        const d = await r.json();
        if (!cancelled) setAvailable(Boolean(d && d.enabled));
      } catch (_e) {
        /* fail-closed: hidden */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, turns]);

  const onKeyDown = useCallback((e) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  const send = useCallback(async (raw) => {
    const message = String(raw || "").trim().slice(0, MAX_MESSAGE_CHARS);
    if (!message || busy) return;
    setBusy(true);
    setInput("");
    setTurns((prev) => [...prev, { role: "user", content: message }]);
    // Include only prior user/assistant turns (exclude the welcome bubble
    // when it is the only assistant turn — harmless but redundant).
    const history = turns
      .filter((t) => t.role === "user" || t.role === "assistant")
      .slice(-MAX_HISTORY_TURNS)
      .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_MESSAGE_CHARS) }));
    try {
      abortRef.current = new AbortController();
      const r = await fetch(`${BACKEND}/api/concierge/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
        signal: abortRef.current.signal,
      });
      const d = await r.json().catch(() => ({}));
      const reply = (d && typeof d.reply === "string" && d.reply.trim())
        ? d.reply
        : "The concierge is briefly unavailable. Please try again in a moment.";
      setTurns((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (_e) {
      setTurns((prev) => [...prev, {
        role: "assistant",
        content: "The concierge is briefly unavailable. Please try again in a moment.",
      }]);
    } finally {
      setBusy(false);
    }
  }, [busy, turns]);

  if (!available) return null;

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        data-testid="phileon-ai-concierge-launcher"
        aria-label="Open PHILEON Concierge"
        onClick={() => setOpen(true)}
        style={launcherStyle}
      >
        PHILEON Concierge
      </button>

      {/* Drawer */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="PHILEON Concierge"
          data-testid="phileon-ai-concierge-drawer"
          style={overlayStyle}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={panelStyle}>
            <header style={headerStyle}>
              <span style={eyebrowStyle}>PHILEON</span>
              <h2 style={titleStyle}>Concierge</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close concierge"
                data-testid="phileon-ai-concierge-close"
                style={closeBtnStyle}
              >
                ×
              </button>
            </header>

            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-atomic="false"
              data-testid="phileon-ai-concierge-log"
              style={logStyle}
            >
              {turns.map((t, i) => (
                <div key={i} style={bubbleWrapStyle(t.role)}>
                  <div style={bubbleStyle(t.role)}>{t.content}</div>
                </div>
              ))}
              {busy && (
                <div style={bubbleWrapStyle("assistant")}>
                  <div style={{ ...bubbleStyle("assistant"), fontStyle: "italic", opacity: 0.7 }}
                       aria-live="polite" data-testid="phileon-ai-concierge-loading">
                    Thinking…
                  </div>
                </div>
              )}
            </div>

            <div style={quickPromptRowStyle} data-testid="phileon-ai-concierge-quickprompts">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  disabled={busy}
                  onClick={() => send(q.label)}
                  data-testid={`phileon-ai-concierge-quick-${q.id}`}
                  style={quickPromptStyle(busy)}
                >
                  {q.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              style={composerStyle}
              data-testid="phileon-ai-concierge-composer"
            >
              <label htmlFor="phileon-ai-concierge-input" style={{ position: "absolute", left: "-9999px" }}>
                Message the PHILEON Concierge
              </label>
              <input
                id="phileon-ai-concierge-input"
                ref={inputRef}
                type="text"
                maxLength={MAX_MESSAGE_CHARS}
                value={input}
                disabled={busy}
                placeholder="What are you looking for?"
                onChange={(e) => setInput(e.target.value)}
                data-testid="phileon-ai-concierge-input"
                style={inputStyle(busy)}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                data-testid="phileon-ai-concierge-send"
                style={sendBtnStyle(busy || !input.trim())}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Inline style objects — matches PHILEON typography ── */

const launcherStyle = {
  position: "fixed",
  right: 20,
  bottom: 20,
  zIndex: 3200,
  padding: "12px 20px",
  background: "#08070a",
  color: "#c8a24a",
  border: "1px solid #c8a24a",
  fontFamily: "'Cinzel',serif",
  fontSize: 11,
  letterSpacing: ".28em",
  textTransform: "uppercase",
  cursor: "pointer",
  boxShadow: "0 10px 32px rgba(0,0,0,.5)",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 3300,
  background: "rgba(0,0,0,.55)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "flex-end",
  padding: "16px",
};

const panelStyle = {
  width: "min(96vw, 420px)",
  maxHeight: "min(92vh, 720px)",
  background: "#0a0a0c",
  color: "#e8e0cf",
  border: "1px solid #2a2625",
  boxShadow: "0 24px 60px rgba(0,0,0,.6)",
  display: "flex",
  flexDirection: "column",
};

const headerStyle = {
  padding: "16px 20px 12px",
  borderBottom: "1px solid #2a2625",
  position: "relative",
  textAlign: "center",
};

const eyebrowStyle = {
  fontFamily: "'Cinzel',serif",
  color: "#c8a24a",
  letterSpacing: ".5em",
  fontSize: 10,
  display: "block",
  marginBottom: 6,
};

const titleStyle = {
  margin: 0,
  fontFamily: "'Cinzel',serif",
  letterSpacing: ".22em",
  fontSize: 16,
  color: "#f4ecd6",
  textTransform: "uppercase",
};

const closeBtnStyle = {
  position: "absolute",
  right: 12,
  top: 12,
  background: "transparent",
  border: "none",
  color: "#c8a24a",
  fontSize: 26,
  lineHeight: 1,
  cursor: "pointer",
  padding: "0 6px",
};

const logStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "16px 18px",
  fontFamily: "'Playfair Display',Georgia,serif",
  fontSize: 15,
  lineHeight: 1.5,
};

const bubbleWrapStyle = (role) => ({
  display: "flex",
  justifyContent: role === "user" ? "flex-end" : "flex-start",
  marginBottom: 10,
});

const bubbleStyle = (role) => ({
  maxWidth: "82%",
  padding: "10px 14px",
  background: role === "user" ? "#1b1815" : "#12100e",
  color: "#e8e0cf",
  border: role === "user" ? "1px solid #3a3327" : "1px solid #26221d",
  whiteSpace: "pre-wrap",
});

const quickPromptRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  padding: "6px 14px 10px",
  borderTop: "1px solid #1a1815",
};

const quickPromptStyle = (busy) => ({
  padding: "6px 10px",
  background: "transparent",
  color: "#c8a24a",
  border: "1px solid #3a3327",
  fontFamily: "'Cinzel',serif",
  fontSize: 10,
  letterSpacing: ".2em",
  textTransform: "uppercase",
  cursor: busy ? "not-allowed" : "pointer",
  opacity: busy ? 0.5 : 1,
});

const composerStyle = {
  display: "flex",
  gap: 8,
  padding: "10px 14px 14px",
  borderTop: "1px solid #2a2625",
};

const inputStyle = (busy) => ({
  flex: 1,
  padding: "10px 12px",
  background: "#08070a",
  border: "1px solid #2a2625",
  color: "#f4ecd6",
  fontFamily: "'Playfair Display',Georgia,serif",
  fontSize: 15,
  outline: "none",
  opacity: busy ? 0.6 : 1,
});

const sendBtnStyle = (disabled) => ({
  padding: "10px 16px",
  background: "#08070a",
  color: "#c8a24a",
  border: "1px solid #c8a24a",
  fontFamily: "'Cinzel',serif",
  fontSize: 11,
  letterSpacing: ".22em",
  textTransform: "uppercase",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.4 : 1,
});
