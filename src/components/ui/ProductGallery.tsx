"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package, X } from "lucide-react";
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
        sizes="(max-width: 767px) calc(100vw - 64px), (max-width: 1023px) 60vw, (max-width: 1280px) 45vw, 550px"
        className="object-contain p-4 pointer-events-none"
        preload={priority}
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
        draggable={false}
      />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageLoaded, setLightboxImageLoaded] = useState(false);

  const closeLightbox = useCallback(() => setIsLightboxOpen(false), []);
  const showPreviousImage = useCallback(() => {
    setActiveIndex((index) => (index - 1 + images.length) % images.length);
  }, [images.length]);
  const showNextImage = useCallback(() => {
    setActiveIndex((index) => (index + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLightbox, isLightboxOpen, showNextImage, showPreviousImage]);

  useEffect(() => {
    setLightboxImageLoaded(false);
  }, [activeIndex, isLightboxOpen]);

  if (isLoading) {
    return <GallerySkeleton />;
  }

  if (!images || images.length === 0) {
    return <EmptyGallery />;
  }

  const current = images[activeIndex];
  const mainImageSizes = "(max-width: 767px) calc(100vw - 64px), (max-width: 1023px) 60vw, (max-width: 1280px) 45vw, 550px";

  return (
    <div
      className="flex flex-col lg:flex-row gap-4 bg-[#f5f5f5] p-4 rounded-xl"
      role="region"
      aria-roledescription="product gallery"
      aria-label="Product image gallery"
    >
      <div
        className="hidden lg:flex flex-col gap-3 w-[90px] shrink-0 self-stretch"
        role="tablist"
        aria-label="Image thumbnails"
      >
        {images.slice(0, 5).map((img, idx) => (
          <ThumbnailButton
            key={img.id}
            src={img.url}
            alt={img.alt_text || `Product image ${idx + 1}`}
            isActive={idx === activeIndex}
            onClick={() => setActiveIndex(idx)}
            size="desktop"
          />
        ))}
        {images.length > 5 && (
          <button type="button" onClick={() => setIsLightboxOpen(true)} className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-xl bg-white text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={`View all ${images.length} images`}>
            +{images.length - 5}
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <MainImageViewer
          src={current.url}
          alt={current.alt_text || `Product image ${activeIndex + 1}`}
          priority={activeIndex === 0}
        />
      </div>

      {/* Preload optimized main-image variants for the immediately selectable thumbnails. */}
      <div className="pointer-events-none fixed left-[-10000px] top-0 h-px w-px overflow-hidden" aria-hidden="true">
        {images.slice(0, 5).map((image, index) => (
          <Image
            key={`preload-${image.id}`}
            src={image.url}
            alt=""
            width={1}
            height={1}
            sizes={mainImageSizes}
            loading="eager"
            fetchPriority={index === 0 ? "high" : "low"}
          />
        ))}
      </div>

      <div
        className="lg:hidden flex gap-3 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Image thumbnails"
      >
        {images.slice(0, 5).map((img, idx) => (
          <ThumbnailButton
            key={img.id}
            src={img.url}
            alt={img.alt_text || `Product image ${idx + 1}`}
            isActive={idx === activeIndex}
            onClick={() => setActiveIndex(idx)}
            size="mobile"
          />
        ))}
        {images.length > 5 && (
          <button type="button" onClick={() => setIsLightboxOpen(true)} className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={`View all ${images.length} images`}>
            +{images.length - 5}
          </button>
        )}
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-[#090a0c] text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Product image preview"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
        >
          <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xs font-semibold tracking-wide">IMG</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Product gallery</p>
                <p className="text-xs text-white/50">{activeIndex + 1} of {images.length}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeLightbox}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-14 py-4 sm:px-24 sm:py-8" onClick={(event) => event.stopPropagation()}>
            {!lightboxImageLoaded && <div className="absolute h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white/80" aria-label="Loading image" />}

            {images.length > 1 && (
              <button
                type="button"
                onClick={showPreviousImage}
                className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6 sm:h-12 sm:w-12"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <div className={`relative h-full max-h-[78vh] w-full max-w-6xl transition-opacity duration-200 ${lightboxImageLoaded ? "opacity-100" : "opacity-0"}`}>
              <Image
                key={current.id}
                src={current.url}
                alt={current.alt_text || `Product image ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
                onLoad={() => setLightboxImageLoaded(true)}
                draggable={false}
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6 sm:h-12 sm:w-12"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {images.length > 1 && (
            <footer className="shrink-0 border-t border-white/10 bg-black/20 px-4 py-4 sm:px-8">
              <div className="mx-auto flex max-w-full items-center justify-center gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-md border transition sm:h-14 sm:w-14 ${index === activeIndex ? "border-white ring-2 ring-white/30" : "border-white/10 opacity-55 hover:opacity-100"}`}
                  >
                    <Image src={image.url} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            </footer>
          )}
        </div>
      )}
    </div>
  );
}
