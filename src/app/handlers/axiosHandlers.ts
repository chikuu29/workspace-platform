import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { RootState, store } from '../store';
import { getOrCreateDeviceId } from '../../utils/services/appServices';

const BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;

const getCsrfToken = (): string => {
    if (typeof document === 'undefined') return '';

    const token = document.cookie
        .split(';')
        .find((cookie) => cookie.trim().startsWith('csrftoken='));

    return token ? token.split('=')[1] : '';
};

const createDefaultHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Client-ID': import.meta.env.VITE_X_Client_ID,
    'X-CSRFToken': getCsrfToken(),
});

const createApiClient = (): AxiosInstance =>
    axios.create({
        baseURL: BASE_URL,
        withCredentials: true,
        headers: createDefaultHeaders(),
        timeout: 30000,
    });

const applyCommonRequestHeaders = (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers || {};
    config.headers['X-CSRFToken'] = getCsrfToken();
    config.headers['X-Device-ID'] = getOrCreateDeviceId();

    if (!config.headers['Content-Type']) {
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        } else if (config.data && typeof config.data === 'object') {
            config.headers['Content-Type'] = 'application/json';
        }
    }

    return config;
};

const privateAPI = createApiClient();
const publicAPI = createApiClient();

publicAPI.interceptors.request.use(
    (config) => applyCommonRequestHeaders(config),
    (error: AxiosError) => Promise.reject(error)
);

privateAPI.interceptors.request.use(
    (config) => {
        const nextConfig = applyCommonRequestHeaders(config);
        const authState: RootState = store.getState();
        const accessToken = authState?.auth?.access_token;

        if (accessToken) {
            nextConfig.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        return nextConfig;
    },
    (error: AxiosError) => Promise.reject(error)
);

/**
 * Response interceptor: handle 401 (session expired) globally.
 * Instead of every component checking for 401, centralise it here
 * so the user is redirected once and in-memory auth state is cleared.
 */
privateAPI.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            const { logout } = require('../slices/auth/authSlice');
            store.dispatch(logout());

            // Redirect only if not already on auth pages
            if (!window.location.pathname.startsWith('/auth')) {
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export { privateAPI, publicAPI, BASE_URL };
