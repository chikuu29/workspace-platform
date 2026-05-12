/**
 * useSubscriptionPlans.ts
 *
 * Custom hook for fetching subscription plans from the backend.
 * Returns the plan list, loading state, error state, and a refetch function.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import type { SubscriptionPlanDocument } from "../types/Gym.types";
import { GymApiService } from "../services/gymApi.service";

interface UseSubscriptionPlansOptions {
  /** If true, only fetch active plans. Default: false */
  activeOnly?: boolean;
  /** Number of records to skip. Default: 0 */
  skip?: number;
  /** Max records to return. Default: 50 */
  limit?: number;
}

interface UseSubscriptionPlansResult {
  plans: SubscriptionPlanDocument[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => void;
}

export const useSubscriptionPlans = (
  options: UseSubscriptionPlansOptions = {}
): UseSubscriptionPlansResult => {
  const { activeOnly = false, skip = 0, limit = 50 } = options;

  const [plans, setPlans] = useState<SubscriptionPlanDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Prevent stale subscriptions on unmount
  const mountedRef = useRef(true);

  const fetchPlans = useCallback(() => {
    setLoading(true);
    setError(null);

    const subscription = GymApiService.getPlans(skip, limit, activeOnly).subscribe({
      next: (res) => {
        if (!mountedRef.current) return;

        if (res.success) {
          setPlans(res.data);
          setTotal(res.pagination?.total ?? res.data.length);
        } else {
          setError((res as any).message ?? "Failed to load plans.");
        }
        setLoading(false);
      },
      error: (err) => {
        if (!mountedRef.current) return;
        setError(err?.message ?? "Network error loading plans.");
        setLoading(false);
      },
    });

    return subscription;
  }, [skip, limit, activeOnly]);

  useEffect(() => {
    mountedRef.current = true;
    const sub = fetchPlans();
    return () => {
      mountedRef.current = false;
      sub?.unsubscribe();
    };
  }, [fetchPlans]);

  return { plans, loading, error, total, refetch: fetchPlans };
};
