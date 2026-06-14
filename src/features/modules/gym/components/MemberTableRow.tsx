/**
 * MemberTableRow.tsx
 *
 * Modern glassmorphic table-row for the member directory.
 * Memoized for high-performance virtual scrolling.
 *
 * Design refresh:
 * - Gradient avatar fallback tied to status accent
 * - Inline status dot instead of badge for compactness
 * - Subtle glow + lift on hover via group interaction
 * - Plan tag uses a rounded pill with brand tint
 */
import { memo, useCallback, useMemo } from "react";
import {
  Badge,
  Box,
  Circle,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  ArrowRight,
  CalendarDays,
  Mail,
  Phone,
} from "lucide-react";
import type { MemberDocument } from "../types/Gym.types";

// ── Status theme map ─────────────────────────────────────────────────
const STATUS_THEME = {
  active: {
    label: "Active",
    colorPalette: "green" as const,
    accent: "green.400",
    dot: "#22c55e",
    dotGlow: "rgba(34,197,94,0.4)",
  },
  attention: {
    label: "Attention",
    colorPalette: "orange" as const,
    accent: "orange.400",
    dot: "#fb923c",
    dotGlow: "rgba(251,146,60,0.4)",
  },
  frozen: {
    label: "Frozen",
    colorPalette: "blue" as const,
    accent: "blue.400",
    dot: "#60a5fa",
    dotGlow: "rgba(96,165,250,0.4)",
  },
} as const;

const formatDate = (date?: string) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ── Avatar color palette ────────────────────────────────────────────
const AVATAR_PALETTES = [
  { bg: "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)", shadow: "rgba(117,81,255,0.35)" },
  { bg: "linear-gradient(135deg, #01B574 0%, #00875A 100%)", shadow: "rgba(1,181,116,0.35)" },
  { bg: "linear-gradient(135deg, #FFB547 0%, #FF8F00 100%)", shadow: "rgba(255,181,71,0.35)" },
  { bg: "linear-gradient(135deg, #3965FF 0%, #0037FF 100%)", shadow: "rgba(57,101,255,0.35)" },
  { bg: "linear-gradient(135deg, #EC4899 0%, #D01C78 100%)", shadow: "rgba(236,72,153,0.35)" },
  { bg: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)", shadow: "rgba(6,182,212,0.35)" },
] as const;

const getAvatarPalette = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

// ── Props ────────────────────────────────────────────────────────────
interface MemberTableRowProps {
  member: MemberDocument;
  onClick: (id: string) => void;
  style?: React.CSSProperties;
}

