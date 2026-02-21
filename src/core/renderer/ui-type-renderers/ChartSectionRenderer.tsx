import React, { lazy, Suspense, useMemo } from "react";
import { Box, Skeleton, Text, VStack } from "@chakra-ui/react";
import type { SectionRendererProps } from "./types";

const CHART_COMPONENT_REGISTRY: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
  RevenuAnalytics: () => import("@/features/modules/gym/RevenuAnalytics")
};

const AnalyticsLoader = ({ componentKey }: { componentKey: string }) => {
  const Component = useMemo(() => {
    const factory = CHART_COMPONENT_REGISTRY[componentKey];
    return factory ? lazy(factory) : null;
  }, [componentKey]);

  if (!Component) {
    return (
      <Box p={6} border="1px dashed" borderColor="gray.200" borderRadius="xl">
        <Text fontSize="sm" color="gray.500">Chart component '{componentKey}' is not registered.</Text>
      </Box>
    );
  }

  return (
    <Suspense fallback={<Skeleton height="300px" borderRadius="xl" />}>
      <Component />
    </Suspense>
  );
};

const ChartSectionRenderer: React.FC<SectionRendererProps> = ({ component }) => {
  const charts = component.uiConfig?.charts || [];

  return (
    <Box {...(component.layout || {})}>
      {component.title && <Text fontSize="lg" fontWeight="800" mb={4}>{component.title}</Text>}
      <VStack align="stretch" gap={4}>
        {charts.map((chart: any) => (
          <AnalyticsLoader key={chart.id || chart.componentKey} componentKey={chart.componentKey || chart.id} />
        ))}
      </VStack>
    </Box>
  );
};

export default React.memo(ChartSectionRenderer);
