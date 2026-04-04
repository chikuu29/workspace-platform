/**
 * ViewMember — Gym member directory with action sidebar.
 *
 * Uses the shared PageLayout + PageHeader pattern.
 * Layout: left member grid + right action-required panel (full height tile).
 * Responsive: stacks vertically on mobile/tablet.
 * Fetches real data from GET /gym/members.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import {
  LuArrowRight,
  LuCalendarClock,
  LuLoaderCircle,
  LuMail,
  LuPhone,
  LuPlus,
  LuUsers,
} from "react-icons/lu";
import { GETAPI } from "@/app/api";
import { PageLayout } from "@/core/components/PageLayout";

// ── Types ──────────────────────────────────────────────────────────────

interface MemberDocument {
  _id: string;
  _org: {
    org_id: number;
    org_uuid: string;
    org_name: string;
    app_code: string;
    app_name: string;
  };
  _meta: {
    entity_type: string;
    record_id: string;
    version: number;
    is_deleted: boolean;
    created: { at: string; by: string };
    updated: { at: string; by: string };
    deleted: { at: string; by: string } | null;
  };
  data: Record<string, string>;
}

interface MembersResponse {
  success: boolean;
  data: MemberDocument[];
  total: number;
  skip: number;
  limit: number;
}

// ── Utilities ──────────────────────────────────────────────────────────

const getInitials = (first?: string, last?: string): string => {
  const f = first?.charAt(0)?.toUpperCase() ?? "";
  const l = last?.charAt(0)?.toUpperCase() ?? "";
  return f + l || "?";
};

const formatDate = (isoString?: string): string => {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const getFullName = (d: Record<string, string>): string =>
  [d.firstName, d.lastName].filter(Boolean).join(" ") || "Unnamed";

// ── Member Card ────────────────────────────────────────────────────────

interface MemberCardProps {
  member: MemberDocument;
  onView: (id: string) => void;
}

const MemberCard = ({ member, onView }: MemberCardProps) => {
  const d = member.data;
  const initials = getInitials(d.firstName, d.lastName);
  const fullName = getFullName(d);

  const handleClick = useCallback(() => {
    onView(member._meta.record_id);
  }, [member._meta.record_id, onView]);

  return (
    <Box
      bg="app.card.bg"
      border="1px solid"
      borderColor="app.card.border"
      borderRadius="xl"
      p={4}
      cursor="pointer"
      onClick={handleClick}
      transition="all 0.2s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
        borderColor: "app.text.accent",
      }}
    >
      <VStack align="stretch" gap={3.5}>
        {/* Header: Avatar + Name */}
        <Flex gap={3} align="center">
          <Avatar.Root size="md">
            <Avatar.Fallback fontWeight="700" fontSize="sm">
              {initials}
            </Avatar.Fallback>
          </Avatar.Root>

          <VStack align="start" gap="0" flex="1" minW="0">
            <Text
              fontSize="sm"
              fontWeight="700"
              color="app.text.primary"
              lineClamp={1}
            >
              {fullName}
            </Text>
            <Text
              fontSize="xs"
              color="app.text.muted"
              fontWeight="500"
              fontFamily="mono"
            >
              {member._meta.record_id}
            </Text>
          </VStack>

          {d.member_id && (
            <Badge
              colorPalette="purple"
              variant="subtle"
              px={2}
              py={0.5}
              borderRadius="full"
              fontSize="2xs"
              fontWeight="700"
            >
              {d.member_id}
            </Badge>
          )}
        </Flex>

        {/* Contact */}
        <VStack align="stretch" gap={1.5}>
          {d.email && (
            <HStack gap={2} color="app.text.muted">
              <LuMail size={13} />
              <Text fontSize="xs" fontWeight="500" lineClamp={1}>
                {d.email}
              </Text>
            </HStack>
          )}
          {d.phone && (
            <HStack gap={2} color="app.text.muted">
              <LuPhone size={13} />
              <Text fontSize="xs" fontWeight="500">
                {d.phone}
              </Text>
            </HStack>
          )}
        </VStack>

        {/* Footer */}
        <Flex justify="space-between" align="center">
          <Text fontSize="2xs" color="app.text.muted" fontWeight="500">
            Joined {formatDate(member._meta.created.at)}
          </Text>
          <Text fontSize="2xs" color="app.text.muted" fontWeight="500">
            v{member._meta.version}
          </Text>
        </Flex>
      </VStack>
    </Box>
  );
};

