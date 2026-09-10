"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
export interface GalleryImage {
  id: number | string;
  url: string;
  alt_text?: string | null;
}

interface ProductGalleryModalProps {
  images: GalleryImage[];
  /** Optional fixed height for main image area */
  mainHeight?: string;
}

interface ZoomState {
  show: boolean;
  x: number;
  y: number;
  naturalWidth: number;
  naturalHeight: number;
}

function useImageZoom(zoomFactor = 2.5) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState<ZoomState>({
    show: false,
    x: 50,
    y: 50,
    naturalWidth: 0,
    naturalHeight: 0,
  });

  const handleMouseEnter = useCallback(() => {
    if (imageRef.current) {
      setZoom((prev) => ({
        ...prev,
        show: true,
        naturalWidth: imageRef.current?.naturalWidth || 0,
        naturalHeight: imageRef.current?.naturalHeight || 0,
      }));
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom((prev) => ({ ...prev, x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setZoom((prev) => ({ ...prev, show: false }));
  }, []);

  return {
    containerRef,
    imageRef,
    zoom,
    zoomFactor,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}

function MainImageViewer({ src, alt, priority = true, height = "h-72" }: { src: string; alt: string; priority?: boolean; height?: string }) {
  const { containerRef, imageRef, zoom, zoomFactor, handlers } = useImageZoom(2.5);

  return (
    <div ref={containerRef} className={cn("relative bg-white rounded-xl overflow-hidden border border-gray-100 cursor-crosshair select-none", height)} {...handlers}>
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        fill
        sizes="360px"
        className="object-contain p-4 pointer-events-none"
        priority={priority}
        unoptimized
        draggable={false}
      />

      {zoom.show && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: `${zoomFactor * 100}% ${zoomFactor * 100}%`,
            backgroundPosition: `${zoom.x}% ${zoom.y}%`,
            backgroundRepeat: "no-repeat",
            imageRendering: "auto",
          }}
        />
      )}

      {zoom.show && (
        <div
          className="absolute pointer-events-none border-2 border-white/50 bg-white/10 rounded-full shadow-lg"
          style={{
            width: "120px",
            height: "120px",
            left: `calc(${zoom.x}% - 60px)`,
            top: `calc(${zoom.y}% - 60px)`,
            transform: "translate(0, 0)",
            backdropFilter: "blur(1px)",
          }}
        />
      )}
    </div>
  );
}

function ThumbnailButton({ src, alt, isActive, onClick }: { src: string; alt: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-lg transition-all duration-200 w-[70px] h-[70px]",
        isActive ? "border-2 border-[var(--color-primary)] shadow-md" : "border-transparent bg-white hover:border-gray-200"
      )}
      aria-label={`View ${alt}`}
      aria-current={isActive ? "true" : undefined}
      type="button"
    >
      <Image src={src} alt={alt} fill sizes="70px" className="object-cover" unoptimized draggable={false} />
    </button>
  );
}

export default function ProductGalleryModal({ images, mainHeight = "h-72" }: ProductGalleryModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center aspect-square bg-[#f5f5f5] rounded-xl">
        <div className="flex flex-col items-center gap-3 text-gray-300">
          <Package className="h-16 w-16" />
          <p className="text-sm font-medium">No images available</p>
        </div>
      </div>
    );
  }

  const current = images[activeIndex];

  return (
    <div className="space-y-3 w-full">
      <MainImageViewer src={current.url} alt={current.alt_text || `Product image ${activeIndex + 1}`} priority={activeIndex === 0} height={mainHeight} />

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <ThumbnailButton key={img.id} src={img.url} alt={img.alt_text || `Image ${idx + 1}`} isActive={idx === activeIndex} onClick={() => setActiveIndex(idx)} />
          ))}
        </div>
      )}
    </div>
  );
}
