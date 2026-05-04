/**
 * useAttendanceStats.ts
 *
 * Custom hook for fetching attendance analytics from the backend.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import type { AttendanceStats } from "../types/Gym.types";
import { GymApiService } from "../services/gymApi.service";

interface UseAttendanceStatsResult {
  stats: AttendanceStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAttendanceStats = (): UseAttendanceStatsResult => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchStats = useCallback(() => {
    setLoading(true);
    setError(null);

    const subscription = GymApiService.getAttendanceStats().subscribe({
      next: (data) => {
        if (!mountedRef.current) return;
        setStats(data);
        setLoading(false);
      },
      error: (err) => {
        if (!mountedRef.current) return;
        setError(err?.message ?? "Failed to load attendance stats.");
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
