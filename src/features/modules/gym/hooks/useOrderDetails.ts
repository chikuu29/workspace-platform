/**
 * useOrderDetails.ts
 *
 * Custom hook to fetch a gym membership order by order_number.
 * Used by OrderView page (step 3.5 in the sales flow).
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { GetOrderResponse } from "../types/Gym.types";
import { GymApiService } from "../services/gymApi.service";

type OrderData = GetOrderResponse["data"];

interface UseOrderDetailsResult {
  order: OrderData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches a single gym order by order_number.
 * Provides a stable refetch function for post-action refreshes.
 */
export const useOrderDetails = (
  orderNumber: string | undefined
): UseOrderDetailsResult => {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchOrder = useCallback(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const sub = GymApiService.getMembershipOrder(orderNumber).subscribe({
      next: (res) => {
        if (!mountedRef.current) return;
        if (res.success) {
          setOrder(res.data);
        } else {
          setError((res as any).message ?? "Failed to load order.");
        }
        setLoading(false);
      },
      error: (err) => {
        if (!mountedRef.current) return;
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Network error loading order."
        );
        setLoading(false);
      },
    });

    return () => sub.unsubscribe();
  }, [orderNumber]);

  useEffect(() => {
    mountedRef.current = true;
    const cleanup = fetchOrder();
    return () => {
      mountedRef.current = false;
      cleanup?.();
    };
  }, [fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
};
