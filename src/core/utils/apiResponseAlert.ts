export type AppAlertStatus = "success" | "error" | "warning" | "info";

export interface AppAlertPayload {
  status: AppAlertStatus;
  title: string;
  description?: string;
}

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
): AppAlertPayload => {
  const {
    successMessage,
    errorMessage,
    defaultSuccessMessage = "Action completed successfully.",
    defaultErrorMessage = "Action failed. Please try again.",
    includeErrorDescription = true,
  } = options;

  if (result?.success) {
    return {
      status: "success",
      title: successMessage || result.message || defaultSuccessMessage,
    };
  }

  return {
    status: "error",
    title: errorMessage || result?.message || defaultErrorMessage,
    description: includeErrorDescription ? extractErrorDescription(result?.error || result?.data) : undefined,
  };
};
