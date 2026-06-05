/**
 * useInvoiceDetails.ts
 *
 * Custom hook to fetch a gym membership invoice by invoice_number.
 * Used by InvoiceDetails page (step 4 in the sales flow).
 * The invoice carries member_id, plan_code, and dates in source_ref.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { GymInvoiceResponse } from "../types/Gym.types";
import { GymApiService } from "../services/gymApi.service";

type InvoiceData = GymInvoiceResponse["data"];

interface UseInvoiceDetailsResult {
  invoice: InvoiceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches a single gym invoice by invoice_number.
 * Provides a stable refetch function for post-action refreshes.
 */
export const useInvoiceDetails = (
  invoiceNumber: string | undefined
): UseInvoiceDetailsResult => {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchInvoice = useCallback(() => {
    if (!invoiceNumber) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const sub = GymApiService.getGymInvoice(invoiceNumber).subscribe({
      next: (res) => {
        if (!mountedRef.current) return;
        if (res.success) {
          setInvoice(res.data);
        } else {
          setError((res as any).message ?? "Failed to load invoice.");
        }
        setLoading(false);
      },
      error: (err) => {
        if (!mountedRef.current) return;
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Network error loading invoice."
        );
        setLoading(false);
      },
    });

    return () => sub.unsubscribe();
  }, [invoiceNumber]);

  useEffect(() => {
    mountedRef.current = true;
    const cleanup = fetchInvoice();
    return () => {
      mountedRef.current = false;
      cleanup?.();
    };
  }, [fetchInvoice]);

  return { invoice, loading, error, refetch: fetchInvoice };
};
