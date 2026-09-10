"use client";

import { useState, useRef } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart, addToCartWithQuantity } from "@/lib/features/cart/cartSlice";
import { ShoppingCart, Check, Loader2 } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    price: number;
    stock?: number;
    variant_id?: number;
    variant_option_id?: number;
    variant_name?: string;
    delivery_charge?: number;
  };
  variant?: "icon" | "default" | "full";
  quantity?: number;
  className?: string;
}

export default function AddToCartButton({
  product,
  variant = "default",
  quantity = 1,
  className = "",
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleAddToCart = () => {
    setLoading(true);
    
    const item = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: product.price,
      variant_id: product.variant_id,
      variant_option_id: product.variant_option_id,
      variant_name: product.variant_name,
      stock: product.stock || 99,
      delivery_charge: product.delivery_charge,
    };

    if (quantity > 1) {
      dispatch(addToCartWithQuantity({ ...item, quantity, animation: true }));
    } else {
      dispatch(addToCart(item));
    }

    setAdded(true);
    setLoading(false);
    
    // Fly animation
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const cartIcon = document.querySelector('[data-cart-icon]');
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        const el = document.createElement('div');
        el.className = 'fixed z-[9999] w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold shadow-lg pointer-events-none';
        el.style.left = `${rect.left + rect.width / 2 - 16}px`;
        el.style.top = `${rect.top + rect.height / 2 - 16}px`;
        el.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
        el.innerHTML = '+1';
        document.body.appendChild(el);
        requestAnimationFrame(() => {
          el.style.left = `${cartRect.left + cartRect.width / 2 - 16}px`;
          el.style.top = `${cartRect.top + cartRect.height / 2 - 16}px`;
          el.style.transform = 'scale(0.3)';
          el.style.opacity = '0.5';
        });
        setTimeout(() => el.remove(), 800);
      }
    }
    setTimeout(() => setAdded(false), 1500);
  };

  if (variant === "icon") {
    return (
      <button ref={btnRef} onClick={handleAddToCart} disabled={loading}
        className={`p-2 rounded-lg transition-all duration-200 ${
          added ? "bg-green-500 text-white scale-110" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white hover:scale-105"
        } active:scale-95 disabled:opacity-50 ${className}`} title="Add to cart">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      </button>
    );
  }

  if (variant === "full") {
    return (
      <button ref={btnRef} onClick={handleAddToCart} disabled={loading}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
          added ? "bg-green-500 text-white" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white hover:shadow-lg hover:shadow-green-200"
        } active:scale-[0.98] disabled:opacity-50 ${className}`}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : added ? <><Check className="h-5 w-5" /> Added to Cart</> : <><ShoppingCart className="h-5 w-5" /> Add to Cart</>}
      </button>
    );
  }

  return (
    <button ref={btnRef} onClick={handleAddToCart} disabled={loading}
      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        added ? "bg-green-500 text-white" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white hover:shadow-md"
      } active:scale-95 disabled:opacity-50 ${className}`}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : added ? <><Check className="h-4 w-4" /> Added</> : <><ShoppingCart className="h-4 w-4" /> Add</>}
    </button>
  );
}