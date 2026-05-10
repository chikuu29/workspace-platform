import * as dynamicFunctions from "@/script/myAppsScript";
import type {
    AppAction,
    ActionExecutionContext,
    ActionHandler,
    RouteAction,
    ModalAction,
    ExternalAction,
    CallbackAction,
    ApiCallAction,
} from "./types";
import { firstValueFrom } from "rxjs";
import { APIRequest } from "@/app/api";
import { useApiResponseModalStore } from "@/core/store/useApiResponseModalStore";
import { buildApiResponseAlert } from "@/core/utils/apiResponseAlert";
import { buildWorkspacePath } from "@/core/utils/pathBuilder";

/**
 * ActionEngine
 *
 * Strategy-pattern executor for navigation actions.
 * Each action type maps to a pure handler function.
 * Adding a new type = add a handler + a union member in types.ts.
 *
 * @module core/action-engine/ActionEngine
 */

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Replaces placeholders like {{key}} in a string with matching values from the data object.
 * @param str The string containing placeholders.
 * @param data The object containing values to substitute.
 * @returns The interpolated string.
 */
const interpolate = (str: string, data: any) => {
    return str.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();

        // 1. Check for exact matching first (supports direct keys and keys with literal dots)
        if (data[trimmedKey] !== undefined) {
            return String(data[trimmedKey]);
        }

        // 2. Fallback to nested dot-notation paths
        const parts = trimmedKey.split('.');
        let val = data;
        for (const part of parts) {
            if (val === null || val === undefined) {
                val = undefined;
                break;
            }
            val = val[part];
        }
        return val !== undefined ? String(val) : match;
    });
};

/**
 * Recursively traverses an object, array, or string and performs string interpolation
 * on all string values. Useful for updating dynamic configuration objects (like actions)
 * with real-time data from API responses or form payloads.
 * 
 * @param obj The configuration object, array, or string to interpolate.
 * @param data The reference data source containing key-value pairs.
 * @returns A new object/array/string with interpolated values.
 */
const deepInterpolate = (obj: any, data: any): any => {
    if (typeof obj === 'string') return interpolate(obj, data);
    if (Array.isArray(obj)) return obj.map(item => deepInterpolate(item, data));
    if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const [k, v] of Object.entries(obj)) {
            newObj[k] = deepInterpolate(v, data);
        }
        return newObj;
    }
    return obj;
};

// ─── Path Builder ────────────────────────────────────────────────────
// buildWorkspacePath is now imported from @/core/utils/pathBuilder
// (shared across ActionEngine, useWorkspaceRouter, MenuLink)


// ─── Individual Handlers ─────────────────────────────────────────────

const handleRoute: ActionHandler = async (action, ctx) => {
    const { path } = action as RouteAction;
    // Interpret path in case there are template literals waiting to be replaced
    // We combine ctx.payload and ctx.response into interpolation scope
    const interpolationData = { ...ctx.payload, ...(ctx.response || {}) };
    console.log(ctx);

    console.log("interpolationData2", interpolationData);
    const interpolatedPath = deepInterpolate(path, interpolationData);
    console.log("interpolatedPath2", interpolatedPath);
    const fullPath = buildWorkspacePath(interpolatedPath, ctx.organizationName);
    ctx.navigate(fullPath);
};

const handleModal: ActionHandler = async (action, ctx) => {
    const { templateName, appName, config } = action as ModalAction;
    ctx.openModal({ templateName, appName, config });
};

const handleExternal: ActionHandler = async (action) => {
    const { url, target } = action as ExternalAction;
    window.open(url, target ?? "_blank", "noopener,noreferrer");
};

const handleCallback: ActionHandler = async (action, ctx) => {
    const { handler } = action as CallbackAction;
    const fn = (dynamicFunctions as Record<string, Function>)[handler];
    if (typeof fn === "function") {
        await fn(ctx.menuConfig, ctx);
    }
};

const handleApiCall: ActionHandler = async (action, ctx) => {
    const apiAction = action as ApiCallAction;
    const { url, method, params, headers, successMessage, errorMessage, laterActions } = apiAction;

    try {
        const response: any = await firstValueFrom(
            APIRequest({
                method: (method as any) || "POST",
                path: url,
                params,
                headers,
                data: ctx.payload,
                isPrivateApi: true,
            })
        );
        console.log("API_CALL action response:", response);
        const isSuccess = response?.success !== false;

        const modalConfig = buildApiResponseAlert({
            success: isSuccess,
            message: isSuccess ? (successMessage || 'Operation successful') : (errorMessage || 'Operation failed'),
            data: response,
            error: isSuccess ? undefined : response
        }, {
            successMessage,
            errorMessage
        });

        useApiResponseModalStore.getState().openModal(modalConfig);

        if (isSuccess && laterActions) {
            // response.data holds the created resource payload
            const interpolationData = { ...ctx.payload, ...(response?.data || response?.result || response) };
            console.log("interpolationData", interpolationData);
            const nextAction = deepInterpolate(laterActions, interpolationData);
            console.log("nextAction", nextAction);
            // Execute the next action(s) sequentially
            await ActionEngine.execute(nextAction, { ...ctx, response: response?.data || response?.result });
        }

    } catch (error) {
        console.error("API_CALL action failed:", error);
        const modalConfig = buildApiResponseAlert({
            success: false,
            message: errorMessage || 'Operation failed',
            error
        }, { errorMessage });

        useApiResponseModalStore.getState().openModal(modalConfig);
    }
};

// ─── Handler Registry ────────────────────────────────────────────────

const handlers: Record<string, ActionHandler> = {
    route: handleRoute,
    NAVIGATION: handleRoute, // Alias for route
    modal: handleModal,
    drawer: handleModal, // Drawer reuses modal store for now; extend later
    external: handleExternal,
    callback: handleCallback,
    API_CALL: handleApiCall,
};

// ─── Public API ──────────────────────────────────────────────────────

export const ActionEngine = {
    /**
     * Executes a navigation action using the strategy pattern.
     * Falls through gracefully if the action type is unknown.
     * Can also execute an array of actions sequentially.
     */
    execute: async (action: AppAction | AppAction[], context: ActionExecutionContext): Promise<void> => {
        if (Array.isArray(action)) {
            for (const singleAction of action) {
                await ActionEngine.execute(singleAction, context);
            }
            return;
        }

        const handler = handlers[action.type];
        if (handler) {
            await handler(action, context);
        } else {
            console.warn(`[ActionEngine] Unknown action type: "${(action as any).type}"`);
        }
    },

    /**
     * Register a custom action handler at runtime.
     * Enables plugins/extensions without modifying engine source.
     */
    registerHandler: (type: string, handler: ActionHandler): void => {
        handlers[type] = handler;
    },
};
