"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { productService, type Product } from "@/services/product.service";
import { Search, X, Loader2, ShoppingCart } from "lucide-react";
import { trackSearch, trackViewSearchResults, trackSelectItem } from "@/lib/gtm";

const DEBOUNCE_DELAY = 350;
const MIN_QUERY_LENGTH = 2;

interface SearchOverlayProps {
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  isOpen: boolean;
  categoryId?: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function SearchOverlay({
  query,
  onQueryChange,
  onClose,
  isOpen,
  categoryId,
  inputRef,
}: SearchOverlayProps) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY);

  // Fetch search results when debounced query changes
  useEffect(() => {
    if (!isOpen || debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await productService.search(debouncedQuery, categoryId);

        if (cancelled) return;

        if (res.success) {
          setResults(res.data);

          // GTM: Track search and search results
          trackSearch({ searchTerm: debouncedQuery });
          trackViewSearchResults({
            searchTerm: debouncedQuery,
            resultsCount: res.data.length,
            items: res.data.slice(0, 8).map((p) => ({
              productId: p.id,
              productName: p.name,
              price: p.price ?? 0,
              category: p.category,
            })),
          });
        } else {
          setResults([]);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Something went wrong. Please try again.");
        setResults([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedQuery, categoryId, isOpen]);

  // Close on pointer down outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node;

      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      if (inputRef?.current?.contains(target)) {
        return;
      }

      onClose();
    };

    document.addEventListener("pointerdown", handlePointerDownOutside, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside, true);
    };
  }, [isOpen, onClose, inputRef]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Only handle arrow keys if we have results
      if (results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev < results.length - 1 ? prev + 1 : 0;
          scrollIntoView(next);
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : results.length - 1;
          scrollIntoView(next);
          return next;
        });
      } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        const selectedProduct = results[selectedIndex];
        if (selectedProduct) {
          // Close overlay and navigate using Next.js router
          onClose();
          router.push(`/product/${selectedProduct.slug}`);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex]);

  const scrollIntoView = (index: number) => {
    const element = document.getElementById(`search-result-${index}`);
    if (element) {
      try {
        element.scrollIntoView({ block: "nearest" });
      } catch (error) {
        // Element might not be in DOM yet, silently fail
      }
    }
  };

  const handleClear = useCallback(() => {
    onQueryChange("");
    setResults([]);
    setSelectedIndex(-1);
    inputRef?.current?.focus();
  }, [onQueryChange, inputRef]);

  const handleSelectProduct = (slug: string) => {
    const product = results.find((p) => p.slug === slug);
    if (product) {
      // GTM: Track product click from search
      trackSelectItem({
        productId: product.id,
        productName: product.name,
        price: product.price ?? 0,
        listName: "search_results",
        category: product.category,
      });
    }
    onClose();
    router.push(`/product/${slug}`);
  };

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  if (!isOpen) return null;

  const showResults =
    debouncedQuery.length >= MIN_QUERY_LENGTH &&
    !loading &&
    !error &&
    results.length > 0;

  const showNoResults =
    debouncedQuery.length >= MIN_QUERY_LENGTH &&
    !loading &&
    !error &&
    results.length === 0;

  const showError =
    debouncedQuery.length >= MIN_QUERY_LENGTH && !loading && error;

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-full z-[100] mx-auto mt-1 w-full"
      onPointerDownCapture={(e) => e.stopPropagation()}
    >
      {/* Results Panel */}
      <div className="max-h-[420px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl shadow-black/10">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center gap-3 px-4 py-10 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
            <span>Searching products...</span>
          </div>
        )}

        {/* Error State */}
        {showError && (
          <div className="px-4 py-10 text-center text-sm text-red-500">
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                productService.search(debouncedQuery).then((res) => {
                  if (res.success) setResults(res.data);
                  setLoading(false);
                });
              }}
              className="mt-2 text-[var(--color-primary)] underline underline-offset-2 hover:text-[var(--color-primary)]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results List */}
        {showResults && (
          <div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Products ({results.length})
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {results.slice(0, 8).map((product, index) => (
                <button
                  key={product.id}
                  id={`search-result-${index}`}
                  type="button"
                  onClick={() => handleSelectProduct(product.slug)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                    index === selectedIndex
                      ? "bg-[#F0FDF4]"
                      : "hover:bg-[#F0FDF4]"
                  }`}
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    {product.thumbnail ? (
                      <Image
                        src={product.thumbnail}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <ShoppingCart className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    {product.category && (
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {product.category}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      ৳{(product.price ?? 0).toLocaleString("en-BD")}
                    </span>
                    {product.regular_price != null && product.price != null && product.regular_price > product.price && (
                      <span className="ml-1.5 text-xs text-gray-400 line-through">
                        ৳{product.regular_price.toLocaleString("en-BD")}
                      </span>
                    )}
                    {product.has_discount !== false &&
                      product.regular_price != null &&
                      product.price != null &&
                      product.regular_price > product.price && (
                        <span className="ml-1 text-[10px] font-bold text-red-500">
                          -{product.discount_percent ??
                            Math.round(((product.regular_price - product.price) / product.regular_price) * 100)}%
                        </span>
                      )}
                  </div>
                </button>
              ))}
            </div>
            {results.length > 8 && (
              <Link
                href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 border-t border-gray-100 px-4 py-3 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[#F0FDF4]"
              >
                <Search className="h-4 w-4" />
                <span>View all {results.length} results</span>
              </Link>
            )}
          </div>
        )}

        {/* No Results */}
        {showNoResults && (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <Search className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-900">
              No products found
            </p>
            <p className="mt-1 text-xs text-gray-400">
              We couldn't find anything for &ldquo;{debouncedQuery}&rdquo;
            </p>
          </div>
        )}

        {/* Initial state - no query yet */}
        {query.length === 0 && !loading && (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            <Search className="mx-auto mb-3 h-10 w-10 text-gray-200" />
            <p>Type at least 2 characters to start searching</p>
          </div>
        )}
      </div>
    </div>
  );
}
