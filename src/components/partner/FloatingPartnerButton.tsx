"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Sparkles } from "lucide-react";

export default function FloatingPartnerButton() {
  const pathname = usePathname();
  if (pathname === "/become-a-partner") return null;

  return (
    <Link
      href="#ask-us"
      onClick={(event) => {
        event.preventDefault();
        window.dispatchEvent(new Event("open-store-chat"));
      }}
      aria-label="Ask us"
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[80] inline-flex h-14 items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-white shadow-xl shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] md:bottom-6 md:right-6"
    >
      <span className="relative"><MessageCircle className="h-5 w-5" /><Sparkles className="absolute -right-1 -top-1 h-3 w-3 fill-white" /></span>
      <span className="text-sm font-semibold">Ask us</span>
    </Link>
  );
}
