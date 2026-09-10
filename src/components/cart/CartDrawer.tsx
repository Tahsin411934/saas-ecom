"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  selectCartItems, selectCartCount, selectCartTotal, selectCartOpen,
  removeFromCart, updateQuantity, setCartOpen,
} from "@/lib/features/cart/cartSlice";
import { trackRemoveFromCart, trackBeginCheckout } from "@/lib/gtm";

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const total = useAppSelector(selectCartTotal);
  const isOpen = useAppSelector(selectCartOpen);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) dispatch(setCartOpen(false));
    };
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") dispatch(setCartOpen(false)); };
    if (isOpen) { document.addEventListener("mousedown", handleClickOutside); document.addEventListener("keydown", handleEscape); }
    return () => { document.removeEventListener("mousedown", handleClickOutside); document.removeEventListener("keydown", handleEscape); };
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" />
      <div ref={drawerRef} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
        style={{ animation: "slideIn 0.3s ease-out" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold">Cart ({count})</h2>
          </div>
          <button onClick={() => dispatch(setCartOpen(false))} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-6">Add some products to get started</p>
              <Link href="/" onClick={() => dispatch(setCartOpen(false))}
                className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-semibold text-sm hover:bg-[var(--color-primary)]">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.variant_id}`} className="flex gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 group">
                  <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} onClick={() => dispatch(setCartOpen(false))}
                      className="text-sm font-medium text-gray-900 hover:text-[var(--color-primary)] line-clamp-1">{item.name}</Link>
                    {item.variant_name && <p className="text-xs text-gray-500">{item.variant_name}</p>}
                    <p className="text-sm font-semibold text-[var(--color-primary)] mt-1">৳{(item.price * item.quantity).toLocaleString("en-BD")}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => {
                        if (item.quantity <= 1) {
                          dispatch(removeFromCart({ id: item.id, variant_id: item.variant_id }));
                          // GTM: Track remove from cart
                          trackRemoveFromCart({
                            productId: item.id,
                            productName: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            variant: item.variant_name,
                          });
                        } else {
                          dispatch(updateQuantity({ id: item.id, variant_id: item.variant_id, quantity: item.quantity - 1 }));
                        }
                      }} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50">
                        <Minus className="h-3 w-3 text-gray-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => dispatch(updateQuantity({ id: item.id, variant_id: item.variant_id, quantity: item.quantity + 1 }))}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50">
                        <Plus className="h-3 w-3 text-gray-600" />
                      </button>
                      <button onClick={() => {
                        dispatch(removeFromCart({ id: item.id, variant_id: item.variant_id }));
                        // GTM: Track remove from cart
                        trackRemoveFromCart({
                          productId: item.id,
                          productName: item.name,
                          price: item.price,
                          quantity: item.quantity,
                          variant: item.variant_name,
                        });
                      }}
                        className="ml-auto opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-lg font-bold">৳{total.toLocaleString("en-BD")}</span>
            </div>
            <Link href="/cart" onClick={() => dispatch(setCartOpen(false))}
              className="block w-full text-center py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-primary)]">
              View Cart
            </Link>
            <Link href="/checkout" onClick={() => {
              dispatch(setCartOpen(false));
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
            }}
              className="block w-full text-center py-3 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl font-semibold text-sm hover:bg-[#F0FDF4]">
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}