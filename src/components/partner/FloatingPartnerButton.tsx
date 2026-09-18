"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FloatingPartnerButton() {
  const pathname = usePathname();
  if (pathname === "/become-a-partner") return null;

  return (
    <Button asChild className="group fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-40 flex h-auto min-h-8 items-center gap-1.5 rounded-full border border-white/15 bg-[var(--color-primary)] py-2 pl-1 pr-4 text-white shadow-lg transition-all hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] md:bottom-6 md:left-6 md:pr-5">
      <Link href="/become-a-partner">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15"><Store size={10} /></span>
        <span className="text-xs font-semibold sm:text-sm">Become a partner</span>
        <ArrowRight size={10} className="hidden transition-transform motion-safe:group-hover:translate-x-0.5 sm:block" />
      </Link>
    </Button>
  );
}
