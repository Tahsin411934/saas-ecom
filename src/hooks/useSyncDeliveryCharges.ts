"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectCartItems, updateDeliveryCharges } from "@/lib/features/cart/cartSlice";
import { syncCartApi } from "@/services/cart.service";

/**
 * Keeps the local cart's product delivery charges in sync with the backend so
 * the Shipping row always shows the LIVE product charges — localStorage values
 * go stale when an admin changes a product's delivery charge after the item
 * was already added to the cart.
 *
 * Silently no-ops for guests (the sync endpoint returns 401) or when the
 * backend is unreachable — the local estimate keeps rendering meanwhile.
 */
export function useSyncDeliveryCharges() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);

  useEffect(() => {
    const backendItems = items
      .filter((item) => item.variant_id)
      .map((item) => ({
        product_id: item.id,
        variant_id: item.variant_id!,
        variant_option_id: item.variant_option_id,
        quantity: item.quantity,
      }));

    if (backendItems.length === 0) return;

    let cancelled = false;
    syncCartApi(backendItems)
      .then((res) => {
        if (cancelled || res.status !== "success") return;
        const charges = (res.data?.items ?? [])
          .filter((item) => typeof item.delivery_charge === "number")
          .map((item) => ({
            variant_id: item.variant_id,
            delivery_charge: item.delivery_charge as number,
          }));
        if (charges.length > 0) {
          dispatch(updateDeliveryCharges(charges));
        }
      })
      .catch(() => {
        // Not authenticated or offline — keep the local estimate.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

