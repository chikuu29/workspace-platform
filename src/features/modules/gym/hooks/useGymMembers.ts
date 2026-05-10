/**
 * useGymMembers.ts
 *
 * Managed hook for fetching and filtering gym members.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { GymApiService } from "../services/gymApi.service";
import { MemberDocument } from "../types/Gym.types";

export const useGymMembers = (skip: number = 0, limit: number = 50) => {
  const [members, setMembers] = useState<MemberDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(() => {
    setLoading(true);
    const sub = GymApiService.getMembers(skip, limit).subscribe({
      next: (res) => {
        if (res.success) {
          setMembers(res.data);
          setTotal(res.total);
        }
        setLoading(false);
      },
      error: (err) => {
        setError(err.message || "Failed to load members");
        setLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, [skip, limit]);

  useEffect(() => {
    return fetchMembers();
  }, [fetchMembers]);

  return { members, total, loading, error, refresh: fetchMembers };
};
