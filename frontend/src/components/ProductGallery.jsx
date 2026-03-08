import React, { useState, useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ProductGallery Component
 * 
 * Features:
 * - Swipeable carousel on mobile
 * - Arrow navigation on desktop
 * - Thumbnail navigation strip
 * - Zoom-on-hover for images (desktop only)
 * - Video autoplay support (muted, loop, playsInline)
 * - Only active slide video plays
 */

function ProductGallery({ items = [] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const videoRefs = useRef([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  // Handle video play/pause based on selected slide
  useEffect(() => {
    if (!items || items.length === 0) return;
    
    // Pause all videos
    videoRefs.current.forEach((video) => {
      if (video && !video.paused) {
        video.pause();
      }
    });
    
    // Play the active video
    const activeVideo = videoRefs.current[selectedIndex];
    if (activeVideo && items[selectedIndex]?.type === "video") {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        const playPromise = activeVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Autoplay was prevented, which is OK
            console.log('Autoplay prevented:', error.name);
          });
        }
      }, 150);
    }
  }, [selectedIndex, items]);

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    const currentItem = items[selectedIndex];
    // Only enable zoom for images on desktop
    if (currentItem?.type === "image" && window.innerWidth >= 768) {
      setIsZoomed(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  if (!items || items.length === 0) {
    return (
      <div className="w-full h-[500px] bg-white/5 rounded-2xl flex items-center justify-center">
        <p className="text-white/40">No media available</p>
      </div>
    );
  }

  return (
    <div className="w-full" data-testid="product-gallery">
      {/* Main Viewer */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex">
            {items.map((item, index) => (
              <div
                key={index}
                className="embla__slide flex-[0_0_100%] min-w-0 relative"
              >
                {item.type === "video" ? (
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    className="w-full h-[400px] md:h-[600px] lg:h-[700px] object-cover bg-black"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={item.poster || undefined}
                  >
                    <source src={item.src} type="video/mp4" />
                  </video>
                ) : (
                  <div
                    className="relative w-full h-[400px] md:h-[600px] lg:h-[700px] overflow-hidden cursor-zoom-in"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <img
                      src={item.src}
                      alt={item.alt || `Product view ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300"
                      style={
                        isZoomed && index === selectedIndex
                          ? {
                              transform: "scale(2)",
                              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            }
                          : {}
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Arrow Navigation */}
        {items.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all backdrop-blur-sm"
              aria-label="Previous slide"
              data-testid="gallery-prev-btn"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={scrollNext}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all backdrop-blur-sm"
              aria-label="Next slide"
              data-testid="gallery-next-btn"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
          <p className="text-white text-sm font-light">
            {selectedIndex + 1} / {items.length}
          </p>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {items.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={[
                "flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === index
                  ? "border-[#C6A24A] opacity-100"
                  : "border-white/20 opacity-50 hover:opacity-75",
              ].join(" ")}
              aria-label={`View slide ${index + 1}`}
              data-testid={`gallery-thumb-${index}`}
            >
              {item.type === "video" ? (
                <video
                  className="w-full h-full object-cover pointer-events-none bg-black"
                  muted
                  playsInline
                  preload="metadata"
                  poster={item.poster || undefined}
                >
                  <source src={item.src} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={item.src}
                  alt={item.alt || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .embla {
          overflow: hidden;
        }
        .embla__container {
          display: flex;
        }
        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
const MemoizedProductGallery = React.memo(ProductGallery);
export default MemoizedProductGallery;
