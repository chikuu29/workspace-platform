/**
 * StatCard.tsx
 *
 * Premium KPI stat tile with gradient icon background,
 * smooth hover animation, and full theme-token support.
 *
 * Uses semantic tokens: app.card.bg, app.card.border,
 * app.text.primary, app.text.muted.
 */
import { memo } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import type { LucideIcon } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

interface StatCardProps {
  /** Short label above the value (e.g. "Total Members") */
  label: string;
  /** Primary display value (e.g. "1,248") */
  value: string;
  /** Small caption below the value */
  subtitle: string;
  /** Lucide icon component from lucide-react */
  icon: LucideIcon;
  /** Chakra color token for accent (e.g. "blue.500") */
  accentColor: string;
  /** Show skeleton while data loads */
  loading?: boolean;
}

// ── Gradient background for the icon circle ──────────────────────────

const ACCENT_GRADIENTS: Record<string, string> = {
  "blue.500": "linear-gradient(135deg, #3b82f6, #6366f1)",
  "green.500": "linear-gradient(135deg, #10b981, #059669)",
  "purple.500": "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  "orange.500": "linear-gradient(135deg, #f59e0b, #ef4444)",
  "teal.500": "linear-gradient(135deg, #14b8a6, #0ea5e9)",
  "pink.500": "linear-gradient(135deg, #ec4899, #f43f5e)",
};

/** Fallback gradient if the accent isn't in the map */
const fallbackGradient = "linear-gradient(135deg, #6366f1, #8b5cf6)";

// ── Component ────────────────────────────────────────────────────────

const StatCard = memo(({
  label,
  value,
  subtitle,
  icon: IconComponent,
  accentColor,
  loading = false,
}: StatCardProps) => {
  const gradient = ACCENT_GRADIENTS[accentColor] || fallbackGradient;
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");

  return (
    <Box
      p={5}
      borderRadius="2xl"
      bg={'app.card.bg'}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(16px) saturate(140%)"
      boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}
      transition="all 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
      role="group"
    >
      <HStack justify="space-between" align="start" gap={4}>
        {/* Text block */}
        <VStack align="start" gap={1} minW={0}>
          <Text
            fontSize="xs"
            fontWeight="bold"
            color="app.text.muted"
            textTransform="uppercase"
            letterSpacing="0.05em"
          >
            {label}
          </Text>

          <Skeleton loading={loading} borderRadius="md" minH="30px">
            <Heading
              size="xl"
              fontWeight="900"
              color="app.text.primary"
              letterSpacing="tight"
              lineHeight="1.1"
            >
              {value}
            </Heading>
          </Skeleton>

          <Text fontSize="xs" fontWeight="600" color="app.text.muted">
            {subtitle}
          </Text>
        </VStack>

        {/* Gradient icon badge */}
        <Flex
          align="center"
          justify="center"
          w="44px"
          h="44px"
          borderRadius="xl"
          bg={gradient}
          color="white"
          flexShrink={0}
        >
          <IconComponent size={20} strokeWidth={2} />
        </Flex>
      </HStack>
    </Box>
  );
});

StatCard.displayName = "StatCard";
export default StatCard;
