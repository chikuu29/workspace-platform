/**
 * PKCE (Proof Key for Code Exchange) Service
 *
 * Implements RFC 7636 to protect the OAuth 2.0 authorization code flow
 * against interception attacks. Uses the S256 challenge method exclusively
 * for maximum security.
 *
 * Flow:
 *   1. `generateCodeVerifier()`    → Random 64-char base64url string
 *   2. `generateCodeChallenge(v)`  → SHA-256 hash → base64url encoded
 *   3. `getStoredCodeVerifier()`   → Retrieve & remove from sessionStorage
 */

import CryptoJS from "crypto-js";

const PKCE_STORAGE_KEY = "pkce_code_verifier" as const;
const VERIFIER_BYTE_LENGTH = 48; // 48 bytes → 64 base64url characters

// --- Base64url Encoding (RFC 4648 §5) ---

/**
 * Converts a Uint8Array to a base64url-encoded string.
 * Standard base64 characters `+`, `/`, and trailing `=` are replaced
 * to make the output URL-safe without percent-encoding.
 */
const toBase64Url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
};

// --- Public API ---

/**
 * Generates a cryptographically random code verifier (RFC 7636 §4.1).
 * Uses Web Crypto API for CSPRNG-backed randomness.
 *
 * @returns A 64-character base64url-encoded random string.
 */
export const generateCodeVerifier = (): string => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(VERIFIER_BYTE_LENGTH));
    return toBase64Url(randomBytes.buffer);
};

/**
 * Generates a code challenge from the verifier using S256 method (RFC 7636 §4.2).
 * challenge = BASE64URL(SHA256(ASCII(code_verifier)))
 *
 * @param verifier - The plain-text code verifier string.
 * @returns A promise resolving to the base64url-encoded SHA-256 hash.
 */
export const generateCodeChallenge = async (verifier: string): Promise<string> => {
    // Prefer native Web Crypto API if available (Requires Secure Context: HTTPS or localhost)
    if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const digest = await crypto.subtle.digest("SHA-256", data);
        return toBase64Url(digest);
    }
    
    // Fallback for insecure development contexts (e.g., http://*.local)
    const hash = CryptoJS.SHA256(verifier);
    const base64 = CryptoJS.enc.Base64.stringify(hash);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/**
 * Persists the code verifier to sessionStorage.
 * sessionStorage is chosen over localStorage because the verifier is
 * single-use and should not persist across tabs or browser sessions.
 *
 * @param verifier - The code verifier to store.
 */
export const storeCodeVerifier = (verifier: string): void => {
    sessionStorage.setItem(PKCE_STORAGE_KEY, verifier);
};

/**
 * Retrieves the stored code verifier and immediately removes it.
 * The removal enforces single-use semantics — if a second exchange
 * attempt occurs (e.g., double-click), it will fail cleanly.
 *
 * @returns The code verifier, or an empty string if not found.
 */
export const getStoredCodeVerifier = (): string => {
    const verifier = sessionStorage.getItem(PKCE_STORAGE_KEY) ?? "";
    sessionStorage.removeItem(PKCE_STORAGE_KEY);
    return verifier;
};
