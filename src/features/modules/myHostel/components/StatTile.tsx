import { memo } from "react";
import { Box, Circle, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

interface StatTileProps {
  label:      string;
  value:      string | number;
  subtitle:   string;
  icon:       LucideIcon;
  accent:     string;
  gradStart?: string;
  gradEnd?:   string;
}

/**
 * StatTile — memoised KPI metric card.
 * Renders a gradient accent bar at the top when gradStart/gradEnd are provided,
 * giving each tile a colour identity without requiring hard-coded inline styles.
 */
const StatTile = memo(({ label, value, subtitle, icon, accent, gradStart, gradEnd }: StatTileProps) => {
  const hasGrad = Boolean(gradStart && gradEnd);

  return (
    <Box
      bg="app.card.bg"
      border="1px solid"
      borderColor="app.card.border"
      borderRadius="xl"
      overflow="hidden"
      transition="all 0.2s ease"
      _hover={{ transform: "translateY(-2px)", shadow: "md" }}
    >
      {hasGrad && (
        <Box h="3px" bgGradient={`linear(to-r, ${gradStart}, ${gradEnd})`} />
      )}

      <Box p={{ base: 4, md: 5 }}>
        <VStack align="start" gap={1.5}>
          <HStack gap={1.5}>
            <Circle
              size="7"
              bg={gradStart ? `${gradStart}18` : "bg.subtle"}
              color={gradStart ?? accent}
            >
              <Icon as={icon} boxSize={3.5} />
            </Circle>
            <Text
              fontSize="2xs"
              fontWeight="800"
              textTransform="uppercase"
              letterSpacing="0.08em"
              color="app.text.muted"
            >
              {label}
            </Text>
          </HStack>

          <Heading size="xl" color={accent} lineHeight="1" mt={1}>
            {value}
          </Heading>

          <Text fontSize="xs" color="app.text.muted" fontWeight="600">
            {subtitle}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
});

StatTile.displayName = "StatTile";
export default StatTile;
