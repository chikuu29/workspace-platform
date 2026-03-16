import { API_SERVICES } from "@/config/api.config"

export interface LOGIN_CREDENTIAL {
  username?: string
  password?: string
}




export interface DISPLAY_TYPE {
  SHOW_TOP_NAV_MENU?: boolean
  SHOW_SIDE_NAV_MENU?: boolean
}

export interface APP_CONFIG_STATE {
  FEATURE: any[]
  DISPLAY_TYPE: DISPLAY_TYPE
}


export interface APP_LOADER {
  loaderText?: string,
  active: boolean
}


export interface AlertProps {
  title: string;
  description: any;
  status: "info" | "warning" | "success" | "error";
  isVisible: boolean;
  onClose?: () => void;
}


export interface NavBarActionProps {
  showAuthFullName?: boolean
}




export interface APIConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ServiceEndpoints {
  [key: string]: string;
}

export interface POSTAPI_INTERFACE {
  path: string;
  data?: Record<string, any>;
  service?: string; // New: specify which microservice
  isPrivateApi?: boolean;
  files?: FileList | File[];
}

export interface GETAPI_INTERFACE {
  path: string;
  service?: string;
  isPrivateApi?: boolean;
  params?: Record<string, any>;
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error_details?: any;
}

export type ServiceType = typeof API_SERVICES[keyof typeof API_SERVICES];