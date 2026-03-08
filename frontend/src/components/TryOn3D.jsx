import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Text } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, ZoomIn, ZoomOut, Settings } from 'lucide-react';

// Hand Model Component
const HandModel = ({ fingerSelection, ringScale, ringPosition }) => {
  // Simple hand representation using basic geometries
  return (
    <group position={[0, -2, 0]} rotation={[0.2, 0, 0]}>
      {/* Palm */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.3, 3]} />
        <meshStandardMaterial color="#f4c2a1" />
      </mesh>
      
      {/* Fingers */}
      {['thumb', 'index', 'middle', 'ring', 'pinky'].map((finger, index) => {
        const positions = [
          [-0.8, 0.2, 1.2], // thumb
          [-0.6, 0.2, 1.8], // index  
          [-0.2, 0.2, 2.0], // middle
          [0.2, 0.2, 1.9],  // ring
          [0.6, 0.2, 1.6]   // pinky
        ];
        
        const isSelected = fingerSelection === finger;
        
        return (
          <group key={finger} position={positions[index]}>
            {/* Finger segments */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.15, 0.18, 1, 8]} />
              <meshStandardMaterial color={isSelected ? "#ffd700" : "#f4c2a1"} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.12, 0.15, 0.8, 8]} />
              <meshStandardMaterial color={isSelected ? "#ffd700" : "#f4c2a1"} />
            </mesh>
            <mesh position={[0, 1.8, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 0.6, 8]} />
              <meshStandardMaterial color={isSelected ? "#ffd700" : "#f4c2a1"} />
            </mesh>
            
            {/* Ring position indicator for selected finger */}
            {isSelected && (
              <mesh position={[0, ringPosition, 0]}>
                <torusGeometry args={[0.2 * ringScale, 0.05, 8, 16]} />
                <meshStandardMaterial color="#c9a962" metalness={0.8} roughness={0.2} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Ring Model Component
const RingModel = ({ gltfUrl, scale, position, metalVariant }) => {
  const gltfRef = useRef();
  
  // Load GLB model if available
  let gltf = null;
  try {
    if (gltfUrl) {
      gltf = useGLTF(gltfUrl);
    }
  } catch (error) {
    console.warn('Failed to load GLB model:', error);
  }

  // Fallback ring if GLB not available
  if (!gltf) {
    return (
      <mesh position={position} scale={[scale, scale, scale]}>
        <torusGeometry args={[0.5, 0.1, 8, 16]} />
        <meshStandardMaterial 
          color={metalVariant === 'gold' ? '#ffd700' : metalVariant === 'silver' ? '#c0c0c0' : '#4a4a4a'}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    );
  }

  return (
    <primitive 
      ref={gltfRef}
      object={gltf.scene} 
      position={position}
      scale={[scale, scale, scale]}
    />
  );
};

const TryOn3D = ({ product }) => {
  const [fingerSelection, setFingerSelection] = useState('ring');
  const [ringSize, setRingSize] = useState([7]);
  const [ringScale, setRingScale] = useState(1);
  const [metalVariant, setMetalVariant] = useState('gold');
  const [stoneVariant, setStoneVariant] = useState('');
  const [assets, setAssets] = useState(null);
  const [loading, setLoading] = useState(true);
  const controlsRef = useRef();

  // Fetch try-on assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tryon/assets?product_id=${product.id}`);
        const data = await response.json();
        setAssets(data);
        
        // Set default variants
        if (data.available_metals.length > 0) {
          setMetalVariant(data.available_metals[0].toLowerCase());
        }
        if (data.available_stones.length > 0) {
          setStoneVariant(data.available_stones[0]);
        }
      } catch (error) {
        console.error('Failed to fetch try-on assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [product.id]);

  // Calculate ring scale based on size
  useEffect(() => {
    const sizeScale = 0.8 + (ringSize[0] - 4) * 0.05; // Size 4 = 0.8x, Size 12 = 1.2x
    setRingScale(sizeScale * (assets?.tryon_ring_scale || 1.0));
  }, [ringSize, assets]);

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const fingerPositions = {
    thumb: [0, 0.8, 0],
    index: [0, 1.0, 0], 
    middle: [0, 1.2, 0],
    ring: [0, 1.0, 0],
    pinky: [0, 0.8, 0]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-phileon-black to-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-phileon-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-phileon-ivory/70">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-phileon-black to-gray-900 rounded-lg overflow-hidden">
      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 2, 8], fov: 45 }}
          style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            
            <HandModel 
              fingerSelection={fingerSelection}
              ringScale={ringScale}
              ringPosition={0.8}
            />
            
            <RingModel 
              gltfUrl={assets?.tryon_glb_url}
              scale={ringScale}
              position={fingerPositions[fingerSelection]}
              metalVariant={metalVariant}
            />
            
            <Environment preset="studio" />
            <ContactShadows opacity={0.3} scale={10} blur={1} far={10} />
            <OrbitControls 
              ref={controlsRef}
              enablePan={false}
              minDistance={4}
              maxDistance={12}
              maxPolarAngle={Math.PI / 1.5}
            />
          </Suspense>
        </Canvas>
        
        {/* 3D Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={resetView}
            className="bg-phileon-black/80 border-phileon-gold/30 text-phileon-gold hover:bg-phileon-gold/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Product Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="outline" className="bg-phileon-black/80 border-phileon-gold/30 text-phileon-gold">
            {product.name}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-phileon-black/50 border-l border-phileon-gold/20 p-6 overflow-y-auto">
        <h3 className="text-lg font-light text-phileon-ivory mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-phileon-gold" />
          Customization
        </h3>

        {/* Finger Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-phileon-ivory/90 mb-3">
            Finger Selection
          </label>
          <Select value={fingerSelection} onValueChange={setFingerSelection}>
            <SelectTrigger className="bg-phileon-black/50 border-phileon-gold/30 text-phileon-ivory">
              <SelectValue placeholder="Select finger" />
            </SelectTrigger>
            <SelectContent className="bg-phileon-black border-phileon-gold/30">
              <SelectItem value="thumb">Thumb</SelectItem>
              <SelectItem value="index">Index</SelectItem>
              <SelectItem value="middle">Middle</SelectItem>
              <SelectItem value="ring">Ring</SelectItem>
              <SelectItem value="pinky">Pinky</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ring Size */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-phileon-ivory/90 mb-3">
            Ring Size: {ringSize[0]}
          </label>
          <Slider
            value={ringSize}
            onValueChange={setRingSize}
            min={4}
            max={12}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-phileon-ivory/50 mt-1">
            <span>4</span>
            <span>12</span>
          </div>
        </div>

        {/* Metal Variant */}
        {assets?.available_metals?.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-phileon-ivory/90 mb-3">
              Metal
            </label>
            <Select value={metalVariant} onValueChange={setMetalVariant}>
              <SelectTrigger className="bg-phileon-black/50 border-phileon-gold/30 text-phileon-ivory">
                <SelectValue placeholder="Select metal" />
              </SelectTrigger>
              <SelectContent className="bg-phileon-black border-phileon-gold/30">
                {assets.available_metals.map((metal) => (
                  <SelectItem key={metal} value={metal.toLowerCase()}>
                    {metal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stone Variant */}
        {assets?.available_stones?.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-phileon-ivory/90 mb-3">
              Stone
            </label>
            <Select value={stoneVariant} onValueChange={setStoneVariant}>
              <SelectTrigger className="bg-phileon-black/50 border-phileon-gold/30 text-phileon-ivory">
                <SelectValue placeholder="Select stone" />
              </SelectTrigger>
              <SelectContent className="bg-phileon-black border-phileon-gold/30">
                {assets.available_stones.map((stone) => (
                  <SelectItem key={stone} value={stone}>
                    {stone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Instructions */}
        <div className="border-t border-phileon-gold/20 pt-4 mt-6">
          <p className="text-xs text-phileon-ivory/60 leading-relaxed">
            • Drag to rotate the view
            • Scroll to zoom in/out
            • Select different fingers to see ring placement
            • Adjust size and materials to visualize your preference
          </p>
        </div>
      </div>
    </div>
  );
};

export default TryOn3D;