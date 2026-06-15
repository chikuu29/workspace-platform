/**
 * ViewMember.tsx
 *
 * Modern SaaS member directory for the gym app.
 * Supports card/table view toggle, client-side pagination,
 * and virtualized table scrolling via @tanstack/react-virtual.
 *
 * Redesign v2 — Cleaner glassmorphic cards, minimal chrome,
 * polished table with status dot indicators, refined typography.
 */

import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Circle,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Separator,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Crown,
  Dumbbell,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Snowflake,
  Sparkles,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";

import { PageHeader } from "@/core/components/PageHeader";
import { useGymMembers } from "./hooks/useGymMembers";
import { MemberDocument } from "./types/Gym.types";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { useEffect } from "react";
import { toaster } from "@/components/ui/toaster";
import MemberTableRow from "./components/MemberTableRow";
import Pagination, { PAGE_SIZES, type PageSize } from "./components/Pagination";

// ─── Design Tokens ───────────────────────────────────────────────────────────

const BRAND_HEX = "#422AFB";
const BRAND_ALT = "#7551FF";
const BRAND_GRADIENT = "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)";

const BILLING_LABEL: Record<string, string> = {
  monthly: "month",
  quarterly: "quarter",
  yearly: "year",
  "half-yearly": "6 months",
};

type ViewMode = "card" | "table";

type MemberFilter = "all" | "active" | "attention" | "frozen";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getMemberName = (data: MemberDocument["data"]) => {
  const first = data.firstName || "";
  const last = data.lastName || "";

  return {
    full: `${first} ${last}`.trim() || "Unknown Member",
    initials: `${first?.[0] || ""}${last?.[0] || ""}` || "GM",
  };
};

const getMemberContact = (data: MemberDocument["data"]) => ({
  email: data.email || "No email",
  phone: data.phone || "No phone",
});

