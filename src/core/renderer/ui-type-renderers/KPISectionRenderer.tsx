import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, SimpleGrid, HStack, Heading, Badge, Flex } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { WidgetRegistry } from "@/core/registry/WidgetRegistry";
import { GETAPI } from "@/app/api";
import AsyncLoadIcon from "@/core/utils/hooks/AsyncLoadIcon";

import type { SectionRendererProps } from "./types";

/**
 * Utility to interpolate placeholders like {{token}} in string templates
 * using matching values from API response data. Supports flat keys and
 * nested keys inside a standard "kpis" object.
 */
const interpolateString = (template: string, data: any): string => {
  if (!template) return "";
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const trimmedKey = key.trim();
    if (data && data[trimmedKey] !== undefined) {
      return String(data[trimmedKey]);
    }
    if (data && data.kpis && data.kpis[trimmedKey] !== undefined) {
      return String(data.kpis[trimmedKey]);
    }
    return "";
  });
};

const KPISectionRenderer: React.FC<SectionRendererProps> = ({ component, resolveData }) => {
  console.log("Rendering KPISection with component:", component);
  
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch KPI data dynamically if APIS config is present
  useEffect(() => {
    if (!component.APIS || !component.APIS.path) return;

    setLoading(true);
    const subscription = GETAPI({
      path: component.APIS.path,
      isPrivateApi: true,
    }).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          setApiData(res.data);
        }
        setLoading(false);
      },
      error: (err) => {
        console.error("Failed to load KPI metrics via GETAPI:", err);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [component.APIS?.path]);

  // Resolve widget registry key alias to core widget key
  const resolveWidgetKey = (rawWidget?: string) => {
    if (!rawWidget) return "kpi";
    const aliases: Record<string, string> = {
      KPI_CARD: "kpi",
      kpiCard: "kpi",
    };
    return aliases[rawWidget] || rawWidget;
  };

  // Memoize dynamic binding & interpolation mapping to prevent unnecessary recalculations
  const records = useMemo(() => {
    const rawKpis = component.dataSource
      ? resolveData(component.dataSource)
      : (component.KPIS || []);

    if (!apiData) {
      return rawKpis;
    }

    return rawKpis.map((kpi: any) => {
      const interpolatedKpi = {
        ...kpi,
        value: interpolateString(kpi.value, apiData),
        helpText: interpolateString(kpi.helpText, apiData),
      };

      if (Array.isArray(kpi.subKpis)) {
        interpolatedKpi.subKpis = kpi.subKpis.map((sub: any) => ({
          ...sub,
          value: interpolateString(sub.value, apiData),
        }));
      }

      return interpolatedKpi;
    });
  }, [component.dataSource, component.KPIS, resolveData, apiData]);

  // Layout styling variables
  const gridColumns = component.layout?.columns;
  const gridGap = component.layout?.gap || 6;

  return (
    <Box mb={6}>
      {component.title && (
        <Flex
          justify="space-between"
          align={{ base: "start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          mb={6}
          p={4}
          borderRadius="2xl"
          bg={"app.card.bg"}
          border="1px solid"
          borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
          backdropFilter="blur(8px)"
        >
          <HStack align="center" gap={3}>
            {component.icon && (
              <Flex
                align="center"
                justify="center"
                w="40px"
                h="40px"
                borderRadius="xl"
                bg={useColorModeValue("blue.50", "rgba(59, 130, 246, 0.1)")}
                border="1px solid"
                borderColor={useColorModeValue("blue.100", "rgba(59, 130, 246, 0.2)")}
                color={useColorModeValue("blue.600", "blue.400")}
                flexShrink={0}
              >
                <AsyncLoadIcon iconName={component.icon} size={20} boxSize="5" />
              </Flex>
            )}
            {!component.icon && (
              <Box
                w="4px"
                h="32px"
                borderRadius="full"
                bgGradient="linear(to-b, blue.500, purple.500)"
              />
            )}
            <Box>
              <Heading
                size="md"
                fontWeight="900"
                letterSpacing="tight"
                color="app.text.primary"
              >
                {component.title}
              </Heading>
              {component.description && (
                <Text mt={0.5} fontSize="xs" color="gray.500" fontWeight="500">
                  {component.description}
                </Text>
              )}
            </Box>
          </HStack>

          <Badge
            variant="subtle"
            colorPalette={loading ? "blue" : "green"}
            size="sm"
            borderRadius="full"
            px={3}
            py={1}
            display="flex"
            alignItems="center"
            gap={2}
            fontWeight="700"
            letterSpacing="wider"
            fontSize="2xs"
            textTransform="uppercase"
            boxShadow="sm"
            bg={useColorModeValue("green.50/80", "rgba(16, 185, 129, 0.1)")}
            color={useColorModeValue("green.700", "green.400")}
            border="1px solid"
            borderColor={useColorModeValue("green.200/40", "rgba(16, 185, 129, 0.2)")}
          >
            <Box
              w="6px"
              h="6px"
              borderRadius="full"
              bg={loading ? "blue.500" : "green.500"}
              css={{
                animation: "pulse-glow 2s infinite ease-in-out",
                "@keyframes pulse-glow": {
                  "0%": { transform: "scale(0.8)", opacity: 0.5 },
                  "50%": { transform: "scale(1.2)", opacity: 1 },
                  "100%": { transform: "scale(0.8)", opacity: 0.5 },
                }
              }}
            />
            {loading ? "Syncing" : "Live"}
          </Badge>
        </Flex>
      )}
      <SimpleGrid columns={gridColumns} gap={gridGap}>
        {records.map((item: any, index: number) => {
          const widgetKey = resolveWidgetKey(item?.widget);
          const WidgetComponent = WidgetRegistry.get(widgetKey);
          if (WidgetComponent) {
            return (
              <WidgetComponent
                key={`${component.id || "kpi-sec"}-${index}`}
                {...item}
                loading={loading}
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
