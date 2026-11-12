"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FloatingPartnerButton() {
  const pathname = usePathname();
  if (pathname === "/become-a-partner") return null;

  return (
    <Button asChild className="group fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[var(--color-primary)] p-0 text-white shadow-lg transition-all hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] sm:h-auto sm:w-auto sm:min-h-8 sm:justify-start sm:gap-1.5 sm:py-2 sm:pl-1 sm:pr-4 md:bottom-6 md:left-6 md:pr-5">
      <Link href="/become-a-partner">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15"><Store size={12} /></span>
        <span className="hidden text-xs font-semibold sm:inline sm:text-sm">Become a partner</span>
        <ArrowRight size={10} className="hidden transition-transform motion-safe:group-hover:translate-x-0.5 sm:block" />
      </Link>
    </Button>
  );
}
