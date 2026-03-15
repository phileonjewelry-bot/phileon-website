import { useState, useEffect, useRef } from 'react';

const VaultUnlockSequence = ({ isActive, onComplete, onCancel }) => {
  const [phase, setPhase] = useState('idle'); // idle, glitch, password, video, complete
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const glitchTimeoutRef = useRef(null);

  const CORRECT_PASSWORD = 'phileon';

  // Start sequence when activated
  useEffect(() => {
    if (isActive && phase === 'idle') {
      setPhase('glitch');
      setPassword('');
      setError(false);
    }
    
    if (!isActive && phase !== 'idle') {
      setPhase('idle');
      setPassword('');
      setError(false);
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
      }
    }
    
    return () => {
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
      }
    };
  }, [isActive]);

  // Handle glitch to password transition
  useEffect(() => {
    if (phase === 'glitch') {
      glitchTimeoutRef.current = setTimeout(() => {
        setPhase('password');
      }, 450);
    }
    
    return () => {
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
      }
    };
  }, [phase]);

  // Focus input when password phase starts
  useEffect(() => {
    if (phase === 'password' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase]);

  // Lock body scroll when active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive]);

  // Handle password submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.toLowerCase() === CORRECT_PASSWORD) {
      setPhase('video');
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 1500);
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    setPhase('complete');
    onComplete();
  };

  // Auto-play video when phase changes to video
  useEffect(() => {
    if (phase === 'video' && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, [phase]);

  // Handle cancel/close
  const handleClose = () => {
    setPhase('idle');
    onCancel();
  };

  if (!isActive) return null;

  return (
    <div className="vault-unlock-overlay" data-testid="vault-unlock-sequence">
      {/* Glitch Phase */}
      {phase === 'glitch' && (
        <div className="glitch-container">
          {/* Scanlines */}
          <div className="scanlines" />
          
          {/* RGB Split layers */}
          <div className="rgb-split rgb-red" />
          <div className="rgb-split rgb-green" />
          <div className="rgb-split rgb-blue" />
          
          {/* Horizontal distortion bars */}
          <div className="distortion-bars">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="distortion-bar" style={{ 
                animationDelay: `${i * 40}ms`,
                top: `${10 + i * 12}%`
              }} />
            ))}
          </div>
          
          {/* Terminal text flash */}
          <div className="terminal-text">
            <div className="terminal-line line-1">ACCESS BREACH DETECTED</div>
            <div className="terminal-line line-2">AUTHENTICATING...</div>
            <div className="terminal-line line-3">ACCESS GRANTED</div>
          </div>
        </div>
      )}

      {/* Password Phase */}
      {phase === 'password' && (
        <div className="password-container">
          <button 
            className="password-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
          
          <div className="password-content">
            <div className="password-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            
            <h2 className="password-title">VAULT ACCESS</h2>
            <p className="password-subtitle">Enter authorization code</p>
            
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`password-input ${error ? 'error' : ''}`}
                autoComplete="off"
                data-testid="vault-password-input"
              />
              <button 
                type="submit" 
                className="password-submit"
                data-testid="vault-password-submit"
              >
                AUTHENTICATE
              </button>
            </form>
            
            {error && (
              <p className="password-error">ACCESS DENIED</p>
            )}
          </div>
        </div>
      )}

      {/* Video Phase */}
      {phase === 'video' && (
        <div className="video-container">
          <video
            ref={videoRef}
            src="https://customer-assets.emergentagent.com/job_63c5abba-472d-4451-a69c-37c068fb273a/artifacts/wxe2ftd7_XiaoYing_Video_1773605685242.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="unlock-video"
          />
        </div>
      )}

      <style>{`
        .vault-unlock-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: #000;
        }

        /* ========== GLITCH PHASE ========== */
        .glitch-container {
          position: absolute;
          inset: 0;
          background: #000;
          overflow: hidden;
          animation: screenShake 0.45s ease-out;
        }

        @keyframes screenShake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-3px, 2px); }
          20% { transform: translate(3px, -2px); }
          30% { transform: translate(-2px, -3px); }
          40% { transform: translate(2px, 3px); }
          50% { transform: translate(-3px, -1px); }
          60% { transform: translate(3px, 1px); }
          70% { transform: translate(-1px, 3px); }
          80% { transform: translate(1px, -3px); }
          90% { transform: translate(-2px, 2px); }
        }

        .scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          );
          pointer-events: none;
          animation: scanlineFlicker 0.1s infinite;
        }

        @keyframes scanlineFlicker {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }

        .rgb-split {
          position: absolute;
          inset: 0;
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .rgb-red {
          background: rgba(255, 0, 0, 0.1);
          animation: rgbShiftRed 0.15s ease-in-out infinite;
        }

        .rgb-green {
          background: rgba(0, 255, 0, 0.1);
          animation: rgbShiftGreen 0.15s ease-in-out infinite;
        }

        .rgb-blue {
          background: rgba(0, 0, 255, 0.1);
          animation: rgbShiftBlue 0.15s ease-in-out infinite;
        }

        @keyframes rgbShiftRed {
          0%, 100% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
        }

        @keyframes rgbShiftGreen {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-1px); }
        }

        @keyframes rgbShiftBlue {
          0%, 100% { transform: translateX(2px); }
          50% { transform: translateX(-2px); }
        }

        .distortion-bars {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .distortion-bar {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(199, 162, 75, 0.4) 20%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(199, 162, 75, 0.4) 80%,
            transparent 100%
          );
          animation: distortionSlide 0.2s ease-out forwards;
          opacity: 0;
        }

        @keyframes distortionSlide {
          0% { 
            transform: translateX(-100%) scaleX(0.5);
            opacity: 0;
          }
          30% { opacity: 1; }
          100% { 
            transform: translateX(100%) scaleX(1.5);
            opacity: 0;
          }
        }

        .terminal-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          font-family: 'Courier New', monospace;
          font-size: clamp(12px, 3vw, 18px);
          letter-spacing: 0.15em;
          color: #C7A24B;
        }

        .terminal-line {
          opacity: 0;
          animation: terminalFlash 0.15s ease-out forwards;
        }

        .line-1 { animation-delay: 0ms; color: #ff4444; }
        .line-2 { animation-delay: 120ms; color: #C7A24B; }
        .line-3 { animation-delay: 280ms; color: #44ff44; font-weight: bold; }

        @keyframes terminalFlash {
          0% { opacity: 0; transform: translateY(-5px); }
          50% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0.3; transform: translateY(0); }
        }

        .glitch-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.08;
          pointer-events: none;
          animation: noiseShift 0.1s steps(5) infinite;
        }

        @keyframes noiseShift {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-1%, 1%); }
          50% { transform: translate(1%, -1%); }
          75% { transform: translate(-1%, -1%); }
          100% { transform: translate(1%, 1%); }
        }

        .glitch-container::after {
          content: '';
          position: absolute;
          inset: 0;
          background: white;
          animation: initialFlash 0.15s ease-out forwards;
          pointer-events: none;
        }

        @keyframes initialFlash {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }

        /* ========== PASSWORD PHASE ========== */
        .password-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          animation: fadeIn 0.3s ease-out;
        }

        .password-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 44px;
          height: 44px;
          border: 1px solid rgba(199, 162, 75, 0.3);
          border-radius: 50%;
          background: transparent;
          color: #C7A24B;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .password-close-btn:hover {
          background: rgba(199, 162, 75, 0.1);
          border-color: rgba(199, 162, 75, 0.5);
        }

        .password-content {
          text-align: center;
          padding: 24px;
          max-width: 360px;
          width: 100%;
        }

        .password-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 24px;
          color: #C7A24B;
        }

        .password-icon svg {
          width: 100%;
          height: 100%;
        }

        .password-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          letter-spacing: 0.2em;
          color: #C7A24B;
          margin-bottom: 8px;
        }

        .password-subtitle {
          font-size: 12px;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          margin-bottom: 32px;
        }

        .password-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .password-input {
          width: 100%;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(199, 162, 75, 0.3);
          border-radius: 4px;
          color: #fff;
          font-size: 18px;
          letter-spacing: 0.3em;
          text-align: center;
          outline: none;
          transition: all 0.2s ease;
        }

        .password-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }

        .password-input:focus {
          border-color: #C7A24B;
          background: rgba(199, 162, 75, 0.05);
        }

        .password-input.error {
          border-color: #ff4444;
          animation: inputShake 0.3s ease;
        }

        @keyframes inputShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
        }

        .password-submit {
          width: 100%;
          padding: 14px 24px;
          background: transparent;
          border: 1px solid #C7A24B;
          color: #C7A24B;
          font-size: 12px;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .password-submit:hover {
          background: #C7A24B;
          color: #000;
        }

        .password-error {
          margin-top: 16px;
          font-size: 12px;
          letter-spacing: 0.15em;
          color: #ff4444;
          animation: errorPulse 0.5s ease;
        }

        @keyframes errorPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* ========== VIDEO PHASE ========== */
        .video-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .unlock-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
        }

        @media (max-width: 640px) {
          .terminal-text { font-size: 14px; }
          .distortion-bar { height: 2px; }
          .password-close-btn { top: 16px; right: 16px; }
          .password-title { font-size: 24px; }
        }
      `}</style>
    </div>
  );
};

export default VaultUnlockSequence;
