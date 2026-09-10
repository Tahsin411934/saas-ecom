import { productDetailService } from "@/services/product-detail.service";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await productDetailService.getBySlug(slug);

    const title = product.seo_title || `${product.name} | OneHaatbd`;
    const description =
      product.seo_description ||
      product.short_description ||
      `Buy ${product.name} at OneHaatbd. Best price, fast delivery.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: product.main_image
          ? [{ url: product.main_image, alt: product.name }]
          : [],
      },
    };
  } catch {
    return {
      title: "Product | OneHaatbd",
      description: "Product details",
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  let product;
  try {
    product = await productDetailService.getBySlug(slug);
  } catch {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}