// utils/formatters.ts
export const formatValue = (value: any) => {
    if (Array.isArray(value)) {
        return value.join(', '); // Join arrays as a comma-separated string
    }

    if (typeof value === 'string') {
        // Check if it's an ISO date-time string
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
        if (isoDateRegex.test(value)) {
            // return new Date(value), "MMMM do, yyyy h:mm a")
            // return new Date(value).toLocaleString(); // Format date-time strings
            return new Date(value).toLocaleString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true, // Enables AM/PM format
            }).toUpperCase(); // Format ISO date-time to human-readable form with AM/PM
        }
        return value; // Return plain strings as-is
    }

    if (typeof value === 'number') {
        return value.toLocaleString(); // Format numbers with locale-aware commas
    }

    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2); // Format objects as pretty JSON
    }

    return String(value); // Fallback for other types (boolean, undefined, etc.)
};