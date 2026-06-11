/**
 * useGymDashboard.ts
 *
 * Custom hook to manage gym dashboard state and data fetching.
 */
import { useState, useEffect, useCallback } from "react";
import { GymApiService } from "../services/gymApi.service";
import { GymDashboardStats } from "../types/Gym.types";

export const useGymDashboard = () => {
  const [stats, setStats] = useState<GymDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    return GymApiService.getAnalytics().subscribe({
      next: (data) => {
        setStats(data);
        setLoading(false);
      },
      error: (err) => {
        console.error("Failed to fetch gym stats:", err);
        setError("Unable to load dashboard data");
        setLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    const subscription = fetchData();
    return () => subscription.unsubscribe();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { stats, loading, error, refresh };
};
