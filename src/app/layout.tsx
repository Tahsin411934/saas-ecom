import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarServer from "@/components/layout/NavbarServer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { settingsService } from "@/services/settings.service";
import Footer from "@/components/layout/Footer";
import StoreProvider from "@/lib/StoreProvider";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ToastProvider from "@/components/ui/ToastProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import FloatingCartButton from "@/components/cart/FloatingCartButton";
import { normalizeAssetUrl } from "@/lib/asset-url";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

function getGtmScriptContent(code: string): string {
  return code.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)?.[1] ?? code;
}

// Site configuration - override via NEXT_PUBLIC_SITE_URL env if needed
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://onehaatbd.com").replace(/\/+$/, "");
const SITE_NAME = "OneHaat.bd";
const SITE_DESCRIPTION =
  "OneHaat.bd is Bangladesh's trusted online shopping destination. Discover top-quality products at unbeatable prices with fast, reliable delivery across Bangladesh.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "var(--color-primary)",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Premium Online Shopping in Bangladesh | Best Prices & Fast Delivery`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "OneHaat.bd", "OneHaat", "online shopping Bangladesh", "Bangladesh online store",
    "buy online Bangladesh", "ecommerce Bangladesh", "best online shopping",
    "discount shopping", "electronics", "clothing", "home decor", "fast delivery Bangladesh",
    "premium products", "affordable prices", "Dhaka shopping", "online bazar",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "bn_BD",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Premium Online Shopping in Bangladesh`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
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
    languages: {
      "en-US": SITE_URL,
      "bn-BD": SITE_URL,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  category: "ecommerce",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    // Add your Google Search Console / Bing verification codes here
    // google: "your-google-verification-code",
    // other: { "msvalidate.01": "your-bing-verification-code" },
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let primaryColor = "var(--color-primary)";
  let gtmHeaderCode: string | null = null;
  let gtmBodyCode: string | null = null;
  let siteName = SITE_NAME;
  let siteDescription = SITE_DESCRIPTION;
  let siteLogo: string | null = null;
  let phone = "";
  let email = "";
  let address = "";
  let facebookUrl = "";
  let twitterUrl = "";
  let instagramUrl = "";
  let youtubeUrl = "";
  let whatsappNumber = "";

  try {
    const settingsRes = await settingsService.getAll();
    if (settingsRes.success && settingsRes.data) {
      const s = settingsRes.data;
      if (s.primary_color) primaryColor = s.primary_color;
      if (s.site_name) siteName = s.site_name;
      if (s.site_description) siteDescription = s.site_description;
      if (s.site_logo) siteLogo = s.site_logo;
      if (s.phone) phone = s.phone;
      if (s.email) email = s.email;
      if (s.address) address = s.address;
      if (s.facebook_url) facebookUrl = s.facebook_url;
      if (s.twitter_url) twitterUrl = s.twitter_url;
      if (s.instagram_url) instagramUrl = s.instagram_url;
      if (s.youtube_url) youtubeUrl = s.youtube_url;
      if (s.whatsapp_number) whatsappNumber = s.whatsapp_number;
      if (s.gtm_enabled === "1") {
        gtmHeaderCode = s.gtm_header_code;
        gtmBodyCode = s.gtm_body_code;
      }
    }
  } catch {}

  const logoUrl = siteLogo
    ? normalizeAssetUrl(siteLogo) || `${SITE_URL}/og-image.jpg`
    : `${SITE_URL}/og-image.jpg`;

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: SITE_URL,
    logo: logoUrl,
    description: siteDescription,
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(address ? { address: { "@type": "PostalAddress", streetAddress: address, addressCountry: "BD" } } : {}),
    sameAs: [facebookUrl, twitterUrl, instagramUrl, youtubeUrl].filter(Boolean),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: SITE_URL,
    description: siteDescription,
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

  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: siteName,
    url: SITE_URL,
    description: siteDescription,
    image: logoUrl,
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    ...(address ? { address: { "@type": "PostalAddress", streetAddress: address, addressCountry: "BD" } } : {}),
    ...(whatsappNumber ? { contactPoint: { "@type": "ContactPoint", telephone: whatsappNumber, contactType: "customer service", availableLanguage: ["English", "Bengali"] } } : {}),
    sameAs: [facebookUrl, twitterUrl, instagramUrl, youtubeUrl].filter(Boolean),
  };

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {gtmHeaderCode ? <script dangerouslySetInnerHTML={{ __html: getGtmScriptContent(gtmHeaderCode) }} /> : null}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || "https://admin.onehaatbd.com"} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || "https://admin.onehaatbd.com"} />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="canonical" href={SITE_URL} />
        <meta name="geo.region" content="BD" />
        <meta name="geo.placename" content="Bangladesh" />
        <meta name="theme-color" content={primaryColor} />
        <meta name="application-name" content={siteName} />
        <meta name="apple-mobile-web-app-title" content={siteName} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content={primaryColor} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white font-sans m-0 p-0"
        style={{ "--color-primary": primaryColor } as React.CSSProperties}>
        {gtmBodyCode ? <div dangerouslySetInnerHTML={{ __html: gtmBodyCode }} /> : null}
        <StoreProvider>
          <a href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4 focus:bg-white focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
            Skip to main content
          </a>
          <NavbarServer />
          <main id="main-content" className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <CartDrawer />
          <FloatingCartButton />
          <ToastProvider />
          <ScrollToTop />
        </StoreProvider>
      </body>
    </html>
  );
}