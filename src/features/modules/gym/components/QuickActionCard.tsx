/**
 * QuickActionCard.tsx
 *
 * Clickable workflow shortcut with icon, label, description,
 * and smooth hover animation. Uses semantic design tokens.
 */
import { memo, useMemo } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { useColorModeValue } from "@/components/ui/color-mode";

// ── Types ────────────────────────────────────────────────────────────

interface QuickActionCardProps {
  /** Primary label */
  label: string;
  /** Short description */
  description: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Chakra color token for accent tint */
  accentColor: string;
  /** Click handler */
  onClick: () => void;
}

const COLOR_MAP: Record<string, string> = {
  "blue.500": "#3965FF",
  "green.500": "#01B574",
  "purple.500": "#8B5CF6",
  "teal.500": "#06B6D4",
  "orange.500": "#FFB547",
  "pink.500": "#EC4899",
};

// ── Component ────────────────────────────────────────────────────────

const QuickActionCard = memo(({
  label,
  description,
  icon: IconComponent,
  accentColor,
  onClick,
}: QuickActionCardProps) => {
  const panelBg = useColorModeValue("rgba(255,255,255,0.72)", "rgba(18,22,40,0.65)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.06)");

  const accentHex = useMemo(() => COLOR_MAP[accentColor] || "#422AFB", [accentColor]);

  return (
    <Box
      as="button"
      w="full"
      textAlign="left"
      p={4}
      borderRadius="20px"
      bg={panelBg}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(24px) saturate(190%)"
      boxShadow={useColorModeValue("0 8px 32px rgba(0,0,0,0.02)", "0 8px 32px rgba(0,0,0,0.15)")}
      cursor="pointer"
      transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      _hover={{
        borderColor: `${accentHex}60`,
        transform: "translateY(-4px)",
        boxShadow: `0 12px 30px -8px ${accentHex}40`,
        bg: useColorModeValue("rgba(255,255,255,0.92)", "rgba(18,22,40,0.85)"),
      }}
      _active={{ transform: "scale(0.98)" }}
      onClick={onClick}
      role="group"
    >
      <HStack gap={3.5} w="full" justify="space-between">
        <HStack gap={3} minW={0} w="full">
          {/* Icon container with a glowing background */}
          <Flex
            align="center"
            justify="center"
            w="46px"
            h="46px"
            borderRadius="16px"
            bg={`linear-gradient(135deg, ${accentHex}18, ${accentHex}05)`}
            border="1px solid"
            borderColor={`${accentHex}25`}
            color={accentHex}
            flexShrink={0}
            position="relative"
            overflow="hidden"
            transition="all 0.25s"
            _groupHover={{
              bg: `linear-gradient(135deg, ${accentHex}, ${accentHex}bb)`,
              color: "white",
              boxShadow: `0 4px 14px ${accentHex}50`,
              borderColor: "transparent",
            }}
          >
            <IconComponent size={18} strokeWidth={2.5} />
          </Flex>

          <VStack align="start" gap={0} minW={0} flex={1}>
            <Text
              fontSize="sm"
              fontWeight="900"
              color="app.text.primary"
              lineHeight="1.2"
              transition="color 0.2s"
              _groupHover={{ color: accentHex }}
            >
              {label}
            </Text>
            <Text
              fontSize="11px"
              fontWeight="600"
              color="app.text.muted"
              lineHeight="1.4"
              mt={0.5}
              truncate
              w="full"
            >
              {description}
            </Text>
          </VStack>
        </HStack>

        {/* Arrow indicator */}
        <Box
          opacity={0.3}
          transform="translateX(-4px)"
          transition="all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          color="app.text.muted"
          flexShrink={0}
          _groupHover={{
            opacity: 1,
            transform: "translateX(0)",
            color: accentHex,
          }}
        >
          <ArrowRight size={14} strokeWidth={3} />
        </Box>
      </HStack>
    </Box>
  );
});

QuickActionCard.displayName = "QuickActionCard";
export default QuickActionCard;