const formatDate = (date?: string) => {
  if (!date) return "Recently added";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Recently added";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─── Status Theme ────────────────────────────────────────────────────────────

const statusStyles = {
  active: {
    label: "Active",
    colorPalette: "green",
    accent: "green.400",
    accentHex: "#22c55e",
    glow: "rgba(34,197,94,0.25)",
    bg: "green.500/10",
    border: "green.500/20",
  },
  attention: {
    label: "Needs attention",
    colorPalette: "orange",
    accent: "orange.400",
    accentHex: "#fb923c",
    glow: "rgba(251,146,60,0.25)",
    bg: "orange.500/10",
    border: "orange.500/20",
  },
  frozen: {
    label: "Frozen",
    colorPalette: "blue",
    accent: "blue.400",
    accentHex: "#60a5fa",
    glow: "rgba(96,165,250,0.25)",
    bg: "blue.500/10",
    border: "blue.500/20",
  },
} as const;

// ─── Avatar Color Palette ────────────────────────────────────────────────────

const AVATAR_PALETTES = [
  { bg: "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)", shadow: "rgba(117,81,255,0.40)" },
  { bg: "linear-gradient(135deg, #01B574 0%, #00875A 100%)", shadow: "rgba(1,181,116,0.40)" },
  { bg: "linear-gradient(135deg, #FFB547 0%, #FF8F00 100%)", shadow: "rgba(255,181,71,0.40)" },
  { bg: "linear-gradient(135deg, #3965FF 0%, #0037FF 100%)", shadow: "rgba(57,101,255,0.40)" },
  { bg: "linear-gradient(135deg, #EC4899 0%, #D01C78 100%)", shadow: "rgba(236,72,153,0.40)" },
  { bg: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)", shadow: "rgba(139,92,246,0.40)" },
  { bg: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)", shadow: "rgba(6,182,212,0.40)" },
] as const;

const getAvatarColorScheme = (name?: string) => {
  if (!name) return AVATAR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

/** Stat tile used in the hero metrics area */
const StatTile = memo(({
  label,
  value,
  caption,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  caption: string;
  icon: React.ElementType;
  accent: string;
}) => {
  const tileBg = useColorModeValue("rgba(255,255,255,0.78)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("whiteAlpha.900", "whiteAlpha.200");

  return (
    <Box
      p={{ base: 4, md: 5 }}
      borderRadius="2xl"
      bg={tileBg}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(18px) saturate(160%)"
      boxShadow="0 18px 42px -30px rgba(15, 23, 42, 0.55)"
    >
      <HStack justify="space-between" align="start" gap={4}>
        <VStack align="start" gap={1}>
          <Text fontSize="xs" color="app.text.muted" fontWeight="800" textTransform="uppercase">
            {label}
          </Text>
          <Heading size="xl" color="app.text.primary" letterSpacing="tight">
            {value}
          </Heading>
          <Text fontSize="xs" color="app.text.muted" fontWeight="600">
            {caption}
          </Text>
        </VStack>
        <Circle size="11" bg={`${accent}/12`} color={accent}>
          <Icon as={icon} boxSize={5} />
        </Circle>
      </HStack>
    </Box>
  );
});
StatTile.displayName = "StatTile";

/** Segmented filter pill */
const FilterButton = memo(({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <Button
    size="sm"
    variant={active ? "solid" : "ghost"}
    colorPalette={active ? "blue" : "gray"}
    borderRadius="xl"
    px={4}
    fontWeight="800"
    onClick={onClick}
  >
    {label}
  </Button>
));
FilterButton.displayName = "FilterButton";

// ─── Member Card (MemberProfile) ─────────────────────────────────────────────

/**
 * Redesigned member card — clean, minimal, premium aesthetic.
 *
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │  Gradient avatar  ·  Name + ID + Status │
 * │  Email · Phone · Expiry (compact grid)  │
 * │  Plan pill · Price · Payment badge       │
 * │  [Renew] [Upgrade] [Freeze]             │
 * └─────────────────────────────────────────┘
 */
const MemberProfile = memo(({
  member,
  onClick,
}: {
  member: MemberDocument;
  onClick: (id: string) => void;
}) => {
  const { data, _meta } = member;
  const name = getMemberName(data);
  const contact = getMemberContact(data);
  const status = data.status || "active";
  const statusTheme = statusStyles[status] || statusStyles.active;
  const avatarStyle = useMemo(() => getAvatarColorScheme(name.full), [name.full]);
  const sub = member.subscription;

  // Theme-aware colors
  const cardBg = useColorModeValue(
    "rgba(255,255,255,0.82)",
    "rgba(18,22,42,0.55)",
  );
  const cardBorder = useColorModeValue(
    "rgba(226,232,240,0.7)",
    "rgba(255,255,255,0.07)",
  );
  const hoverBorderColor = useColorModeValue(
    "rgba(117,81,255,0.35)",
    "rgba(117,81,255,0.45)",
  );
  const shadow = useColorModeValue(
    "0 4px 24px -8px rgba(0,0,0,0.06)",
    "0 8px 32px -12px rgba(0,0,0,0.35)",
  );
  const hoverShadow = useColorModeValue(
    "0 12px 40px -12px rgba(0,0,0,0.10)",
    `0 16px 48px -12px ${avatarStyle.shadow}`,
  );
  const muted = useColorModeValue("gray.500", "gray.400");
  const sectionBg = useColorModeValue(
    "rgba(248,250,252,0.8)",
    "rgba(255,255,255,0.03)",
  );
  const outlineBorder = useColorModeValue(
    "rgba(0,0,0,0.06)",
    "rgba(255,255,255,0.06)",
  );

  const handleClick = useCallback(() => {
    onClick(_meta.id);
  }, [onClick, _meta.id]);

  const handleRenew = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toaster.create({ title: "Renew Plan", description: `Navigating to renewals for ${name.full}...`, type: "success" });
    onClick(_meta.id);
  }, [onClick, _meta.id, name.full]);

  const handleUpgrade = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toaster.create({ title: "Upgrade Plan", description: `Navigating to plan template selection for ${name.full}...`, type: "info" });
    onClick(_meta.id);
  }, [onClick, _meta.id, name.full]);

  const handleFreeze = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toaster.create({ title: "Freeze Membership", description: `Membership freeze request dispatched for ${name.full}.`, type: "warning" });
  }, [name.full]);

  const fmtCurrency = useCallback(
    (amount: number, currency = "INR") =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      style={{ width: "100%" }}
    >
      <Box
        p={0}
        borderRadius="20px"
        bg={"app.card.bg"}
        border="1px solid"
        borderColor={cardBorder}
        boxShadow={shadow}
        backdropFilter="blur(24px) saturate(180%)"
        position="relative"
        overflow="hidden"
        cursor="pointer"
        transition="border-color 0.25s, box-shadow 0.3s"
        onClick={handleClick}
        _hover={{
          borderColor: hoverBorderColor,
          boxShadow: hoverShadow,
        }}
      >
        {/* ═══ Header Section: Avatar + Identity ═══ */}
        <Box p={5} pb={4}>
          <HStack gap={3.5} align="start">
            {/* Gradient Avatar */}
            <Circle
              size="52px"
              bg={avatarStyle.bg}
              color="white"
              fontWeight="950"
              fontSize="md"
              flexShrink={0}
              boxShadow={`0 4px 14px ${avatarStyle.shadow}`}
              position="relative"
            >
              {name.initials}
              {/* Live status dot — bottom-right of avatar */}
              <Box
                position="absolute"
                bottom="-1px"
                right="-1px"
                w="14px"
                h="14px"
                borderRadius="full"
                bg={statusTheme.accentHex}
                border="2.5px solid"
                borderColor={useColorModeValue("white", "rgba(18,22,42,1)")}
                boxShadow={`0 0 8px ${statusTheme.glow}`}
              />
            </Circle>

            {/* Name + badges */}
            <VStack align="start" gap={1} flex={1} minW={0}>
              <Heading
                fontSize="14px"
                fontWeight="900"
                color="app.text.primary"
                letterSpacing="-0.01em"
                lineHeight="1.3"
                lineClamp={1}
              >
                {name.full}
              </Heading>

              <HStack gap={1.5} flexWrap="wrap">
                {/* Member ID */}
                <Text
                  fontSize="10px"
                  fontFamily="mono"
                  fontWeight="700"
                  color={muted}
                  bg={sectionBg}
                  px={1.5}
                  py={0.5}
                  borderRadius="md"
                  lineClamp={1}
                >
                  {data?.member_id}
                </Text>

                {/* Status badge */}
                <Badge
                  fontSize="8px"
                  fontWeight="900"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  colorPalette={statusTheme.colorPalette}
                  variant="subtle"
                  textTransform="uppercase"
                  letterSpacing="0.04em"
                >
                  {statusTheme.label}
                </Badge>
              </HStack>

              {/* Plan name pill (if present) */}
              {sub?.plan_name && (
                <HStack gap={1.5} mt={0.5}>
                  <Crown size={10} color={BRAND_ALT} />
                  <Text
                    fontSize="10px"
                    fontWeight="800"
                    color={useColorModeValue(BRAND_HEX, "#a78bfa")}
                    letterSpacing="0.02em"
                  >
                    {sub.plan_name}
                  </Text>
                </HStack>
              )}
            </VStack>
          </HStack>
        </Box>

        {/* ═══ Info Grid: Contact + Membership ═══ */}
        <Box px={5} pb={3}>
          <Box
            p={3}
            borderRadius="14px"
            bg={sectionBg}
            border="1px solid"
            borderColor={outlineBorder}
          >
            <SimpleGrid columns={2} gap={2.5}>
              {/* Email */}
              <VStack align="start" gap={0.5}>
                <HStack gap={1} color={muted}>
                  <Mail size={9} />
                  <Text fontSize="8px" fontWeight="800" textTransform="uppercase" letterSpacing="0.06em">
                    Email
                  </Text>
                </HStack>
                <Text fontSize="10px" fontWeight="700" color="app.text.primary" lineClamp={1}>
                  {contact.email}
                </Text>
              </VStack>

              {/* Phone */}
              <VStack align="start" gap={0.5}>
                <HStack gap={1} color={muted}>
                  <Phone size={9} />
                  <Text fontSize="8px" fontWeight="800" textTransform="uppercase" letterSpacing="0.06em">
                    Phone
                  </Text>
                </HStack>
                <Text fontSize="10px" fontWeight="700" color="app.text.primary">
                  {contact.phone}
                </Text>
              </VStack>

              {/* Expiry */}
              <VStack align="start" gap={0.5}>
                <HStack gap={1} color={muted}>
                  <CalendarDays size={9} />
                  <Text fontSize="8px" fontWeight="800" textTransform="uppercase" letterSpacing="0.06em">
                    Expires
                  </Text>
                </HStack>
                <Text fontSize="10px" fontWeight="700" color="app.text.primary">
                  {formatDate(sub?.end_date)}
                </Text>
              </VStack>

              {/* Plan Cost */}
              <VStack align="start" gap={0.5}>
                <HStack gap={1} color={muted}>
                  <Zap size={9} />
                  <Text fontSize="8px" fontWeight="800" textTransform="uppercase" letterSpacing="0.06em">
                    Plan Cost
                  </Text>
                </HStack>
                <HStack gap={1} align="baseline">
                  <Text fontSize="11px" fontWeight="900" color="app.text.primary">
                    {fmtCurrency(sub?.price || 1500)}
                  </Text>
                  <Text fontSize="8px" fontWeight="600" color={muted}>
                    / {BILLING_LABEL[sub?.billing_cycle || "monthly"] || "mo"}
                  </Text>
                </HStack>
              </VStack>
            </SimpleGrid>
          </Box>
        </Box>

        {/* ═══ Action Buttons ═══ */}
        <Box px={5} pb={5}>
          <HStack gap={2} w="full">
            <Button
              size="xs"
              h="30px"
              flex={1}
              borderRadius="10px"
              fontWeight="900"
              fontSize="10px"
              letterSpacing="0.02em"
              bgImage={BRAND_GRADIENT}
              color="white"
              cursor="pointer"
              boxShadow={`0 3px 10px ${BRAND_HEX}30`}
              onClick={handleRenew}
              _hover={{ transform: "translateY(-1px)", boxShadow: `0 6px 14px ${BRAND_HEX}50` }}
              _active={{ transform: "scale(0.98)" }}
              transition="all 0.2s"
            >
              <Icon as={RefreshCw} boxSize={3} />
              <Text ml={1}>Renew</Text>
            </Button>
            <Button
              size="xs"
              h="30px"
              flex={1}
              borderRadius="10px"
              fontWeight="900"
              fontSize="10px"
              letterSpacing="0.02em"
              variant="outline"
              borderColor={outlineBorder}
              color="app.text.primary"
              cursor="pointer"
              onClick={handleUpgrade}
              transition="all 0.2s"
              _hover={{ bg: useColorModeValue("gray.50", "whiteAlpha.50"), borderColor: BRAND_HEX, color: BRAND_HEX, transform: "translateY(-1px)" }}
              _active={{ transform: "scale(0.98)" }}
            >
              <Icon as={Crown} boxSize={3} />
              <Text ml={1}>Upgrade</Text>
            </Button>
            <Button
              size="xs"
              h="30px"
              flex={1}
              borderRadius="10px"
              fontWeight="900"
              fontSize="10px"
              letterSpacing="0.02em"
              variant="outline"
              borderColor={outlineBorder}
              color="app.text.primary"
              cursor="pointer"
              onClick={handleFreeze}
              transition="all 0.2s"
              _hover={{ bg: useColorModeValue("gray.50", "whiteAlpha.50"), borderColor: "#3965FF", color: "#3965FF", transform: "translateY(-1px)" }}
              _active={{ transform: "scale(0.98)" }}
            >
              <Icon as={Snowflake} boxSize={3} />
              <Text ml={1}>Freeze</Text>
            </Button>
          </HStack>
        </Box>
      </Box>
    </motion.div>
  );
});
MemberProfile.displayName = "MemberProfile";

