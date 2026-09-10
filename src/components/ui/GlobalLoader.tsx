"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalLoaderProps {
  /** Full screen overlay mode */
  fullScreen?: boolean;
  /** Custom message text */
  message?: string;
  /** Additional className */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export default function GlobalLoader({
  fullScreen = false,
  message = "Loading...",
  className,
  size = "md",
}: GlobalLoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const content = (
    <div className={cn("flex flex-col items-center justify-center h-screen gap-4", className)}>
      {/* Animated spinner with brand color */}
      <div className="relative">
        <Loader2
          className={cn(
            "animate-spin text-[var(--color-primary)]",
            sizeClasses[size]
          )}
        />
        {/* Subtle pulse ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-[var(--color-primary)]/20 animate-ping",
            sizeClasses[size]
          )}
        />
      </div>

      {/* Loading text with animated dots */}
      <div className="flex items-center gap-1">
        <span className={cn("font-medium text-gray-600", textSizeClasses[size])}>
          {message}
        </span>
        <span className="flex gap-0.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-primary)] [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-primary)] [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-primary)]" />
        </span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}