import { useEffect } from 'react';

// Gold pulse effect on tap/click
const useGoldPulse = () => {
  useEffect(() => {
    let lastPulse = 0;
    const cooldownMs = 120;

    const createPulse = (x, y) => {
      const now = Date.now();
      if (now - lastPulse < cooldownMs) return;
      lastPulse = now;

      const el = document.createElement('div');
      el.className = 'ph-pulse';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      document.body.appendChild(el);
      
      el.addEventListener('animationend', () => {
        el.remove();
      });
    };

    const handlePointerDown = (e) => {
      // Ignore right click
      if (e.button !== undefined && e.button !== 0) return;
      createPulse(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);
};

const GoldPulseProvider = ({ children }) => {
  useGoldPulse();
  return children;
};

export default GoldPulseProvider;
