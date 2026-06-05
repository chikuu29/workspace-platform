/**
 * useGymPlan.ts
 *
 * Custom hook to fetch a single subscription plan by code or identifier.
 * Used by the ReviewOrder page to display plan details before invoice generation.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { SubscriptionPlanDocument } from "../types/Gym.types";
import { GymApiService } from "../services/gymApi.service";

interface UseGymPlanResult {
  plan: SubscriptionPlanDocument | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches a single plan by code or record_id.
 * Keeps the subscription stable (unmount cleanup) to avoid memory leaks.
 */
export const useGymPlan = (identifier: string | undefined): UseGymPlanResult => {
  const [plan, setPlan] = useState<SubscriptionPlanDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard against setting state after unmount
  const mountedRef = useRef(true);

  const fetchPlan = useCallback(() => {
    if (!identifier) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const sub = GymApiService.getPlan(identifier).subscribe({
      next: (doc) => {
        if (!mountedRef.current) return;
        setPlan(doc);
        setLoading(false);
      },
      error: (err) => {
        if (!mountedRef.current) return;
        setError(err?.response?.data?.message || err?.message || "Failed to load plan.");
        setLoading(false);
      },
    });

    return () => sub.unsubscribe();
  }, [identifier]);

  useEffect(() => {
    mountedRef.current = true;
    const cleanup = fetchPlan();
    return () => {
      mountedRef.current = false;
      cleanup?.();
    };
  }, [fetchPlan]);

  return { plan, loading, error };
};
