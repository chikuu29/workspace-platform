import React, { useMemo } from "react";
import { Box } from "@chakra-ui/react";
import DataTable from "@/core/widgets/DataTable";
import type { SectionRendererProps } from "./types";

const DEFAULT_TABLE_DATA = [
  { id: "M001", name: "John Doe", plan: "Annual Platinum", trainer: "Alex", status: "Active", lastVisit: "2 hours ago" },
  { id: "M002", name: "Jane Smith", plan: "Monthly Basic", trainer: "Sarah", status: "Active", lastVisit: "5 hours ago" }
];

const toLegacyActions = (events?: Record<string, any>) => {
  if (!events) return [];
  return Object.entries(events).map(([eventKey, config]) => ({
    label: eventKey.split("_").join(" "),
    onClick: (row: any) => {
      console.log(`[Table Event] ${eventKey}`, { row, config });
    },
    requiresConfirm: Boolean(config?.requiresConfirm),
    confirmMessage: config?.confirmMessage,
    isDanger: eventKey.toLowerCase().includes("delete"),
  }));
};

const TableSectionRenderer: React.FC<SectionRendererProps> = ({ component, resolveData, resolveActions, fallbackTableColumns }) => {
  console.log("Rendering TableSection with component:", component);
  
  const apiConfig = useMemo(() => {
    return component.TABLES?.APIS?.loadData;
  }, [component.TABLES]);

  const rows = useMemo(() => {
    if (component.dataSource) return resolveData(component.dataSource);
    return component.TABLES?.data?.length ? component.TABLES.data : undefined;
  }, [component.dataSource, component.TABLES?.data, resolveData]);

  const columns = component.uiConfig?.columns || component.TABLES?.SETTINGS?.columns || fallbackTableColumns || [];
  const actions = component.actionRef
    ? resolveActions(component.actionRef, component.id)
    : toLegacyActions(component.TABLES?.events);

  return (
    <Box {...(component.layout || {})}>
      <DataTable
        title={component.uiConfig?.tableTitle || component.title || "Data Table"}
        data={rows}
        apiConfig={apiConfig}
        columns={columns as any}
        actions={actions}
        initialState={component.uiConfig?.initialState || {
          page: 1,
          pageSize: component.TABLES?.SETTINGS?.pagination?.pageSize || 10,
          searchQuery: "",
          sortBy: null,
          sortOrder: null,
          filters: {},
        }}
      />
    </Box>
  );
};

export default React.memo(TableSectionRenderer);
