import HeroBannerServer from "@/components/home/HeroBannerServer";
import CategoryScrollServer from "@/components/home/CategoryScrollServer";
import HomePageServer from "@/components/home/HomePageServer";
import CampaignSection from "@/components/home/CampaignSection";
import { campaignService } from "@/services/campaign.service";
import type { Metadata } from "next";

// Homepage freshness is controlled centrally in src/config/revalidate.ts
// (consumed by services at the fetch level — do NOT add `export const revalidate`
// here: build-time analyzers only accept inline literals, not imported values).

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://onehaatbd.com").replace(/\/+$/, "");
const SITE_NAME = "OneHaat.bd";
const SITE_DESCRIPTION =
  "OneHaat.bd is Bangladesh's trusted online shopping destination. Discover top-quality products at unbeatable prices with fast, reliable delivery across Bangladesh.";

export const metadata: Metadata = {
  title: `${SITE_NAME} - Premium Online Shopping in Bangladesh | Best Prices & Fast Delivery`,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} - Premium Online Shopping in Bangladesh`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Premium Online Shopping in Bangladesh`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Premium Online Shopping in Bangladesh`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function Home() {
  const campaigns = await campaignService.getActive().catch(() => []);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.jpg`,
    description: SITE_DESCRIPTION,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Bengali"],
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <div className="flex flex-col">
        <HeroBannerServer />
        <CategoryScrollServer />
        <CampaignSection campaigns={campaigns} />
        <HomePageServer />
      </div>
    </>
  );
}
