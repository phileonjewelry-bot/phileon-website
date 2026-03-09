import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Upload, Image, Download, Share2, RotateCcw, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TryOnPhoto = ({ product }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [fingerPosition, setFingerPosition] = useState(null);
  const [ringSize, setRingSize] = useState([7]);
  const [metalVariant, setMetalVariant] = useState('');
  const [stoneVariant, setStoneVariant] = useState('');
  const [resultImage, setResultImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [assets, setAssets] = useState(null);
  const imageRef = useRef();
  const canvasRef = useRef();

  // Fetch assets on mount
  React.useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tryon/assets?product_id=${product.id}`);
        const data = await response.json();
        setAssets(data);
        
        if (data.available_metals.length > 0) {
          setMetalVariant(data.available_metals[0]);
        }
        if (data.available_stones.length > 0) {
          setStoneVariant(data.available_stones[0]);
        }
      } catch (error) {
        console.error('Failed to fetch try-on assets:', error);
      }
    };
    fetchAssets();
  }, [product.id]);

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage({
          file,
          preview: reader.result
        });
        setResultImage(null);
        setFingerPosition(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    multiple: false
  });

  const handleImageClick = (e) => {
    if (!uploadedImage || processing) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setFingerPosition({ x, y });
    
    // Visual feedback - add a temporary dot
    const existingDot = document.getElementById('finger-position-dot');
    if (existingDot) existingDot.remove();
    
    const dot = document.createElement('div');
    dot.id = 'finger-position-dot';
    dot.style.position = 'absolute';
    dot.style.left = `${x}%`;
    dot.style.top = `${y}%`;
    dot.style.width = '12px';
    dot.style.height = '12px';
    dot.style.backgroundColor = '#c9a962';
    dot.style.borderRadius = '50%';
    dot.style.transform = 'translate(-50%, -50%)';
    dot.style.boxShadow = '0 0 10px rgba(201, 169, 98, 0.8)';
    dot.style.zIndex = '10';
    dot.style.animation = 'pulse 1s infinite';
    
    const imageContainer = imageRef.current.parentElement;
    imageContainer.style.position = 'relative';
    imageContainer.appendChild(dot);
  };

  const processTryOn = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedImage.file);
      formData.append('product_id', product.id);
      formData.append('ring_size', ringSize[0].toString());
      
      if (metalVariant) formData.append('metal_variant', metalVariant);
      if (stoneVariant) formData.append('stone_variant', stoneVariant);
      if (fingerPosition) {
        formData.append('finger_position', JSON.stringify(fingerPosition));
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tryon/photo`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process try-on');
      }

      const result = await response.json();
      setResultImage(result.result_url);
      
      toast.success(`Try-on complete! ${result.cache_hit ? '(Cached result)' : `(${result.processing_time?.toFixed(1)}s)`}`);
      
      // Log analytics
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'photo_processed',
          product_id: product.id,
          device_info: {
            ring_size: ringSize[0],
            metal_variant: metalVariant,
            stone_variant: stoneVariant,
            has_finger_position: !!fingerPosition
          }
        })
      });
      
    } catch (error) {
      console.error('Try-on processing failed:', error);
      toast.error('Failed to process try-on. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = async () => {
    if (!resultImage) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${resultImage}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `phileon-tryon-${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Log analytics
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'result_download',
          product_id: product.id
        })
      });
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image');
    }
  };

  const shareResult = async () => {
    if (!resultImage) return;
    
    try {
      if (navigator.share && navigator.canShare) {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${resultImage}`);
        const blob = await response.blob();
        const file = new File([blob], `phileon-tryon-${product.name}.jpg`, { type: 'image/jpeg' });
        
        await navigator.share({
          title: `Phileon Try-On: ${product.name}`,
          text: `Check out how this ${product.name} looks on me!`,
          files: [file]
        });
      } else {
        // Fallback - copy URL to clipboard
        const fullUrl = `${window.location.origin}${process.env.REACT_APP_BACKEND_URL}${resultImage}`;
        await navigator.clipboard.writeText(fullUrl);
        toast.success('Image URL copied to clipboard!');
      }
      
      // Log analytics
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'result_share',
          product_id: product.id
        })
      });
      
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share image');
    }
  };

  const resetAll = () => {
    setUploadedImage(null);
    setResultImage(null);
    setFingerPosition(null);
    const dot = document.getElementById('finger-position-dot');
    if (dot) dot.remove();
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-phileon-black to-gray-900 rounded-lg overflow-hidden">
      {/* Image Area */}
      <div className="flex-1 flex flex-col">
        {!uploadedImage && !resultImage ? (
          // Upload Area
          <div {...getRootProps()} className={`flex-1 border-2 border-dashed rounded-lg m-4 flex items-center justify-center cursor-pointer transition-colors ${
            isDragActive ? 'border-phileon-gold bg-phileon-gold/10' : 'border-phileon-gold/30 hover:border-phileon-gold/60 hover:bg-phileon-gold/5'
          }`}>
            <input {...getInputProps()} />
            <div className="text-center p-8">
              <Upload className="w-16 h-16 text-phileon-gold mx-auto mb-4" />
              <h3 className="text-xl font-light text-phileon-ivory mb-2">
                {isDragActive ? 'Drop your image here' : 'Upload your hand photo'}
              </h3>
              <p className="text-phileon-ivory/60 mb-4">
                Drag & drop an image, or click to browse
              </p>
              <p className="text-xs text-phileon-ivory/40">
                Supports JPG, PNG, WebP up to 10MB
              </p>
            </div>
          </div>
        ) : (
          // Image Display
          <div className="flex-1 p-4">
            <div className="h-full bg-gray-900 rounded-lg overflow-hidden relative">
              <img
                ref={imageRef}
                src={resultImage ? `${process.env.REACT_APP_BACKEND_URL}${resultImage}` : uploadedImage.preview}
                alt="Try-on"
                className="w-full h-full object-contain cursor-crosshair"
                onClick={!resultImage ? handleImageClick : undefined}
              />
              
              {!resultImage && fingerPosition && (
                <div className="absolute top-4 left-4 bg-phileon-black/80 text-phileon-ivory px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-phileon-gold" />
                  Ring position selected
                </div>
              )}
              
              {!resultImage && uploadedImage && (
                <div className="absolute bottom-4 left-4 bg-phileon-black/80 text-phileon-ivory/70 px-3 py-1 rounded-full text-xs">
                  Click on your finger to position the ring
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(uploadedImage || resultImage) && (
          <div className="p-4 border-t border-phileon-gold/20 flex gap-3">
            {uploadedImage && !processing && (
              <Button
                onClick={processTryOn}
                className="flex-1 bg-phileon-gold text-phileon-black hover:bg-phileon-gold/90"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Apply Ring'
                )}
              </Button>
            )}
            
            {resultImage && (
              <>
                <Button
                  onClick={downloadResult}
                  variant="outline"
                  className="border-phileon-gold/30 text-phileon-gold hover:bg-phileon-gold/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={shareResult}
                  variant="outline"
                  className="border-phileon-gold/30 text-phileon-gold hover:bg-phileon-gold/20"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </>
            )}
            
            <Button
              onClick={resetAll}
              variant="outline"
              size="icon"
              className="border-phileon-gold/30 text-phileon-ivory hover:bg-phileon-gold/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-phileon-black/50 border-l border-phileon-gold/20 p-6 overflow-y-auto">
        <h3 className="text-lg font-light text-phileon-ivory mb-6 flex items-center gap-2">
          <Image className="w-5 h-5 text-phileon-gold" />
          Photo Settings
        </h3>

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
            disabled={processing}
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
            <Select value={metalVariant} onValueChange={setMetalVariant} disabled={processing}>
              <SelectTrigger className="bg-phileon-black/50 border-phileon-gold/30 text-phileon-ivory">
                <SelectValue placeholder="Select metal" />
              </SelectTrigger>
              <SelectContent className="bg-phileon-black border-phileon-gold/30">
                {assets.available_metals.map((metal) => (
                  <SelectItem key={metal} value={metal}>
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
            <Select value={stoneVariant} onValueChange={setStoneVariant} disabled={processing}>
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
          <h4 className="text-sm font-medium text-phileon-ivory/90 mb-2">How to get best results:</h4>
          <ul className="text-xs text-phileon-ivory/60 space-y-2">
            <li>• Use a clear, well-lit photo of your hand</li>
            <li>• Extend your hand with fingers separated</li>
            <li>• Click on your ring finger to position the ring</li>
            <li>• Ensure your hand is the main focus of the image</li>
          </ul>
        </div>

        {processing && (
          <div className="border-t border-phileon-gold/20 pt-4 mt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-phileon-gold animate-spin mr-2" />
              <span className="text-phileon-ivory/70 text-sm">Processing your try-on...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TryOnPhoto;