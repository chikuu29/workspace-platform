import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/**
 * AppRegistry
 *
 * Centralized registry for lazy-loaded app modules.
 * Replaces the old componentConfig with a proper caching layer
 * and type-safe resolution API.
 *
 * NOTE: This is separate from core/registry/ViewRegistry which
 * handles view-type component registration (SectionView, FormView).
 * AppRegistry handles app → module → lazy component resolution.
 *
 * @module core/registry/AppRegistry
 */

// ─── Types ───────────────────────────────────────────────────────────

/** Factory function that returns a dynamic import promise */
export type LazyImportFn = () => Promise<{ default: ComponentType<any> }>;

/** 
 * Optional config to attach PBAC permissions to a specific view route.
 * 
 * To require multiple permissions:
 * - Use an array: `permissions: ["ACCOUNT.ROLES.READ", "ACCOUNT.USERS.READ"]`
 * - Set `requireAll: true` (AND logic) if they need EVERY permission in the array.
 * - Set `requireAll: false` (OR logic, default) if they only need ANY ONE of them.
 */
export interface AppViewConfig {
    component: LazyImportFn;
    permissions?: string | string[];
    requireAll?: boolean;
}

/** Config for a single app — maps view names to lazy imports or complex configs */
export interface AppModuleConfig {
    [viewName: string]: LazyImportFn | AppViewConfig;
}

/** Top-level registry shape — maps app names to module configs */
export interface RegistryConfig {
    [appName: string]: AppModuleConfig;
}

// ─── Internal State ──────────────────────────────────────────────────

/**
 * Stable cache for lazy components.
 * Key format: "appName::viewName"
 * Once a lazy component is created, it's reused forever — prevents
 * React from unmounting and remounting on re-renders.
 */
const lazyCache = new Map<string, LazyExoticComponent<ComponentType<any>>>();

/** Mutable registry — seeded with defaults, extensible at runtime */
const registry: RegistryConfig = {
    Default: {
        workspacePage: () => import("@/core/WorkspacePage"),
        layout: () => import("@/theme/layouts/workspace"),
        myApps: () => import("@/features/myApps/MyApps"),
        pageNotFound: () => import("@/pages/NoPageFound"),
    },
};

// ─── Eager Load Local Module Registries ──────────────────────────────

const localRegistries = import.meta.glob("../../features/modules/*/registry.ts", { eager: true });

const initLocalRegistries = () => {
    for (const path in localRegistries) {
        const match = path.match(/\/features\/modules\/([^/]+)\/registry\.ts$/);
        if (match) {
            const [, appName] = match;
            const moduleExport = localRegistries[path] as { registry?: AppModuleConfig };
            if (moduleExport && moduleExport.registry) {
                registry[appName] = moduleExport.registry;
            }
        }
    }
};

initLocalRegistries();

// ─── Auto-Discovery Glob Routing ────────────────────────────────────

const directViews = import.meta.glob("../../features/modules/*/*.tsx");
const indexViews = import.meta.glob("../../features/modules/*/*/index.tsx");

const dynamicRegistry = new Map<string, LazyImportFn>();

// Initialize dynamic registry for unconfigured views
const initDynamicRegistry = () => {
    // 1. Process direct views (*.tsx directly inside module directory)
    for (const path in directViews) {
        const match = path.match(/\/features\/modules\/([^/]+)\/([^/]+)\.tsx$/);
        if (match) {
            const [, app, view] = match;
            const key = `${app.toLowerCase()}::${view.toLowerCase()}`;
            dynamicRegistry.set(key, directViews[path] as LazyImportFn);
        }
    }

    // 2. Process index views (index.tsx inside a subfolder under module directory)
    for (const path in indexViews) {
        const match = path.match(/\/features\/modules\/([^/]+)\/([^/]+)\/index\.tsx$/);
        if (match) {
            const [, app, view] = match;
            const key = `${app.toLowerCase()}::${view.toLowerCase()}`;
            dynamicRegistry.set(key, indexViews[path] as LazyImportFn);
        }
    }
};

