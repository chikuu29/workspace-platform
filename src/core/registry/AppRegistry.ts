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
type LazyImportFn = () => Promise<{ default: ComponentType<any> }>;

/** Config for a single app — maps view names to lazy import functions */
interface AppModuleConfig {
    [viewName: string]: LazyImportFn;
}

/** Top-level registry shape — maps app names to module configs */
interface RegistryConfig {
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
    AdminModules: {
        layout: () => import("@/theme/layouts/workspace"),
        home: () => import("@/features/modules/admin/AdminView"),
        DatabaseStatistics: () => import("@/features/modules/admin/DatabaseStatisticsView"),
    },
    myGym: {
        layout: () => import("@/theme/layouts/workspace"),
        home: () => import("@/features/modules/gym/GymView"),
        Subscription: () => import("@/features/modules/gym/Subscription"),
        ListMember: () => import("@/features/modules/gym/Members"),
    },
    Default: {
        workspacePage: () => import("@/core/WorkspacePage"),
        layout: () => import("@/theme/layouts/workspace"),
        myApps: () => import("@/features/myApps/MyApps"),
        pageNotFound: () => import("@/pages/NoPageFound"),
    },
};

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

export const AppRegistry = {
    /**
     * Resolve a view component for a given app and view name.
     * Falls back to "Default" config if the app has no entry.
     * Returns null if the view doesn't exist in either config.
     */
    resolveView(
        appName: string,
        viewName: string
    ): LazyExoticComponent<ComponentType<any>> | null {
        // Try app-specific config first
        const appConfig = registry[appName];
        if (appConfig && viewName in appConfig) {
            return getCachedLazy(`${appName}::${viewName}`, appConfig[viewName]);
        }

        // Fallback to Default config
        const defaultConfig = registry["Default"];
        if (defaultConfig && viewName in defaultConfig) {
            return getCachedLazy(`Default::${viewName}`, defaultConfig[viewName]);
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
        return this.resolveView(appName, "layout");
    },

    /**
     * Resolve the WorkspacePage fallback component.
     * Used when no specific component matches the route.
     */
    resolveWorkspacePage(): LazyExoticComponent<ComponentType<any>> | null {
        return this.resolveView("Default", "workspacePage");
    },

    /**
     * Check if an app has a registered config.
     */
    hasApp(appName: string): boolean {
        return appName in registry;
    },

    /**
     * Register a new app module config at runtime.
     * Useful for dynamically loaded tenant modules.
     */
    registerApp(appName: string, config: AppModuleConfig): void {
        registry[appName] = config;
    },

    /**
     * Get all registered app names (debugging / dev tools).
     */
    getRegisteredApps(): string[] {
        return Object.keys(registry);
    },
} as const;
