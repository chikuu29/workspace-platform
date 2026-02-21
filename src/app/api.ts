import { from, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { privateAPI, publicAPI } from "./handlers/axiosHandlers";
import { getFromCache, saveToCache } from "./handlers/dexieHandles";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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
}

interface LegacyGetOptions {
  path: string;
  params?: Record<string, any>;
  isPrivateApi?: boolean;
  enableCache?: boolean;
  cacheTTL?: number;
}

interface LegacyPostOptions {
  path: string;
  data?: any;
  isPrivateApi?: boolean;
  enableCache?: boolean;
  cacheTTL?: number;
  files?: FileList | File[];
}

const errorMessages: Record<number, string> = {
  401: "Unauthorized access",
  404: "Resource not found",
  500: "Internal server error",
  502: "Bad gateway",
  503: "Service unavailable",
  505: "Server not found",
};

const buildCacheKey = ({ method, path, params = {}, data = {} }: APIRequestOptions) =>
  `${method}_${path}_${JSON.stringify(params)}_${JSON.stringify(data)}`;

const buildPayload = (data: any = {}, files?: FileList | File[]) => {
  if (!files || files.length === 0) return data;

  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file, file.name);
  });

  Object.keys(data || {}).forEach((key) => {
    formData.append(key, data[key]);
  });

  return formData;
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
}: APIRequestOptions) => {
  const apiHandler = isPrivateApi ? privateAPI : publicAPI;
  const shouldCache = enableCache && method === "GET";
  const cacheKey = buildCacheKey({ method, path, params, data });
  const payload = buildPayload(data, files);

  return from(
    (async () => {
      if (shouldCache) {
        const cachedData = await getFromCache(cacheKey);
        if (cachedData) return cachedData;
      }

      const response = await apiHandler.request({
        method,
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
      const statusCode = error?.response?.status as number;
      const message = errorMessages[statusCode] || "An unknown error occurred";

      return of({
        success: false,
        message,
        data: error?.response?.data,
        errorInfo: error,
      });
    })
  );
};

const GETAPI = ({ path, params = {}, isPrivateApi = false, enableCache = false, cacheTTL = 300 }: LegacyGetOptions) =>
  APIRequest({
    method: "GET",
    path,
    params,
    isPrivateApi,
    enableCache,
    cacheTTL,
  });

const POSTAPI = ({ path, data = {}, isPrivateApi = false, files, enableCache = false, cacheTTL = 300 }: LegacyPostOptions) =>
  APIRequest({
    method: "POST",
    path,
    data,
    isPrivateApi,
    files,
    enableCache,
    cacheTTL,
  });

const PUTAPI = ({ path, data = {}, isPrivateApi = false, files, enableCache = false, cacheTTL = 300 }: LegacyPostOptions) =>
  APIRequest({
    method: "PUT",
    path,
    data,
    isPrivateApi,
    files,
    enableCache,
    cacheTTL,
  });

const DELETEAPI = ({ path, data = {}, isPrivateApi = false, enableCache = false, cacheTTL = 300 }: LegacyPostOptions) =>
  APIRequest({
    method: "DELETE",
    path,
    data,
    isPrivateApi,
    enableCache,
    cacheTTL,
  });

export { APIRequest, GETAPI, POSTAPI, PUTAPI, DELETEAPI };
