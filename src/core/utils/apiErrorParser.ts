
export interface ValidationIssue {
    field: string;
    message: string;
    type?: string;
}

export interface ParsedError {
    summary: string;
    issues: ValidationIssue[];
}

/**
 * Parses the API error response to extract user-friendly messages.
 * Handles the specific format: { error: { input: {...}, body: { field: { type, msg } } } }
 */
export const parseApiError = (error: any): ParsedError => {
    const defaultSummary = "An unexpected error occurred.";

    if (!error) {
        return { summary: defaultSummary, issues: [] };
    }

    // Handle simple string message
    if (typeof error === 'string') {
        return { summary: error, issues: [] };
    }

    // Handle standard "message" field
    let summary = error.message || defaultSummary;

    // Check for the "error" object structure from backend
    const errorDetails = error.error || error; // In case checking error.error is redundant or flattened

    const issues: ValidationIssue[] = [];

    // 1. Check for "body" validation errors
    if (errorDetails.body) {
        Object.entries(errorDetails.body).forEach(([field, detail]: [string, any]) => {
            // Handles __root__ errors
            if (field === '__root__') {
                issues.push({
                    field: "General",
                    message: detail.msg || detail.message || "Invalid request body",
                    type: detail.type
                });
                return;
            }

            // Handle standard field error
            if (detail && detail.msg) {
                issues.push({
                    field: formatFieldName(field),
                    message: detail.msg === "Field required" ? "is required" : detail.msg,
                    type: detail.type
                });
            }
        });
    }

    // 2. Check for "query" validation errors (if any)
    if (errorDetails.query) {
        Object.entries(errorDetails.query).forEach(([field, detail]: [string, any]) => {
            if (detail && detail.msg) {
                issues.push({
                    field: formatFieldName(field),
                    message: detail.msg,
                    type: detail.type
                });
            }
        });
    }

    // 3. Fallback: If no structured validation errors, but we have a generic "detail"
    if (issues.length === 0 && errorDetails.detail) {
        // sometimes detail is a string, sometimes a list
        if (typeof errorDetails.detail === 'string' || typeof errorDetails.details === 'string') {
            summary = errorDetails.detail || errorDetails.details;
        } else if (Array.isArray(errorDetails.detail)) {
            // Standard FastAPI validation error list (loc, msg, type) IF it wasn't caught by our custom handler
            errorDetails.detail.forEach((err: any) => {
                const field = err.loc ? err.loc[err.loc.length - 1] : 'Field';
                issues.push({
                    field: formatFieldName(field),
                    message: err.msg,
                    type: err.type
                });
            });
        }
    }

    // Refine summary if we have validation issues
    if (issues.length > 0 && summary === "Validation Errors") {
        summary = `Please fix the following ${issues.length} error${issues.length > 1 ? 's' : ''}:`;
    }

    return { summary, issues };
};

const formatFieldName = (field: string): string => {
    // Convert snake_case to Title Case (e.g., organization_email -> Organization Email)
    return field
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};
