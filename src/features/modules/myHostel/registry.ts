import type { AppModuleConfig } from "@/core/registry/AppRegistry";

export const registry: AppModuleConfig = {
    layout: () => import("@/theme/layouts/workspace"),
    portfolio: () => import("./MultiBuildingHostelPortfolio"),
    building: () => import("./BuildingDetailPage"),
};
