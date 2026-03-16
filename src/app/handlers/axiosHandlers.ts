/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                     Axios HTTP Client Layer                        │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │  Two Axios instances:                                               │
 * │                                                                     │
 * │  • publicAPI  — For unauthenticated endpoints (login, register).   │
 * │                  Sends common headers (CSRF, Device-ID) but        │
 * │                  NO Bearer token.                                   │
 * │                                                                     │
 * │  • privateAPI — For authenticated endpoints.                       │
 * │                  Automatically attaches `Authorization: Bearer`     │
 * │                  from Redux store.                                  │
 * │                                                                     │
 * │  Silent Token Refresh:                                              │
 * │                                                                     │
 * │  When a privateAPI call returns 401 (token expired), we:            │
 * │   1. Call GET /auth/me (refreshes via httpOnly cookie)              │
 * │   2. Update Redux with the new access_token                        │
 * │   3. Retry the original request transparently                      │
 * │   4. Queue any concurrent 401s so only ONE refresh happens         │
 * │   5. If refresh itself fails → logout + redirect                   │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { RootState, store } from '../store';
import { login, logout } from '../slices/auth/authSlice';
import { getOrCreateDeviceId } from '../../utils/services/appServices';

// ────────────────────────────────────────────────────────────────────────
// 1. BASE URL
//    DEV  → "/api" (Vite proxy handles CORS)
//    PROD → full backend URL from env
// ────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;

// ────────────────────────────────────────────────────────────────────────
// 2. HELPERS
// ────────────────────────────────────────────────────────────────────────

/** Read the Django/Express CSRF token from the browser cookie. */
const getCsrfToken = (): string => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie
        .split(';')
        .find((c) => c.trim().startsWith('csrftoken='));
    return match ? match.split('=')[1] : '';
};

/** Static headers applied to every request on both instances. */
const DEFAULT_HEADERS = {
    'X-Client-ID': import.meta.env.VITE_X_Client_ID,
} as const;

/**
 * Attach dynamic headers that change per-request:
 *  - X-CSRFToken   → fresh value from cookie
 *  - X-Device-ID   → stable device fingerprint
 *  - Content-Type   → auto-detect FormData vs JSON
 */
const attachDynamicHeaders = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const headers = config.headers ?? {};
    headers['X-CSRFToken'] = getCsrfToken();
    headers['X-Device-ID'] = getOrCreateDeviceId();

    // ── Dynamic Content-Type Detection ──
    // If not manually specified, detect based on payload type
    if (!headers['Content-Type'] && config.data) {
        if (config.data instanceof FormData) {
            // NOTE: We DELETE Content-Type for FormData. 
            // If we set it to 'multipart/form-data' manually, the boundary will be missing.
            // Deleting it lets Axios/Browser set it with the correct boundary.
            delete headers['Content-Type'];
        } else if (config.data instanceof URLSearchParams) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else if (typeof config.data === 'object') {
            headers['Content-Type'] = 'application/json';
        }
    } else if (!headers['Content-Type'] && !config.data && config.method !== 'get') {
        // Fallback for non-GET requests without data
        headers['Content-Type'] = 'application/json';
    }

    config.headers = headers;
    return config;
};

// ────────────────────────────────────────────────────────────────────────
// 3. AXIOS INSTANCES
// ────────────────────────────────────────────────────────────────────────

const createApiClient = (): AxiosInstance =>
    axios.create({
        baseURL: BASE_URL,
        withCredentials: true,   // Always send httpOnly cookies
        headers: { ...DEFAULT_HEADERS },
        timeout: 30_000,         // 30 seconds
    });

const publicAPI = createApiClient();
const privateAPI = createApiClient();

// ────────────────────────────────────────────────────────────────────────
// 4. REQUEST INTERCEPTORS
// ────────────────────────────────────────────────────────────────────────

/** publicAPI — only dynamic headers, no auth. */
publicAPI.interceptors.request.use(
    (config) => attachDynamicHeaders(config),
    (error: AxiosError) => Promise.reject(error),
);

/**
 * privateAPI — dynamic headers + Bearer token from Redux.
 *
 * WHY read from Redux on every request?
 *  → The token may get refreshed silently (see response interceptor below).
 *    Reading from the store ensures we always use the latest token.
 */
privateAPI.interceptors.request.use(
    (config) => {
        const enriched = attachDynamicHeaders(config);
        const state = store.getState() as RootState;
        const token = state?.auth?.access_token;
        const organizationUuid = state?.organizations?.organization?.uuid;

        if (token) {
            enriched.headers['Authorization'] = `Bearer ${token}`;
        }

        if (organizationUuid) {
            enriched.headers['X-Organization-ID'] = organizationUuid;
        }

        return enriched;
    },
    (error: AxiosError) => Promise.reject(error),
);

