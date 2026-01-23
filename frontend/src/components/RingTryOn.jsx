import { useState, useRef, useEffect, useCallback } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { X, Camera as CameraIcon, Download, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Finger landmark indices for MediaPipe Hands (constant, doesn't change)
const FINGER_LANDMARKS = {
  index: { base: 5, tip: 8 },
  middle: { base: 9, tip: 12 },
  ring: { base: 13, tip: 16 },
  pinky: { base: 17, tip: 20 },
};

const RingTryOn = ({ ringImage, ringName, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFinger, setSelectedFinger] = useState('ring'); // ring, index, middle, pinky
  const [ringScale, setRingScale] = useState(1);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);

  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw video frame
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        const finger = fingerLandmarks[selectedFinger];
        const baseLandmark = landmarks[finger.base];
        const tipLandmark = landmarks[finger.tip];
        
        // Calculate ring position (between base and first joint)
        const ringX = baseLandmark.x * canvas.width;
        const ringY = (baseLandmark.y * 0.7 + tipLandmark.y * 0.3) * canvas.height;
        
        // Calculate ring size based on finger width
        const fingerWidth = Math.abs(
          landmarks[finger.base].x - landmarks[finger.base + 1]?.x || 0.03
        ) * canvas.width * 3;
        
        const ringSize = Math.max(fingerWidth * ringScale, 30);
        
        // Calculate rotation based on finger angle
        const dx = tipLandmark.x - baseLandmark.x;
        const dy = tipLandmark.y - baseLandmark.y;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        
        // Draw ring
        if (ringImage) {
          const img = new Image();
          img.src = ringImage;
          
          ctx.save();
          ctx.translate(ringX, ringY);
          ctx.rotate(angle);
          
          // Draw ring with glow effect
          ctx.shadowColor = 'rgba(201, 169, 98, 0.5)';
          ctx.shadowBlur = 15;
          ctx.drawImage(img, -ringSize / 2, -ringSize / 2, ringSize, ringSize);
          ctx.restore();
        } else {
          // Draw placeholder ring
          ctx.save();
          ctx.translate(ringX, ringY);
          ctx.rotate(angle);
          
          // Gold ring
          ctx.beginPath();
          ctx.ellipse(0, 0, ringSize / 2, ringSize / 3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = '#c9a962';
          ctx.lineWidth = ringSize / 6;
          ctx.shadowColor = 'rgba(201, 169, 98, 0.6)';
          ctx.shadowBlur = 10;
          ctx.stroke();
          
          // Diamond
          ctx.beginPath();
          ctx.arc(0, -ringSize / 3, ringSize / 8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 15;
          ctx.fill();
          
          ctx.restore();
        }
      }
    }
    
    ctx.restore();
    setIsLoading(false);
  }, [selectedFinger, ringScale, ringImage]);

  useEffect(() => {
    let camera = null;
    
    const initializeCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        if (videoRef.current) {
          camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (handsRef.current && videoRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480,
          });
          cameraRef.current = camera;
          await camera.start();
        }
      } catch (err) {
        console.error('Camera initialization error:', err);
        setError('Unable to access camera. Please ensure camera permissions are granted.');
        setIsLoading(false);
      }
    };

    initializeCamera();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [onResults]);

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `phileon-ring-tryon-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const fingers = [
    { id: 'index', label: 'Index' },
    { id: 'middle', label: 'Middle' },
    { id: 'ring', label: 'Ring' },
    { id: 'pinky', label: 'Pinky' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" data-testid="ring-tryon-modal">
      <div className="relative w-full max-w-4xl bg-phileon-near-black border border-phileon-charcoal">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-phileon-charcoal">
          <div className="flex items-center gap-3">
            <Sparkles className="text-phileon-gold" size={20} />
            <div>
              <h2 className="font-serif text-lg tracking-wider text-phileon-ivory">Virtual Try-On</h2>
              {ringName && <p className="text-xs text-phileon-ivory-muted">{ringName}</p>}
            </div>
          </div>
          {/* Disclaimer */}
          <p className="text-xs text-phileon-ivory-muted/60 hidden md:block">
            For visualization only
          </p>
          <button 
            onClick={onClose}
            className="p-2 text-phileon-ivory-muted hover:text-phileon-ivory transition-colors"
            data-testid="close-tryon"
          >
            <X size={24} />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-0"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full object-contain"
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center">
                <div className="spinner mx-auto mb-4" />
                <p className="text-phileon-ivory-muted text-sm">Initializing camera...</p>
                <p className="text-phileon-ivory-muted text-xs mt-2">Please allow camera access</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center p-6">
                <CameraIcon className="mx-auto mb-4 text-red-400" size={48} />
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} className="btn-outline">
                  <RotateCcw size={16} className="mr-2" /> Retry
                </Button>
              </div>
            </div>
          )}

          {/* Instructions overlay */}
          {!isLoading && !error && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-phileon-ivory-muted text-sm bg-black/60 py-2 px-4 inline-block">
                Position your hand in front of the camera • Ring will appear on selected finger
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-phileon-charcoal">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Finger Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-phileon-ivory-muted tracking-wider">FINGER:</span>
              {fingers.map((finger) => (
                <button
                  key={finger.id}
                  onClick={() => setSelectedFinger(finger.id)}
                  className={`px-3 py-1 text-xs tracking-wider transition-colors ${
                    selectedFinger === finger.id
                      ? 'bg-phileon-gold text-phileon-black'
                      : 'bg-phileon-charcoal text-phileon-ivory-muted hover:text-phileon-ivory'
                  }`}
                  data-testid={`finger-${finger.id}`}
                >
                  {finger.label}
                </button>
              ))}
            </div>

            {/* Size Control */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-phileon-ivory-muted tracking-wider">SIZE:</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={ringScale}
                onChange={(e) => setRingScale(parseFloat(e.target.value))}
                className="w-24 accent-phileon-gold"
                data-testid="ring-size-slider"
              />
            </div>

            {/* Capture Button */}
            <Button 
              onClick={capturePhoto}
              disabled={isLoading || error}
              className="btn-primary"
              data-testid="capture-photo"
            >
              <Download size={16} className="mr-2" /> Save Photo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RingTryOn;
