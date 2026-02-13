import  { ComponentType } from "react";
import { Subscription } from "rxjs";

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
        AdminModule: () => import("./views/modules/admin/AdminView"),
        DatabaseStatistics: () => import("./views/modules/admin/DatabaseStatisticsView"),
    },
    "myGym": {
        GymView: () => import("./views/modules/gym/GymView"),
        AddMember: () => import("./views/modules/gym/AddMember"),
        Subscription: () => import("./views/modules/gym/Subscription"),
        ListMember: () => import("./views/modules/gym/Members")
    },
    "Default": {
        myApps: () => import("./views/myApps/MyApps"),
        pageNotFound: () => import("./pages/NoPageFound"),
    }
    // Add more mappings as needed
};

export default componentConfig;
