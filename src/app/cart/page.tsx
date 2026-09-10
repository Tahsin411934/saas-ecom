"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  selectCartItems, selectCartCount, selectCartTotal, selectShippingTotal, selectGrandTotal,
  removeFromCart, updateQuantity, clearCart,
} from "@/lib/features/cart/cartSlice";
import { useSyncDeliveryCharges } from "@/hooks/useSyncDeliveryCharges";
import { trackViewCart } from "@/lib/gtm";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const total = useAppSelector(selectCartTotal);
  const shippingCost = useAppSelector(selectShippingTotal);
  const grandTotal = useAppSelector(selectGrandTotal);
  const [promoCode, setPromoCode] = useState("");

  // Pull the LIVE per-product delivery charges from the backend so the
  // shipping row never shows stale values (e.g. after an admin change).
  useSyncDeliveryCharges();

  // GTM: Track view cart
  useEffect(() => {
    if (items.length > 0) {
      trackViewCart({
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant_name,
        })),
        totalValue: total,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <ShoppingCart className="h-20 w-20 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary)] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-500">{count} items in your cart</p>
          </div>
          <button onClick={() => dispatch(clearCart())} className="text-sm text-red-500 hover:text-red-700 font-medium">
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.variant_id}-${item.variant_option_id ?? 'base'}`} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 hover:shadow-sm transition-shadow">
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.slug}`} className="text-sm font-semibold text-gray-900 hover:text-[var(--color-primary)] line-clamp-1">
                    {item.name}
                  </Link>
                  <div className="mt-0.5">
                    {item.variant_name && (
                      <p className="text-xs text-gray-500">Size: {item.variant_name}</p>
                    )}
                    {item.variant_option_id && (
                      <p className="text-xs text-gray-500">Color: Selected</p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-[var(--color-primary)] mt-1">৳{(item.price * item.quantity).toLocaleString("en-BD")}</p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => {
                        if (item.quantity <= 1) dispatch(removeFromCart({ id: item.id, variant_id: item.variant_id, variant_option_id: item.variant_option_id }));
                        else dispatch(updateQuantity({ id: item.id, variant_id: item.variant_id, variant_option_id: item.variant_option_id, quantity: item.quantity - 1 }));
                      }} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 rounded-l-lg">
                        <Minus className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => dispatch(updateQuantity({ id: item.id, variant_id: item.variant_id, variant_option_id: item.variant_option_id, quantity: item.quantity + 1 }))}
                        disabled={item.quantity >= item.stock}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 rounded-r-lg disabled:opacity-50">
                        <Plus className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    </div>
                    <button onClick={() => dispatch(removeFromCart({ id: item.id, variant_id: item.variant_id, variant_option_id: item.variant_option_id }))}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">৳{item.price.toLocaleString("en-BD")} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({count} items)</span>
                  <span className="font-medium">৳{total.toLocaleString("en-BD")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-[var(--color-primary)]">
                    {shippingCost === 0 ? "Free" : `৳${shippingCost.toLocaleString("en-BD")}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-[var(--color-primary)]">৳{grandTotal.toLocaleString("en-BD")}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="flex gap-2 mb-4">
                <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Apply</button>
              </div>

              <button onClick={() => router.push("/checkout")}
                className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-primary)] transition-colors flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </button>

              <Link href="/" className="block text-center mt-3 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)] font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}