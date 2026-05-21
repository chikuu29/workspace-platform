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
import { LucideIcon } from "lucide-react";
// ── Gradient background for the icon circle ──────────────────────────

const ACCENT_GRADIENTS: Record<string, string> = {
  "blue.500": "linear-gradient(135deg, #3b82f6, #6366f1)",
  "green.500": "linear-gradient(135deg, #10b981, #059669)",
  "purple.500": "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  "orange.500": "linear-gradient(135deg, #f59e0b, #ef4444)",
  "teal.500": "linear-gradient(135deg, #14b8a6, #0ea5e9)",
  "pink.500": "linear-gradient(135deg, #ec4899, #f43f5e)",
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
  /** Lucide icon component from lucide-react */
  icon: LucideIcon;
  /** Chakra color token for accent (e.g. "blue.500") */
  accentColor: string;
  /** Show skeleton while data loads */
  loading?: boolean;
  helpText?:string;
  colorPalette?:any
  subKpis?:any[]


}

/** Fallback gradient if the accent isn't in the map */
const fallbackGradient = "linear-gradient(135deg, #6366f1, #8b5cf6)";

const KPITile = memo(
  ({
    label,
    value,
    helpText,
    colorPalette,
    subKpis,
    icon: IconComponent,
    accentColor,
    loading = false,
  }: KPITilesProps) => {
    const gradient = ACCENT_GRADIENTS[accentColor] || fallbackGradient;
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
        <HStack justify="space-between" align="start" gap={4}>
          {/* Text block */}
          <VStack align="start" gap={1} minW={0}>
            <Text
              fontSize="xs"
              fontWeight="700"
              color="app.text.muted"
              textTransform="uppercase"
              letterSpacing="0.05em"
            >
              {label}
            </Text>

            <Skeleton loading={false} borderRadius="md" minH="30px">
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

            {/* <Text fontSize="xs" fontWeight="600" color="app.text.muted">
            {subtitle}
          </Text> */}
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
            {/* <IconComponent size={20} strokeWidth={2} /> */}
          </Flex>
        </HStack>
        <Stat.Root>
          <Stat.Label fontSize="sm" fontWeight="600" color={labelColor}>
            {label}
          </Stat.Label>
          <Stat.ValueText
            mt={1}
            fontSize="2xl"
            fontWeight="800"
            color={valueColor}
          >
            {value}
          </Stat.ValueText>
          {helpText && <Stat.HelpText fontSize="xs">{helpText}</Stat.HelpText>}
        </Stat.Root>

        {Array.isArray(subKpis) && subKpis.length > 0 && (
          <HStack gap={2} w="full" mt={4}>
            {subKpis.map((sub: any, idx: number) => (
              <SubKPITile key={`${label}-${idx}`} config={sub} />
            ))}
          </HStack>
        )}
      </Box>
    );
  },
);

export default KPITile;
