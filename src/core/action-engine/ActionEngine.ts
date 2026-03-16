import * as dynamicFunctions from "@/script/myAppsScript";
import type {
    NavigationAction,
    ActionExecutionContext,
    ActionHandler,
    RouteAction,
    ModalAction,
    ExternalAction,
    CallbackAction,
} from "./types";

/**
 * ActionEngine
 *
 * Strategy-pattern executor for navigation actions.
 * Each action type maps to a pure handler function.
 * Adding a new type = add a handler + a union member in types.ts.
 *
 * @module core/action-engine/ActionEngine
 */

// ─── Path Builder ────────────────────────────────────────────────────

/** Builds an organization-scoped workspace path */
const buildWorkspacePath = (path: string, organizationName: string): string => {
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `/${organizationName}/workspace/${cleanPath}`;
};

// ─── Individual Handlers ─────────────────────────────────────────────

const handleRoute: ActionHandler = (action, ctx) => {
    const { path } = action as RouteAction;
    const fullPath = buildWorkspacePath(path, ctx.organizationName);
    ctx.navigate(fullPath);
};

const handleModal: ActionHandler = (action, ctx) => {
    const { templateName, appName, config } = action as ModalAction;
    ctx.openModal({ templateName, appName, config });
};

const handleExternal: ActionHandler = (action) => {
    const { url, target } = action as ExternalAction;
    window.open(url, target ?? "_blank", "noopener,noreferrer");
};

const handleCallback: ActionHandler = (action, ctx) => {
    const { handler } = action as CallbackAction;
    const fn = (dynamicFunctions as Record<string, Function>)[handler];
    if (typeof fn === "function") {
        fn(ctx.menuConfig);
    }
};

// ─── Handler Registry ────────────────────────────────────────────────

const handlers: Record<string, ActionHandler> = {
    route: handleRoute,
    modal: handleModal,
    drawer: handleModal, // Drawer reuses modal store for now; extend later
    external: handleExternal,
    callback: handleCallback,
};

// ─── Public API ──────────────────────────────────────────────────────

export const ActionEngine = {
    /**
     * Executes a navigation action using the strategy pattern.
     * Falls through gracefully if the action type is unknown.
     */
    execute: (action: NavigationAction, context: ActionExecutionContext): void => {
        const handler = handlers[action.type];
        if (handler) {
            handler(action, context);
        } else {
            console.warn(`[ActionEngine] Unknown action type: "${action.type}"`);
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
