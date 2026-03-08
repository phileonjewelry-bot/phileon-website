import { useEffect } from 'react';

// Intent Flash effect - blue radial gradient on click
const useIntentFlash = () => {
  useEffect(() => {
    let lastFlash = 0;
    const cooldownMs = 100;

    const createFlash = () => {
      const now = Date.now();
      if (now - lastFlash < cooldownMs) return;
      lastFlash = now;

      const el = document.createElement('div');
      el.className = 'intent-flash';
      document.body.appendChild(el);
      
      el.addEventListener('animationend', () => {
        el.remove();
      });
    };

    const handlePointerDown = (e) => {
      // Ignore right click
      if (e.button !== undefined && e.button !== 0) return;
      createFlash();
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);
};

const IntentFlashProvider = ({ children }) => {
  useIntentFlash();
  return children;
};

export default IntentFlashProvider;
