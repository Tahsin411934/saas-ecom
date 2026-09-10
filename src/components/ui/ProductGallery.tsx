"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface GalleryImage {
  id: number | string;
  url: string;
  alt_text?: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
}

// ─── Zoom State ──────────────────────────────────────────────────────────────
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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoom((prev) => ({
        ...prev,
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
      }));
    },
    [],
  );

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

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function GallerySkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 bg-[#f5f5f5] p-4 rounded-xl">
      <div className="hidden lg:flex flex-col gap-3 w-[90px] shrink-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-[90px] h-[90px] rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <div className="aspect-square bg-gray-200 rounded-xl" />
      </div>
      <div className="lg:hidden flex gap-3 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-[70px] h-[70px] rounded-lg bg-gray-200 shrink-0" />
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyGallery() {
  return (
    <div className="flex items-center justify-center aspect-square bg-[#f5f5f5] rounded-xl">
      <div className="flex flex-col items-center gap-3 text-gray-300">
        <Package className="h-16 w-16" />
        <p className="text-sm font-medium">No images available</p>
      </div>
    </div>
  );
}

// ─── Main Image Viewer with Zoom ──────────────────────────────────────────────
function MainImageViewer({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const { containerRef, imageRef, zoom, zoomFactor, handlers } = useImageZoom(2.5);

  return (
    <div
      ref={containerRef}
      className="relative aspect-square bg-white rounded-xl overflow-hidden border border-gray-100 cursor-crosshair select-none"
      {...handlers}
    >
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, calc(100% - 90px - 1rem)"
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

// ─── Thumbnail Button ─────────────────────────────────────────────────────────
interface ThumbnailButtonProps {
  src: string;
  alt: string;
  isActive: boolean;
  onClick: () => void;
  size?: "desktop" | "mobile";
}

function ThumbnailButton({
  src,
  alt,
  isActive,
  onClick,
  size = "desktop",
}: ThumbnailButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-200",
        "border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        size === "desktop" ? "w-[90px] h-[90px]" : "w-[70px] h-[70px] rounded-lg",
        isActive
          ? "border-blue-500 shadow-md"
          : "border-transparent bg-white hover:border-gray-200 hover:shadow-sm"
      )}
      aria-label={`View ${alt}`}
      aria-current={isActive ? "true" : undefined}
      tabIndex={0}
      type="button"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={size === "desktop" ? "90px" : "70px"}
        className="object-over"
        unoptimized
        draggable={false}
      />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <GallerySkeleton />;
  }

  if (!images || images.length === 0) {
    return <EmptyGallery />;
  }

  const current = images[activeIndex];

  return (
    <div
      className="flex flex-col lg:flex-row gap-4 bg-[#f5f5f5] p-4 rounded-xl"
      role="region"
      aria-roledescription="product gallery"
      aria-label="Product image gallery"
    >
      <div
        className="hidden lg:flex flex-col gap-3 w-[90px] shrink-0 overflow-y-auto max-h-[600px]"
        role="tablist"
        aria-label="Image thumbnails"
      >
        {images.map((img, idx) => (
          <ThumbnailButton
            key={img.id}
            src={img.url}
            alt={img.alt_text || `Product image ${idx + 1}`}
            isActive={idx === activeIndex}
            onClick={() => setActiveIndex(idx)}
            size="desktop"
          />
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <MainImageViewer
          src={current.url}
          alt={current.alt_text || `Product image ${activeIndex + 1}`}
          priority={activeIndex === 0}
        />
      </div>

      <div
        className="lg:hidden flex gap-3 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Image thumbnails"
      >
        {images.map((img, idx) => (
          <ThumbnailButton
            key={img.id}
            src={img.url}
            alt={img.alt_text || `Product image ${idx + 1}`}
            isActive={idx === activeIndex}
            onClick={() => setActiveIndex(idx)}
            size="mobile"
          />
        ))}
      </div>
    </div>
  );
}