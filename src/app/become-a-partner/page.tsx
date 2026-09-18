import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BecomePartner from "@/components/partner/BecomePartner";
import { buildApiUrl } from "@/lib/api-url";
import { settingsService } from "@/services/settings.service";

export const metadata: Metadata = {
  title: "Become a partner",
  description: "Register your business and create your store on our marketplace.",
};

export default async function BecomePartnerPage() {
  const settings = await settingsService.getAll().catch(() => null);
  const siteName = settings?.data?.site_name || "OneHaat.bd";
  const sellerLoginUrl = new URL("/", buildApiUrl("/api/v1/register/store-owner")).toString();

  return (
    <div className="bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-[1040px]">
        <Button asChild variant="link" className="mb-6 h-auto gap-2 p-0 text-slate-500 hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]">
          <Link href="/"><ArrowLeft size={16} />Back to shopping</Link>
        </Button>
        <BecomePartner siteName={siteName} sellerLoginUrl={sellerLoginUrl} />
      </div>
    </div>
  );
}
