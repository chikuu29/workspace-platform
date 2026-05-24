/**
 * Converts a string from snake_case or camelCase to "Title Case".
 *
 * @param {string} key - The input string to be formatted.
 * @returns {string} - The formatted string in "Title Case".
 *
 * Examples:
 *   formatKey("allowed_origins") => "Allowed Origins"
 *   formatKey("allowedOrigins")  => "Allowed Origins"
 *   formatKey("client_id")       => "Client Id"
 */
export const formatKey = (key: string): string => {
    return key
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Convert camelCase to spaced format
        .replace(/_/g, " ") // Replace underscores with spaces (snake_case)
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};