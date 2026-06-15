/**
 * PageHeader.tsx
 *
 * Modern, responsive page header with glassmorphic styling.
 * Supports configurable accent color, contextual badge, and
 * retains all existing search/refresh/actions capabilities.
 *
 * WHY glassmorphism: Aligns with the GlassCard pattern already
 * used across the gym module for visual consistency.
 */

import {
  Badge,
  Box,
  Circle,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Search, RefreshCw } from "lucide-react";
import { memo, useMemo } from "react";

/* ─── Accent Color Map ─────────────────────────────────────────────── */

/**
 * Pre-defined accent color palettes for consistent theming across pages.
 * Each entry maps to a Chakra colorPalette and its gradient/glow values.
 */
const ACCENT_MAP: Record<
  string,
  {
    gradient: string;
    glow: string;
    iconBg: string;
    badgePalette: string;
    barGradient: string;
  }
> = {
  blue: {
    gradient: "linear-gradient(135deg, #3b82f6, #6366f1)",
    glow: "0 8px 24px -6px rgba(59, 130, 246, 0.45)",
    iconBg: "blue.500/12",
    badgePalette: "blue",
    barGradient: "linear-gradient(90deg, #3b82f6, #6366f1, #3b82f6)",
  },
  green: {
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
    glow: "0 8px 24px -6px rgba(16, 185, 129, 0.45)",
    iconBg: "green.500/12",
    badgePalette: "green",
    barGradient: "linear-gradient(90deg, #10b981, #06b6d4, #10b981)",
  },
  purple: {
    gradient: "linear-gradient(135deg, #8b5cf6, #d946ef)",
    glow: "0 8px 24px -6px rgba(139, 92, 246, 0.45)",
    iconBg: "purple.500/12",
    badgePalette: "purple",
    barGradient: "linear-gradient(90deg, #8b5cf6, #d946ef, #8b5cf6)",
  },
  orange: {
    gradient: "linear-gradient(135deg, #f97316, #ef4444)",
    glow: "0 8px 24px -6px rgba(249, 115, 22, 0.45)",
    iconBg: "orange.500/12",
    badgePalette: "orange",
    barGradient: "linear-gradient(90deg, #f97316, #ef4444, #f97316)",
  },
  cyan: {
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    glow: "0 8px 24px -6px rgba(6, 182, 212, 0.45)",
    iconBg: "cyan.500/12",
    badgePalette: "cyan",
    barGradient: "linear-gradient(90deg, #06b6d4, #3b82f6, #06b6d4)",
  },
  teal: {
    gradient: "linear-gradient(135deg, #14b8a6, #10b981)",
    glow: "0 8px 24px -6px rgba(20, 184, 166, 0.45)",
    iconBg: "teal.500/12",
    badgePalette: "teal",
    barGradient: "linear-gradient(90deg, #14b8a6, #10b981, #14b8a6)",
  },
};

/** Fallback accent when an unrecognized key is provided */
const DEFAULT_ACCENT = ACCENT_MAP.blue;

/* ─── Types ────────────────────────────────────────────────────────── */

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  showRefresh?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  icon?: React.ElementType;
  /** Small contextual label displayed above the title (e.g. "Command Center") */
  badge?: string;
  /** Chakra colorPalette name override for the badge. Defaults to accent color. */
  badgeColor?: string;
  /** Key into ACCENT_MAP — controls gradient bar, icon glow, badge color. Defaults to "blue". */
  accentColor?: string;
}

/* ─── Component ────────────────────────────────────────────────────── */

