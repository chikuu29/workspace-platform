import type { AppModuleConfig } from "@/core/registry/AppRegistry";

export const registry: AppModuleConfig = {
    layout: () => import("@/theme/layouts/workspace"),
    home: () => import("./PlatformView"),
    DatabaseStatistics: {
        component: () => import("./DatabaseStatisticsView"),
        permissions: "SYSTEM.ADMINISTRATOR.*",
    },
    ApplicationClients: {
        component: () => import("./OAuthView"),
        permissions: "SYSTEM.ADMINISTRATOR.*",
    },
    AuthUsers: () => import("./AuthUser"),
    Organizations: {
        component: () => import("./OrganizationView"),
        permissions: "SYSTEM.ADMINISTRATOR.*",
    },
    accesscontrol: {
        component: () => import("./AccessControlView"),
        permissions: "SYSTEM.ADMINISTRATOR.*",
    },
    SaasApps: {
        component: () => import("./SaasAppsView"),
        permissions: "SYSTEM.ADMINISTRATOR.*",
    },
    Features: {
        component: () => import("./FeaturesView"),
        permissions: "SYSTEM.ADMINISTRATOR.*",
    },
    Permissions: {
        component: () => import("./PermissionsView"),
        permissions: "SYSTEM.ADMINISTRATOR.*",
    },
    SubscriptionPlans: {
        component: () => import("./SubscriptionPlansView"),
        permissions: "SYSTEM.ADMINISTRATOR.*",
    },
    OrganizationRoles: {
        component: () => import("./OrganizationRolesView")
    },
    OrganizationUsers: {
        component: () => import("./OrganizationUsersView")
    },
    OrganizationAccess: () => import("./OrganizationAccessView"),
    PolicyManagement: {
        component: () => import("./PolicyManagementView")
    },
};
