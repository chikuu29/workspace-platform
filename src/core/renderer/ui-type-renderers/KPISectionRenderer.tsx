import React from "react";
import { Box, Text, SimpleGrid, HStack, Heading } from "@chakra-ui/react";
import { WidgetRegistry } from "@/core/registry/WidgetRegistry";

import type { SectionRendererProps } from "./types";


const KPISectionRenderer: React.FC<SectionRendererProps> = ({ component, resolveData }) => {
  console.log("Rendering KPISection with component:", component);
  console.log("Data source:", resolveData);

  const records = component.dataSource ? resolveData(component.dataSource) : (component.KPIS || []);
  const columns = component.uiConfig?.columns || { base: 1, md: 2, lg: 3 };

  const resolveWidgetKey = (rawWidget?: string) => {
    if (!rawWidget) return "kpi";
    const aliases: Record<string, string> = {
      KPI_CARD: "kpi",
      kpiCard: "kpi",
    };
    return aliases[rawWidget] || rawWidget;
  };
  

  return (
    <Box {...(component.layout || {})}>
      {component.title && (
        <HStack align="start" gap={3} mb={4}>
          <Box w="3px" h="42px" borderRadius="full" bg="blue.500" />
          <Box>
            <Heading size="md" fontWeight="900" letterSpacing="tight">
              {component.title}
            </Heading>
            {component.description && (
              <Text mt={1} fontSize="sm" color="gray.500">
                {component.description}
              </Text>
            )}
          </Box>
        </HStack>
      )}
      <SimpleGrid columns={columns} gap={component.uiConfig?.gap || 6}>
        {records.map((item: any, index: number) => {
          const widgetKey = resolveWidgetKey(item?.widget);
          const WidgetComponent = WidgetRegistry.get(widgetKey);
          if (WidgetComponent) {
            return (
              <WidgetComponent
                key={`${component.id}-${index}`}
                {...item}
              />
            );
          }

          return null;
        })}
      </SimpleGrid>
    </Box>
  );
};

export default React.memo(KPISectionRenderer);
