/**
 * RecentEnrollmentsList.tsx
 *
 * Displays the 5 most recent member enrollments.
 * Fetches its own data directly to decouple from parent renders,
 * hashes names to map them to gorgeous linear gradients,
 * and features smooth hover transitions.
 */
import { memo, useCallback, useEffect, useState, useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
  Flex,
} from "@chakra-ui/react";
import { CircleCheck, ArrowRight } from "lucide-react";
import type { RecentMember } from "../types/Gym.types";
import { GymApiService } from "../services/gymApi.service";
import { useColorModeValue } from "@/components/ui/color-mode";

// ── Helpers ──────────────────────────────────────────────────────────

const formatDate = (date?: string): string => {
  if (!date) return "Recently";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const getInitials = (name?: string): string => {
  if (!name) return "GM";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Returns a premium linear gradient based on the hash of the member's name.
 */
const getAvatarColorScheme = (name?: string) => {
  const colors = [
    { bg: "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)", color: "#FFFFFF" }, // Indigo
    { bg: "linear-gradient(135deg, #01B574 0%, #00875A 100%)", color: "#FFFFFF" }, // Emerald
    { bg: "linear-gradient(135deg, #FFB547 0%, #FF8F00 100%)", color: "#FFFFFF" }, // Amber
    { bg: "linear-gradient(135deg, #3965FF 0%, #0037FF 100%)", color: "#FFFFFF" }, // Neon Blue
    { bg: "linear-gradient(135deg, #EC4899 0%, #D01C78 100%)", color: "#FFFFFF" }, // Magenta
    { bg: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)", color: "#FFFFFF" }, // Violet
    { bg: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)", color: "#FFFFFF" }, // Cyan
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// ── Types ────────────────────────────────────────────────────────────

interface RecentEnrollmentsListProps {
  onViewAll: () => void;
  onMemberClick: (recordId: string) => void;
}

interface MemberRowProps {
  member: RecentMember;
  onClick: (recordId: string) => void;
}

const STATUS_MAP = {
  active: { label: "Active", colorPalette: "green", indicatorColor: "#01B574" },
  attention: { label: "Attention", colorPalette: "orange", indicatorColor: "#FFB547" },
  frozen: { label: "Frozen", colorPalette: "blue", indicatorColor: "#3965FF" },
};

// ── Member Row Component (Memoized) ──────────────────────────────────

const MemberRow = memo(({ member, onClick }: MemberRowProps) => {
  const handleClick = useCallback(
    () => onClick(member.id),
    [onClick, member.id],
  );

  const avatarStyle = useMemo(() => getAvatarColorScheme(member.name), [member.name]);
  const formattedDate = useMemo(() => formatDate(member.created_at), [member.created_at]);
  const initials = useMemo(() => getInitials(member.name), [member.name]);

  const statusInfo = useMemo(() => {
    const s = member.status || "active";
    return STATUS_MAP[s as keyof typeof STATUS_MAP] || STATUS_MAP.active;
  }, [member.status]);

  const rowBg = useColorModeValue("rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.02)");
  const hoverBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.06)");
  const rowBorder = useColorModeValue("rgba(226, 232, 240, 0.6)", "rgba(255, 255, 255, 0.04)");

  return (
    <HStack
      justify="space-between"
      p={3.5}
      borderRadius="xl"
      bg={rowBg}
      border="1px solid"
      borderColor={rowBorder}
      cursor="pointer"
      transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        bg: hoverBg,
        borderColor: "app.text.accent/20",
        transform: "translateX(6px)",
        boxShadow: "0 4px 20px -8px rgba(0, 0, 0, 0.08)",
      }}
      onClick={handleClick}
      role="group"
    >
      <HStack gap={3.5} minW={0} flex={1}>
        {/* Custom Gradient Avatar with Dynamic Status Ring */}
        <Flex
          align="center"
          justify="center"
          w="42px"
          h="42px"
          borderRadius="14px"
          bg={avatarStyle.bg}
          color={avatarStyle.color}
          fontWeight="800"
          fontSize="xs"
          boxShadow="sm"
          position="relative"
          flexShrink={0}
          transition="transform 0.25s"
          _groupHover={{ transform: "scale(1.05)" }}
        >
          {initials}
          <Box
            position="absolute"
            bottom="-2px"
            right="-2px"
            w="10px"
            h="10px"
            bg={statusInfo.indicatorColor}
            borderRadius="full"
            border="2px solid"
            borderColor="app.card.bg"
          />
        </Flex>

        <VStack align="start" gap={0} minW={0} flex={1}>
          <Text
            fontSize="sm"
            fontWeight="800"
            color="app.text.primary"
            truncate
            _groupHover={{ color: "app.text.accent" }}
            transition="color 0.2s"
          >
            {member.name}
          </Text>
          <Text fontSize="xs" fontWeight="600" color="app.text.muted" truncate>
            {member.plan} • {formattedDate}
          </Text>
        </VStack>
      </HStack>

      <HStack gap={2}>
        <Badge
          colorPalette={statusInfo.colorPalette}
          variant="subtle"
          borderRadius="full"
          fontWeight="800"
          fontSize="3xs"
          px={2.5}
          py={0.5}
        >
          {statusInfo.label}
        </Badge>
        <Box
          opacity={0}
          transform="translateX(-4px)"
          transition="all 0.2s"
          color="app.text.accent"
          _groupHover={{ opacity: 1, transform: "translateX(0)" }}
        >
          <ArrowRight size={14} strokeWidth={2.5} />
        </Box>
      </HStack>
    </HStack>
  );
});
MemberRow.displayName = "MemberRow";

// ── Main Component (Memoized) ─────────────────────────────────────────

const RecentEnrollmentsList = memo(({ onViewAll, onMemberClick }: RecentEnrollmentsListProps) => {
  const [members, setMembers] = useState<RecentMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch recent enrollments directly inside the component
  useEffect(() => {
    setLoading(true);
    const subscription = GymApiService.getGymKPIs().subscribe({
      next: (data) => {
        setMembers(data.recent_members || []);
        setLoading(false);
      },
      error: (err) => {
        console.error("Failed to fetch recent enrollments:", err);
        setLoading(false);
      },
    });
    return () => subscription.unsubscribe();
  }, []);

  const displayMembers = useMemo(() => members.slice(0, 5), [members]);
  const borderColor = useColorModeValue("rgba(226, 232, 240, 0.84)", "rgba(255, 255, 255, 0.12)");

  const renderMemberRow = useCallback(
    (m: RecentMember) => (
      <MemberRow
        key={m.id}
        member={m}
        onClick={onMemberClick}
      />
    ),
    [onMemberClick],
  );

  return (
    <Box
      p={5.5}
      borderRadius="24px"
      bg={"app.card.bg"}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px) saturate(160%)"
      boxShadow={useColorModeValue("0 10px 30px rgba(0, 0, 0, 0.04)", "0 4px 20px rgba(0, 0, 0, 0.2)")}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative vertical accent bar */}
      <Box
        position="absolute"
        top="0"
        left="0"
        bottom="0"
        w="4px"
        bgGradient="linear(to-b, #7551FF, #422AFB)"
      />

      <VStack align="stretch" gap={5} pl={3.5} pr={1} py={1.5}>
        <HStack justify="space-between" align="center" mb={1.5}>
          <VStack align="start" gap={1}>
            <Heading size="sm" fontWeight="900" color="app.text.primary">
              Recent Enrollments
            </Heading>
            <Text fontSize="xs" fontWeight="600" color="app.text.muted">
              Newly registered gym subscribers
            </Text>
          </VStack>
          <Button
            variant="ghost"
            size="xs"
            borderRadius="lg"
            fontWeight="800"
            color="app.text.accent"
            onClick={onViewAll}
            _hover={{ bg: "app.text.accent/10" }}
          >
            View all
          </Button>
        </HStack>

        <Skeleton loading={loading} borderRadius="xl" minH={loading ? "180px" : undefined}>
          <VStack align="stretch" gap={2}>
            {displayMembers.map(renderMemberRow)}
            {!loading && displayMembers.length === 0 && (
              <VStack py={8} gap={2}>
                <Box color="app.text.muted" opacity={0.4}>
                  <CircleCheck size={32} strokeWidth={1.5} />
                </Box>
                <Text fontSize="sm" color="app.text.muted" fontWeight="600">
                  No recent enrollments yet.
                </Text>
              </VStack>
            )}
          </VStack>
        </Skeleton>
      </VStack>
    </Box>
  );
});

RecentEnrollmentsList.displayName = "RecentEnrollmentsList";
export default RecentEnrollmentsList;
