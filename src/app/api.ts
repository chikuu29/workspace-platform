import { from, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { privateAPI, publicAPI } from "./handlers/axiosHandlers";
import { getFromCache, saveToCache } from "./handlers/dexieHandles";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type APIService = "core" | "ui" | "ai" | "identity";

interface APIRequestOptions {
  method: RequestMethod;
  path: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  isPrivateApi?: boolean;
  enableCache?: boolean;
  cacheTTL?: number;
  files?: FileList | File[];
  serverName?: APIService;
}

interface LegacyGetOptions {
  path: string;
  params?: Record<string, any>;
  isPrivateApi?: boolean;
  enableCache?: boolean;
  cacheTTL?: number;
  serverName?: APIService;
}

interface LegacyPostOptions {
  path: string;
  data?: any;
  isPrivateApi?: boolean;
  enableCache?: boolean;
  cacheTTL?: number;
  files?: FileList | File[];
  serverName?: APIService;
}

const errorMessages: Record<number, string> = {
  401: "Unauthorized access",
  404: "Resource not found",
  500: "Internal server error",
  502: "Bad gateway",
  503: "Service unavailable",
  505: "Server not found",
};

const buildCacheKey = ({ method, path, params = {}, data = {}, serverName = "core" }: APIRequestOptions) =>
  `${serverName}_${method}_${path}_${JSON.stringify(params)}_${JSON.stringify(data)}`;

const buildPayload = (data: any = {}, files?: FileList | File[]) => {
  // If no files, return data as is (could be Object, FormData, or URLSearchParams)
  if (!files || files.length === 0) return data;

  // Append files to FormData. If data is already FormData, use it; otherwise create new.
  const formData = (data instanceof FormData) ? data : new FormData();

  if (!(data instanceof FormData)) {
    Object.keys(data || {}).forEach((key) => {
      formData.append(key, data[key]);
    });
  }

  Array.from(files).forEach((file) => {
    formData.append("files", file, file.name);
  });

  return formData;
};

// Map service to its respective base URL
export const getBaseUrl = (serverName: APIService) => {
  if (import.meta.env.DEV) {
   console.log(`DEV MODE: Routing API call to ${serverName} server`);
    switch (serverName) {
      case "ui": return "/ui-api";
      case "ai": return "/ai-api";
      case "identity": return "/identity";
      case "core":
      default: return "/api";
    }
  } else {
    // In production, fallback to environment variables
    switch (serverName) {
      case "ui": return import.meta.env.VITE_UI_API_URL || "/ui-api";
      case "ai": return import.meta.env.VITE_AI_API_URL || "/ai-api";
      case "identity": return import.meta.env.VITE_IDENTITY_PROVIDER_API_URL || "/identity";
      case "core":
      default: return import.meta.env.VITE_API_URL || "/api";
    }
  }
};

/**
 * Common API request method.
 * Pass method as GET/POST/PUT/PATCH/DELETE.
 */
const APIRequest = ({
  method,
  path,
  params = {},
  data = {},
  headers = {},
  isPrivateApi = false,
  enableCache = false,
  cacheTTL = 300,
  files,
  serverName = "core",
}: APIRequestOptions) => {
  const apiHandler = isPrivateApi ? privateAPI : publicAPI;
  const shouldCache = enableCache && method === "GET";
  const cacheKey = buildCacheKey({ method, path, params, data, serverName } as APIRequestOptions);
  const payload = buildPayload(data, files);

  return from(
    (async () => {
      if (shouldCache) {
        const cachedData = await getFromCache(cacheKey);
        if (cachedData) return cachedData;
      }

      const response = await apiHandler.request({
        method,
        baseURL: getBaseUrl(serverName), // Dynamically target the correct server
        url: path,
        params,
        data: method === "GET" ? undefined : payload,
        headers,
      });

      const responseData = response.data;

      if (shouldCache) {
        await saveToCache(cacheKey, responseData, cacheTTL);
      }

      return responseData;
    })()
  ).pipe(
    catchError((error) => {
      // For 401s, axiosHandlers usually retries. If we are here, it means the retry also failed
      // or it was a path that skips refresh (like /auth/refresh itself).
      const statusCode = error?.response?.status as number;
      const serverMessage = error?.response?.data?.message || error?.response?.data?.detail;
      const message = serverMessage || errorMessages[statusCode] || "An unknown error occurred";

      return of({
        success: false,
        message,
        data: error?.response?.data,
        errorInfo: error,
      });
    })
  );
};

const GETAPI = ({ path, params = {}, isPrivateApi = false, enableCache = false, cacheTTL = 300, serverName = "core" }: LegacyGetOptions) =>
  APIRequest({
    method: "GET",
    path,
    params,
    isPrivateApi,
    enableCache,
    cacheTTL,
    serverName,
  });

const POSTAPI = ({ path, data = {}, isPrivateApi = false, files, enableCache = false, cacheTTL = 300, serverName = "core" }: LegacyPostOptions) =>
  APIRequest({
    method: "POST",
    path,
    data,
    isPrivateApi,
    files,
    enableCache,
    cacheTTL,
    serverName,
  });

const PUTAPI = ({ path, data = {}, isPrivateApi = false, files, enableCache = false, cacheTTL = 300, serverName = "core" }: LegacyPostOptions) =>
  APIRequest({
    method: "PUT",
    path,
    data,
    isPrivateApi,
    files,
    enableCache,
    cacheTTL,
    serverName,
  });

const DELETEAPI = ({ path, data = {}, isPrivateApi = false, enableCache = false, cacheTTL = 300, serverName = "core" }: LegacyPostOptions) =>
  APIRequest({
    method: "DELETE",
    path,
    data,
    isPrivateApi,
    enableCache,
    cacheTTL,
    serverName,
  });

/**
 * Specialized OAuth2 POST helper.
 * Automatically handles content-type detection and token refresh failure.
 */
const POSTWITHOAUTH = async (path: string, options: { body?: any; data?: any; headers?: any; sid?: string; redirect?: string }) => {
  const payload = options.body || options.data;

  // If sid (session_id) is provided, ensure it's in the payload for grant-style requests
  if (options.sid && payload instanceof URLSearchParams) {
    if (!payload.has("sid") && !payload.has("session_id")) {
      payload.append("sid", options.sid);
    }
  }

  return APIRequest({
    method: "POST",
    path,
    data: payload,
    headers: options.headers,
    isPrivateApi: true,
  }).toPromise();
};

export { APIRequest, GETAPI, POSTAPI, PUTAPI, DELETEAPI, POSTWITHOAUTH };
