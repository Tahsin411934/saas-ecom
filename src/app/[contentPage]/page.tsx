import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPageView from "@/components/content/ContentPage";
import { contentPages } from "@/lib/content-pages";
import { settingsService } from "@/services/settings.service";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://onehaatbd.com").replace(/\/+$/, "");

interface Props {
  params: Promise<{ contentPage: string }>;
}

export function generateStaticParams() {
  return Object.keys(contentPages).map((contentPage) => ({ contentPage }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { contentPage } = await params;
  const page = contentPages[contentPage];
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `${SITE_URL}/${page.slug}` },
    openGraph: {
      type: "website",
      title: `${page.title} | OneHaatbd`,
      description: page.description,
      url: `${SITE_URL}/${page.slug}`,
      siteName: "OneHaatbd",
    },
  };
}

export default async function ContentPageRoute({ params }: Props) {
  const { contentPage } = await params;
  const page = contentPages[contentPage];
  if (!page) notFound();

  const settings = await settingsService.getAll().catch(() => null);
  const contact = {
    email: settings?.data?.email || "support@onehaatbd.com",
    phone: settings?.data?.phone || "+880 123-456-7890",
    address: settings?.data?.address || "Dhaka, Bangladesh",
  };

  return <ContentPageView page={page} contact={contact} />;
}
