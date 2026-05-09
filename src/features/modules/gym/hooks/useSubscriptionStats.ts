/**
 * useSubscriptionStats.ts
 *
 * Custom hook for fetching subscription dashboard KPIs from the backend.
 * Returns stats, loading state, and a refetch function.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import type { SubscriptionStats } from "../types/Gym.types";
import { GymApiService } from "../services/gymApi.service";

interface UseSubscriptionStatsResult {
  stats: SubscriptionStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSubscriptionStats = (): UseSubscriptionStatsResult => {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchStats = useCallback(() => {
    setLoading(true);
    setError(null);

    const subscription = GymApiService.getSubscriptionAnalytics().subscribe({
      next: (data) => {
        if (!mountedRef.current) return;
        setStats(data);
        setLoading(false);
      },
      error: (err) => {
        if (!mountedRef.current) return;
        setError(err?.message ?? "Failed to load subscription stats.");
        setLoading(false);
      },
    });

    return subscription;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const sub = fetchStats();
    return () => {
      mountedRef.current = false;
      sub?.unsubscribe();
    };
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
