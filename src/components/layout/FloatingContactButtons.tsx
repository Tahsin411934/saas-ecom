"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, MessageCircle, Phone, X } from "lucide-react";
import { settingsService } from "@/services/settings.service";

const fallbackNumber = "01856533432";

function internationalNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `88${digits}`;
  return digits;
}

const actionClass = "flex h-12 min-w-40 items-center justify-between gap-3 rounded-full border border-slate-100 bg-white py-1 pl-4 pr-1 text-sm font-semibold text-slate-800 shadow-lg shadow-slate-900/10 transition hover:-translate-x-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2";
const iconClass = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white";

export default function FloatingContactButtons() {
  const [numbers, setNumbers] = useState({ phone: fallbackNumber, whatsapp: fallbackNumber });
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    settingsService.getAll().then((settings) => {
      if (!active) return;
      const values = settings.data ?? {};
      setNumbers({
        phone: values.phone || values.whatsapp_number || fallbackNumber,
        whatsapp: values.whatsapp_number || values.phone || fallbackNumber,
      });
    }).catch(() => {
      // Keep the support number if public settings are temporarily unavailable.
    });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setExpanded(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [expanded]);

  const whatsappMessage = encodeURIComponent("Hello, I need help with a product or order from OneHaat.");
  const openChat = () => {
    setExpanded(false);
    window.dispatchEvent(new Event("open-store-chat"));
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[70] flex flex-col items-end gap-2 md:bottom-6 md:right-6"
    >
      <div
        id="floating-contact-options"
        aria-label="Contact options"
        aria-hidden={!expanded}
        className={`flex flex-col items-end gap-2 transition-all duration-200 motion-reduce:transition-none ${expanded ? "translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-2 opacity-0"}`}
      >
        <a
          href={`https://wa.me/${internationalNumber(numbers.whatsapp)}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClass}
          onClick={() => setExpanded(false)}
        >
          <span>WhatsApp</span>
          <span className={`${iconClass} bg-[#168c55]`}><MessageCircle className="h-5 w-5" aria-hidden="true" /></span>
        </a>
        <a
          href={`tel:+${internationalNumber(numbers.phone)}`}
          className={actionClass}
          onClick={() => setExpanded(false)}
        >
          <span>Call us</span>
          <span className={`${iconClass} bg-[var(--color-primary)]`}><Phone className="h-5 w-5" aria-hidden="true" /></span>
        </a>
        <button type="button" className={actionClass} onClick={openChat}>
          <span>Live Chat</span>
          <span className={`${iconClass} bg-emerald-900`}><MessageCircle className="h-5 w-5" aria-hidden="true" /></span>
        </button>
      </div>

      <button
        type="button"
        aria-label={expanded ? "Close contact options" : "Open contact options"}
        aria-controls="floating-contact-options"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
        className={`flex h-14 items-center justify-between gap-3 rounded-full border border-slate-100 bg-white py-1 text-sm font-semibold text-slate-800 shadow-xl shadow-slate-900/15 transition hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${expanded ? "min-w-40 pl-4 pr-1" : "w-14 justify-center px-1"}`}
      >
        <span className={expanded ? "" : "sr-only"}>Contact</span>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-white">
          {expanded ? <X className="h-5 w-5" aria-hidden="true" /> : <Headphones className="h-5 w-5" aria-hidden="true" />}
        </span>
      </button>
    </div>
  );
}
