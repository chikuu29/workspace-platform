/**
 * usePolicies — Custom hook for policy data management
 *
 * Provides reactive state management for policy CRUD operations.
 * Uses RxJS subscriptions for API calls with proper cleanup.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Subscription } from "rxjs";
import type { Policy } from "../types/policy.types";
import { fetchPolicies, fetchPlatformPolicies } from "../services/policyApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

interface UsePoliciesReturn {
  /** List of policies */
  policies: Policy[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error message, if any */
  error: string | null;
  /** Refresh the policy list */
  refresh: () => void;
}

/**
 * Hook to fetch and manage policies.
 * Platform users get all policies; org users get org + global policies.
 */
const usePolicies = (): UsePoliciesReturn => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userType = useSelector((state: RootState) => state.rbac?.user_type);
  const subscriptionRef = useRef<Subscription | null>(null);

  const loadPolicies = useCallback(() => {
    setIsLoading(true);
    setError(null);

    // Cleanup previous subscription to prevent memory leaks
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Use platform endpoint for PLATFORM users, org endpoint for others
    const apiCall = userType === "PLATFORM"
      ? fetchPlatformPolicies()
      : fetchPolicies();

    subscriptionRef.current = apiCall.subscribe({
      next: (response: any) => {
        if (response?.success && Array.isArray(response.data)) {
          setPolicies(response.data);
        } else {
          setError(response?.message || "Failed to fetch policies");
          setPolicies([]);
        }
        setIsLoading(false);
      },
      error: (err: any) => {
        setError(err?.message || "Network error");
        setPolicies([]);
        setIsLoading(false);
      },
    });
  }, [userType]);

  // Fetch policies on mount and when userType changes
  useEffect(() => {
    loadPolicies();

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [loadPolicies]);

  return {
    policies,
    isLoading,
    error,
    refresh: loadPolicies,
  };
};

export default usePolicies;
