"use client";

import { useEffect, useMemo, useState } from "react";
import { categoryProductsService } from "@/services/category-products.service";
import { SORT_OPTIONS, type CategoryProductsData } from "@/types/product";

export function parseCategoryFilters(query: string) {
  const params = new URLSearchParams(query);
  const positiveInteger = (value: string | null) => {
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0 ? number : undefined;
  };
  return {
    sort: SORT_OPTIONS.find((option) => option.value === params.get("sort"))?.value ?? "latest",
    brandId: positiveInteger(params.get("brand_id")),
    page: positiveInteger(params.get("page")) ?? 1,
  };
}

export function useCategoryProducts(slug: string, initialData: CategoryProductsData, query: string) {
  const filters = parseCategoryFilters(query);
  const { sort, brandId, page } = filters;
  const key = JSON.stringify([slug, sort, brandId ?? null, page]);
  const initialKey = JSON.stringify([slug, "latest", null, 1]);
  const [retry, setRetry] = useState(0);
  const request = useMemo(() => ({ key, retry }), [key, retry]);
  const [result, setResult] = useState<{
    request: typeof request | null;
    data: CategoryProductsData;
    error: string;
  }>({ request: null, data: initialData, error: "" });

  useEffect(() => {
    if (key === initialKey) return;

    const controller = new AbortController();
    let active = true;
    categoryProductsService.getBySlug(slug, {
      sort, brand_id: brandId, page, per_page: 24, refresh: true,
    }, controller.signal).then((data) => {
      if (active) setResult({ request, data, error: "" });
    }).catch(() => {
      if (active) setResult((previous) => ({
        ...previous, request, error: "Products could not be loaded. Please try again.",
      }));
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [slug, sort, brandId, page, key, initialKey, request]);

  return {
    ...filters,
    data: key === initialKey ? initialData : result.data,
    pending: key !== initialKey && result.request !== request,
    error: key !== initialKey && result.request === request ? result.error : "",
    retry: () => setRetry((value) => value + 1),
  };
}
