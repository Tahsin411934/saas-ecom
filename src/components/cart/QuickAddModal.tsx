"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProductGalleryModal from "@/components/ui/ProductGalleryModal";
import { Loader2, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { productDetailService, type ProductDetailData, type ProductVariant } from "@/services/product-detail.service";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart, addToCartWithQuantity } from "@/lib/features/cart/cartSlice";
import { trackAddToCart } from "@/lib/gtm";

interface QuickAddModalProps {
  product: {
    id: number;
    name: string;
    slug: string;
    main_image: string | null;
    price: number | null;
  };
  triggerLabel?: string;
  disabled?: boolean;
}

export default function QuickAddModal({ product, triggerLabel = "Add to Cart", disabled = false }: QuickAddModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setLoading(true);
    productDetailService
      .getBySlug(product.slug)
      .then((data) => {
        setDetail(data);
      })
      .catch(() => {
        setError("Unable to load product details. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, product.slug]);

  useEffect(() => {
    if (!detail) return;
    setSelectedVariant(detail.variants && detail.variants.length > 0 ? detail.variants[0] : null);
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
  }, [detail]);

  useEffect(() => {
    if (!detail?.variants) return;
    const match = detail.variants.find((v) =>
      (selectedColor ? v.attributes?.color === selectedColor : true) &&
      (selectedSize ? v.attributes?.size === selectedSize : true)
    );
    if (match) setSelectedVariant(match);
    else if (!selectedColor && !selectedSize) setSelectedVariant(detail.variants[0] ?? null);
    else setSelectedVariant(null);
  }, [selectedColor, selectedSize, detail?.variants]);

  const price = selectedVariant?.sale_price ?? detail?.price_range?.min ?? product.price ?? 0;
  const comparePrice = selectedVariant?.compare_at_price ?? null;
  const inStock = selectedVariant ? (selectedVariant.stock ?? 0) > 0 || selectedVariant.allow_backorder : true;
  const stockCount = selectedVariant?.stock ?? 0;
  const imageUrl = selectedVariant?.image ?? detail?.main_image ?? product.main_image;

  const attributeOptions = useMemo(() => {
    if (!detail) {
      return { colors: [], sizes: [], colorMap: {} as Record<string, string | undefined> };
    }

    if (detail.attribute_options) {
      const colorMap: Record<string, string | undefined> = {};
      const colors = detail.attribute_options.colors.map((c) => {
        if (c.hex) colorMap[c.value] = c.hex.replace(/^#/, "");
        return c.value;
      });
      const sizes = detail.attribute_options.sizes.map((s) => s.value);
      return { colors, sizes, colorMap };
    }

    const colors = new Set<string>();
    const sizes = new Set<string>();
    const colorMap: Record<string, string | undefined> = {};

    detail.variants?.forEach((v) => {
      if (v.attributes?.color) {
        colors.add(v.attributes.color);
        if (v.attributes?.color_hex) {
          colorMap[v.attributes.color] = v.attributes.color_hex.replace(/^#/, "");
        }
      }
      if (v.attributes?.size) {
        sizes.add(v.attributes.size);
      }
    });

    return { colors: Array.from(colors), sizes: Array.from(sizes), colorMap };
  }, [detail]);

  const handleAddToCart = () => {
    const item = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: imageUrl,
      price,
      variant_id: selectedVariant?.id,
      variant_name: selectedVariant?.name,
      stock: stockCount,
      delivery_charge: detail?.delivery_charge,
    };

    if (quantity > 1) {
      dispatch(addToCartWithQuantity({ ...item, quantity, animation: true }));
    } else {
      dispatch(addToCart(item));
    }

    // GTM: Track add to cart
    trackAddToCart({
      productId: product.id,
      productName: product.name,
      price,
      quantity,
      variant: selectedVariant?.name,
      imageUrl: imageUrl || undefined,
    });

    setOpen(false);
    router.push("/cart");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="w-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)] shadow-sm"
          disabled={disabled}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100vh-1.5rem)] w-[calc(100vw-1.5rem)] rounded-2xl p-0 sm:max-h-[calc(100vh-4rem)] sm:w-[min(95vw,70rem)] sm:rounded-[2rem]">
        <DialogHeader className="flex items-start justify-between gap-4 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <DialogTitle>Quick Add To Cart</DialogTitle>
            <p className="text-sm text-gray-500">Review variant options and stock before checkout.</p>
          </div>
        </DialogHeader>

        <DialogClose asChild>
          <button aria-label="Close" className="absolute right-3 top-3 z-50 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-gray-600 shadow-sm hover:bg-white sm:right-4 sm:top-4 sm:h-10 sm:w-10">
            <X className="h-4 w-4" />
          </button>
        </DialogClose>

        <div className="grid gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 md:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:rounded-[1.5rem] sm:p-4">
            {loading ? (
              <div className="flex h-72 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-[1.25rem] bg-white shadow-sm">
                {(() => {
                  const allImages = detail?.gallery && detail.gallery.length > 0
                    ? detail.gallery.map((g) => ({ id: g.id, url: g.url, alt_text: g.alt_text }))
                    : imageUrl
                      ? [{ id: 0, url: imageUrl, alt_text: product.name }]
                      : [];

                  if (allImages.length > 0) {
                    return (
                      <div className="mx-auto w-full max-w-[320px] md:mx-0 md:max-w-none md:w-[320px]">
                        <ProductGalleryModal images={allImages} mainHeight="h-72" />
                      </div>
                    );
                  }

                  return (
                  <div className="flex h-72 items-center justify-center text-gray-400">
                    <ShoppingCart className="h-12 w-12" />
                  </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{detail?.brand?.name ?? "Product"}</p>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              {detail?.short_description && (
                <p className="text-sm leading-6 text-gray-600">{detail.short_description}</p>
              )}
            </div>

            <div className="flex flex-col gap-4 rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-semibold text-gray-900">৳{price.toLocaleString("en-BD")}</div>
                {comparePrice ? (
                  <div className="text-sm text-gray-400 line-through">৳{comparePrice.toLocaleString("en-BD")}</div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge className={inStock ? "bg-[#ECFDF5] text-[#166534]" : "bg-[#FEF3F2] text-[#B91C1C]"}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </Badge>
                {selectedVariant && selectedVariant.track_inventory && stockCount >= 0 ? (
                  <span className="text-sm text-gray-500">{stockCount} units available</span>
                ) : null}
              </div>

              {detail?.variants && detail.variants.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Select Variant:</h3>
                    <span className="text-xs text-gray-500">{detail.variants.length} options</span>
                  </div>
                  <div>
                    {/* Colors */}
                    {(() => {
                      const colors = attributeOptions.colors;
                      if (colors.length > 0) {
                        return (
                          <div className="mb-3">
                            <div className="text-sm font-medium text-gray-700">Color</div>
                            <div className="flex gap-2 mt-2">
                              {colors.map((c) => {
                                const option = detail?.attribute_options?.colors.find((opt) => opt.value === c);
                                const hasStock = option ? option.available : detail?.variants.some((v) => v.attributes?.color === c && ((v.stock ?? 0) > 0 || v.allow_backorder));
                                const hex = attributeOptions.colorMap[c];
                                return (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => { setSelectedColor(c); setQuantity(1); }}
                                    disabled={!hasStock}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${selectedColor === c ? 'ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]' : 'border-gray-200'} ${!hasStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  >
                                    <span className="inline-flex h-4 w-4 rounded-full border ${hex ? 'border-gray-200' : 'border-gray-300'}" style={{ backgroundColor: hex ? `#${hex}` : undefined }} />
                                    <span className="text-sm">{c}</span>
                                    {option?.available_count != null ? (
                                      <span className="text-[11px] text-gray-500">({option.available_count})</span>
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Sizes */}
                    {(() => {
                      const sizes = attributeOptions.sizes;
                      if (sizes.length > 0) {
                        return (
                          <div className="mb-3">
                            <div className="text-sm font-medium text-gray-700">Size</div>
                            <div className="flex gap-2 mt-2">
                              {sizes.map((s) => {
                                const option = detail?.attribute_options?.sizes.find((opt) => opt.value === s);
                                const hasStock = option ? option.available && (!selectedColor || detail?.variants.some((v) => v.attributes?.size === s && v.attributes?.color === selectedColor && ((v.stock ?? 0) > 0 || v.allow_backorder))) : detail?.variants.some((v) => v.attributes?.size === s && ((v.stock ?? 0) > 0 || v.allow_backorder) && (selectedColor ? v.attributes?.color === selectedColor : true));
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => { setSelectedSize(s); setQuantity(1); }}
                                    disabled={!hasStock}
                                    className={`px-3 py-2 rounded-lg text-sm border ${selectedSize === s ? 'ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]' : 'border-gray-200'} ${!hasStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  >
                                    {s}
                                    {option?.available_count != null ? (
                                      <span className="ml-1 text-[11px] text-gray-500">({option.available_count})</span>
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Fallback variant grid if no structured attrs */}
                    {(() => {
                      const hasStructured = detail.variants.some((v) => v.attributes?.color || v.attributes?.size);
                      if (!hasStructured) {
                        return (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {detail.variants.map((variant) => {
                              const active = selectedVariant?.id === variant.id;
                              return (
                                <button
                                  key={variant.id}
                                  type="button"
                                  onClick={() => setSelectedVariant(variant)}
                                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                                    active
                                      ? 'border-[var(--color-primary)] bg-[#ECFDF5] text-[#134E4A]'
                                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="font-medium">{variant.name}</div>
                                  <div className="text-sm text-gray-500">৳{variant.sale_price.toLocaleString('en-BD')}</div>
                                </button>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-100 rounded-2xl"
                    disabled={!inStock}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="mx-4 text-sm font-semibold text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-100 rounded-2xl"
                    disabled={!inStock}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock || loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
