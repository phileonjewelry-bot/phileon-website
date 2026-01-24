import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, Smartphone, Camera, Cube, Image } from 'lucide-react';
import TryOn3D from './TryOn3D';
import TryOnPhoto from './TryOnPhoto';
import TryOnLiveAR from './TryOnLiveAR';

const TryOnModal = ({ isOpen, onClose, product }) => {
  const [activeTab, setActiveTab] = useState('3d');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!product) return null;

  const handleTabChange = (value) => {
    setActiveTab(value);
    
    // Log analytics
    const eventType = value === '3d' ? '3d_view' : value === 'photo' ? 'photo_upload' : 'ar_attempt';
    logTryOnAnalytics(eventType, product.id);
  };

  const logTryOnAnalytics = async (eventType, productId) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          product_id: productId,
          user_agent: navigator.userAgent,
          device_info: {
            is_mobile: isMobile,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight
          },
          session_id: sessionStorage.getItem('phileon_session_id') || 'anonymous'
        })
      });
    } catch (error) {
      console.warn('Analytics logging failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] bg-phileon-black border-2 border-phileon-gold/20">
        <DialogHeader className="border-b border-phileon-gold/20 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-light text-phileon-ivory flex items-center gap-3">
              <Cube className="w-6 h-6 text-phileon-gold" />
              Try On: {product.name}
            </DialogTitle>
            <Button
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="text-phileon-ivory hover:text-phileon-gold hover:bg-phileon-gold/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-phileon-ivory/70 mt-2">
            Experience this piece before making your inquiry
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full bg-phileon-black/50 border border-phileon-gold/20" style={{
            gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : '1fr 1fr'
          }}>
            <TabsTrigger 
              value="3d" 
              className="data-[state=active]:bg-phileon-gold/20 data-[state=active]:text-phileon-gold text-phileon-ivory/70 hover:text-phileon-ivory flex items-center gap-2"
            >
              <Cube className="w-4 h-4" />
              <span className="hidden sm:inline">3D View</span>
              <span className="sm:hidden">3D</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="photo" 
              className="data-[state=active]:bg-phileon-gold/20 data-[state=active]:text-phileon-gold text-phileon-ivory/70 hover:text-phileon-ivory flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Photo Try-On</span>
              <span className="sm:hidden">Photo</span>
            </TabsTrigger>
            
            {isMobile && (
              <TabsTrigger 
                value="live-ar" 
                className="data-[state=active]:bg-phileon-gold/20 data-[state=active]:text-phileon-gold text-phileon-ivory/70 hover:text-phileon-ivory flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Live AR</span>
                <span className="sm:hidden">AR</span>
              </TabsTrigger>
            )}
          </TabsList>

          <div className="mt-6 h-[60vh] overflow-hidden">
            <TabsContent value="3d" className="h-full mt-0">
              <TryOn3D product={product} />
            </TabsContent>

            <TabsContent value="photo" className="h-full mt-0">
              <TryOnPhoto product={product} />
            </TabsContent>

            {isMobile && (
              <TabsContent value="live-ar" className="h-full mt-0">
                <TryOnLiveAR product={product} onFallbackToPhoto={() => setActiveTab('photo')} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TryOnModal;