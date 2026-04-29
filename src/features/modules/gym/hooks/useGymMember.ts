/**
 * useGymMember.ts
 *
 * Managed hook for fetching a single gym member's details.
 */
import { useState, useEffect, useCallback } from "react";
import { GymApiService } from "../services/gymApi.service";
import { MemberDocument } from "../types/Gym.types";

export const useGymMember = (recordId?: string) => {
  const [member, setMember] = useState<MemberDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMember = useCallback(() => {
    if (!recordId) return;
    setLoading(true);
    const sub = GymApiService.getMember(recordId).subscribe({
      next: (res) => {
        setMember(res);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message || "Failed to load member details");
        setLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, [recordId]);

  useEffect(() => {
    return fetchMember();
  }, [fetchMember]);

  return { member, loading, error, refresh: fetchMember };
};
