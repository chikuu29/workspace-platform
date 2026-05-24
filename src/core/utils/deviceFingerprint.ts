/**
 * Device Fingerprint Utility
 *
 * Generates a persistent device ID (UUID) stored in localStorage.
 * This is sent as X-Device-ID header on every API request to bind
 * refresh tokens to the device.
 */
import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "device_id";

/**
 * Get or create a persistent device ID.
 * Stored in localStorage so it survives page refreshes.
 */
export function getDeviceId(): string {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
}

/**
 * Get device info summary (browser + OS) for display purposes.
 */
export function getDeviceInfo(): { browser: string; os: string; deviceName: string } {
    const ua = navigator.userAgent;

    // Browser detection
    let browser = "Unknown";
    if (ua.includes("Edg/")) browser = "Edge";
    else if (ua.includes("OPR/") || ua.includes("Opera")) browser = "Opera";
    else if (ua.includes("Chrome/") && ua.includes("Safari/")) browser = "Chrome";
    else if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Safari/") && !ua.includes("Chrome/")) browser = "Safari";

    // OS detection
    let os = "Unknown";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("CrOS")) os = "Chrome OS";

    return {
        browser,
        os,
        deviceName: `${browser} on ${os}`,
    };
}