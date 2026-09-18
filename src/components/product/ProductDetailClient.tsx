"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  ChevronRight,
  Check,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type ProductDetailData,
  type ProductVariant,
  type VariantOption,
} from "@/services/product-detail.service";
import ProductGallery from "@/components/ui/ProductGallery";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addToCart } from "@/lib/features/cart/cartSlice";
import {
  toggleWishlistItem,
  fetchWishlistItems,
  selectIsInWishlist,
} from "@/lib/features/wishlist/wishlistSlice";
import { requireAuth } from "@/lib/require-auth";
import { reviewService } from "@/services/review.service";
import { toast } from "react-toastify";
import {
  trackViewItem,
  trackAddToCart,
  trackAddToWishlist,
} from "@/lib/gtm";

interface ProductDetailClientProps {
  product: ProductDetailData;
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null,
  );
  const initialVariant = product.variants?.[0] ?? null;
  const initialOption = initialVariant?.options?.[0] ?? null;
  const [selectedColor, setSelectedColor] = useState<string | null>(initialOption?.color_name ?? null);
  const [selectedSize, setSelectedSize] = useState<string | null>(initialVariant?.attributes?.size ?? initialVariant?.name ?? null);
  const [selectedOption, setSelectedOption] = useState<VariantOption | null>(initialOption);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [updatingWishlist, setUpdatingWishlist] = useState(false);

  // The selected color option is the sellable item when a variant has colors.
  const basePrice =
    selectedVariant?.discount_price ??
    selectedVariant?.sale_price ??
    product.price_range?.min ??
    0;
  const optionBase =
    selectedOption?.regular_price ??
    selectedOption?.sale_price ??
    (basePrice + (selectedOption?.price_adjustment ?? 0));
  const optionDiscount =
    selectedOption?.discount_price != null
      ? selectedOption.discount_price
      : selectedOption && selectedOption.discount_percent > 0
      ? optionBase * (1 - selectedOption.discount_percent / 100)
      : null;
  const currentPrice =
    selectedOption?.discount_price ??
    optionDiscount ??
    selectedOption?.sale_price ??
    basePrice;
  const comparePrice =
    (selectedOption?.compare_at_price && selectedOption.compare_at_price > currentPrice
      ? selectedOption.compare_at_price
      : null) ??
    (selectedVariant?.regular_price && selectedVariant.regular_price > currentPrice
      ? selectedVariant.regular_price
      : null) ??
    (selectedVariant?.compare_at_price && selectedVariant.compare_at_price > currentPrice
      ? selectedVariant.compare_at_price
      : null) ??
    null;
  const hasSale = comparePrice !== null && comparePrice > currentPrice;
  const stockCount = selectedOption?.stock ?? selectedVariant?.stock ?? 0;
  const inStock = selectedVariant
    ? (selectedOption ? stockCount > 0 : stockCount > 0) || selectedVariant.allow_backorder
    : false;

  const isWishlisted = useAppSelector(selectIsInWishlist(product.id));

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlistItems());
    }
  }, [dispatch, isAuthenticated]);

  // GTM: Track product view
  useEffect(() => {
    trackViewItem({
      productId: product.id,
      productName: product.name,
      price: currentPrice,
      category: product.categories?.[0]?.name,
      brand: product.brand?.name,
      imageUrl: product.main_image || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, product.name]);

  // Keep the selected color inside the selected parent variant.
  useEffect(() => {
    const defaultVariant = product.variants?.[0] ?? null;
    if (!selectedVariant && defaultVariant) {
      setSelectedVariant(defaultVariant);
      setSelectedSize(defaultVariant.attributes?.size ?? defaultVariant.name);
      const firstOption = defaultVariant.options?.[0] ?? null;
      setSelectedOption(firstOption);
      setSelectedColor(firstOption?.color_name ?? null);
    }
  }, [selectedSize, product.variants]);

  const handleVariantOptionClick = (option: VariantOption) => {
    setSelectedOption(option);
    setQuantity(1);
    // Update color if option has color_name
    if (option.color_name) {
      setSelectedColor(option.color_name);
    }
  };

  const variantOptions = selectedVariant?.options ?? [];
  
  // Keep both selectors always visible

  const allImages = useMemo(() => {
    if (selectedVariant?.image) {
      return [{ id: `variant-${selectedVariant.id}`, url: selectedVariant.image, alt_text: product.name }];
    }
    if (product.gallery && product.gallery.length > 0) {
      return product.gallery;
    }
    if (product.main_image) {
      return [{ id: 0, url: product.main_image, alt_text: product.name, is_main: true, sort_order: 0 }];
    }
    return [];
  }, [product.gallery, product.main_image, product.name, selectedVariant?.image, selectedVariant?.id]);

  const attributeOptions = useMemo(() => {
    // Prefer server-provided attribute_options when available
    if (product.attribute_options) {
      const colorMap: Record<string, string | undefined> = {};
      const colors = product.attribute_options.colors.map((c) => {
        if (c.hex) colorMap[c.value] = c.hex.replace(/^#/, '');
        return c.value;
      });
      const sizes = product.attribute_options.sizes.map((s) => s.value);
      return { colors, sizes, colorMap };
    }

    const sizes = new Set<string>();
    product.variants?.forEach((v) => {
      // Check attributes.size first, then fallback to variant name
      if (v.attributes?.size) {
        sizes.add(v.attributes.size);
      } else if (v.name) {
        // Match common size patterns: S, M, L, XL, XXL, XXXL, XS, or numeric sizes like 28, 30, 32
        // Use lookbehind/lookahead to match sizes even when preceded/followed by spaces or hyphens
        const sizeMatch = v.name.match(/(?:^|[\s\-])(X?S|M|L|XL|XXL|XXXL|\d{1,2}(?:\.\d)?)(?:[\s\-]|$)/i);
        if (sizeMatch) {
          sizes.add(sizeMatch[1]);
        }
      }
    });
    
    // If no sizes found from attributes, try to extract from variant options or use variant names
    if (sizes.size === 0 && product.variants && product.variants.length > 0) {
      // Check if variants have different names that could be sizes
      const variantNames = product.variants.map(v => v.name).filter(Boolean);
      // If all variants have the same name, use that as a single "size" option
      if (variantNames.length > 0 && variantNames.every(name => name === variantNames[0])) {
        sizes.add(variantNames[0]);
      }
    }
    
    return { colors: [], sizes: Array.from(sizes), colorMap: {} };
  }, [product.variants, product.attribute_options]);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.main_image,
        price: currentPrice,
        variant_id: selectedVariant?.id,
        variant_name: selectedVariant?.name,
        variant_option_id: selectedOption?.id,
        stock: stockCount,
        delivery_charge: product.delivery_charge,
        store_id: product.store_id,
        store_name: product.store?.name,
      })
    );

    // GTM: Track add to cart
    trackAddToCart({
      productId: product.id,
      productName: product.name,
      price: currentPrice,
      quantity,
      variant: selectedVariant?.name,
      category: product.categories?.[0]?.name,
      brand: product.brand?.name,
      imageUrl: product.main_image || undefined,
    });
  };

  const handleToggleWishlist = async () => {
    if (!requireAuth(isAuthenticated)) return;
    if (updatingWishlist) return;

    setUpdatingWishlist(true);
    try {
      await dispatch(
        toggleWishlistItem({
          productId: product.id,
          isWishlisted,
          item: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            image: product.main_image,
            price: currentPrice,
          },
        })
      ).unwrap();

      // GTM: Track wishlist add/remove
      if (!isWishlisted) {
        trackAddToWishlist({
          productId: product.id,
          productName: product.name,
          price: currentPrice,
          category: product.categories?.[0]?.name,
          brand: product.brand?.name,
          imageUrl: product.main_image || undefined,
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update wishlist. Please try again.");
    } finally {
      setUpdatingWishlist(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!requireAuth(isAuthenticated)) return;
    
    if (!reviewTitle.trim() || !reviewBody.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await reviewService.submitReview(product.id, {
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
      });

      if (response.success) {
        alert("Review submitted successfully! It will be published after approval.");
        setShowReviewForm(false);
        setReviewRating(5);
        setReviewTitle("");
        setReviewBody("");
        // Reload page to refresh reviews from product detail API
        window.location.reload();
      } else {
        alert(response.message || "Failed to submit review");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error submitting review. Please try again.";
      alert(message);
      console.error(error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description || "",
    image: product.main_image,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      price: currentPrice,
      priceCurrency: "BDT",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            {product.categories && product.categories.length > 0 && (
              <>
                <Link
                  href={`/category/${product.categories[0].slug}`}
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  {product.categories[0].name}
                </Link>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </>
            )}
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>

          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Image Gallery */}
            <div className="relative space-y-4">
              <ProductGallery images={allImages} />

              {/* Sale badge overlays on top of the gallery */}
              {hasSale && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-full">
                  Sale
                </Badge>
              )}

              {/* Wishlist button */}
              <button
                onClick={handleToggleWishlist}
                disabled={updatingWishlist}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-busy={updatingWishlist}
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`}
                />
              </button>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col gap-6">
              {/* Brand + Title */}
              <div>
                {product.brand && (
                  <Link
                    href={`/brand/${product.brand.slug}`}
                    className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {product.brand.name}
                  </Link>
                )}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-1">
                  {product.name}
                </h1>
                {product.short_description && (
                  <p className="mt-2 text-gray-500 text-sm md:text-base">
                    {product.short_description}
                  </p>
                )}
              </div>

              {/* Ratings */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(product.reviews?.average_rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({product.reviews?.total_reviews || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ৳{currentPrice.toLocaleString("en-BD")}
                </span>
                {hasSale && (
                  <span className="text-lg text-gray-400 line-through">
                    ৳{comparePrice.toLocaleString("en-BD")}
                  </span>
                )}
              </div>

              {/* Attribute selectors: Color + Size */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose Options</h3>

                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700">Size / Variant</div>
                    <div className="flex gap-2 mt-2">
                      {product.variants.map((v) => {
                        const variantLabel = v.name || `Variant ${v.id}`;
                        const isSelected = selectedSize === variantLabel || selectedVariant?.id === v.id;
                        const variantHasStock = v.options?.length
                          ? v.options.some((option) => (option.stock ?? 0) > 0)
                          : (v.stock ?? 0) > 0;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setSelectedVariant(v);
                              setSelectedSize(v.attributes?.size ?? variantLabel);
                              setSelectedOption(v.options?.[0] ?? null);
                              setSelectedColor(v.options?.[0]?.color_name ?? null);
                              setQuantity(1);
                            }}
                            disabled={!variantHasStock && !v.allow_backorder}
                            className={`px-3 py-2 rounded-lg text-sm border ${isSelected ? 'ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]' : 'border-gray-200'} ${!variantHasStock && !v.allow_backorder ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            {variantLabel}
                            {variantHasStock && (
                              <span className="ml-1 text-[11px] text-orange-500">Available</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                   {/* Color Options from variant_options table (per selected variant) - ALWAYS VISIBLE */}
                   <div className="mb-3">
                     <div className="text-sm font-medium text-gray-700 mb-2">Available Colors</div>
                     {variantOptions.length > 0 ? (
                       <div className="flex flex-wrap gap-3">
                         {variantOptions.map((opt) => (
                           <button
                             key={opt.id}
                             type="button"
                             onClick={() => handleVariantOptionClick(opt)}
                             disabled={(opt.stock ?? 0) <= 0 && !selectedVariant?.allow_backorder}
                             className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                               selectedOption?.id === opt.id
                                 ? 'ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]'
                                 : 'border-gray-200 hover:border-gray-300'
                             } ${(opt.stock ?? 0) <= 0 && !selectedVariant?.allow_backorder ? 'opacity-40 cursor-not-allowed' : ''}`}
                             title={opt.color_name}
                           >
                             <span
                               className="inline-block w-8 h-8 rounded-full border border-gray-200"
                               style={{ backgroundColor: opt.color_code || '#ccc' }}
                             />
                             <span className="text-[10px] font-medium text-gray-600">{opt.color_name}</span>
                             <span className="text-[9px] text-gray-500">৳{(opt.sale_price ?? currentPrice).toLocaleString("en-BD")}</span>
                             {opt.discount_percent > 0 && (
                               <span className="text-[9px] font-semibold text-red-500">-{opt.discount_percent}%</span>
                             )}
                           </button>
                         ))}
                       </div>
                     ) : (
                       <p className="text-sm text-gray-400 italic">No color options available for this size</p>
                     )}
                   </div>

                </div>
              )}

              {/* Stock status */}
              <div className="flex items-center gap-2 text-sm">
                {inStock ? (
                  <>
                    <Check className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="text-[var(--color-primary)] font-medium">In Stock</span>
                    {stockCount > 0 && stockCount <= 5 && (
                      <span className="text-orange-500 text-xs">
                        (Only {stockCount} left)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 text-red-500" />
                    <span className="text-red-500 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Quantity selector */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-12 items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    aria-label="Decrease quantity"
                    disabled={!inStock}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-12 w-16 items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="flex h-12 w-12 items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    aria-label="Increase quantity"
                    disabled={!inStock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <Button
                  disabled={!inStock}
                  onClick={handleAddToCart}
                  className="flex-1 h-12 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white font-semibold text-sm gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>

                {/* Share */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl"
                  aria-label="Share product"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Product Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <Truck className="h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Free Shipping</p>
                    <p className="text-xs text-gray-500">On orders over Ã Â§Â³99</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <ShieldCheck className="h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-500">100% secure</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <RotateCcw className="h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-500">30 days return</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-100" />

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Categories:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description Section Ã¢â‚¬â€ renders HTML safely from backend text editor */}
          {product.description && (
            <div className="mt-12 lg:mt-16">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <div
                className="prose prose-sm max-w-none text-gray-600 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_a]:text-[var(--color-primary)] [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Reviews Section */}
          <div className="mt-12 lg:mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Reviews ({product.reviews?.total_reviews || 0})
            </h2>

            {product.reviews?.items && product.reviews.items.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.items.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {review.user_name || "Anonymous"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {review.created_at}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {review.title && (
                      <p className="font-medium text-gray-900 text-sm">
                        {review.title}
                      </p>
                    )}
                    {review.body && (
                      <p className="text-sm text-gray-500 mt-1">
                        {review.body}
                      </p>
                    )}
                    {review.is_verified_purchase && (
                      <span className="inline-block mt-2 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl">
                <Star className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">
                  No reviews yet. Be the first to review!
                </p>
              </div>
            )}

            {/* Write a Review Button */}
            <div className="mt-6">
              {!showReviewForm ? (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white"
                >
                  Write a Review
                </Button>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Write Your Review</h3>
                  
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= reviewRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Title
                    </label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Summarize your experience"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      maxLength={255}
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      placeholder="Share your thoughts about this product"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                      maxLength={2000}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                    <Button
                      onClick={() => setShowReviewForm(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {product.related_products && product.related_products.length > 0 && (
            <div className="mt-12 lg:mt-16">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Related Products
              </h2>
              <div className="products-carousel">
                {product.related_products.map((rp) => (
                  <div key={rp.id} className="product-card-item">
                    <Link
                      href={`/product/${rp.slug}`}
                      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="aspect-square bg-gray-50 relative overflow-hidden">
                        {rp.main_image ? (
                          <Image
                            src={rp.main_image}
                            alt={rp.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-300">
                            <Package className="h-10 w-10" />
                          </div>
                        )}
                        {rp.has_discount === true &&
                          rp.regular_price != null &&
                          rp.price != null &&
                          rp.regular_price > rp.price && (
                            <span className="absolute top-2 left-2 rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                              -{rp.discount_percent ??
                                Math.round(((rp.regular_price - rp.price) / rp.regular_price) * 100)}%
                            </span>
                          )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                          {rp.name}
                        </h3>
                        <p className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-[var(--color-primary)]">
                            ৳{(rp.price ?? 0).toLocaleString("en-BD")}
                          </span>
                          {rp.regular_price != null &&
                            rp.price != null &&
                            rp.regular_price > rp.price && (
                              <span className="text-xs text-gray-400 line-through">
                                ৳{rp.regular_price.toLocaleString("en-BD")}
                              </span>
                            )}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
