import { ComponentType } from "react";

// Define the type for a lazy-loaded component
type LazyComponent = () => Promise<{ default: ComponentType<any> }>;

// Define the type for AdminModules, which can hold multiple LazyComponents
interface nestedLazyComponent {
    [key: string]: LazyComponent;
}

// Define the main componentConfig type
interface ComponentConfig {
    [key: string]: LazyComponent | nestedLazyComponent;
}

// Define the componentConfig object
const componentConfig: ComponentConfig = {
    "AdminModules": {
        layout: () => import("@/features/ui/layouts/workspace"),
        home: () => import("@/features/modules/admin/AdminView"),
        DatabaseStatistics: () => import("@/features/modules/admin/DatabaseStatisticsView"),
    },
    "myGym": {
        layout: () => import("@/features/ui/layouts/workspace"),
        GymView: () => import("@/features/modules/gym/GymView"),
        AddMember: () => import("@/features/modules/gym/AddMember"),
        Subscription: () => import("@/features/modules/gym/Subscription"),
        ListMember: () => import("@/features/modules/gym/Members")
    },
    "Default": {
        layout: () => import("@/features/ui/layouts/workspace"),
        myApps: () => import("@/features/myApps/MyApps"),
        pageNotFound: () => import("@/pages/NoPageFound"),
    }
    // Add more mappings as needed
};

export default componentConfig;