// ── Action Sidebar Item ────────────────────────────────────────────────

interface ActionItemProps {
  member: MemberDocument;
  reason: string;
}

const ActionItem = ({ member, reason }: ActionItemProps) => {
  const d = member.data;
  const fullName = getFullName(d);

  return (
    <Box
      p={3}
      borderRadius="lg"
      bg="app.card.bg"
      border="1px solid"
      borderColor="app.card.border"
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        borderColor: "app.text.accent",
        transform: "translateX(2px)",
      }}
    >
      <Flex gap={3} align="center">
        <Avatar.Root size="sm">
          <Avatar.Fallback fontWeight="700" fontSize="xs">
            {getInitials(d.firstName, d.lastName)}
          </Avatar.Fallback>
        </Avatar.Root>

        <VStack align="start" gap="0" flex="1" minW="0">
          <Text fontSize="sm" fontWeight="600" color="app.text.primary" lineClamp={1}>
            {fullName}
          </Text>
          <Text fontSize="xs" color="app.text.muted" fontWeight="500">
            {reason}
          </Text>
        </VStack>

        <Box color="app.text.muted">
          <LuArrowRight size={14} />
        </Box>
      </Flex>
    </Box>
  );
};

// ── Empty State ────────────────────────────────────────────────────────

const EmptyState = ({ hasSearch }: { hasSearch: boolean }) => (
  <Flex direction="column" align="center" justify="center" py={16} gap={4}>
    <Flex
      w="14"
      h="14"
      borderRadius="xl"
      bg="app.card.bg"
      border="1px solid"
      borderColor="app.card.border"
      color="app.text.accent"
      align="center"
      justify="center"
    >
      <LuUsers size={24} />
    </Flex>
    <VStack gap={1}>
      <Heading size="sm" fontWeight="700" color="app.text.primary">
        {hasSearch ? "No members found" : "No members yet"}
      </Heading>
      <Text color="app.text.muted" textAlign="center" maxW="xs" fontSize="sm">
        {hasSearch
          ? "Try a different search term."
          : "Add your first member to get started."}
      </Text>
    </VStack>
  </Flex>
);

// ── Main Component ─────────────────────────────────────────────────────

