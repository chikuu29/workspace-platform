import React, { memo } from "react";
import {
  Box,
  HStack,
  Stat,
  Text,
  VStack,
  Skeleton,
  Heading,
  Flex,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import AsyncLoadIcon from "@/core/utils/hooks/AsyncLoadIcon";

// ── Gradient background for the icon circle ──────────────────────────

const ACCENT_GRADIENTS: Record<string, string> = {
  "blue": "linear-gradient(135deg, #3b82f6, #6366f1)",
  "green": "linear-gradient(135deg, #10b981, #059669)",
  "purple": "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  "orange": "linear-gradient(135deg, #f59e0b, #ef4444)",
  "teal": "linear-gradient(135deg, #14b8a6, #0ea5e9)",
  "pink": "linear-gradient(135deg, #ec4899, #f43f5e)",
  "red": "linear-gradient(135deg, #ef4444, #dc2626)",
  "cyan": "linear-gradient(135deg, #06b6d4, #0891b2)",
  "yellow": "linear-gradient(135deg, #eab308, #ca8a04)",
  "gray": "linear-gradient(135deg, #6b7280, #4b5563)",
};

const SubKPITile = ({ config }: { config: any }) => {
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.700", "gray.200");

  return (
    <VStack
      align="start"
      gap={0}
      p={2}
      bg={useColorModeValue("gray.50", "whiteAlpha.50")}
      // bg={"app.card.bg"}
      borderRadius="md"
      flex="1"
    >
      <Text
        fontSize="10px"
        fontWeight="700"
        color={labelColor}
        textTransform="uppercase"
        letterSpacing="wider"
      >
        {config.label}
      </Text>
      <Text fontSize="md" fontWeight="800" color={valueColor}>
        {config.value}
      </Text>
    </VStack>
  );
};

// Types KPI Tiles

interface KPITilesProps {
  /** Short label above the value (e.g. "Total Members") */
  label: string;
  /** Primary display value (e.g. "1,248") */
  value: string;
  /** Small caption below the value */
  subtitle: string;
  /** Lucide icon component from lucide-react or name of it */
  icon?: any;
  /** Chakra color token for accent (e.g. "blue.500") */
  /** Show skeleton while data loads */
  loading?: boolean;
  helpText?: string;
  colorPalette?: string;
  subKpis?: any[];
}

/** Fallback gradient if the accent isn't in the map */
const fallbackGradient = "linear-gradient(135deg, #6366f1, #8b5cf6)";

const KPITile = memo(
  ({
    label,
    value,
    helpText,
    colorPalette="blue",
    subKpis,
    icon,
    loading = false,
  }: KPITilesProps) => {
    const basePalette = colorPalette ? colorPalette.split(".")[0] : "blue";
    const gradient = ACCENT_GRADIENTS[colorPalette] || ACCENT_GRADIENTS[basePalette] || fallbackGradient;
    const bg = useColorModeValue("white", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const labelColor = useColorModeValue("gray.500", "gray.400");
    const valueColor = useColorModeValue(
      `${colorPalette ? `${colorPalette}.600` : "blue.600"}`,
      `${colorPalette ? `${colorPalette}.400` : "blue.400"}`,
    );

    return (
      <Box
        p={5}
        borderRadius="2xl"
        bg={"app.card.bg"}
        border="1px solid"
        borderColor={borderColor}
        backdropFilter="blur(16px) saturate(140%)"
        boxShadow={useColorModeValue(
          "0 4px 12px rgba(0, 0, 0, 0.05)",
          "0 1px 3px rgba(0,0,0,0.04)",
        )}
        transition="all 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
        role="group"

      >
        <VStack align="stretch" gap={4} w="full">
          <HStack justify="space-between" align="start" gap={4} w="full">
            {/* Text block */}
            <VStack align="start" gap={1} minW={0} flex={1}>
              <Text
                fontSize="xs"
                fontWeight="700"
                color="app.text.muted"
                textTransform="uppercase"
                letterSpacing="0.05em"
                wordBreak="break-word"
                whiteSpace="normal"
              >
                {label}
              </Text>

              <Skeleton loading={loading} borderRadius="md" minH="30px" w="full">
                <Heading
                  size="xl"
                  fontWeight="900"
                  color="app.text.primary"
                  letterSpacing="tight"
                  lineHeight="1.1"
                  wordBreak="break-word"
                  whiteSpace="normal"
                >
                  {value}
                </Heading>
              </Skeleton>

              {helpText && (
                <Text
                  fontSize="xs"
                  fontWeight="600"
                  color="app.text.muted"
                  mt={1}
                  wordBreak="break-word"
                  whiteSpace="normal"
                >
                  {helpText}
                </Text>
              )}
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
              {typeof icon === "string" || !icon ? (
                <AsyncLoadIcon iconName={icon || "MonitorCog"} size={20} boxSize="5" />
              ) : (
                React.createElement(icon, { size: 20 })
              )}
            </Flex>
          </HStack>

          {Array.isArray(subKpis) && subKpis.length > 0 && (
            <HStack gap={2} w="full" mt={1}>
              {subKpis.map((sub: any, idx: number) => (
                <SubKPITile key={`${label}-${idx}`} config={sub} />
              ))}
            </HStack>
          )}
        </VStack>
      </Box>
    );
  },
);

export default KPITile;
