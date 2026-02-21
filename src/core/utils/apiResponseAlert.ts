import type { ApiResponseModalConfig } from "@/core/store/useApiResponseModalStore";

export interface ApiExecutionResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: any;
}

interface BuildApiAlertOptions {
  successMessage?: string;
  errorMessage?: string;
  defaultSuccessMessage?: string;
  defaultErrorMessage?: string;
  includeErrorDescription?: boolean;
}

const extractErrorDescription = (error: any): string | undefined => {
  if (!error) return undefined;
  if (typeof error === "string") return error;

  return (
    error?.message ||
    error?.errorInfo?.message ||
    error?.response?.data?.message ||
    error?.data?.message ||
    undefined
  );
};

/**
 * Centralized API-response to alert mapping.
 * Reusable across forms, tables and custom actions.
 */
export const buildApiResponseAlert = (
  result: ApiExecutionResult,
  options: BuildApiAlertOptions = {}
): ApiResponseModalConfig => {
  const {
    successMessage,
    errorMessage,
    defaultSuccessMessage = "Action completed successfully.",
    defaultErrorMessage = "Action failed. Please try again.",
    includeErrorDescription = true,
  } = options;

  if (result?.success) {
    return {
      type: "success",
      title: successMessage || result.message || defaultSuccessMessage,
      autoClose: true,
      duration: 2200,
    };
  }

  const statusCode = result?.error?.response?.status || result?.data?.statusCode;
  const type = statusCode === 401 || statusCode === 403 ? "warning" : "error";

  return {
    type,
    title: errorMessage || result?.message || defaultErrorMessage,
    message: includeErrorDescription ? extractErrorDescription(result?.error || result?.data) : undefined,
  };
};
