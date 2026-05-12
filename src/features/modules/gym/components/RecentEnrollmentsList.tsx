/**
 * RecentEnrollmentsList.tsx
 *
 * Displays the 5 most recent member enrollments with avatar,
 * name, plan, date, and status badge. Fully theme-aware.
 */
import { memo, useCallback } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CircleCheck } from "lucide-react";
import type { RecentMember } from "../types/Gym.types";
import { useColorModeValue } from "@/components/ui/color-mode";

const formatDate = (date?: string): string => {
  if (!date) return "Recently";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const getInitials = (name?: string): string =>
  name?.slice(0, 2).toUpperCase() || "GM";

interface RecentEnrollmentsListProps {
  members: RecentMember[];
  loading: boolean;
  onViewAll: () => void;
  onMemberClick: (recordId: string) => void;
}

interface MemberRowProps {
  member: RecentMember;
  onClick: (recordId: string) => void;
}

const MemberRow = memo(({ member, onClick }: MemberRowProps) => {
  const handleClick = useCallback(
    () => onClick(member.record_id),
    [onClick, member.record_id],
  );

  return (
    <HStack
      justify="space-between"
      p={3}
      borderRadius="xl"
      bg="app.text.accent/6"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ bg: "app.text.accent/10", transform: "translateX(3px)" }}
      onClick={handleClick}
    >
      <HStack gap={3} minW={0}>
        <Avatar.Root size="sm" shape="rounded">
          <Avatar.Fallback fontWeight="800" fontSize="xs">
            {getInitials(member.name)}
          </Avatar.Fallback>
        </Avatar.Root>
        <VStack align="start" gap={0} minW={0}>
          <Text fontSize="sm" fontWeight="800" color="app.text.primary" truncate>{member.name}</Text>
          <Text fontSize="xs" fontWeight="600" color="app.text.muted" truncate>
            {member.plan} • {formatDate(member.created_at)}
          </Text>
        </VStack>
      </HStack>
      <Badge colorPalette="green" variant="subtle" borderRadius="full" fontWeight="700" fontSize="2xs">Active</Badge>
    </HStack>
  );
});
MemberRow.displayName = "MemberRow";

const RecentEnrollmentsList = memo(({ members, loading, onViewAll, onMemberClick }: RecentEnrollmentsListProps) => {
  const displayMembers = members.slice(0, 5);
  // const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");

  return (
    <Box
      p={5}
      borderRadius="2xl"
      bg={"app.card.bg"}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(16px) saturate(140%)"
      boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}
    >
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <Heading size="sm" fontWeight="900" color="app.text.primary">Recent Enrollments</Heading>
          <Button variant="ghost" size="xs" borderRadius="lg" fontWeight="800" color="app.text.accent" onClick={onViewAll}>View all</Button>
        </HStack>
        <Skeleton loading={loading} borderRadius="xl" minH={loading ? "180px" : undefined}>
          <VStack align="stretch" gap={2}>
            {displayMembers.map((m) => <MemberRow key={m.record_id} member={m} onClick={onMemberClick} />)}
            {!loading && displayMembers.length === 0 && (
              <VStack py={8} gap={2}>
                <Box color="app.text.muted" opacity={0.4}><CircleCheck size={32} strokeWidth={1.5} /></Box>
                <Text fontSize="sm" color="app.text.muted" fontWeight="600">No recent enrollments yet.</Text>
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