// ── Component ────────────────────────────────────────────────────────
const MemberTableRow = memo(({ member, onClick, style }: MemberTableRowProps) => {
  const { data, _meta } = member;
  const first = data.firstName || "";
  const last = data.lastName || "";
  const fullName = `${first} ${last}`.trim() || "Unknown";
  const initials = `${first?.[0] || ""}${last?.[0] || ""}` || "GM";
  const status = data.status || "active";
  const theme = STATUS_THEME[status] || STATUS_THEME.active;

  const avatarPalette = useMemo(() => getAvatarPalette(fullName), [fullName]);

  const rowBg = useColorModeValue(
    "rgba(255,255,255,0.65)",
    "rgba(15,23,42,0.45)",
  );
  const hoverBg = useColorModeValue(
    "rgba(240,244,255,0.92)",
    "rgba(30,41,59,0.72)",
  );
  const borderColor = useColorModeValue(
    "rgba(226,232,240,0.45)",
    "rgba(255,255,255,0.05)",
  );
  const muted = useColorModeValue("gray.500", "gray.400");
  const subtleBg = useColorModeValue("rgba(0,0,0,0.03)", "rgba(255,255,255,0.04)");

  const handleClick = useCallback(() => onClick(_meta.id), [onClick, _meta.id]);

  return (
    <HStack
      style={style}
      px={5}
      py={3.5}
      gap={4}
      bg={rowBg}
      borderBottom="1px solid"
      borderColor={borderColor}
      cursor="pointer"
      transition="all 0.2s cubic-bezier(.4,0,.2,1)"
      _hover={{
        bg: hoverBg,
        boxShadow: `inset 3px 0 0 0 ${theme.dot}`,
      }}
      onClick={handleClick}
      role="group"
    >
      {/* ── Avatar + Identity ────────────────────────────────── */}
      <HStack gap={3} minW="200px" flex={1.4}>
        <Circle
          size="36px"
          bg={avatarPalette.bg}
          color="white"
          fontWeight="900"
          fontSize="xs"
          flexShrink={0}
          boxShadow={`0 3px 10px ${avatarPalette.shadow}`}
        >
          {initials}
        </Circle>
        <VStack align="start" gap={0} minW={0}>
          <Text
            fontSize="13px"
            fontWeight="800"
            color="app.text.primary"
            lineClamp={1}
            letterSpacing="-0.01em"
          >
            {fullName}
          </Text>
          <Text
            fontSize="10px"
            color={muted}
            fontWeight="700"
            fontFamily="mono"
            lineClamp={1}
          >
            {data.member_id}
          </Text>
        </VStack>
      </HStack>

      {/* ── Status (dot + label) ─────────────────────────────── */}
      <HStack minW="100px" gap={2}>
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg={theme.dot}
          boxShadow={`0 0 6px ${theme.dotGlow}`}
          flexShrink={0}
        />
        <Text
          fontSize="11px"
          fontWeight="800"
          color={theme.accent}
          textTransform="uppercase"
          letterSpacing="0.04em"
        >
          {theme.label}
        </Text>
      </HStack>

      {/* ── Email ────────────────────────────────────────────── */}
      <HStack
        gap={1.5}
        color={muted}
        minW="160px"
        flex={1}
        display={{ base: "none", lg: "flex" }}
      >
        <Mail size={12} />
        <Text fontSize="12px" fontWeight="600" lineClamp={1}>
          {data.email || "—"}
        </Text>
      </HStack>

      {/* ── Phone ────────────────────────────────────────────── */}
      <HStack
        gap={1.5}
        color={muted}
        minW="120px"
        display={{ base: "none", xl: "flex" }}
      >
        <Phone size={12} />
        <Text fontSize="12px" fontWeight="600">
          {data.phone || "—"}
        </Text>
      </HStack>

      {/* ── Joined ───────────────────────────────────────────── */}
      <HStack
        gap={1.5}
        color={muted}
        minW="110px"
        display={{ base: "none", xl: "flex" }}
      >
        <CalendarDays size={12} />
        <Text fontSize="12px" fontWeight="600">
          {formatDate(_meta.created?.at)}
        </Text>
      </HStack>

      {/* ── Plan ─────────────────────────────────────────────── */}
      <Box minW="120px" flex={0.8} display={{ base: "none", lg: "flex" }}>
        {member.has_plan === false ? (
          <Badge
            fontSize="9px"
            fontWeight="900"
            px={2.5}
            py={0.5}
            borderRadius="full"
            colorPalette="red"
            variant="subtle"
          >
            NO PLAN
          </Badge>
        ) : (
          <Text
            fontSize="12px"
            fontWeight="700"
            color="app.text.primary"
            lineClamp={1}
            bg={subtleBg}
            px={2.5}
            py={0.5}
            borderRadius="full"
          >
            {member.subscription?.plan_name || data.plan || "Standard"}
          </Text>
        )}
      </Box>

      {/* ── Arrow (reveal on hover) ──────────────────────────── */}
      <Box
        color={muted}
        opacity={0.4}
        transition="all 0.25s ease"
        _groupHover={{
          color: theme.accent,
          opacity: 1,
          transform: "translateX(3px)",
        }}
      >
        <ArrowRight size={14} />
      </Box>
    </HStack>
  );
});

MemberTableRow.displayName = "MemberTableRow";
export default MemberTableRow;