initDynamicRegistry();

// ─── Cache Helper ────────────────────────────────────────────────────

/**
 * Returns a cached lazy component for the given key and import function.
 * Creates the lazy wrapper only once per unique key.
 */
const getCachedLazy = (
    cacheKey: string,
    importFn: LazyImportFn
): LazyExoticComponent<ComponentType<any>> => {
    const cached = lazyCache.get(cacheKey);
    if (cached) return cached;

    const component = lazy(importFn);
    lazyCache.set(cacheKey, component);
    return component;
};

// ─── Public API ──────────────────────────────────────────────────────

export interface ResolvedAppView {
    component: LazyExoticComponent<ComponentType<any>>;
    permissions?: string | string[];
    requireAll?: boolean;
}

export const AppRegistry = {
    /**
     * Resolve a view component for a given app and view name.
     * Returns an object containing the cached component and any required permissions.
     * Falls back to "Default" config if the app has no entry.
     * Returns null if the view doesn't exist in either config.
     */
    resolveView(
        appName: string,
        viewName: string
    ): ResolvedAppView | null {
        // 1. Try app-specific configuration first (now populated by local modules)
        const appConfig = registry[appName];
        if (appConfig && viewName in appConfig) {
            const entry = appConfig[viewName];
            if (typeof entry === "function") {
                return { component: getCachedLazy(`${appName}::${viewName}`, entry as LazyImportFn) };
            }
            return {
                component: getCachedLazy(`${appName}::${viewName}`, entry.component),
                permissions: entry.permissions,
                requireAll: entry.requireAll,
            };
        }

        // 2. Try auto-discovery glob registry for zero-config fallback
        const lookupKey = `${appName.toLowerCase()}::${viewName.toLowerCase()}`;
        const autoImport = dynamicRegistry.get(lookupKey);
        if (autoImport) {
            return { component: getCachedLazy(`${appName}::${viewName}`, autoImport) };
        }

        // 3. Fallback to Default config
        const defaultConfig = registry["Default"];
        if (defaultConfig && viewName in defaultConfig) {
            const entry = defaultConfig[viewName];
            if (typeof entry === "function") {
                return { component: getCachedLazy(`Default::${viewName}`, entry as LazyImportFn) };
            }
            return {
                component: getCachedLazy(`Default::${viewName}`, entry.component),
                permissions: entry.permissions,
                requireAll: entry.requireAll,
            };
        }

        return null;
    },

    /**
     * Resolve the layout component for a given app.
     * Falls back to Default layout if the app has no layout entry.
     */
    resolveLayout(
        appName: string
    ): LazyExoticComponent<ComponentType<any>> | null {
        const resolution = this.resolveView(appName, "layout");
        return resolution ? resolution.component : null;
    },

    /**
     * Resolve the WorkspacePage fallback component.
     * Used when no specific component matches the route.
     */
    resolveWorkspacePage(): LazyExoticComponent<ComponentType<any>> | null {
        const resolution = this.resolveView("Default", "workspacePage");
        return resolution ? resolution.component : null;
    },

    /**
     * Check if an app has a registered config.
     */
    hasApp(appName: string): boolean {
        return appName in registry || Array.from(dynamicRegistry.keys()).some(k => k.startsWith(`${appName.toLowerCase()}::`));
    },

    /**
     * Register a new app module config at runtime.
     * Useful for dynamically loaded organization modules.
     */
    registerApp(appName: string, config: AppModuleConfig): void {
        registry[appName] = config;
    },

    /**
     * Get all registered app names (debugging / dev tools).
     */
    getRegisteredApps(): string[] {
        const explicitApps = Object.keys(registry);
        const dynamicApps = Array.from(dynamicRegistry.keys()).map(k => k.split("::")[0]);
        return Array.from(new Set([...explicitApps, ...dynamicApps]));
    },
} as const;
