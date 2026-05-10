/**
 * GymRoutes.ts
 *
 * Centralized routing logic for the Gym module to ensure consistency across components.
 */

export const GymRoutes = {
    /** Root gym module path */
    root: (prefix: string, appCode?: string) => 
        appCode ? `${prefix}/app/${appCode}` : `${prefix}/gym`,

    /** Members list */
    members: (prefix: string, appCode?: string) => 
        `${GymRoutes.root(prefix, appCode)}/members`,

    /** Member details cockpit */
    memberDetail: (prefix: string, memberId: string, appCode?: string) => 
        `${GymRoutes.root(prefix, appCode)}/members/${memberId}`,

    /** Plan selection / Assignment page */
    selectPlan: (prefix: string, memberId: string, appCode?: string) => 
        `${GymRoutes.root(prefix, appCode)}/selectPlan/${memberId}`,

    /** Subscription dashboard / Hub */
    subscriptionHub: (prefix: string, appCode?: string) => 
        `${GymRoutes.root(prefix, appCode)}/Subscription`,

    /** Manage plans (Admin) */
    managePlans: (prefix: string, appCode?: string) => 
        `${GymRoutes.root(prefix, appCode)}/SubscriptionPlans`,
};
