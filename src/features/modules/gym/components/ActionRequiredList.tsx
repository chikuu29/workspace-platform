/**
 * ActionRequiredList.tsx
 *
 * Displays operational alerts that need manager attention:
 * renewals due, frozen accounts, daily check-ins, etc.
 * Each row has a colored indicator, title, and description.
 */
import { memo } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import { useColorModeValue } from "@/components/ui/color-mode";

// ── Types ────────────────────────────────────────────────────────────

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  /** Numeric badge count (optional) */
  count?: number;
}

interface ActionRequiredListProps {
  items: AlertItem[];
  /** Total badge count shown in the header */
  totalCount: number;
}

// ── Single Row ───────────────────────────────────────────────────────

interface AlertRowProps {
  item: AlertItem;
}

const AlertRow = memo(({ item }: AlertRowProps) => {
  const IconComponent = item.icon;

  return (
    <HStack
      p={3}
      borderRadius="xl"
      bg={`${item.accentColor}/8`}
      border="1px solid"
      borderColor={`${item.accentColor}/16`}
      gap={3}
      transition="all 0.18s"
      _hover={{ bg: `${item.accentColor}/12` }}
    >
      {/* Colored icon indicator */}
      <Flex
        align="center"
        justify="center"
        w="36px"
        h="36px"
        borderRadius="lg"
        bg={`${item.accentColor}/14`}
        color={item.accentColor}
        flexShrink={0}
      >
        <IconComponent size={16} strokeWidth={2} />
      </Flex>

      <VStack align="start" gap={0} flex={1} minW={0}>
        <Text fontSize="sm" fontWeight="800" color="app.text.primary">
          {item.title}
        </Text>
        <Text fontSize="xs" fontWeight="600" color="app.text.muted">
          {item.description}
        </Text>
      </VStack>

      {item.count !== undefined && item.count > 0 && (
        <Badge
          colorPalette={item.accentColor.split(".")[0]}
          variant="subtle"
          borderRadius="full"
          px={2}
          fontWeight="800"
          fontSize="xs"
        >
          {item.count}
        </Badge>
      )}
    </HStack>
  );
});
AlertRow.displayName = "AlertRow";

// ── Main Component ───────────────────────────────────────────────────

const ActionRequiredList = memo(({
  items,
  totalCount,
}: ActionRequiredListProps) => {
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");

  return (
    <Box
      p={5}
      borderRadius="2xl"
      bg={panelBg}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(16px) saturate(140%)"
      boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}
    >
      <VStack align="stretch" gap={4}>
        {/* Header */}
        <HStack justify="space-between">
          <Heading size="sm" fontWeight="900" color="app.text.primary">
            Action Required
          </Heading>
          {totalCount > 0 && (
            <Badge
              colorPalette="orange"
              borderRadius="full"
              variant="solid"
              px={2.5}
              fontWeight="800"
            >
              {totalCount}
            </Badge>
          )}
        </HStack>

        {/* Alert rows */}
        <VStack align="stretch" gap={2.5}>
          {items.map((item) => (
            <AlertRow key={item.id} item={item} />
          ))}
        </VStack>
      </VStack>
    </Box>
  );
});

ActionRequiredList.displayName = "ActionRequiredList";
export default ActionRequiredList;
