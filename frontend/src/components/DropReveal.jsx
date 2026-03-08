import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DropReveal = ({ isActive, targetPath = '/shop', dropText = 'DROP 001' }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isActive) {
      // Navigate after animation completes
      const timer = setTimeout(() => {
        try {
          navigate(targetPath);
        } catch (error) {
          console.error('Navigation failed, trying window.location:', error);
          // Fallback to window.location if navigate fails
          window.location.href = targetPath;
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isActive, navigate, targetPath]);

  return (
    <div className={`drop-reveal ${isActive ? 'is-active' : ''}`} data-testid="drop-reveal">
      <div className="drop-reveal__bg">P.</div>
      <div className="drop-reveal__line" />
      <div className="drop-reveal__text">{dropText}</div>
    </div>
  );
};

export default DropReveal;
