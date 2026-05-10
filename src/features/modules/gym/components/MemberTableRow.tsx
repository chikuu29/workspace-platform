/**
 * MemberTableRow.tsx
 *
 * Compact table-row representation of a member for the table view mode.
 * Memoized to prevent re-renders during virtual scroll.
 */
import { memo, useCallback } from "react";
import {
  Avatar,
  Badge,
  Box,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  LuArrowRight,
  LuCalendarDays,
  LuMail,
  LuPhone,
} from "react-icons/lu";
import type { MemberDocument } from "../types/Gym.types";

// ── Status theme map (shared with MemberTile) ────────────────────────
const STATUS_THEME = {
  active: { label: "Active", colorPalette: "green", accent: "green.400" },
  attention: { label: "Attention", colorPalette: "orange", accent: "orange.400" },
  frozen: { label: "Frozen", colorPalette: "blue", accent: "blue.400" },
} as const;

const formatDate = (date?: string) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

interface MemberTableRowProps {
  member: MemberDocument;
  onClick: (id: string) => void;
  style?: React.CSSProperties;
}

const MemberTableRow = memo(({ member, onClick, style }: MemberTableRowProps) => {
  const { data, _meta } = member;
  const first = data.firstName || "";
  const last = data.lastName || "";
  const fullName = `${first} ${last}`.trim() || "Unknown";
  const initials = `${first?.[0] || ""}${last?.[0] || ""}` || "GM";
  const status = data.status || "active";
  const theme = STATUS_THEME[status] || STATUS_THEME.active;

  const rowBg = useColorModeValue("rgba(255,255,255,0.6)", "rgba(15,23,42,0.5)");
  const hoverBg = useColorModeValue("rgba(237,242,247,0.8)", "rgba(30,41,59,0.7)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.5)", "rgba(255,255,255,0.06)");
  const muted = useColorModeValue("gray.500", "gray.400");

  const handleClick = useCallback(() => onClick(_meta.record_id), [onClick, _meta.record_id]);

  return (
    <HStack
      style={style}
      px={4}
      py={3}
      gap={4}
      bg={rowBg}
      borderBottom="1px solid"
      borderColor={borderColor}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{ bg: hoverBg, transform: "translateX(2px)" }}
      onClick={handleClick}
      role="group"
    >
      {/* Avatar + Name */}
      <HStack gap={3} minW="200px" flex={1.4}>
        <Avatar.Root size="sm" shape="rounded">
          <Avatar.Fallback bg={`${theme.accent}/12`} color={theme.accent} fontWeight="900" fontSize="xs">
            {initials}
          </Avatar.Fallback>
        </Avatar.Root>
        <VStack align="start" gap={0} minW={0}>
          <Text fontSize="sm" fontWeight="800" color="app.text.primary" lineClamp={1}>
            {fullName}
          </Text>
          <Text fontSize="2xs" color={muted} fontWeight="700" fontFamily="mono" lineClamp={1}>
            {data.member_id}
          </Text>
        </VStack>
      </HStack>

      {/* Status */}
      <Box minW="90px">
        <Badge
          colorPalette={theme.colorPalette}
          variant="subtle"
          borderRadius="full"
          px={2.5}
          py={0.5}
          fontSize="2xs"
          fontWeight="900"
        >
          {theme.label}
        </Badge>
      </Box>

      {/* Email */}
      <HStack gap={1.5} color={muted} minW="160px" flex={1} display={{ base: "none", lg: "flex" }}>
        <Icon as={LuMail} boxSize={3} />
        <Text fontSize="xs" fontWeight="700" lineClamp={1}>{data.email || "—"}</Text>
      </HStack>

      {/* Phone */}
      <HStack gap={1.5} color={muted} minW="120px" display={{ base: "none", xl: "flex" }}>
        <Icon as={LuPhone} boxSize={3} />
        <Text fontSize="xs" fontWeight="700">{data.phone || "—"}</Text>
      </HStack>

      {/* Joined */}
      <HStack gap={1.5} color={muted} minW="110px" display={{ base: "none", xl: "flex" }}>
        <Icon as={LuCalendarDays} boxSize={3} />
        <Text fontSize="xs" fontWeight="700">{formatDate(_meta.created?.at)}</Text>
      </HStack>

      {/* Plan */}
      <Box minW="120px" flex={0.8} display={{ base: "none", lg: "flex" }}>
        {member.has_plan === false ? (
          <Text fontSize="xs" fontWeight="800" color="red.500">No Plan</Text>
        ) : (
          <Text fontSize="xs" fontWeight="800" color="app.text.primary" lineClamp={1}>
            {member.subscription?.plan_name || data.plan || "Standard"}
          </Text>
        )}
      </Box>

      {/* Arrow */}
      <Box
        color={muted}
        transition="all 0.2s"
        _groupHover={{ color: theme.accent, transform: "translateX(3px)" }}
      >
        <LuArrowRight size={14} />
      </Box>
    </HStack>
  );
});

MemberTableRow.displayName = "MemberTableRow";
export default MemberTableRow;
