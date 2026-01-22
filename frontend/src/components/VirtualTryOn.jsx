import React, { useRef, useEffect, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Hands } from '@mediapipe/hands';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Camera as CameraIcon, Download } from 'lucide-react';

const VirtualTryOn = ({ product, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faceMesh, setFaceMesh] = useState(null);
  const [hands, setHands] = useState(null);
  const [camera, setCamera] = useState(null);

  useEffect(() => {
    initializeAR();

    return () => {
      // Cleanup
      if (camera) {
        camera.stop();
      }
      if (faceMesh) {
        faceMesh.close();
      }
      if (hands) {
        hands.close();
      }
    };
  }, []);

  const initializeAR = async () => {
    try {
      setIsLoading(true);

      // Initialize based on product category
      if (product.category === 'rings') {
        await initializeHandTracking();
      } else {
        await initializeFaceTracking();
      }

      setIsLoading(false);
    } catch (err) {
      console.error('AR initialization failed:', err);
      setError('Failed to initialize camera. Please check permissions.');
      setIsLoading(false);
    }
  };

  const initializeFaceTracking = async () => {
    // Initialize MediaPipe Face Mesh
    const faceDetector = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceDetector.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceDetector.onResults(onFaceResults);
    setFaceMesh(faceDetector);

    // Start camera
    if (videoRef.current) {
      const cam = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceDetector.send({ image: videoRef.current });
        },
        width: 1280,
        height: 720,
      });
      cam.start();
      setCamera(cam);
    }
  };

  const initializeHandTracking = async () => {
    // Initialize MediaPipe Hands
    const handDetector = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    handDetector.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    handDetector.onResults(onHandResults);
    setHands(handDetector);

    // Start camera
    if (videoRef.current) {
      const cam = new Camera(videoRef.current, {
        onFrame: async () => {
          await handDetector.send({ image: videoRef.current });
        },
        width: 1280,
        height: 720,
      });
      cam.start();
      setCamera(cam);
    }
  };

  const onFaceResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = results.image.width;
    canvas.height = results.image.height;

    // Draw video frame
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];

      // Draw jewelry based on category
      if (product.category === 'earrings') {
        drawEarrings(ctx, landmarks, canvas.width, canvas.height);
      } else if (product.category === 'necklaces') {
        drawNecklace(ctx, landmarks, canvas.width, canvas.height);
      }
    }

    ctx.restore();
  };

  const onHandResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = results.image.width;
    canvas.height = results.image.height;

    // Draw video frame
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      results.multiHandLandmarks.forEach((landmarks) => {
        drawRing(ctx, landmarks, canvas.width, canvas.height);
      });
    }

    ctx.restore();
  };

  const drawEarrings = (ctx, landmarks, width, height) => {
    // Left earring position (landmark 234)
    const leftEar = landmarks[234];
    const rightEar = landmarks[454];

    const earringSize = width * 0.04; // 4% of canvas width

    // Draw left earring
    ctx.save();
    ctx.translate(leftEar.x * width, leftEar.y * height);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, earringSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw right earring
    ctx.save();
    ctx.translate(rightEar.x * width, rightEar.y * height);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, earringSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  const drawNecklace = (ctx, landmarks, width, height) => {
    // Get neck points
    const leftShoulder = landmarks[234];
    const rightShoulder = landmarks[454];
    const chin = landmarks[152];

    // Calculate necklace curve
    const centerX = (leftShoulder.x + rightShoulder.x) * width / 2;
    const neckY = chin.y * height + (width * 0.08);

    // Draw necklace chain
    ctx.save();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(leftShoulder.x * width, neckY);
    
    // Bezier curve for natural drape
    const controlY = neckY + (width * 0.03);
    ctx.quadraticCurveTo(centerX, controlY, rightShoulder.x * width, neckY);
    ctx.stroke();

    // Draw pendant at center
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, controlY + 10, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  const drawRing = (ctx, landmarks, width, height) => {
    // Ring finger tip (landmark 12)
    const ringFinger = landmarks[12];

    const ringSize = width * 0.025;

    ctx.save();
    ctx.translate(ringFinger.x * width, ringFinger.y * height);
    
    // Draw ring band
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, ringSize, 0, Math.PI * 2);
    ctx.stroke();

    // Draw gemstone
    ctx.fillStyle = '#FF6B9D';
    ctx.beginPath();
    ctx.arc(0, -ringSize * 0.5, ringSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#C41E3A';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  const captureScreenshot = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${product.name}-tryon.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-red-500">{error}</p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">{product.name}</h2>
          <p className="text-gray-400 text-sm">Virtual Try-On</p>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-gray-800"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-white text-lg">Initializing camera...</div>
          </div>
        )}

        <video
          ref={videoRef}
          className="hidden"
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full"
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 flex justify-center gap-4">
        <Button
          onClick={captureScreenshot}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          <Download className="w-5 h-5 mr-2" />
          Save Photo
        </Button>
      </div>
    </div>
  );
};

export default VirtualTryOn;