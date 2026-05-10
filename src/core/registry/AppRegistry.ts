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

/** 
 * Optional config to attach PBAC permissions to a specific view route.
 * 
 * To require multiple permissions:
 * - Use an array: `permissions: ["ACCOUNT.ROLES.READ", "ACCOUNT.USERS.READ"]`
 * - Set `requireAll: true` (AND logic) if they need EVERY permission in the array.
 * - Set `requireAll: false` (OR logic, default) if they only need ANY ONE of them.
 */
interface AppViewConfig {
    component: LazyImportFn;
    permissions?: string | string[];
    requireAll?: boolean;
}

/** Config for a single app — maps view names to lazy imports or complex configs */
interface AppModuleConfig {
    [viewName: string]: LazyImportFn | AppViewConfig;
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
    system: {
        layout: () => import("@/theme/layouts/workspace"),
        home: () => import("@/features/modules/system/PlatformView"),
        DatabaseStatistics: {
            component: () => import("@/features/modules/system/DatabaseStatisticsView"),
            permissions: "SYSTEM_ADMINISTRATOR.SYSTEM.*",
        },
        ApplicationClients: {
            component: () => import("@/features/modules/system/OAuthView"),
            permissions: "SYSTEM_ADMINISTRATOR.SYSTEM.*",
        },
        AuthUsers: () => import("@/features/modules/system/AuthUser"),
        Organizations: {
            component: () => import("@/features/modules/system/OrganizationView"),
            permissions: "SYSTEM_ADMINISTRATOR.SYSTEM.*",
        },
        accesscontrol: {
            component: () => import("@/features/modules/system/AccessControlView"),
            permissions: "SYSTEM_ADMINISTRATOR.SYSTEM.*",
        },
        SaasApps: {
            component: () => import("@/features/modules/system/SaasAppsView"),
            permissions: "SYSTEM_ADMINISTRATOR.SYSTEM.*",
        },
        Features: {
            component: () => import("@/features/modules/system/FeaturesView"),
            permissions: "SYSTEM_ADMINISTRATOR.SYSTEM.*",
        },
        Permissions: {
            component: () => import("@/features/modules/system/PermissionsView"),
            permissions: "SYSTEM_ADMINISTRATOR.SYSTEM.*",
        },
        SubscriptionPlans: {
            component: () => import("@/features/modules/system/SubscriptionPlansView"),
            permissions: "SYSTEM_ADMINISTRATOR.SYSTEM.*",
        },
        OrganizationRoles: {
            component: () => import("@/features/modules/system/OrganizationRolesView")
        },
        OrganizationUsers: {
            component: () => import("@/features/modules/system/OrganizationUsersView")
        },
        OrganizationAccess: () => import("@/features/modules/system/OrganizationAccessView"),
        PolicyManagement: {
            component: () => import("@/features/modules/system/PolicyManagementView")
        },
    },
    myGym: {
        layout: () => import("@/theme/layouts/workspace"),
        home: () => import("@/features/modules/gym/GymView"),
        // Member management
        members: () => import("@/features/modules/gym/ViewMember"),
        memberDetails: () => import("@/features/modules/gym/MemberDetail"),
        MemberCheckIn: () => import("@/features/modules/gym/MemberCheckIn"),
        // Billing & Subscriptions
        Subscription: () => import("@/features/modules/gym/Subscription"),
        GymSubscriptionPlans: () => import("@/features/modules/gym/GymSubscriptionPlans"),
        AddSubscriptionPlan: () => import("@/features/modules/gym/AddSubscriptionPlan"),
        selectPlan: () => import("@/features/modules/gym/SelectPlan"),
        PaymentsHistory: () => import("@/features/modules/gym/GymComingSoon").then(m => ({ default: m.PaymentsHistory })),
        // Trainers
        trainers: () => import("@/features/modules/gym/TrainersStaff"),
        TrainerProfile: () => import("@/features/modules/gym/TrainerProfile"),
        trainerSchedules: () => import("@/features/modules/gym/GymComingSoon").then(m => ({ default: m.TrainerSchedules })),
        // Classes
        listClasses: () => import("@/features/modules/gym/GymComingSoon").then(m => ({ default: m.ListClasses })),
        addClass: () => import("@/features/modules/gym/GymComingSoon").then(m => ({ default: m.AddClass })),
        classBookings: () => import("@/features/modules/gym/GymComingSoon").then(m => ({ default: m.ClassBookings })),
        // Reports
        revenueReport: () => import("@/features/modules/gym/RevenueReport"),
        attendanceReport: () => import("@/features/modules/gym/AttendanceReport"),
        performanceReport: () => import("@/features/modules/gym/GymComingSoon").then(m => ({ default: m.PerformanceReport })),
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
        // Try app-specific config first
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

        // Fallback to Default config
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
        return appName in registry;
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
        return Object.keys(registry);
    },
} as const;
