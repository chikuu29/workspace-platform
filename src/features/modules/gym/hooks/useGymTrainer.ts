/**
 * useGymTrainer.ts
 *
 * Managed hook for fetching a single gym trainer's profile details.
 */
import { useState, useEffect, useCallback } from "react";
import { GymApiService } from "../services/gymApi.service";
import { TrainerDocument } from "../types/Gym.types";

export const useGymTrainer = (identifier?: string) => {
  const [trainer, setTrainer] = useState<TrainerDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainer = useCallback(() => {
    if (!identifier) return;
    setLoading(true);
    const sub = GymApiService.getTrainer(identifier).subscribe({
      next: (res) => {
        setTrainer(res);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message || "Failed to load trainer details");
        setLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, [identifier]);

  useEffect(() => {
    return fetchTrainer();
  }, [fetchTrainer]);

  return { trainer, loading, error, refresh: fetchTrainer };
};
