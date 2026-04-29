/**
 * useGymDashboard.ts
 *
 * Custom hook to manage gym dashboard state and data fetching.
 */
import { useState, useEffect } from "react";
import { GymApiService } from "../services/gymApi.service";
import { GymDashboardStats } from "../types/Gym.types";

export const useGymDashboard = () => {
  const [stats, setStats] = useState<GymDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const subscription = GymApiService.getDashboardStats().subscribe({
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

    return () => subscription.unsubscribe();
  }, []);

  return { stats, loading, error };
};
