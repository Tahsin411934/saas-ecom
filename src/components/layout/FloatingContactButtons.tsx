"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { settingsService } from "@/services/settings.service";

const fallbackNumber = "01856533432";

function internationalNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `88${digits}`;
  return digits;
}

export default function FloatingContactButtons() {
  const [numbers, setNumbers] = useState({ phone: fallbackNumber, whatsapp: fallbackNumber });

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
      // Retain the support number if public settings are temporarily unavailable.
    });

    return () => { active = false; };
  }, []);

  const whatsappMessage = encodeURIComponent("Hello, I need help with a product or order from OneHaat.");

  return (
    <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-[70] flex items-center gap-2 md:bottom-6 md:left-6" aria-label="Contact OneHaat">
      <a
        href={`https://wa.me/${internationalNumber(numbers.whatsapp)}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        title="WhatsApp"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1fb858] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:h-11 sm:w-11"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </a>
      <a
        href={`tel:+${internationalNumber(numbers.phone)}`}
        aria-label={`Call us at ${numbers.phone}`}
        title="Call us"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition hover:scale-105 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 sm:h-11 sm:w-11"
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
      </a>
    </div>
  );
}