export const PageHeader = memo(
  ({
    title,
    subtitle,
    actions,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    showRefresh,
    onRefresh,
    isRefreshing,
    icon: IconComponent,
    badge,
    badgeColor,
    accentColor = "blue",
  }: PageHeaderProps) => {
    /** Resolve the accent palette — safe fallback to blue */
    const accent = useMemo(
      () => ACCENT_MAP[accentColor] ?? DEFAULT_ACCENT,
      [accentColor],
    );

    /* ── Theme-aware tokens ── */
    const cardBg = useColorModeValue(
      "rgba(255, 255, 255, 0.82)",
      "rgba(15, 23, 42, 0.66)",
    );
    const borderColor = useColorModeValue(
      "rgba(226, 232, 240, 0.86)",
      "rgba(255, 255, 255, 0.10)",
    );
    const shadowColor = useColorModeValue(
      "0 4px 24px -8px rgba(0, 0, 0, 0.08)",
      "0 4px 24px -8px rgba(0, 0, 0, 0.30)",
    );
    const searchBg = useColorModeValue(
      "rgba(255, 255, 255, 0.9)",
      "rgba(15, 23, 42, 0.6)",
    );

    return (
      <Box
        position="relative"
        w="full"
        mb={5}
        borderRadius="2xl"
        overflow="hidden"
        border="1px solid"
        borderColor={borderColor}
        bg={"app.card.bg"}
        backdropFilter="blur(20px) saturate(160%)"
        boxShadow={shadowColor}
        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        {/* ── Gradient Accent Bar ─────────────────────────── */}
        <Box
          h="3px"
          w="full"
          background={accent.barGradient}
          backgroundSize="200% 100%"
          animation="shimmer-bar 4s ease infinite"
        />

        {/* ── Shimmer keyframe injection ─────────────────── */}
        <style>{`
          @keyframes shimmer-bar {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>

        {/* ── Content Area ────────────────────────────────── */}
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "start", lg: "center" }}
          gap={{ base: 4, lg: 6 }}
          px={{ base: 4, md: 6 }}
          py={{ base: 4, md: 5 }}
        >
          {/* ── Left: Icon + Title Block ────────────────── */}
          <Flex align="center" gap={4} flex="1" minW={0}>
            {/* Accent Icon */}
            {IconComponent && (
              <Circle
                size={{ base: "42px", md: "46px" }}
                flexShrink={0}
                bg={accent.gradient}
                color="white"
                boxShadow={accent.glow}
                position="relative"
                overflow="hidden"
                transition="transform 0.2s ease, box-shadow 0.2s ease"
                _hover={{
                  transform: "scale(1.06)",
                }}
              >
                {/* Glass sheen on icon */}
                <Box
                  position="absolute"
                  top="2px"
                  left="5px"
                  right="5px"
                  h="5px"
                  borderRadius="full"
                  bg="rgba(255, 255, 255, 0.25)"
                  pointerEvents="none"
                />
                <Icon
                  as={IconComponent}
                  boxSize={{ base: 4, md: 5 }}
                  strokeWidth={2.4}
                  position="relative"
                  zIndex={1}
                />
              </Circle>
            )}

            {/* Title Stack */}
            <Stack gap={1} minW={0}>
              {/* Contextual Badge */}
              {badge && (
                <Box>
                  <Badge
                    colorPalette={
                      (badgeColor as string) ?? accent.badgePalette
                    }
                    variant="subtle"
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    fontSize="2xs"
                    fontWeight="900"
                    letterSpacing="wider"
                    textTransform="uppercase"
                  >
                    {badge}
                  </Badge>
                </Box>
              )}

              <Heading
                fontWeight="950"
                letterSpacing="tight"
                color="app.text.primary"
                lineHeight="1.15"
                fontSize={{ base: "lg", md: "xl" }}
              >
                {title}
              </Heading>

              {subtitle && (
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="600"
                  color="app.text.muted"
                  maxW="620px"
                  lineHeight="short"
                >
                  {subtitle}
                </Text>
              )}
            </Stack>
          </Flex>

          {/* ── Right: Search / Refresh / Actions ──────── */}
          <Flex
            align="center"
            gap={3}
            flexWrap="wrap"
            justify={{ base: "flex-start", lg: "flex-end" }}
            w={{ base: "full", lg: "auto" }}
            flexShrink={0}
          >
            {/* Search Bar */}
            {onSearchChange && (
              <Box position="relative" w={{ base: "full", md: "280px" }}>
                <Box
                  position="absolute"
                  left={3.5}
                  top="50%"
                  transform="translateY(-50%)"
                  color="app.text.muted"
                  zIndex={1}
                >
                  <Search size={16} />
                </Box>
                <Input
                  placeholder={searchPlaceholder || "Search..."}
                  value={searchValue || ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  pl={10}
                  h="42px"
                  bg={searchBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="xl"
                  fontSize="sm"
                  fontWeight="600"
                  _hover={{ borderColor: "app.text.accent" }}
                  _focus={{
                    borderColor: "app.text.accent",
                    boxShadow:
                      "0 0 0 1px var(--chakra-colors-app-text-accent)",
                    bg: "app.input.bg",
                  }}
                  transition="all 0.2s"
                />
              </Box>
            )}

            {/* Refresh Button */}
            {(showRefresh || onRefresh) && (
              <IconButton
                aria-label="Refresh"
                onClick={onRefresh}
                disabled={isRefreshing}
                variant="outline"
                h="42px"
                w="42px"
                borderRadius="xl"
                borderColor={borderColor}
                color="app.text.muted"
                _hover={{
                  color: "app.text.primary",
                  bg: "app.card.bg",
                  borderColor: "app.text.accent",
                  transform: "rotate(45deg)",
                }}
                transition="all 0.25s ease"
              >
                <RefreshCw
                  size={16}
                  className={isRefreshing ? "spin-animation" : ""}
                />
              </IconButton>
            )}

            {/* Custom Actions */}
            {actions && <Box>{actions}</Box>}
          </Flex>
        </Flex>
      </Box>
    );
  },
);

PageHeader.displayName = "PageHeader";
