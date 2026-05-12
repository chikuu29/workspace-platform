/**
 * useGymMember.ts
 *
 * Managed hook for fetching a single gym member's details.
 *
 * Handles three outcomes:
 *  1. Success → member is set, loading=false
 *  2. Not found (API returns success:false or null data) → member=null, notFound=true
 *  3. Network/unexpected error → member=null, error is set
 */
import { useState, useEffect, useCallback } from "react";
import { GymApiService } from "../services/gymApi.service";
import type { MemberDocument } from "../types/Gym.types";

export interface UseGymMemberResult {
  member: MemberDocument | null;
  loading: boolean;
  /** True when the API explicitly returned no data for the given ID */
  notFound: boolean;
  error: string | null;
  refresh: () => (() => void) | undefined;
}

export const useGymMember = (recordId?: string): UseGymMemberResult => {
  const [member, setMember] = useState<MemberDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMember = useCallback(() => {
    if (!recordId) {
      // No ID supplied — nothing to fetch, treat as not-found
      setMember(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setError(null);

    const sub = GymApiService.getMember(recordId).subscribe({
      next: (res: any) => {
        /**
         * Platform's catchError returns { success: false, data: … } on HTTP errors.
         * The pipe's map(res => res.data) extracts that inner data, so `res` here
         * could be the actual MemberDocument OR the raw error response body.
         *
         * Detect invalid responses by checking for the required `data` property
         * that every MemberDocument must have (it carries the member fields).
         */
        if (!res || !res.data || (res as any).success === false) {
          setMember(null);
          setNotFound(true);
        } else {
          setMember(res);
          setNotFound(false);
        }
        setLoading(false);
      },
      error: (err) => {
        setError(err.message || "Failed to load member details");
        setMember(null);
        setNotFound(false);
        setLoading(false);
      },
    });

    return () => sub.unsubscribe();
  }, [recordId]);

  useEffect(() => {
    return fetchMember();
  }, [fetchMember]);

  return { member, loading, notFound, error, refresh: fetchMember };
};