// ────────────────────────────────────────────────────────────────────────
// 5. RESPONSE INTERCEPTOR — Silent Token Refresh
//
//    PROBLEM:
//      access_token expires every ~15 min. Without this, every API call
//      after expiry returns 401 and the user is kicked to /auth/login.
//
//    SOLUTION:
//      On 401 → silently call GET /auth/me (server uses the long-lived
//      httpOnly refresh_token cookie to issue a new access_token)
//      → update Redux → retry the original request. The caller never
//      knows a refresh happened.
//
//    EDGE CASES HANDLED:
//      • Multiple concurrent 401s → only ONE /auth/me call (queue pattern)
//      • /auth/me itself returns 401 → refresh_token is dead → real logout
//      • /auth/logout returns 401 → don't loop, just reject
//      • _retry flag prevents infinite retry loops
// ────────────────────────────────────────────────────────────────────────

/** Paths excluded from silent refresh to prevent infinite loops. */
const SKIP_REFRESH_PATHS = ['/auth/me', '/auth/refresh', '/auth/logout', "/oauth2/authorize"] as const;

/** Module-level flag: is a refresh call currently in-flight? */
let isRefreshing = false;

/** Requests waiting for the refresh to finish. */
interface QueueEntry {
    resolve: (newToken: string) => void;
    reject: (error: unknown) => void;
}
let failedQueue: QueueEntry[] = [];

/**
 * After refresh completes, resolve or reject every queued request.
 * Clearing the queue is critical — stale entries would leak memory.
 */
const drainQueue = (error: unknown, newToken: string | null): void => {
    for (const entry of failedQueue) {
        error ? entry.reject(error) : entry.resolve(newToken!);
    }
    failedQueue = [];
};

/**
 * Hard logout: clear Redux auth state and redirect.
 * Skip redirect if already on /auth/* to avoid redirect loops.
 */
const forceLogout = (): void => {
    store.dispatch(logout());
    if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
    }
};

/** Extended config type to track retry state. */
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

privateAPI.interceptors.response.use(
    // ── Success: pass through ──
    (response: AxiosResponse) => response,

    // ── Error: handle 401 ──
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableConfig | undefined;
        const is401 = error.response?.status === 401;

        // Guard: not a 401, or no config, or already retried, or a skip path
        const shouldSkipRefresh =
            !is401 ||
            !originalRequest ||
            originalRequest._retry ||
            SKIP_REFRESH_PATHS.some((p) => originalRequest.url?.includes(p));

        if (shouldSkipRefresh) {
            // /auth/refresh returned 401 → refresh_token is dead → logout
            if (is401 && originalRequest?.url?.includes('/auth/refresh')) {
                forceLogout();
            }
            return Promise.reject(error);
        }

        // ── Another request is already refreshing → wait in queue ──
        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((freshToken) => {
                originalRequest.headers['Authorization'] = `Bearer ${freshToken}`;
                return privateAPI(originalRequest);
            });
        }

        // ── This request will perform the refresh ──
        originalRequest._retry = true;   // Prevent infinite loop on retry
        isRefreshing = true;

        try {
            // GET /auth/refresh — lightweight endpoint, only returns { access_token }.
            // Uses the httpOnly cookie to exchange refresh_token for a new access_token.
            // Unlike /auth/me, it does NOT fetch user info (saves 1 OAuth2 HTTP call).
            const { data } = await privateAPI.get('/auth/refresh');

            if (!data?.success || !data?.access_token) {
                // Server responded 200 but payload is invalid → treat as failure
                drainQueue(error, null);
                forceLogout();
                return Promise.reject(error);
            }

            // ✅ Refresh succeeded — only update the token in Redux.
            // User info (login_info, permissions) stays unchanged from initial hydration.
            const currentAuth = (store.getState() as RootState).auth;
            store.dispatch(login({
                success: true,
                access_token: data.access_token,
                authProvider: currentAuth.authRes?.authProvider,
            }));

            // Release all queued requests with the fresh token
            drainQueue(null, data.access_token);

            // Retry the original request that triggered the refresh
            originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
            return privateAPI(originalRequest);

        } catch (refreshError) {
            // ❌ Refresh failed — refresh_token expired or server unreachable
            drainQueue(refreshError, null);
            forceLogout();
            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    },
);

// ────────────────────────────────────────────────────────────────────────
// 6. EXPORTS
// ────────────────────────────────────────────────────────────────────────

export { privateAPI, publicAPI, BASE_URL };
