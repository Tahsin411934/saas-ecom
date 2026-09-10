import type { Metadata } from "next";
import { categoryService, type Category } from "@/services/category.service";
import AllCategoriesPage from "@/components/category/AllCategoriesPage";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://onehaatbd.com").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "All Categories | OneHaatbd",
  description:
    "Browse all product categories at OneHaat.bd. Shop audio, gadgets, fashion and more — top-quality products at unbeatable prices with fast delivery across Bangladesh.",
  alternates: {
    canonical: `${SITE_URL}/categories`,
  },
};

export default async function CategoriesPage() {
  let categories: Category[] = [];

  try {
    const res = await categoryService.getAll();
    if (res.success) {
      categories = res.data;
    }
  } catch {
    // API unavailable – component renders the empty state
  }

  return <AllCategoriesPage categories={categories} />;
}