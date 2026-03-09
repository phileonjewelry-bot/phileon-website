import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Camera, CameraOff, Image } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TryOnLiveAR = ({ product, onFallbackToPhoto }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    checkSupport();
    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const checkSupport = () => {
    // Check if device supports camera and required APIs
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasCanvas = !!document.createElement('canvas').getContext;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!hasGetUserMedia || !hasCanvas) {
      setIsSupported(false);
      setError('Your device does not support camera access or canvas rendering');
      return;
    }

    if (!isMobile) {
      setIsSupported(false);
      setError('Live AR is only available on mobile devices');
      return;
    }

    setIsSupported(true);
  };

  const requestCameraPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      setError(null);
      
      // Set video stream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Log analytics
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'ar_attempt',
          product_id: product.id,
          device_info: {
            user_agent: navigator.userAgent,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight
          }
        })
      });
      
    } catch (err) {
      console.error('Camera permission denied:', err);
      setHasPermission(false);
      setError('Camera permission denied. Please allow camera access to use Live AR.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setHasPermission(false);
  };

  // Show unsupported message
  if (!isSupported) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-phileon-black to-gray-900 rounded-lg">
        <div className="text-center p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-phileon-gold mx-auto mb-4" />
          <h3 className="text-xl font-light text-phileon-ivory mb-4">
            Live AR Not Available
          </h3>
          <p className="text-phileon-ivory/70 mb-6">
            {error}
          </p>
          <Button
            onClick={onFallbackToPhoto}
            className="bg-phileon-gold text-phileon-black hover:bg-phileon-gold/90"
          >
            <Image className="w-4 h-4 mr-2" />
            Try Photo Upload Instead
          </Button>
        </div>
      </div>
    );
  }

  // Show permission request
  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-phileon-black to-gray-900 rounded-lg">
        <div className="text-center p-8 max-w-md">
          <Camera className="w-16 h-16 text-phileon-gold mx-auto mb-4" />
          <h3 className="text-xl font-light text-phileon-ivory mb-4">
            Live AR Try-On
          </h3>
          <p className="text-phileon-ivory/70 mb-6">
            Use your device's camera to see how {product.name} looks on your hand in real-time.
          </p>
          <Button
            onClick={requestCameraPermission}
            className="bg-phileon-gold text-phileon-black hover:bg-phileon-gold/90 mr-3"
          >
            <Camera className="w-4 h-4 mr-2" />
            Enable Camera
          </Button>
          <Button
            onClick={onFallbackToPhoto}
            variant="outline"
            className="border-phileon-gold/30 text-phileon-gold hover:bg-phileon-gold/20"
          >
            <Image className="w-4 h-4 mr-2" />
            Photo Upload
          </Button>
        </div>
      </div>
    );
  }

  // Show permission denied
  if (hasPermission === false) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-phileon-black to-gray-900 rounded-lg">
        <div className="text-center p-8 max-w-md">
          <CameraOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-light text-phileon-ivory mb-4">
            Camera Access Denied
          </h3>
          <Alert className="mb-6 border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <Button
              onClick={requestCameraPermission}
              variant="outline"
              className="border-phileon-gold/30 text-phileon-gold hover:bg-phileon-gold/20 w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={onFallbackToPhoto}
              className="bg-phileon-gold text-phileon-black hover:bg-phileon-gold/90 w-full"
            >
              <Image className="w-4 h-4 mr-2" />
              Use Photo Upload Instead
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show AR interface
  return (
    <div className="flex h-full bg-gradient-to-br from-phileon-black to-gray-900 rounded-lg overflow-hidden">
      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror front camera
        />
        
        {/* Overlay Canvas for AR effects */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* AR Indicators */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 border-2 border-phileon-gold rounded-full opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-phileon-gold rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          {/* Instructions */}
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-phileon-black/80 text-phileon-ivory px-4 py-2 rounded-lg text-sm">
              Position your hand in the center and extend your ring finger
            </div>
          </div>
          
          {/* Product info */}
          <div className="absolute bottom-20 left-4 right-4">
            <div className="bg-phileon-black/80 text-phileon-ivory px-4 py-3 rounded-lg">
              <div className="font-medium">{product.name}</div>
              <div className="text-xs text-phileon-ivory/70 mt-1">
                Live AR Preview - Move your hand to see the ring
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
          <Button
            onClick={stopCamera}
            variant="outline"
            size="icon"
            className="bg-phileon-black/80 border-phileon-gold/30 text-phileon-gold hover:bg-phileon-gold/20 rounded-full w-12 h-12"
          >
            <CameraOff className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={onFallbackToPhoto}
            variant="outline" 
            className="bg-phileon-black/80 border-phileon-gold/30 text-phileon-gold hover:bg-phileon-gold/20"
          >
            <Image className="w-4 h-4 mr-2" />
            Switch to Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TryOnLiveAR;