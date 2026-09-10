"use client";

import { useState, useEffect } from "react";
import { type AnnouncementBar } from "@/services/announcement-bar.service";

interface TopHeaderBarProps {
  serverAnnouncementBars?: AnnouncementBar[];
}

// Default fallback
const DEFAULT_BARS: AnnouncementBar[] = [
  {
    id: 0,
    left_text: "🚚 Free Shipping on Orders Over ৳99",
    center_text: "Summer Sale is Live! Up to 50% OFF 🔥",
    right_text: "📞 Support: (800) 123-4567",
    background_color: "#0F1115",
    text_color: "#ffffff",
    sort_order: 0,
    status: "active",
  },
];

export default function TopHeaderBar({ serverAnnouncementBars }: TopHeaderBarProps) {

  const bars =
    serverAnnouncementBars && serverAnnouncementBars.length > 0
      ? serverAnnouncementBars
      : DEFAULT_BARS;

  const [currentIndex, setCurrentIndex] = useState(0);

  // ২. Auto-rotate effect
  useEffect(() => {
    if (bars.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bars.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [bars.length]);

  const currentBar = bars[currentIndex] || bars[0];

  return (
    <div
      className="h-8 text-xs transition-colors duration-300"
      role="banner"
      aria-label="Announcement bar"
      style={{
        backgroundColor: currentBar.background_color,
        color: currentBar.text_color,
      }}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4">
        <span className="hidden sm:inline" aria-label="Left announcement">
          {currentBar.left_text || ""}
        </span>
        <span className="mx-auto sm:mx-0" aria-label="Center announcement">
          {currentBar.center_text || ""}
        </span>
        <span className="hidden sm:inline" aria-label="Right announcement">
          {currentBar.right_text || ""}
        </span>
      </div>
    </div>
  );
}