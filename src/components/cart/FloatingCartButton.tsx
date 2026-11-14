"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectCartCount, toggleCart } from "@/lib/features/cart/cartSlice";

export default function FloatingCartButton() {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCartCount);
  const [bounce, setBounce] = useState(false);
  const [prevCount, setPrevCount] = useState(count);

  useEffect(() => {
    if (count !== prevCount && count > 0) {
      setBounce(true);
      setPrevCount(count);
      setTimeout(() => setBounce(false), 500);
    }
  }, [count, prevCount]);

  if (count === 0) return null;

  return (
    <button
      data-cart-icon
      onClick={() => dispatch(toggleCart())}
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[60] hidden items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 md:bottom-6 md:right-6 lg:flex"
      style={{
        animation: bounce ? "bounceOnce 0.5s ease" : "none",
      }}
    >
      <div className="relative">
        <ShoppingCart className="h-5 w-5" />
        <span className="absolute -top-2 -right-3 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">
          {count > 99 ? "99+" : count}
        </span>
      </div>
      <span className="text-sm font-semibold">Cart</span>
      <style jsx>{`
        @keyframes bounceOnce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-8px); }
          50% { transform: translateY(4px); }
          75% { transform: translateY(-2px); }
        }
      `}</style>
    </button>
  );
}
