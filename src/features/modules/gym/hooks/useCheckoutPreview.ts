/**
 * useCheckoutPreview.ts
 *
 * Custom hook to preview membership checkout pricing and details.
 * Communicates with GymApiService.checkoutPreview.
 */
import { useState, useEffect, useCallback } from "react";
import { GymApiService } from "../services/gymApi.service";
import type { CheckoutPreviewResponse } from "../types/Gym.types";

export interface UseCheckoutPreviewResult {
  previewData: CheckoutPreviewResponse["data"] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useCheckoutPreview = (
  memberId?: string,
  planCode?: string,
  startDate?: string,
  couponCode?: string
): UseCheckoutPreviewResult => {
  const [previewData, setPreviewData] = useState<CheckoutPreviewResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = useCallback(() => {
    if (!memberId || !planCode) {
      setPreviewData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const sub = GymApiService.checkoutPreview({
      member_id: memberId,
      plan_code: planCode,
      start_date: startDate || undefined,
      coupon_code: couponCode || undefined,
    }).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          setPreviewData(res.data);
        } else {
          setError(res?.message || "Failed to generate checkout preview.");
          setPreviewData(null);
        }
        setLoading(false);
      },
      error: (err) => {
        setError(err.message || "Failed to generate checkout preview.");
        setPreviewData(null);
        setLoading(false);
      },
    });

    return () => sub.unsubscribe();
  }, [memberId, planCode, startDate, couponCode]);

  useEffect(() => {
    const cleanup = fetchPreview();
    return () => {
      if (cleanup) cleanup();
    };
  }, [fetchPreview]);

  return {
    previewData,
    loading,
    error,
    refresh: fetchPreview,
  };
};
