"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ShoppingCart,
  ArrowUpDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GlobalLoader from "@/components/ui/GlobalLoader";
import ProductCard from "@/components/ui/ProductCard";
import {
  type CategoryProductsData,
  type CategorySortOption,
  SORT_OPTIONS,
} from "@/types/product";
import { useCategoryProducts } from "./useCategoryProducts";
import { brandsService, type BrandOption } from "@/services/brands.service";
import { useAppDispatch } from "@/lib/hooks";
import { fetchWishlistItems } from "@/lib/features/wishlist/wishlistSlice";
import { trackViewItemList, trackViewCategory } from "@/lib/gtm";
import dynamic from "next/dynamic";
import type { Props as SelectProps } from "react-select";
import "./CategoryProductsPage.css";

// Dynamically import react-select to avoid SSR issues
interface BrandSelectOption {
  value: number;
  label: string;
}
const Select = dynamic<SelectProps<BrandSelectOption, false>>(() => import("react-select"), { ssr: false });

interface CategoryProductsPageProps {
  slug: string;
  initialData: CategoryProductsData;
  categoryName: string;
  categoryDescription: string | null;
  categoryImage: string | null;
}

export default function CategoryProductsPage({
  slug,
  initialData,
  categoryName,
  categoryDescription,
  categoryImage,
}: CategoryProductsPageProps) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();
  const { data, sort: sortBy, brandId, page, pending: resultsPending, error: productsError, retry } =
    useCategoryProducts(slug, initialData, queryString);
  const [selectedBrand, setSelectedBrand] = useState<BrandOption | null>(null);

  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSearchInput, setBrandSearchInput] = useState("");
  const [brandPage, setBrandPage] = useState(1);

  const [brandHasMore, setBrandHasMore] = useState(false);
  const categoryId = initialData.category?.id;

  const brandRequestId = useRef(0);

  // Load brands for the dropdown (first 20)
  const loadBrands = useCallback(
    async (params: { search?: string; page?: number; append?: boolean; categoryId?: number }) => {
      const currentRequestId = ++brandRequestId.current;
      setBrandLoading(true);
      try {
        const result = await brandsService.getAll({
          search: params.search,
          page: params.page || 1,
          limit: 20,
          categoryId: params.categoryId,
        });
        const newBrands = result.data || [];
        if (currentRequestId !== brandRequestId.current) return [];

        setBrandHasMore(
          (result.meta?.current_page || 1) < (result.meta?.last_page || 1)
        );
        if (params.append) {
          setBrands((prev) => {
            const existingIds = new Set(prev.map((brand) => brand.id));
            return [...prev, ...newBrands.filter((brand) => !existingIds.has(brand.id))];
          });
        } else {
          setBrands(newBrands);
        }
        return newBrands;
      } catch {
        return [];
      } finally {
        if (currentRequestId === brandRequestId.current) setBrandLoading(false);
      }
    },
    []
  );

  // Load only brands assigned to this category.
  useEffect(() => {
    setBrands([]);
    setSelectedBrand(null);
    setBrandSearchInput("");
    setBrandPage(1);

    setBrandHasMore(false);
    void loadBrands({ page: 1, categoryId });
  }, [categoryId, loadBrands]);

  useEffect(() => {
    setSelectedBrand((previous) => {
      if (!brandId) return null;
      return brands.find((brand) => brand.id === brandId)
        ?? (previous?.id === brandId ? previous : null);
    });
  }, [brandId, brands]);

  useEffect(() => () => { brandRequestId.current += 1; }, [slug]);

  useEffect(() => { dispatch(fetchWishlistItems()); }, [dispatch]);
  // Update URL params
  const updateUrlParams = useCallback(
    (params: { sort?: string; brand_id?: string; page?: string }) => {
      const newParams = new URLSearchParams(window.location.search);
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      const qs = newParams.toString();
      const nextUrl = `/category/${slug}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", nextUrl);
    },
    [slug]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSort = e.target.value as CategorySortOption;

      updateUrlParams({ sort: newSort, page: "" });
    },
    [updateUrlParams]
  );

  // Handle brand change
  const handleBrandChange = useCallback(
    (option: BrandOption | null) => {
      if (brandId === option?.id) return;
      setSelectedBrand(option);

      updateUrlParams({
        brand_id: option ? String(option.id) : "",
        page: "",
      });
    },
    [brandId, updateUrlParams]
  );

  const { products = [], category } = data;
  const productCount = data.meta?.total ?? products.length;
  const displayName = category?.name || categoryName;
  const displayDescription = category?.description || categoryDescription;
  const displayImage = category?.image || categoryImage;
  // GTM: Track category view
  useEffect(() => {
    if (category?.id) {
      trackViewCategory({
        categoryId: category.id,
        categoryName: displayName,
        categorySlug: slug,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.id, slug]);

  // GTM: Track product list view
  useEffect(() => {
    if (products.length > 0) {
      trackViewItemList({
        listName: "category_page",
        items: products.map((p) => ({
          productId: p.id,
          productName: p.name,
          price: p.price ?? 0,
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://onehaatbd.com" },
      { "@type": "ListItem", position: 2, name: "Categories", item: "https://onehaatbd.com/categories" },
      { "@type": "ListItem", position: 3, name: displayName, item: `https://onehaatbd.com/category/${slug}` },
    ],
  };

  const brandOptions = useMemo(
    () =>
      brands.map((b) => ({
        value: b.id,
        label: b.name,
      })),
    [brands]
  );

  const selectedBrandValue = selectedBrand
    ? { value: selectedBrand.id, label: selectedBrand.name }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50" aria-busy={resultsPending}>
        {/* Category Hero Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="mx-auto max-w-[1200px] px-4">
            <nav className="flex items-center gap-2 py-3 text-xs text-gray-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
              <ChevronLeft className="h-3 w-3 rotate-180" aria-hidden="true" />
              <Link href="/categories" className="hover:text-[var(--color-primary)] transition-colors">Categories</Link>
              <ChevronLeft className="h-3 w-3 rotate-180" aria-hidden="true" />
              <span className="text-gray-900 font-medium">{displayName}</span>
            </nav>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 md:py-8">
              <div className="flex items-start md:items-center gap-6">
                {displayImage && (
                  <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl overflow-hidden shadow-md">
                    <Image
                      src={displayImage}
                      alt={displayName}
                      fill
                      sizes="(max-width: 768px) 80px, 96px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                    {displayName}
                  </h1>
                  {displayDescription && (
                    <p className="mt-2 text-sm md:text-base text-gray-500 max-w-2xl leading-relaxed">
                      {displayDescription}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-400">
                    {productCount} product{productCount !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>

              {/* Sort & Filter - Right Side */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {/* Brand Filter - Searchable Select */}
                <div className="min-w-[180px]">
                  <Select
                    instanceId="brand-select"
                    placeholder="All Brands"
                    isClearable
                    isLoading={brandLoading}
                    options={brandOptions}
                    value={selectedBrandValue}
                    onChange={(option) => {
                      if (option) {
                        const brand = brands.find((b) => b.id === option.value);
                        handleBrandChange(brand || null);
                      } else {
                        handleBrandChange(null);
                      }
                    }}
                    onInputChange={(inputValue: string) => {
                      setBrandSearchInput(inputValue);
                      setBrandPage(1);
                      loadBrands({ search: inputValue || undefined, page: 1, append: false, categoryId });
                      return inputValue;
                    }}
                    filterOption={null}
                    onMenuScrollToBottom={() => {
                      if (brandHasMore && !brandLoading) {
                        const nextPage = brandPage + 1;
                        setBrandPage(nextPage);
                        loadBrands({ search: brandSearchInput || undefined, page: nextPage, append: true, categoryId });
                      }
                    }}
                    classNamePrefix="category-select"
                    noOptionsMessage={() => "No brands found"}
                    aria-label="Filter by brand"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
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

                {/* Reset Button */}
                {(sortBy !== "latest" || brandId) && (
                  <button
                    onClick={() => {
                      setSelectedBrand(null);
                      updateUrlParams({ sort: "", brand_id: "", page: "" });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Bar */}
        {(selectedBrand || sortBy !== "latest") && (
          <div className="mx-auto max-w-[1200px] px-4 pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {sortBy !== "latest" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                  Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                </span>
              )}
              {selectedBrand && (
                <button
                  onClick={() => handleBrandChange(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm rounded-full hover:bg-[var(--color-primary)]/20 transition-colors"
                >
                  Brand: {selectedBrand.name}
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedBrand(null);
                  updateUrlParams({ sort: "", brand_id: "", page: "" });
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                <X className="h-3.5 w-3.5" />
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative mx-auto min-h-[420px] max-w-[1200px] px-4 py-6" aria-busy={resultsPending}>
          {/* Products */}
          {productsError ? (
            <div role="alert" className="rounded-xl border border-red-100 bg-white p-8 text-center">
              <p className="text-sm text-red-600">{productsError}</p>
              <Button variant="outline" className="mt-4" onClick={retry}>Try again</Button>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {selectedBrand
                  ? `No products from "${selectedBrand.name}" in this category.`
                  : "This category has no products yet. Check back soon!"}
              </p>
              {selectedBrand && (
                <button
                  onClick={() => handleBrandChange(null)}
                  className="inline-flex h-10 items-center rounded-full bg-[var(--color-primary)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-primary)] transition-colors"
                >
                  Clear Brand Filter
                </button>
              )}
              {!selectedBrand && (
                <Link
                  href="/shop"
                  className="inline-flex h-10 items-center rounded-full bg-[var(--color-primary)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-primary)] transition-colors"
                >
                  Browse All Products
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {!productsError && products.length > 0 && (
            <div className="flex justify-center mt-10">
              <nav className="flex items-center gap-2" aria-label="Pagination">
                <Button variant="outline" size="sm" disabled={resultsPending || page <= 1}
                  onClick={() => updateUrlParams({ page: String(page - 1) })}>
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Previous</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white min-w-[36px]"
                >
                  {data.meta?.current_page ?? page}
                </Button>
                <Button variant="outline" size="sm" disabled={resultsPending || page >= (data.meta?.last_page ?? 1)}
                  onClick={() => updateUrlParams({ page: String(page + 1) })}>
                  <ChevronLeft className="h-4 w-4 rotate-180" aria-hidden="true" />
                  <span className="sr-only">Next</span>
                </Button>
              </nav>
            </div>
          )}
          {resultsPending && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/95 backdrop-blur-sm" role="status" aria-live="polite">
              <GlobalLoader className="h-full min-h-[420px]" message="Loading products..." />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
