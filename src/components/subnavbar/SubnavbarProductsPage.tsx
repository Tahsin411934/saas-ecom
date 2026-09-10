"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Grid3X3,
  List,
  ChevronLeft,
  ShoppingCart,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/ProductCard";
import {
  type SubnavbarProductsData,
  type SubnavbarProduct,
  SORT_OPTIONS,
  type SubnavbarSortOption,
} from "@/services/subnavbar.service";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchWishlistItems,
} from "@/lib/features/wishlist/wishlistSlice";

interface SubnavbarProductsPageProps {
  slug: string;
  initialData: SubnavbarProductsData;
}

export default function SubnavbarProductsPage({
  slug,
  initialData,
}: SubnavbarProductsPageProps) {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SubnavbarSortOption>("latest");
  const [data, setData] = useState<SubnavbarProductsData>(initialData);

  useEffect(() => {
    dispatch(fetchWishlistItems());
  }, [dispatch]);

  const { subnavbar, products = [] } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subnavbar Hero Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-[1200px] px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 py-3 text-xs text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
            <ChevronLeft className="h-3 w-3 rotate-180" aria-hidden="true" />
            <span className="text-gray-900 font-medium">{subnavbar.name}</span>
          </nav>

          {/* Subnavbar Hero */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 py-6 md:py-8">
            {subnavbar.image && (
              <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={subnavbar.image}
                  alt={subnavbar.name}
                  fill
                  sizes="(max-width: 768px) 80px, 96px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                {subnavbar.name}
              </h1>
              {subnavbar.description && (
                <p className="mt-2 text-sm md:text-base text-gray-500 max-w-2xl leading-relaxed">
                  {subnavbar.description}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-400">
                {products.length} product{products.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-xl border border-gray-200 p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${viewMode === "grid" ? "bg-[var(--color-primary)] text-white" : "bg-white text-gray-500 hover:bg-gray-100"}`}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${viewMode === "list" ? "bg-[var(--color-primary)] text-white" : "bg-white text-gray-500 hover:bg-gray-100"}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
            <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SubnavbarSortOption)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid / List */}
        {products.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "products-carousel"
                : "flex flex-col gap-3"
            }
          >
            {products.map((product) => (
              <div key={product.id} className={viewMode === "grid" ? "product-card-item" : ""}>
                <ProductCard product={product} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              No products available in this category yet.
            </p>
            <Link
              href="/shop"
              className="inline-flex h-10 items-center rounded-full bg-[var(--color-primary)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-primary)] transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Pagination */}
        {data.meta && data.meta.last_page > 1 && (
          <div className="flex justify-center mt-10">
            <nav className="flex items-center gap-2" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                disabled={(data.meta?.current_page ?? 1) <= 1}
                className="text-gray-400"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Previous</span>
              </Button>
              {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === (data.meta?.current_page ?? 1) ? "default" : "outline"}
                  size="sm"
                  className={
                    page === (data.meta?.current_page ?? 1)
                      ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white min-w-[36px]"
                      : "min-w-[36px]"
                  }
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={(data.meta?.current_page ?? 1) >= data.meta.last_page}
                className="text-gray-400"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" aria-hidden="true" />
                <span className="sr-only">Next</span>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}