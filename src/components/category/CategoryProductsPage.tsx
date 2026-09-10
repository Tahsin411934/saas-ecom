"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  SlidersHorizontal,
  ChevronLeft,
  ShoppingCart,
  ArrowUpDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/ProductCard";
import {
  type CategoryProductsData,
  type CategorySortOption,
  SORT_OPTIONS,
} from "@/types/product";
import { categoryProductsService } from "@/services/category-products.service";
import { brandsService, type BrandOption } from "@/services/brands.service";
import { useAppDispatch } from "@/lib/hooks";
import { fetchWishlistItems } from "@/lib/features/wishlist/wishlistSlice";
import { trackViewItemList, trackViewCategory } from "@/lib/gtm";
import dynamic from "next/dynamic";
import "./CategoryProductsPage.css";

// Dynamically import react-select to avoid SSR issues
const Select = dynamic(() => import("react-select"), { ssr: false });

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
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL params
  const sortFromUrl = searchParams.get("sort") as CategorySortOption | null;
  const brandIdFromUrl = searchParams.get("brand_id");

  const [sortBy, setSortBy] = useState<CategorySortOption>(
    sortFromUrl && SORT_OPTIONS.some((o) => o.value === sortFromUrl)
      ? sortFromUrl
      : "latest"
  );
  const [selectedBrand, setSelectedBrand] = useState<BrandOption | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [data, setData] = useState<CategoryProductsData>(initialData);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSearchInput, setBrandSearchInput] = useState("");
  const [brandPage, setBrandPage] = useState(1);
  const [brandTotal, setBrandTotal] = useState(0);
  const [brandHasMore, setBrandHasMore] = useState(false);

  // Load brands for the dropdown (first 20)
  const loadBrands = useCallback(
    async (params: { search?: string; page?: number; append?: boolean }) => {
      setBrandLoading(true);
      try {
        const result = await brandsService.getAll({
          search: params.search,
          page: params.page || 1,
          limit: 20,
        });
        const newBrands = result.data || [];
        setBrandTotal(result.meta?.total || 0);
        setBrandHasMore(
          (result.meta?.current_page || 1) < (result.meta?.last_page || 1)
        );
        if (params.append) {
          setBrands((prev) => [...prev, ...newBrands]);
        } else {
          setBrands(newBrands);
        }
        return newBrands;
      } catch {
        return [];
      } finally {
        setBrandLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadBrands({ page: 1 }).then((newBrands) => {
      // If brand_id is in URL, find and set the brand
      if (brandIdFromUrl) {
        const found = newBrands.find(
          (b: BrandOption) => b.id === parseInt(brandIdFromUrl)
        );
        if (found) setSelectedBrand(found);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch(fetchWishlistItems());
  }, [dispatch]);

  // Build query params and fetch
  const fetchProducts = useCallback(
    (params: {
      sort?: CategorySortOption;
      brand_id?: number | null;
      page?: number;
    }) => {
      setLoading(true);

      const queryParams: any = { per_page: 24, refresh: 1 };
      if (params.sort) queryParams.sort = params.sort;
      if (params.brand_id) queryParams.brand_id = params.brand_id;
      if (params.page) queryParams.page = params.page;

      categoryProductsService
        .getBySlug(slug, queryParams)
        .then((result) => {
          setData(result);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    },
    [slug]
  );

  // Update URL params
  const updateUrlParams = useCallback(
    (params: { sort?: string; brand_id?: string; page?: string }) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      const qs = newParams.toString();
      router.replace(`/category/${slug}${qs ? `?${qs}` : ""}`, {
        scroll: false,
      });
    },
    [slug, router, searchParams]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSort = e.target.value as CategorySortOption;
      setSortBy(newSort);
      updateUrlParams({ sort: newSort, page: "" });
      fetchProducts({
        sort: newSort,
        brand_id: selectedBrand?.id,
        page: 1,
      });
    },
    [selectedBrand, updateUrlParams, fetchProducts]
  );

  // Handle brand change
  const handleBrandChange = useCallback(
    (option: BrandOption | null) => {
      setSelectedBrand(option);
      updateUrlParams({
        brand_id: option ? String(option.id) : "",
        page: "",
      });
      fetchProducts({
        sort: sortBy,
        brand_id: option?.id,
        page: 1,
      });
    },
    [sortBy, updateUrlParams, fetchProducts]
  );

  const { products = [], category } = data;
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

      <div className="min-h-screen bg-gray-50">
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
                      unoptimized
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
                    {products.length} product{products.length !== 1 ? "s" : ""} found
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
                    onChange={(option: any) => {
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
                      loadBrands({ search: inputValue || undefined, page: 1, append: false });
                      return inputValue;
                    }}
                    filterOption={null}
                    onMenuOpen={() => {}}
                    onMenuClose={() => {}}
                    onMenuScrollToBottom={() => {
                      if (brandHasMore && !brandLoading) {
                        const nextPage = brandPage + 1;
                        setBrandPage(nextPage);
                        loadBrands({ search: brandSearchInput || undefined, page: nextPage, append: true });
                      }
                    }}
                    classNamePrefix="category-select"
                    noOptionsMessage={() => "No brands found"}
                    aria-label="Filter by brand"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden flex items-center gap-2 text-gray-700"
                  onClick={() => setShowMobileFilter(!showMobileFilter)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>

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
                  {loading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-primary)]" />
                  )}
                </div>

                {/* Reset Button */}
                {(sortBy !== "latest" || selectedBrand) && (
                  <button
                    onClick={() => {
                      setSortBy("latest");
                      setSelectedBrand(null);
                      updateUrlParams({ sort: "", brand_id: "", page: "" });
                      fetchProducts({ sort: "latest", brand_id: null, page: 1 });
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
                  setSortBy("latest");
                  setSelectedBrand(null);
                  updateUrlParams({ sort: "", brand_id: "", page: "" });
                  fetchProducts({ sort: "latest", brand_id: null, page: 1 });
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
        <div className="mx-auto max-w-[1200px] px-4 py-6">
          {/* Products */}
          {products.length > 0 ? (
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
          {products.length > 0 && (
            <div className="flex justify-center mt-10">
              <nav className="flex items-center gap-2" aria-label="Pagination">
                <Button variant="outline" size="sm" disabled className="text-gray-400">
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Previous</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white min-w-[36px]"
                >
                  1
                </Button>
                <Button variant="outline" size="sm" disabled className="text-gray-400">
                  <ChevronLeft className="h-4 w-4 rotate-180" aria-hidden="true" />
                  <span className="sr-only">Next</span>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
}