"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "react-toastify";

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
  triggerClassName?: string;
}

export default function QuickAddModal({ product, triggerLabel = "Add to Cart", disabled = false, triggerClassName }: QuickAddModalProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const minimumOrderQuantity = Math.max(1, detail?.minimum_order_quantity ?? 1);

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
    const initialVariant = detail.variants?.find((variant) => (variant.stock ?? 0) > 0 || variant.allow_backorder)
      ?? detail.variants?.[0]
      ?? null;
    setSelectedVariant(initialVariant);
    setSelectedColor(initialVariant?.attributes?.color ?? null);
    setSelectedSize(initialVariant?.attributes?.size ?? null);
    setQuantity(Math.max(1, detail.minimum_order_quantity ?? 1));
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
  const inStock = selectedVariant
    ? (selectedVariant.stock ?? 0) > 0 || selectedVariant.allow_backorder
    : !detail?.variants?.length;
  const stockCount = selectedVariant?.stock ?? 0;
  const imageUrl = selectedVariant?.image ?? detail?.main_image ?? product.main_image;
  const canAddToCart = Boolean(
    detail && !loading && !error && inStock && (!detail.variants.length || selectedVariant)
  );

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
      minimum_order_quantity: minimumOrderQuantity,
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
    toast.success(`${product.name} successfully added to cart.`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={triggerClassName ?? "w-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)] shadow-sm"}
          disabled={disabled}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-white p-0 shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Add To Cart</DialogTitle>
        </DialogHeader>
        <DialogClose asChild>
          <button aria-label="Close" className="absolute right-3 top-3 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </DialogClose>

        <div className="min-w-0 space-y-5 p-5 pt-7">
          <div className="flex min-w-0 items-center gap-4 pr-7">
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-gray-100">
              {imageUrl ? (
                <Image src={imageUrl} alt={product.name} fill sizes="72px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400"><ShoppingCart className="h-7 w-7" /></div>
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <h2 className="break-words text-lg font-normal leading-snug text-gray-900">{product.name}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-normal text-gray-900">৳{price.toLocaleString("en-BD")}</span>
                {comparePrice ? <span className="text-sm text-gray-400 line-through">৳{comparePrice.toLocaleString("en-BD")}</span> : null}
              </div>
            </div>
          </div>

          {loading ? <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />Loading options…</div> : null}
          {error ? <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          {!inStock && detail && !loading ? <p className="text-sm text-red-600">This option is currently out of stock.</p> : null}

          {detail?.variants && detail.variants.length > 0 ? (
            <div className="space-y-5">
              {attributeOptions.colors.length > 0 ? (
                <section>
                  <p className="mb-3 text-sm text-gray-900">Color: <span className="font-medium">{selectedColor ?? "Select a color"}</span></p>
                  <div className="flex flex-wrap gap-3">
                    {attributeOptions.colors.map((color) => {
                      const option = detail.attribute_options?.colors.find((item) => item.value === color);
                      const available = option ? option.available : detail.variants.some((variant) => variant.attributes?.color === color && ((variant.stock ?? 0) > 0 || variant.allow_backorder));
                      const hex = attributeOptions.colorMap[color];
                      return (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          aria-label={`Color ${color}`}
                          aria-pressed={selectedColor === color}
                          onClick={() => { setSelectedColor(color); setQuantity(minimumOrderQuantity); }}
                          disabled={!available}
                          className={`h-9 w-9 rounded-full border border-gray-400 p-1 ${selectedColor === color ? "ring-1 ring-gray-900 ring-offset-2" : ""} ${!available ? "cursor-not-allowed opacity-35" : ""}`}
                        >
                          <span className="block h-full w-full rounded-full border border-black/10" style={{ backgroundColor: hex ? `#${hex}` : "#e5e7eb" }} />
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {attributeOptions.sizes.length > 0 ? (
                <section>
                  <p className="mb-3 text-sm text-gray-900">Size: <span className="font-medium">{selectedSize ?? "Select a size"}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {attributeOptions.sizes.map((size) => {
                      const option = detail.attribute_options?.sizes.find((item) => item.value === size);
                      const available = option ? option.available && (!selectedColor || detail.variants.some((variant) => variant.attributes?.size === size && variant.attributes?.color === selectedColor && ((variant.stock ?? 0) > 0 || variant.allow_backorder))) : detail.variants.some((variant) => variant.attributes?.size === size && ((variant.stock ?? 0) > 0 || variant.allow_backorder) && (!selectedColor || variant.attributes?.color === selectedColor));
                      return (
                        <button
                          key={size}
                          type="button"
                          aria-pressed={selectedSize === size}
                          onClick={() => { setSelectedSize(size); setQuantity(minimumOrderQuantity); }}
                          disabled={!available}
                          className={`min-w-[44px] border px-3 py-2 text-sm transition-colors ${selectedSize === size ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-900 hover:border-gray-500"} ${!available ? "cursor-not-allowed opacity-35" : ""}`}
                        >{size}</button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {!detail.variants.some((variant) => variant.attributes?.color || variant.attributes?.size) ? (
                <div className="flex flex-wrap gap-2">
                  {detail.variants.map((variant) => (
                    <button key={variant.id} type="button" onClick={() => setSelectedVariant(variant)} className={`border px-3 py-2 text-sm ${selectedVariant?.id === variant.id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-800"}`}>
                      {variant.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">Quantity</p>
              {minimumOrderQuantity > 1 ? <p className="text-xs text-gray-500">Minimum: {minimumOrderQuantity}{detail?.unit?.short_name ? ` ${detail.unit.short_name}` : detail?.unit?.name ? ` ${detail.unit.name}` : ""}</p> : null}
            </div>
            <div className="inline-flex items-center bg-gray-100">
              <button type="button" onClick={() => setQuantity(Math.max(minimumOrderQuantity, quantity - 1))} className="flex h-11 w-11 items-center justify-center text-gray-700 hover:bg-gray-200" disabled={!inStock} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
              <span className="min-w-[52px] text-center text-sm font-medium text-gray-900">{quantity}</span>
              <button type="button" onClick={() => setQuantity(Math.min(selectedVariant?.track_inventory && !selectedVariant.allow_backorder ? Math.max(minimumOrderQuantity, stockCount) : Math.max(99, minimumOrderQuantity), quantity + 1))} className="flex h-11 w-11 items-center justify-center text-gray-700 hover:bg-gray-200" disabled={!inStock} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
            </div>
          </section>

          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-none bg-gray-900 text-sm font-semibold uppercase text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Add to Cart · ৳{price.toLocaleString("en-BD")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
