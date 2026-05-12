/**
 * useGymTrainers.ts
 *
 * Managed hook for fetching the list of gym trainers.
 */
import { useState, useEffect, useCallback } from "react";
import { GymApiService } from "../services/gymApi.service";
import { TrainerDocument } from "../types/Gym.types";

export const useGymTrainers = (skip: number = 0, limit: number = 50) => {
  const [trainers, setTrainers] = useState<TrainerDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainers = useCallback(() => {
    setLoading(true);
    const sub = GymApiService.getTrainers(skip, limit).subscribe({
      next: (res) => {
        if (res.success) {
          setTrainers(res.data);
          setTotal(res.total);
        }
        setLoading(false);
      },
      error: (err) => {
        setError(err.message || "Failed to load trainers");
        setLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, [skip, limit]);

  useEffect(() => {
    return fetchTrainers();
  }, [fetchTrainers]);

  return { trainers, total, loading, error, refresh: fetchTrainers };
};
