import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, Box, Image, Camera } from 'lucide-react';

const TryOnModalSimple = ({ isOpen, onClose, product }) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[80vh] bg-black border-2 border-yellow-600">
        <DialogHeader className="border-b border-yellow-600/20 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-light text-white flex items-center gap-3">
              <Box className="h-6 w-6 text-yellow-600" />
              Try On: {product.name}
            </DialogTitle>
            <Button
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="text-white hover:text-yellow-600 hover:bg-yellow-600/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-300 mt-2">
            Experience this piece before making your inquiry
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full bg-gray-900 border border-yellow-600/20" style={{
            gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : '1fr 1fr'
          }}>
            <TabsTrigger 
              value="3d" 
              className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-600 text-gray-400 hover:text-white flex items-center gap-2"
            >
              <Box className="h-4 w-4" />
              <span className="hidden sm:inline">3D View</span>
              <span className="sm:hidden">3D</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="photo" 
              className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-600 text-gray-400 hover:text-white flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Photo Try-On</span>
              <span className="sm:hidden">Photo</span>
            </TabsTrigger>
            
            {isMobile && (
              <TabsTrigger 
                value="live-ar" 
                className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-600 text-gray-400 hover:text-white flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Live AR</span>
                <span className="sm:hidden">AR</span>
              </TabsTrigger>
            )}
          </TabsList>

          <div className="mt-6 h-[50vh] overflow-hidden">
            <TabsContent value="3d" className="h-full mt-0">
              <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
                <div className="text-center">
                  <Box className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl text-white mb-2">3D Try-On</h3>
                  <p className="text-gray-400">3D viewer will be loaded here</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photo" className="h-full mt-0">
              <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
                <div className="text-center">
                  <Image className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl text-white mb-2">Photo Try-On</h3>
                  <p className="text-gray-400">Photo upload will be available here</p>
                </div>
              </div>
            </TabsContent>

            {isMobile && (
              <TabsContent value="live-ar" className="h-full mt-0">
                <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-xl text-white mb-2">Live AR</h3>
                    <p className="text-gray-400">Camera-based AR will work here</p>
                  </div>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TryOnModalSimple;