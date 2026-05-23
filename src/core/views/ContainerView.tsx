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
import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavigate, useParams } from "react-router";
import { useModalStore } from "@/core/store/useModalStore";
import { ActionEngine } from "@/core/action-engine/ActionEngine";
import { DataTableAction } from "@/core/widgets/DataTable/types";
import UITypeRenderEntry from "@/core/renderer/UITypeRenderEntry";
import type {
  DashboardActionConfig,
  DashboardComponentConfig,
  DashboardDataSource,
  DashboardPageConfig,
} from "@/core/renderer/ui-type-renderers/types";
import { BoxSelect } from "lucide-react";

type ContainerViewConfig = DashboardPageConfig & {
  UI_TYPE?: {
    title?: string;
    layoutStyles?: Record<string, any>;
    target?: string;
  };
};

const ContainerView: React.FC<{ config: any }> = ({ config }) => {
  const navigate = useNavigate();
  const { organization_name } = useParams();
  const openModal = useModalStore((s) => s.openModal);

  const orgName = organization_name || "GHOST_ORG";

  const { layoutStyles = {} } = config.UI_TYPE || {};
  const targetKey: string =
    config.UI_TYPE?.target || "UI_VIEW.schema.components";
  console.log("Target Key:", targetKey);
  console.log("ContainerView Config:", config);
  const blocks: any[] = config.UI_VIEW.schema.components || [];

  console.log("Block", blocks);

  const resolveData = (dataSourceKey?: string): any[] => {
    if (!dataSourceKey) return [];
    const source: DashboardDataSource | undefined =
      config.dataSource?.[dataSourceKey];
    if (!source) return [];
    if (source.type === "inline") return source.data || [];
    return source.fallbackData || [];
  };

  const resolveActions = (
    actionRef?: string,
    sectionId?: string,
  ): DataTableAction<any>[] => {
    const actions: DashboardActionConfig[] = actionRef
      ? config.actions?.[actionRef] || []
      : [];

    return actions.map((action) => ({
      label: action.label,
      icon: action.icon,
      colorPalette: action.colorPalette,
      isDanger: action.isDanger,
      requiresConfirm: action.requiresConfirm,
      confirmMessage: action.confirmMessage,
      onClick: (row: any) => {
        const actionPayload = (action as any).action;
        if (actionPayload) {
          ActionEngine.execute(actionPayload, {
            navigate,
            openModal,
            organizationName: orgName,
            payload: row,
          });
        } else {
          const event = action.event || action.label;
          console.log(`[UI Action] ${event}`, { row, sectionId });
        }
      },
    }));
  };

  return (
    <Box>
      <Box
        p={5}
        mb={6}
        borderRadius="2xl"
        bg={useColorModeValue("white", "app.card.bg")}
        border="1px solid"
        borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
        // boxShadow="sm"
        // backdropFilter="blur(8px)"
        position="relative"
        overflow="hidden"
      >
        <style>{`
          @keyframes float-shape-1 {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(3deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          @keyframes drift-float {
            0% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(6px, -8px) rotate(4deg); }
            66% { transform: translate(-4px, 4px) rotate(-3deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes pulse-scale {
            0% { transform: scale(1); }
            50% { transform: scale(1.12); }
            100% { transform: scale(1); }
          }
          @keyframes rotate-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes sideways-sway {
            0% { transform: translateX(0px); }
            50% { transform: translateX(10px); }
            100% { transform: translateX(0px); }
          }
          @keyframes complex-float {
            0% { transform: translateY(0px) scale(1) rotate(0deg); }
            50% { transform: translateY(-10px) scale(0.95) rotate(-5deg); }
            100% { transform: translateY(0px) scale(1) rotate(0deg); }
          }
          @keyframes shine-pulse {
            0% { transform: scale(1) rotate(0deg); opacity: 0.08; }
            50% { transform: scale(1.25) rotate(15deg); opacity: 0.16; }
            100% { transform: scale(1) rotate(0deg); opacity: 0.08; }
          }
        `}</style>

        {/* Dynamic Concentric Circular Radar Overlay */}
        <Box
          position="absolute"
          right="-20px"
          top="-20px"
          color="app.text.accent/5"
          zIndex={0}
          pointerEvents="none"
          css={{
            animation: "rotate-slow 60s infinite linear",
          }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="20" strokeDasharray="40 20" />
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="10" strokeDasharray="10 5" />
          </svg>
        </Box>

        {/* Scattered Background Shape Textures */}
        {[
          {
            id: "shield-security",
            path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
            size: 64,
            top: "-10px",
            right: "8%",
            opacity: 0.08,
            animation: "pulse-scale 9s infinite ease-in-out"
          },
          {
            id: "gear-operations",
            path: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
            size: 72,
            bottom: "-20px",
            left: "20%",
            opacity: 0.07,
            animation: "rotate-slow 28s infinite linear"
          },
          {
            id: "computer-terminal",
            path: "M20 16V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12m-2 4h20m-3-4v4m-14-4v4",
            size: 56,
            top: "25%",
            left: "4%",
            opacity: 0.08,
            animation: "drift-float 12s infinite ease-in-out"
          },
          {
            id: "database-analytics",
            path: "M12 5c5.52 0 10-1.79 10-4S17.52 1 12 1 2 2.79 2 5s4.48 4 10 4zm0 6c5.52 0 10-1.79 10-4S17.52 7 12 7 2 8.79 2 11s4.48 4 10 4zm0 6c5.52 0 10-1.79 10-4S17.52 13 12 13 2 14.79 2 17s4.48 4 10 4z",
            size: 60,
            bottom: "5px",
            right: "32%",
            opacity: 0.06,
            animation: "float-shape-1 18s infinite ease-in-out"
          },
          {
            id: "key-occupancy",
            path: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l1.5 1.5M15.5 7.5L14 6",
            size: 48,
            top: "-5px",
            left: "38%",
            opacity: 0.09,
            animation: "sideways-sway 14s infinite ease-in-out"
          },
          {
            id: "lock-privacy",
            path: "M19 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2zm-12 0V7a5 5 0 0 1 10 0v4",
            size: 50,
            top: "35%",
            right: "22%",
            opacity: 0.08,
            animation: "complex-float 15s infinite ease-in-out"
          },
          {
            id: "building-block",
            path: "M3 21h18M3 21V8a2 2 0 0 1 2-2h3m10 13V4a2 2 0 0 0-2-2h-3m-6 20V12a2 2 0 0 1 2-2h2m0 0v12",
            size: 68,
            top: "-15px",
            left: "15%",
            opacity: 0.07,
            animation: "drift-float 16s infinite ease-in-out"
          },
          {
            id: "receipt-billing",
            path: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1zm12 4H8m8 4H8m8 4H8",
            size: 54,
            bottom: "-10px",
            right: "5%",
            opacity: 0.08,
            animation: "float-shape-1 10s infinite ease-in-out"
          },
          {
            id: "star-premium",
            path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
            size: 40,
            top: "15%",
            right: "45%",
            opacity: 0.08,
            animation: "shine-pulse 7s infinite ease-in-out"
          },
          {
            id: "chakra-mandala",
            path: "M12 2v20M2 12h20M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0",
            size: 80,
            bottom: "-30px",
            right: "18%",
            opacity: 0.07,
            animation: "rotate-slow 45s infinite linear"
          },
          {
            id: "code-brackets",
            path: "m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16",
            size: 52,
            top: "45%",
            left: "12%",
            opacity: 0.08,
            animation: "drift-float 11s infinite ease-in-out"
          }
        ].map((shape) => (
          <Box
            key={shape.id}
            position="absolute"
            top={shape.top}
            left={shape.left}
            right={shape.right}
            bottom={shape.bottom}
            width={`${shape.size}px`}
            height={`${shape.size}px`}
            opacity={shape.opacity}
            color={useColorModeValue("blue.600", "purple.300")}
            pointerEvents="none"
            zIndex={0}
            css={{
              animation: shape.animation,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="100%"
              height="100%"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={shape.path} />
            </svg>
          </Box>
        ))}

        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "start", sm: "center" }}
          gap={4}
          position="relative"
          zIndex={1}
        >
          <HStack gap={4} align="center">
            <Box
              w="4px"
              h="40px"
              borderRadius="full"
              bgGradient="linear(to-b, blue.500, purple.500)"
            />
            <VStack align="start" gap={1.5}>
              <Heading
                size="lg"
                fontWeight="900"
                letterSpacing="tight"
                color="app.text.primary"
              >
                {config.title || config.UI_TYPE?.title || "Gym Dashboard"}
              </Heading>
              {config.appMeta && (
                <HStack gap={3} flexWrap="wrap">
                  {config.appMeta.version && (
                    <Badge
                      variant="subtle"
                      colorPalette="blue"
                      size="sm"
                      borderRadius="full"
                      px={2.5}
                      py={0.5}
                      fontWeight="bold"
                    >
                      v{config.appMeta.version}
                    </Badge>
                  )}
                  {config.appMeta.owner && (
                    <HStack gap={1.5} align="center" color="gray.500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ display: "inline-block" }}
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <Text fontSize="xs" fontWeight="600">
                        Owner: {config.appMeta.owner}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              )}
            </VStack>
          </HStack>
        </Flex>
      </Box>
      <VStack mt={2} {...layoutStyles}>
        <Box>
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
        </Box>
      </VStack>
    </Box>
  );
};

export default React.memo(ContainerView);
