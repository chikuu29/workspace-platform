import React from "react";
import {
  Badge,
  Box,
  Flex,
  Grid,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { DataTableAction } from "@/core/widgets/DataTable/types";
import UITypeRenderEntry from "@/core/renderer/UITypeRenderEntry";
import type { DashboardActionConfig, DashboardComponentConfig, DashboardDataSource, DashboardPageConfig } from "@/core/renderer/ui-type-renderers/types";

type GridViewConfig = DashboardPageConfig & {
  UI_TYPE?: { title?: string; layoutStyles?: Record<string, any> };
};

const GridView: React.FC<{ config: GridViewConfig }> = ({ config }) => {
  const blocks = config.UI_VIEW?.schema?.grids || config.UI_VIEW?.schema?.components || config.components || [];
  const gridLayoutStyles = config.UI_TYPE?.layoutStyles || {};

  const resolveData = (dataSourceKey?: string): any[] => {
    if (!dataSourceKey) return [];
    const source: DashboardDataSource | undefined = config.dataSource?.[dataSourceKey];
    if (!source) return [];
    if (source.type === "inline") return source.data || [];
    return source.fallbackData || [];
  };

  const resolveActions = (actionRef?: string, sectionId?: string): DataTableAction<any>[] => {
    const actions: DashboardActionConfig[] = actionRef ? config.actions?.[actionRef] || [] : [];

    return actions.map((action) => ({
      label: action.label,
      icon: action.icon,
      colorPalette: action.colorPalette,
      isDanger: action.isDanger,
      requiresConfirm: action.requiresConfirm,
      confirmMessage: action.confirmMessage,
      onClick: (row: any) => {
        const event = action.event || action.label;
        console.log(`[UI Action] ${event}`, { row, sectionId });
      },
    }));
  };

  return (
    <VStack gap={10} align="stretch" w="100%" p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
      <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={4}>
        <VStack align="start" gap={1}>
          <Heading size="xl" fontWeight="900" letterSpacing="tight">
            {config.title || config.UI_TYPE?.title || "Gym Dashboard"}
          </Heading>
          {config.appMeta && (
            <HStack gap={3}>
              {config.appMeta.version && <Badge variant="solid" colorPalette="blue" size="sm">v{config.appMeta.version}</Badge>}
              {config.appMeta.owner && <Text fontSize="xs" fontWeight="600" color="gray.500">System Owner: {config.appMeta.owner}</Text>}
            </HStack>
          )}
        </VStack>
      </Flex>

      <Grid templateColumns="repeat(1, 1fr)" gap="6" {...gridLayoutStyles}>
        {blocks.map((block, index) => {
          const normalizedBlock: DashboardComponentConfig = {
            ...block,
            id: block.id || `grid-${index}`,
            layout: block.layout || { gridColumn: "1 / -1" },
          };

          return (
            <UITypeRenderEntry
              key={normalizedBlock.id}
              component={normalizedBlock}
              pageConfig={config}
              resolveData={resolveData}
              resolveActions={resolveActions}
            />
          );
        })}
      </Grid>
    </VStack>
  );
};

export default React.memo(GridView);