// ─── Main View ───────────────────────────────────────────────────────────────

const ViewMember = memo(() => {
  const { navigateTo } = useWorkspaceRouter();

  const handleMemberClick = useCallback(
    (id: string) => {
      navigateTo(`member/${id}`);
    },
    [navigateTo],
  );

  const renderMemberCard = useCallback(
    (member: MemberDocument) => (
      <MemberProfile
        key={member._id}
        member={member}
        onClick={handleMemberClick}
      />
    ),
    [handleMemberClick],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MemberFilter>("all");

  const { members, total, loading, refresh } = useGymMembers();

  const setNavActionConfig = useNavActionStore((state) => state.setNavActionConfig);
  const clearActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    setNavActionConfig([
      {
        id: "refresh",
        icon: RefreshCw,
        bg: "gradient_cyan_purple",
        color: "white",
        ariaLabel: "Refresh members",
        onClick: refresh,
        loading: loading,
        flexShrink: 0,
      },
      {
        id: "enroll",
        label: "New Member",
        icon: Plus,
        bg: "gradient_purple",
        color: "white",
        onClick: () => navigateTo("AddMember"),
      },
    ]);
    return () => clearActions();
  }, [setNavActionConfig, clearActions, refresh, loading, navigateTo]);

  const metrics = useMemo(() => {
    const active = members.filter((member) => member.data.status === "active").length;
    const attention = members.filter((member) => member.data.status === "attention").length;
    const frozen = members.filter((member) => member.data.status === "frozen").length;
    const retention = members.length ? Math.round((active / members.length) * 100) : 0;

    return { active, attention, frozen, retention };
  }, [members]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      const name = getMemberName(member.data);
      const contact = getMemberContact(member.data);
      const matchesFilter = activeFilter === "all" || member.data.status === activeFilter;
      const matchesSearch = !q ||
        name.full.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        contact.phone.toLowerCase().includes(q) ||
        member._meta.id.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, members, searchQuery]);

  // ── View mode + Pagination ──
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState<PageSize>(24);

  // Reset to page 0 when filter/search/pageSize changes
  useEffect(() => { setCurrentPage(0); }, [searchQuery, activeFilter, pageSize]);

  const totalPages = Math.ceil(filteredMembers.length / pageSize);

  // Paginated slice for card view
  const paginatedMembers = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  // Virtual scrolling for table view
  const tableRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filteredMembers.length,
    getScrollElement: () => tableRef.current,
    estimateSize: () => 56,
    overscan: 15,
  });

  const handleViewCard = useCallback(() => setViewMode("card"), []);
  const handleViewTable = useCallback(() => setViewMode("table"), []);
  const handlePageChange = useCallback((p: number) => setCurrentPage(p), []);
  const handlePageSizeChange = useCallback((s: PageSize) => setPageSize(s), []);

  const handleFilterAll = useCallback(() => setActiveFilter("all"), []);
  const handleFilterActive = useCallback(() => setActiveFilter("active"), []);
  const handleFilterAttention = useCallback(() => setActiveFilter("attention"), []);
  const handleFilterFrozen = useCallback(() => setActiveFilter("frozen"), []);

  // ── Theme values ──
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");
  const tableHeaderBg = useColorModeValue("rgba(248,250,252,0.95)", "rgba(20,25,45,0.85)");
  const segmentBg = useColorModeValue("rgba(0,0,0,0.025)", "rgba(255,255,255,0.02)");
  const segmentBorder = useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.04)");
  const viewToggleHoverBg = useColorModeValue("rgba(0,0,0,0.03)", "rgba(255,255,255,0.04)");

  const membersRequiringAttention = useMemo(
    () => members.filter((member) => member.data.status === "attention").slice(0, 5),
    [members],
  );

  return (
    <Box mt={4} animation="fade-in 0.5s ease-out" w="full">
      <PageHeader
        title="Member Directory"
        subtitle={`${total ?? members.length} registered members · Manage plans, renewals & attendance in one place.`}
        onSearchChange={setSearchQuery}
        searchValue={searchQuery}
        searchPlaceholder="Search members, email, phone or ID..."
        icon={Dumbbell}
        badge="Member Ops"
        accentColor="blue"
        actions={
          <HStack gap={2.5} flexWrap="wrap">
            {/* ── Status Filter Tabs ── */}
            <HStack
              gap={1}
              p={1}
              borderRadius="xl"
              bg={segmentBg}
              border="1px solid"
              borderColor={segmentBorder}
            >
              <FilterButton label="All" active={activeFilter === "all"} onClick={handleFilterAll} />
              <FilterButton label="Active" active={activeFilter === "active"} onClick={handleFilterActive} />
              <FilterButton label="Attention" active={activeFilter === "attention"} onClick={handleFilterAttention} />
              <FilterButton label="Frozen" active={activeFilter === "frozen"} onClick={handleFilterFrozen} />
            </HStack>

            {/* ── View Mode Toggle ── */}
            <HStack
              gap={0.5}
              p={1}
              borderRadius="xl"
              bg={segmentBg}
              border="1px solid"
              borderColor={segmentBorder}
            >
              <IconButton
                aria-label="Card view"
                size="xs"
                h="30px"
                w="30px"
                borderRadius="lg"
                bg={viewMode === "card" ? BRAND_GRADIENT : "transparent"}
                color={viewMode === "card" ? "white" : "app.text.muted"}
                boxShadow={viewMode === "card" ? `0 4px 10px ${BRAND_HEX}35` : undefined}
                variant={viewMode === "card" ? undefined : "ghost"}
                _hover={viewMode === "card" ? {} : { bg: viewToggleHoverBg }}
                onClick={handleViewCard}
              >
                <LayoutGrid size={14} />
              </IconButton>
              <IconButton
                aria-label="Table view"
                size="xs"
                h="30px"
                w="30px"
                borderRadius="lg"
                bg={viewMode === "table" ? BRAND_GRADIENT : "transparent"}
                color={viewMode === "table" ? "white" : "app.text.muted"}
                boxShadow={viewMode === "table" ? `0 4px 10px ${BRAND_HEX}35` : undefined}
                variant={viewMode === "table" ? undefined : "ghost"}
                _hover={viewMode === "table" ? {} : { bg: viewToggleHoverBg }}
                onClick={handleViewTable}
              >
                <List size={14} />
              </IconButton>
            </HStack>
          </HStack>
        }
      />
      <VStack align="stretch" gap={6} pb={8}>

        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 360px" }} gap={{ base: 6, xl: 8 }}>
          <GridItem minW={0}>
            <VStack align="stretch" gap={5}>

              {/* ═══ Content: Card or Table ═══ */}
              {loading ? (
                <SimpleGrid columns={{ base: 1, sm: 2, "2xl": 3 }} gap={{ base: 3, md: 4 }}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Skeleton key={item} height={viewMode === "card" ? "280px" : "56px"} borderRadius="20px" />
                  ))}
                </SimpleGrid>
              ) : filteredMembers.length > 0 ? (
                <>
                  {viewMode === "card" ? (
                    /* ── Card View (paginated) ── */
                    <SimpleGrid columns={{ base: 1, sm: 2, "2xl": 3 }} gap={{ base: 3, md: 4 }}>
                      {paginatedMembers.map(renderMemberCard)}
                    </SimpleGrid>
                  ) : (
                    /* ── Table View (virtual scroll) ── */
                    <Box
                      borderRadius="20px"
                      border="1px solid"
                      borderColor={borderColor}
                      overflow="hidden"
                      bg={panelBg}
                      backdropFilter="blur(20px)"
                    >
                      {/* Table header */}
                      <HStack
                        px={5}
                        py={3.5}
                        bg={tableHeaderBg}
                        borderBottom="1px solid"
                        borderColor={borderColor}
                        gap={4}
                      >
                        <Text fontSize="10px" fontWeight="900" color={muted} textTransform="uppercase" letterSpacing="0.06em" minW="200px" flex={1.4}>Member</Text>
                        <Text fontSize="10px" fontWeight="900" color={muted} textTransform="uppercase" letterSpacing="0.06em" minW="100px">Status</Text>
                        <Text fontSize="10px" fontWeight="900" color={muted} textTransform="uppercase" letterSpacing="0.06em" minW="160px" flex={1} display={{ base: "none", lg: "block" }}>Email</Text>
                        <Text fontSize="10px" fontWeight="900" color={muted} textTransform="uppercase" letterSpacing="0.06em" minW="120px" display={{ base: "none", xl: "block" }}>Phone</Text>
                        <Text fontSize="10px" fontWeight="900" color={muted} textTransform="uppercase" letterSpacing="0.06em" minW="110px" display={{ base: "none", xl: "block" }}>Joined</Text>
                        <Text fontSize="10px" fontWeight="900" color={muted} textTransform="uppercase" letterSpacing="0.06em" minW="120px" flex={0.8} display={{ base: "none", lg: "block" }}>Plan</Text>
                        <Box minW="14px" />
                      </HStack>

                      {/* Virtualized rows */}
                      <Box
                        ref={tableRef}
                        overflowY="auto"
                        maxH="600px"
                        css={{ scrollbarWidth: "thin" }}
                      >
                        <Box h={`${virtualizer.getTotalSize()}px`} position="relative" w="full">
                          {virtualizer.getVirtualItems().map((vRow) => {
                            const member = filteredMembers[vRow.index];
                            return (
                              <Box
                                key={vRow.key}
                                position="absolute"
                                top={0}
                                left={0}
                                w="full"
                                transform={`translateY(${vRow.start}px)`}
                              >
                                <MemberTableRow
                                  member={member}
                                  onClick={(id) => navigateTo(`member/${id}`)}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Pagination — shown for card view */}
                  {viewMode === "card" && totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredMembers.length}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  )}
                </>
              ) : (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  py={20}
                  gap={4}
                  borderRadius="20px"
                  bg={panelBg}
                  border="1px solid"
                  borderColor={borderColor}
                  backdropFilter="blur(20px)"
                >
                  <Circle size="16" bg="blue.500/10" color="blue.500">
                    <Users size={30} />
                  </Circle>
                  <VStack gap={1}>
                    <Heading size="sm" fontWeight="900">
                      No members found
                    </Heading>
                    <Text fontSize="sm" color={muted} fontWeight="600">
                      Try a different search, clear the filter, or enroll a new member.
                    </Text>
                  </VStack>
                </Flex>
              )}
            </VStack>
          </GridItem>

          {/* ═══ Sidebar: Priority Queue + Retention Health ═══ */}
          <GridItem>
            <VStack align="stretch" gap={5} position={{ xl: "sticky" }} top={{ xl: "7rem" }}>
              {/* Priority Queue */}
              <Box p={5} borderRadius="20px" bg={"app.card.bg"} border="1px solid" borderColor={borderColor}>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="sm" fontWeight="900">
                        Priority Queue
                      </Heading>
                      <Text fontSize="xs" color={muted} fontWeight="700">
                        Members needing renewal or staff review
                      </Text>
                    </VStack>
                    <Badge colorPalette="orange" borderRadius="full" variant="solid">
                      {membersRequiringAttention.length}
                    </Badge>
                  </HStack>

                  <VStack align="stretch" gap={3}>
                    {membersRequiringAttention.map((member) => {
                      const name = getMemberName(member.data);
                      return (
                        <HStack
                          key={member._id}
                          p={3}
                          borderRadius="14px"
                          bg="orange.500/10"
                          border="1px solid"
                          borderColor="orange.500/20"
                          gap={3}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ transform: "translateX(2px)", bg: "orange.500/15" }}
                          onClick={() => navigateTo(`members/${member._meta.id}`)}
                        >
                          <Avatar.Root size="sm" shape="rounded">
                            <Avatar.Fallback fontWeight="900" color="orange.600">
                              {name.initials}
                            </Avatar.Fallback>
                          </Avatar.Root>
                          <VStack align="start" gap={0} flex={1} minW={0}>
                            <Text fontSize="sm" fontWeight="900" truncate>
                              {name.full}
                            </Text>
                            <Text fontSize="xs" color="orange.600" fontWeight="800">
                              Renewal due
                            </Text>
                          </VStack>
                          <ArrowRight size={15} color="var(--chakra-colors-orange-500)" />
                        </HStack>
                      );
                    })}
                    {membersRequiringAttention.length === 0 && (
                      <Box p={4} borderRadius="14px" bg="green.500/10" border="1px solid" borderColor="green.500/20">
                        <Text fontSize="sm" color="green.600" fontWeight="800" textAlign="center">
                          All member accounts are current.
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </VStack>
              </Box>

              {/* Retention Health */}
              <Box p={5} borderRadius="20px" bg={"app.card.bg"} border="1px solid" borderColor={borderColor}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm" fontWeight="900">
                    Retention Health
                  </Heading>
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={muted} fontWeight="800">
                        Active ratio
                      </Text>
                      <Text fontSize="sm" color="green.500" fontWeight="900">
                        {metrics.retention}%
                      </Text>
                    </HStack>
                    <Box h="10px" bg="blackAlpha.100" borderRadius="full" overflow="hidden">
                      <Box
                        h="full"
                        w={`${metrics.retention}%`}
                        bg="linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"
                        borderRadius="full"
                        transition="width 0.6s ease"
                      />
                    </Box>
                    <Separator opacity={0.35} />
                    <SimpleGrid columns={2} gap={3}>
                      <Box p={3} borderRadius="14px" bg="blue.500/10">
                        <Text fontSize="xs" color={muted} fontWeight="800">
                          Search result
                        </Text>
                        <Text fontSize="lg" fontWeight="900">
                          {filteredMembers.length}
                        </Text>
                      </Box>
                      <Box p={3} borderRadius="14px" bg="purple.500/10">
                        <Text fontSize="xs" color={muted} fontWeight="800">
                          Plans tracked
                        </Text>
                        <Text fontSize="lg" fontWeight="900">
                          {new Set(members.map((member) => member.data.plan || "Standard")).size}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
});

ViewMember.displayName = "ViewMember";
export default ViewMember;
