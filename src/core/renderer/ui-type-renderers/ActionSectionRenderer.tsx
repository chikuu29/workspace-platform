import React from "react";
import { Box, Flex, HStack, VStack, Text, Heading, SimpleGrid } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavigate, useParams } from "react-router";
import { useModalStore } from "@/core/store/useModalStore";
import { ActionEngine } from "@/core/action-engine/ActionEngine";
import AsyncLoadIcon from "@/core/utils/hooks/AsyncLoadIcon";
import { ChevronRight } from "lucide-react";
import type { SectionRendererProps } from "./types";

const ActionSectionRenderer: React.FC<SectionRendererProps> = ({ component, resolveActions }) => {
  const navigate = useNavigate();
  const { organization_name } = useParams();
  const openModal = useModalStore((s) => s.openModal);

  const orgName = organization_name || "GHOST_ORG";

  // Resolve actions list: prioritize inline component.actions, fallback to resolved actions
  const actions = React.useMemo(() => {
    const baseActions = Array.isArray(component.actions)
      ? component.actions
      : resolveActions(component.actionRef, component.id);

    return baseActions.map((action: any) => {
      // If already mapped and contains an onClick function, return it as is
      if (typeof action.onClick === "function") {
        return action;
      }

      // Bind the click event dynamically for inline configurations
      return {
        ...action,
        onClick: (row: any) => {
          if (action.action) {
            ActionEngine.execute(action.action, {
              navigate,
              openModal,
              organizationName: orgName,
              payload: row,
            });
          } else {
            const event = action.event || action.label;
            console.log(`[UI Action] ${event}`, { row, sectionId: component.id });
          }
        },
      };
    });
  }, [component.actions, component.actionRef, component.id, resolveActions, navigate, openModal, orgName]);

  // Configuration settings from uiConfig
  const layoutMode = component.uiConfig?.layout || "vertical"; // vertical, horizontal, grid
  const columns = component.uiConfig?.columns || { base: 1 };
  const gap = component.uiConfig?.gap || 3;

  const cardBg = useColorModeValue("white", "app.card.bg");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  const renderContent = () => {
    if (layoutMode === "horizontal") {
      return (
        <HStack justify="start" gap={3} flexWrap="wrap" w="100%">
          {actions.map((action: any) => {
            const colorPalette = action.colorPalette || "blue";
            return (
              <Box
                as="button"
                key={`${component.id}-${action.label}`}
                onClick={() => action.onClick({})}
                display="flex"
                alignItems="center"
                px={4}
                py={2.5}
                borderRadius="xl"
                border="1px solid"
                borderColor={borderColor}
                bg={cardBg}
                cursor="pointer"
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  transform: "translateY(-1.5px)",
                  shadow: "sm",
                  borderColor: `${colorPalette}.400`,
                  bg: useColorModeValue(`${colorPalette}.50/10`, `rgba(59, 130, 246, 0.04)`),
                }}
                _active={{
                  transform: "translateY(0px)",
                }}
              >
                {action.icon && (
                  <Box mr={2.5} color={useColorModeValue(`${colorPalette}.600`, `${colorPalette}.400`)}>
                    <AsyncLoadIcon iconName={action.icon} size={16} boxSize="4" />
                  </Box>
                )}
                <Text fontWeight="700" fontSize="sm" color="app.text.primary">
                  {action.label}
                </Text>
              </Box>
            );
          })}
        </HStack>
      );
    }

    // Default vertical or grid card actions list
    const items = actions.map((action: any) => {
      const colorPalette = action.colorPalette || "blue";
      
      // Dynamic themed HSL values
      const iconBg = useColorModeValue(`${colorPalette}.50`, `rgba(59, 130, 246, 0.1)`);
      const iconBorder = useColorModeValue(`${colorPalette}.100`, `rgba(59, 130, 246, 0.2)`);
      const iconColor = useColorModeValue(`${colorPalette}.600`, `${colorPalette}.400`);
      
      return (
        <Box
          as="button"
          key={`${component.id}-${action.label}`}
          onClick={() => action.onClick({})}
          display="flex"
          alignItems="center"
          w="100%"
          p={4}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
          bg={cardBg}
          cursor="pointer"
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          textAlign="left"
          _hover={{
            transform: "translateY(-2px)",
            shadow: "md",
            borderColor: `${colorPalette}.400`,
            bg: useColorModeValue(`${colorPalette}.50/20`, `rgba(59, 130, 246, 0.05)`),
            "& .chevron-indicator": {
              transform: "translateX(3px)",
              color: `${colorPalette}.500`,
            }
          }}
          _active={{
            transform: "translateY(0px)",
          }}
        >
          <Flex
            align="center"
            justify="center"
            w="44px"
            h="44px"
            borderRadius="xl"
            bg={iconBg}
            border="1px solid"
            borderColor={iconBorder}
            color={iconColor}
            mr={4}
            flexShrink={0}
            transition="transform 0.2s ease"
          >
            <AsyncLoadIcon iconName={action.icon || "Activity"} size={20} boxSize="5" />
          </Flex>

          <VStack align="start" gap={0.5} flex={1}>
            <Text fontWeight="700" fontSize="sm" color="app.text.primary">
              {action.label}
            </Text>
            {action.description && (
              <Text fontSize="xs" color="gray.500" fontWeight="500">
                {action.description}
              </Text>
            )}
          </VStack>

          <Box
            color={useColorModeValue("gray.300", "gray.600")}
            transition="all 0.2s ease"
            className="chevron-indicator"
            flexShrink={0}
            ml={2}
          >
            <ChevronRight size={18} />
          </Box>
        </Box>
      );
    });

    if (layoutMode === "grid") {
      return (
        <SimpleGrid columns={columns} gap={gap} w="100%">
          {items}
        </SimpleGrid>
      );
    }

    return (
      <VStack gap={gap} w="100%" align="stretch">
        {items}
      </VStack>
    );
  };

  return (
    <Box
      w="100%"
      bg={"app.card.bg"}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      p={5}
      // shadow="sm"
      backdropFilter="blur(8px)"
      mb={6}
      {...(component.layout || {})}
    >
      {component.title && (
        <VStack align="start" gap={1} mb={5}>
          <HStack gap={3}>
            {component.icon && (
              <Flex
                align="center"
                justify="center"
                w="36px"
                h="36px"
                borderRadius="lg"
                bg={useColorModeValue("blue.50", "rgba(59, 130, 246, 0.1)")}
                border="1px solid"
                borderColor={useColorModeValue("blue.100", "rgba(59, 130, 246, 0.2)")}
                color={useColorModeValue("blue.600", "blue.400")}
                flexShrink={0}
              >
                <AsyncLoadIcon iconName={component.icon} size={18} boxSize="4.5" />
              </Flex>
            )}
            {!component.icon && (
              <Box
                w="4px"
                h="24px"
                borderRadius="full"
                bgGradient="linear(to-b, blue.500, purple.500)"
              />
            )}
            <Heading
              size="md"
              fontWeight="800"
              letterSpacing="tight"
              color="app.text.primary"
            >
              {component.title}
            </Heading>
          </HStack>
          {component.description && (
            <Text fontSize="xs" color="gray.500" fontWeight="500">
              {component.description}
            </Text>
          )}
        </VStack>
      )}

      {renderContent()}
    </Box>
  );
};

export default React.memo(ActionSectionRenderer);
