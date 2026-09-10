import { subnavbarService } from "@/services/subnavbar.service";
import SubnavbarProductsPage from "@/components/subnavbar/SubnavbarProductsPage";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await subnavbarService.getProducts(slug, { per_page: 1 });
    return {
      title: `${data.subnavbar.name} | OneHaatbd`,
      description: `Browse ${data.subnavbar.name} products at OneHaatbd. Best prices, fast delivery.`,
    };
  } catch {
    return {
      title: "Category | OneHaatbd",
      description: "Browse products by category",
    };
  }
}

export default async function SubnavbarPage({ params }: Props) {
  const { slug } = await params;

  let initialData;
  try {
    initialData = await subnavbarService.getProducts(slug);
  } catch {
    notFound();
  }

  return <SubnavbarProductsPage slug={slug} initialData={initialData} />;
}