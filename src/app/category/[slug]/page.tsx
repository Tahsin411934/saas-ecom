import { categoryProductsService } from "@/services/category-products.service";
import { categoryService } from "@/services/category.service";
import CategoryProductsPage from "@/components/category/CategoryProductsPage";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  

  try {
    const data = await categoryProductsService.getBySlug(slug, { per_page: 1 });
    const { category } = data;


    return {
      title: `${category.name} | OneHaatbd`,
      description:
        category.description ||
        `Shop the best ${category.name} products at OneHaatbd. Premium quality, unbeatable prices, fast delivery.`,
      openGraph: {
        title: `${category.name} | OneHaatbd`,
        description:
          category.description ||
          `Shop the best ${category.name} products at OneHaatbd.`,
        images: category.image ? [{ url: category.image, alt: category.name }] : [],
      },
    };
  } catch {
    return {
      title: "Category | OneHaatbd",
      description: "Browse our product categories.",
    };
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  // Fetch category info via dedicated API
  let categoryName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  let categoryDescription: string | null = null;
  let categoryImage: string | null = null;

  try {
    const catRes = await categoryService.getBySlug(slug);
    const cat = catRes.data;
    if (cat) {
      categoryName = cat.name;
      categoryDescription = cat.description;
      categoryImage = cat.image || null;
    }
  } catch {
    // Use slug-based fallback
  }

  let pageData;
  try {
    pageData = await categoryProductsService.getBySlug(slug, {
      per_page: 24,
    });
  } catch {
    notFound();
  }

  return (
    <CategoryProductsPage
      slug={slug}
      initialData={pageData}
      categoryName={categoryName}
      categoryDescription={categoryDescription}
      categoryImage={categoryImage}
    />
  );
}