const ViewMember = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { appCode } = useParams();
  const [searchParams] = useSearchParams();

  const [members, setMembers] = useState<MemberDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // ── Path builder ──────────────────────────────────────────────────
  const appParam = searchParams.get("app");
  const appName = appCode || appParam || "myGym";
  const workspacePrefix = pathname.includes("/workspace")
    ? `${pathname.split("/workspace")[0]}/workspace`
    : "";

  const buildViewPath = useCallback(
    (viewName: string) => {
      if (appCode) return `${workspacePrefix}/app/${appCode}/${viewName}`;
      return `${workspacePrefix}/${viewName}?app=${appName}`;
    },
    [appCode, workspacePrefix, appName]
  );

  // ── Fetch members ─────────────────────────────────────────────────
  const fetchMembers = useCallback(() => {
    setLoading(true);
    const sub = GETAPI({
      path: "gym/members",
      isPrivateApi: true,
    }).subscribe({
      next: (res: MembersResponse) => {
        if (res.success) {
          setMembers(res.data || []);
          setTotal(res.total || 0);
        }
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const cleanup = fetchMembers();
    return cleanup;
  }, [fetchMembers]);

  // ── Search filter ─────────────────────────────────────────────────
  const normalizedQuery = query.trim().toLowerCase();

  const filteredMembers = useMemo(() => {
    if (!normalizedQuery) return members;
    return members.filter((m) => {
      const d = m.data;
      const haystack = [
        d.firstName,
        d.lastName,
        d.email,
        d.phone,
        d.member_id,
        m._meta.record_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [members, normalizedQuery]);

  // ── Action required members (extend with real logic later) ────────
  const actionMembers = useMemo(() => {
    // Placeholder: show first 5 — replace with expired/inactive rules
    return members.slice(0, 5).map((m) => ({
      member: m,
      reason: "Review required",
    }));
  }, [members]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleAddMember = useCallback(() => {
    navigate(buildViewPath("AddMember"));
  }, [navigate, buildViewPath]);

  const handleViewMember = useCallback(
    (recordId: string) => {
      navigate(buildViewPath(`members/${recordId}`));
    },
    [navigate, buildViewPath]
  );

  const handleSearchChange = useCallback((val: string) => {
    setQuery(val);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ── Subtitle text ─────────────────────────────────────────────────
  const subtitle = useMemo(() => {
    if (loading) return "Loading…";
    return `${total} member${total !== 1 ? "s" : ""} in your organization`;
  }, [loading, total]);

  // ── Action button for PageHeader ──────────────────────────────────
  const headerActions = useMemo(
    () => (
      <Button
        colorPalette="purple"
        size="sm"
        borderRadius="lg"
        px={4}
        fontWeight="700"
        onClick={handleAddMember}
      >
        <LuPlus size={16} />
        Add Member
      </Button>
    ),
    [handleAddMember]
  );

  return (
    <PageLayout
      title="Gym Members"
      subtitle={subtitle}
      actions={headerActions}
      searchPlaceholder="Search by name, email, phone, or ID…"
      searchValue={query}
      onSearchChange={handleSearchChange}
      showRefresh
      onRefresh={handleRefresh}
      isRefreshing={loading}
    >
      {/* Loading State */}
      {loading && (
        <Flex justify="center" py={16}>
          <Spinner size="lg" color="app.text.accent" />
        </Flex>
      )}

      {/* Main Grid: members (left) + actions (right) */}
      {!loading && (
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 300px" }}
          gap={5}
        >
          {/* ── LEFT: Member Cards ── */}
          <GridItem>
            {filteredMembers.length > 0 ? (
              <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} gap={4}>
                {filteredMembers.map((member) => (
                  <MemberCard
                    key={member._id}
                    member={member}
                    onView={handleViewMember}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <EmptyState hasSearch={normalizedQuery.length > 0} />
            )}
          </GridItem>

          {/* ── RIGHT: Action Required Panel (full tile height) ── */}
          <GridItem>
            <Box
              position="sticky"
              top="4"
              bg="app.card.bg"
              border="1px solid"
              borderColor="app.card.border"
              borderRadius="xl"
              p={4}
              h="fit-content"
            >
              <VStack align="stretch" gap={4}>
                {/* Header */}
                <HStack gap={2.5}>
                  <Flex
                    w="8"
                    h="8"
                    borderRadius="lg"
                    bg="orange.100"
                    color="orange.500"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <LuLoaderCircle size={16} />
                  </Flex>
                  <VStack align="start" gap="0">
                    <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                      Action Required
                    </Text>
                    <Text fontSize="xs" color="app.text.muted" fontWeight="500">
                      {actionMembers.length} member{actionMembers.length !== 1 ? "s" : ""}
                    </Text>
                  </VStack>
                </HStack>

                {/* Action List */}
                {actionMembers.length > 0 ? (
                  <VStack align="stretch" gap={2}>
                    {actionMembers.map(({ member, reason }) => (
                      <ActionItem
                        key={member._id}
                        member={member}
                        reason={reason}
                      />
                    ))}
                  </VStack>
                ) : (
                  <VStack py={6}>
                    <Text fontSize="sm" color="app.text.muted">
                      All clear!
                    </Text>
                  </VStack>
                )}

                {/* Divider */}
                <Box h="1px" bg="app.divider" />

                {/* Quick Stats */}
                <VStack align="stretch" gap={2}>
                  <Text
                    fontSize="2xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color="app.text.accent"
                  >
                    Quick stats
                  </Text>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="app.text.muted">
                      Total members
                    </Text>
                    <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                      {total}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="app.text.muted">
                      Showing
                    </Text>
                    <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                      {filteredMembers.length}
                    </Text>
                  </HStack>
                </VStack>

                {/* Divider */}
                <Box h="1px" bg="app.divider" />

                {/* Upcoming Renewals */}
                <HStack gap={2.5} p={2}>
                  <LuCalendarClock size={14} color="var(--chakra-colors-orange-500)" />
                  <VStack align="start" gap="0">
                    <Text fontSize="xs" fontWeight="600" color="app.text.primary">
                      Upcoming renewals
                    </Text>
                    <Text fontSize="2xs" color="app.text.muted">
                      Coming soon
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      )}
    </PageLayout>
  );
};

export default ViewMember;
