"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectCartItems, selectCartTotal, selectShippingTotal, clearCart } from "@/lib/features/cart/cartSlice";
import { checkoutApi, guestCheckoutApi, type CheckoutResponse } from "@/services/cart.service";
import { useSyncDeliveryCharges } from "@/hooks/useSyncDeliveryCharges";
import { trackBeginCheckout, trackPurchase } from "@/lib/gtm";

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  // Auth may still be hydrating from the token / /me call. Until it settles,
  // don't treat the visitor as a guest (avoids the "Full Name" field flashing
  // for logged-in users, and prevents a stray guest submit).
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  const isGuest = isInitialized && !isAuthenticated;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderNumbers, setOrderNumbers] = useState<string[]>([]);
  // Guest-only field: a logged-out buyer must give their name so the order
  // has someone to deliver to (logged-in users come from their profile).
  const [customerName, setCustomerName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Shipping = the highest product delivery charge in the cart, taken once
  // per order (one parcel = one charge) — the same rule the backend applies.
  const shippingCost = useAppSelector(selectShippingTotal);
  const grandTotal = total + shippingCost;

  // When the cart holds products from more than one store, the backend splits
  // the checkout into one order per store (each with its own delivery charge).
  // Surface a warning so the buyer isn't surprised by multiple shipments.
  const storeKeys = items
    .filter((item) => item.store_id !== undefined)
    .map((item) => (item.store_id === null ? "platform" : String(item.store_id)))
    .filter((v, i, arr) => arr.indexOf(v) === i);
  const cartSpansMultipleStores = storeKeys.length > 1;

  // Pull the LIVE per-product delivery charges from the backend so the
  // shipping row never shows stale values (e.g. after an admin change).
  useSyncDeliveryCharges();

  const handleCheckout = async () => {
    if (!isInitialized) {
      setError("Please wait a moment and try again.");
      return;
    }

    if (!deliveryAddress || !deliveryCity || !deliveryPhone) {
      setError("Please fill in all required delivery details.");
      return;
    }

    // Guests must provide their name (logged-in users come from profile).
    if (isGuest && !customerName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setError(null);

    // GTM: Track begin checkout
    trackBeginCheckout({
      items: items.map((item) => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant_name,
      })),
      totalValue: total,
    });

    const cartItems = items.map(item => ({
      product_id: item.id,
      variant_id: item.variant_id,
      variant_option_id: item.variant_option_id,
      quantity: item.quantity
    }));

    try {
      let result: CheckoutResponse;

      if (isAuthenticated) {
        // First sync the local cart with backend
        const syncResult = await import("@/services/cart.service").then(module => module.syncCartApi(cartItems));

        console.log("Sync result:", syncResult); // Debug log

        if (syncResult.status !== "success") {
          setError(syncResult.message || "Failed to sync cart. Please try again.");
          setLoading(false);
          return;
        }

        // Now proceed with checkout
        result = await checkoutApi({
          cart_id: 0, // Backend will get the active cart for the user
          notes: "",
          delivery_address: deliveryAddress,
          delivery_city: deliveryCity,
          delivery_phone: deliveryPhone,
          delivery_notes: deliveryNotes,
        });
      } else {
        // Guest checkout — send the local cart items + name + delivery details
        // straight to the public guest-checkout endpoint (no login required).
        result = await guestCheckoutApi({
          items: cartItems,
          customer_name: customerName.trim(),
          delivery_address: deliveryAddress,
          delivery_city: deliveryCity,
          delivery_phone: deliveryPhone,
          delivery_notes: deliveryNotes,
        });
      }

      if (result.status === "success" && (result.order || (result.orders && result.orders.length > 0))) {
        // Split-by-store carts return `orders[]` (one order per store);
        // single-store carts return a legacy `order` object.
        const placedOrderNumbers = result.orders && result.orders.length > 0
          ? result.orders.map((o) => o.order_number)
          : [result.order!.order_number];

        setSuccess(true);
        setOrderNumbers(placedOrderNumbers);
        dispatch(clearCart());

        // GTM: Track purchase (one event, grand total across split orders)
        trackPurchase({
          orderId: placedOrderNumbers.join(", "),
          transactionId: placedOrderNumbers.join(", "),
          items: items.map((item) => ({
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
            variant: item.variant_name,
          })),
          totalValue: result.total_amount ?? grandTotal,
          shipping: shippingCost,
        });

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setError(result.message || "Checkout failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <ShoppingCart className="h-20 w-20 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Add some products before checkout</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary)] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center px-4 max-w-md">
          <CheckCircle className="h-20 w-20 text-[var(--color-primary)] mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          {orderNumbers.length > 1 && (
            <div className="w-full p-4 border border-amber-200 bg-amber-50 rounded-xl text-amber-800 text-sm mb-4 text-left">
              Your cart contained products from multiple stores, so your order was
              split into separate shipments (one per store). Each order below is
              handled and delivered independently.
            </div>
          )}
          <p className="text-gray-500 mb-2">
            {orderNumbers.length > 1 ? "Your order numbers are:" : "Your order number is:"}
          </p>
          <div className="space-y-2">
            {orderNumbers.map((number) => (
              <p key={number} className="text-lg font-bold text-[var(--color-primary)]">{number}</p>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 mb-8">Redirecting to home page...</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary)] transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            {cartSpansMultipleStores && (
              <div className="mb-4 p-4 border border-amber-200 bg-amber-50 rounded-xl text-amber-800 text-sm flex items-start gap-2">
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 7H4l2 8l2 10l2 12l2 14M4 8l-2 10 2 10 2 12 2 14M4 8H3 4M7 5h2 3M9 5v7" />
                </svg>
                <span>
                  Your cart contains products from <strong>{storeKeys.length} stores</strong>. Your order will be
                  split into separate shipments — one per store, each with its own delivery charge.
                </span>
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variant_id}-${item.variant_option_id}`} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.variant_name && `Size: ${item.variant_name}`}
                        {item.variant_name && item.variant_option_id && " | "}
                        {item.variant_option_id && "Color: Selected"}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-[var(--color-primary)]">৳{(item.price * item.quantity).toLocaleString("en-BD")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">৳{total.toLocaleString("en-BD")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">{shippingCost === 0 ? <span className="text-[var(--color-primary)]">Free</span> : `৳${shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">Calculated at delivery</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-[var(--color-primary)]">৳{grandTotal.toLocaleString("en-BD")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-xl border border-gray-100 p-6  top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Details</h2>
              
              <div className="space-y-4">
                {isGuest && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full address"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    placeholder="Enter your city"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes (Optional)</label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Any special instructions for delivery"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3 mb-6">
                <div className="p-4 border-2 border-[var(--color-primary)] rounded-xl bg-[var(--color-primary)]/5">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]"></div>
                    </div>
                    <span className="font-medium text-gray-900">Cash on Delivery</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-8">Pay when you receive your order</p>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-primary)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <Link href="/cart" className="flex items-center justify-center gap-2 mt-3 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)] font-medium">
                <ArrowLeft className="h-4 w-4" /> Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}