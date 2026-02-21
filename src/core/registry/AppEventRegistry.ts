import { firstValueFrom } from "rxjs";
import { APIRequest } from "@/app/api";
import { useApiResponseModalStore } from "@/core/store/useApiResponseModalStore";
import { buildApiResponseAlert } from "@/core/utils/apiResponseAlert";

export interface AppActionEventConfig {
  api?: {
    url: string;
    method: string;
    params?: Record<string, any>;
    headers?: Record<string, string>;
  };
  successMessage?: string;
  errorMessage?: string;
  handler?: string;
}

export interface AppEventExecutionContext {
  eventName: string;
  payload: any;
  templateConfig?: any;
}

export interface AppEventExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

type EventHandler = (
  eventConfig: AppActionEventConfig,
  context: AppEventExecutionContext
) => Promise<AppEventExecutionResult>;

const normalizeMethod = (method: string): "GET" | "POST" | "PUT" | "PATCH" | "DELETE" => {
  const upper = (method || "POST").toUpperCase();
  if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(upper)) {
    return upper as any;
  }
  return "POST";
};

class AppEventRegistry {
  private handlers = new Map<string, EventHandler>();

  registerHandler(key: string, handler: EventHandler) {
    this.handlers.set(key, handler);
  }

  async executeEvent(
    eventName: string,
    eventConfig: AppActionEventConfig | undefined,
    payload: any,
    templateConfig?: any
  ): Promise<AppEventExecutionResult> {
    if (!eventConfig) {
      return {
        success: false,
        message: `No event configuration found for '${eventName}'.`,
      };
    }

    const handlerKey = eventConfig.handler || (eventConfig.api ? "API_REQUEST" : "NOOP");
    const handler = this.handlers.get(handlerKey);

    if (!handler) {
      return {
        success: false,
        message: `No handler registered for '${handlerKey}'.`,
      };
    }

    const result = await handler(eventConfig, {
      eventName,
      payload,
      templateConfig,
    });

    if (handlerKey === "API_REQUEST") {
      const modalConfig = buildApiResponseAlert(result, {
        successMessage: eventConfig.successMessage,
        errorMessage: eventConfig.errorMessage,
      });
      useApiResponseModalStore.getState().openModal(modalConfig);
    }

    return result;
  }
}

export const appEventRegistry = new AppEventRegistry();

appEventRegistry.registerHandler("API_REQUEST", async (eventConfig, context) => {
  const apiConfig = eventConfig.api;

  if (!apiConfig?.url) {
    return {
      success: false,
      message: eventConfig.errorMessage || "Missing API configuration for event.",
    };
  }

  try {
    const response: any = await firstValueFrom(
      APIRequest({
        method: normalizeMethod(apiConfig.method),
        path: apiConfig.url,
        params: apiConfig.params,
        headers: apiConfig.headers,
        data: context.payload,
        isPrivateApi: true,
      })
    );

    const isSuccess = response?.success !== false;

    return {
      success: isSuccess,
      message: isSuccess
        ? eventConfig.successMessage || `${context.eventName} completed successfully.`
        : eventConfig.errorMessage || `${context.eventName} failed.`,
      data: response,
      error: isSuccess ? undefined : response,
    };
  } catch (error) {
    return {
      success: false,
      message: eventConfig.errorMessage || `${context.eventName} failed.`,
      error,
    };
  }
});

appEventRegistry.registerHandler("NOOP", async (eventConfig, context) => ({
  success: true,
  message: eventConfig.successMessage || `${context.eventName} handled.`,
  data: context.payload,
}));
