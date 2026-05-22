import { DataTableAction, DataTableColumn } from "@/core/widgets/DataTable/types";

export interface DashboardDataSource {
  type: "inline" | "api";
  data?: any[];
  fallbackData?: any[];
  api?: {
    path: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    params?: Record<string, any>;
    body?: Record<string, any>;
  };
}

export interface DashboardActionConfig {
  label: string;
  icon?: string;
  colorPalette?: string;
  isDanger?: boolean;
  requiresConfirm?: boolean;
  confirmMessage?: string;
  event?: string;
}

export interface DashboardComponentConfig {
  id?: string;
  UI_TYPE: string;
  title?: string;
  description?: string;
  layout?: Record<string, any>;
  icon?: string;
  dataSource?: string;
  actionRef?: string;
  uiConfig?: Record<string, any>;
  APIS?: {
    path: string,
    method: "GET",
    key: "loadData"
  }
  KPIS?: any[];
  TABLES?: {
    data?: any[];
    SETTINGS?: {
      columns?: any[];
      filters?: any[];
      pagination?: { enabled?: boolean; pageSize?: number };
    };
    events?: Record<string, any>;
  };
}

export interface DashboardPageConfig {
  title?: string;
  appMeta?: { version?: string; owner?: string;[key: string]: any };
  layout?: { maxW?: string; contentPadding?: Record<string, any>; sectionGap?: number };
  dataSource?: Record<string, DashboardDataSource>;
  actions?: Record<string, DashboardActionConfig[]>;
  components?: DashboardComponentConfig[];
  UI_VIEW?: { schema?: { components?: DashboardComponentConfig[]; grids?: DashboardComponentConfig[] } };
}

export interface SectionRendererProps {
  component: DashboardComponentConfig;
  pageConfig: DashboardPageConfig;
  resolveData: (key?: string) => any[];
  resolveActions: (actionRef?: string, sectionId?: string) => DataTableAction<any>[];
  fallbackTableColumns?: DataTableColumn<any>[];
}
