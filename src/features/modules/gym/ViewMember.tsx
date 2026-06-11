/**
 * ViewMember.tsx
 *
 * Modern SaaS member directory for the gym app.
 * Supports card/table view toggle, client-side pagination,
 * and virtualized table scrolling via @tanstack/react-virtual.
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
  Filter,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  UserCheck,
  Users,
  Dumbbell,
  CreditCard,
  Zap,
  User,
  Snowflake,
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
  phone: data.phone || "No phone"
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

const statusStyles = {
  active: {
    label: "Active",
    colorPalette: "green",
    accent: "green.400",
    bg: "green.500/10",
    border: "green.500/20",
  },
  attention: {
    label: "Needs attention",
    colorPalette: "orange",
    accent: "orange.400",
    bg: "orange.500/10",
    border: "orange.500/20",
  },
  frozen: {
    label: "Frozen",
    colorPalette: "blue",
    accent: "blue.400",
    bg: "blue.500/10",
    border: "blue.500/20",
  },
} as const;

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

const getAvatarColorScheme = (name?: string) => {
  const colors = [
    { bg: "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)", color: "#FFFFFF", shadow: "rgba(117, 81, 255, 0.4)" }, // Indigo
    { bg: "linear-gradient(135deg, #01B574 0%, #00875A 100%)", color: "#FFFFFF", shadow: "rgba(1, 181, 116, 0.4)" }, // Emerald
    { bg: "linear-gradient(135deg, #FFB547 0%, #FF8F00 100%)", color: "#FFFFFF", shadow: "rgba(255, 181, 71, 0.4)" }, // Amber
    { bg: "linear-gradient(135deg, #3965FF 0%, #0037FF 100%)", color: "#FFFFFF", shadow: "rgba(57, 101, 255, 0.4)" }, // Neon Blue
    { bg: "linear-gradient(135deg, #EC4899 0%, #D01C78 100%)", color: "#FFFFFF", shadow: "rgba(236, 72, 153, 0.4)" }, // Magenta
    { bg: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)", color: "#FFFFFF", shadow: "rgba(139, 92, 246, 0.4)" }, // Violet
    { bg: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)", color: "#FFFFFF", shadow: "rgba(6, 182, 212, 0.4)" }, // Cyan
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const CardFloatingParticles = memo(() => {
  const particles = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 3,
      xStart: Math.random() * 100,
      yStart: Math.random() * 100,
      duration: Math.random() * 8 + 12,
      delay: Math.random() * -6,
    }));
  }, []);

  const particleColor = useColorModeValue("rgba(117, 81, 255, 0.05)", "rgba(117, 81, 255, 0.12)");

  return (
    <Box position="absolute" inset={0} overflow="hidden" pointerEvents="none" zIndex={0}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: particleColor,
            left: `${p.xStart}%`,
            top: `${p.yStart}%`,
          }}
          animate={{
            y: ["0px", "-40px", "0px"],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </Box>
  );
});
CardFloatingParticles.displayName = "CardFloatingParticles";

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

  const cardBorder = useColorModeValue("rgba(226, 232, 240, 0.78)", "rgba(255, 255, 255, 0.08)");
  const sectionBg = useColorModeValue("rgba(0, 0, 0, 0.02)", "rgba(255, 255, 255, 0.02)");
  const cardBg = useColorModeValue(
    "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 244, 255, 0.88) 100%)",
    "linear-gradient(135deg, rgba(26, 22, 55, 0.45) 0%, rgba(14, 18, 36, 0.75) 100%)"
  );
  const shadow = useColorModeValue("0 10px 30px rgba(0, 0, 0, 0.04)", "0 8px 32px rgba(0, 0, 0, 0.22)");
  const hoverShadow = useColorModeValue("0 20px 48px rgba(0, 0, 0, 0.08)", `0 16px 48px ${avatarStyle.shadow}`);
  const outlineBorder = useColorModeValue("rgba(0,0,0,0.06)", "rgba(255,255,255,0.06)");
  const muted = useColorModeValue("gray.500", "gray.400");

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

  const bannerGradient = useMemo(() => {
    if (status === "active") {
      return "linear-gradient(135deg, #0A0C16 0%, #15102a 60%, #422afb 100%)";
    }
    if (status === "frozen") {
      return "linear-gradient(135deg, #0A0C16 0%, #0c182f 60%, #3965ff 100%)";
    }
    return "linear-gradient(135deg, #0A0C16 0%, #20130a 60%, #ffb547 100%)";
  }, [status]);

  const fmtCurrency = useCallback((amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount),
    []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      style={{ width: "100%" }}
    >
      <Box
        p={0}
        borderRadius="24px"
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        boxShadow={shadow}
        backdropFilter="blur(20px) saturate(180%)"
        position="relative"
        overflow="hidden"
        cursor="pointer"
        transition="border-color 0.25s, box-shadow 0.3s"
        onClick={handleClick}
        _hover={{
          borderColor: statusTheme.accent,
          boxShadow: hoverShadow,
        }}
      >
        {/* Floating Ambient Particles Inside Card */}
        <CardFloatingParticles />

        {/* 1. Full-width cover banner */}
        <Box h="110px" bg={bannerGradient} position="relative" zIndex={0}>
          <Box
            position="absolute"
            inset={0}
            borderBottom="1px solid"
            borderColor="rgba(255,255,255,0.08)"
            bg="linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.4) 100%)"
          />
        </Box>

        {/* 2. Glassmorphism profile container */}
        <VStack align="center" gap={3} pt={0} pb={5} px={4.5} w="full" position="relative" zIndex={1} mt="-40px">
          {/* Overlapping Avatar */}
          <Circle
            size="80px"
            bg={useColorModeValue("white", "rgba(18,22,40,1)")}
            p="3px"
            boxShadow={`0 0 15px ${statusTheme.accent}33`}
            border="2px solid"
            borderColor={statusTheme.accent}
          >
            <Circle
              size="100%"
              bg={`linear-gradient(135deg, ${statusTheme.accent}20, ${statusTheme.accent}05)`}
              color={statusTheme.accent}
              fontWeight="950"
              fontSize="xl"
              style={{ textShadow: `0 0 8px ${statusTheme.accent}25` }}
            >
              {name.initials}
            </Circle>
          </Circle>

          {/* Centered Identity details */}
          <VStack align="center" gap={1} textAlign="center" w="full">
            <Heading fontSize="sm" fontWeight="950" color="app.text.primary" letterSpacing="tight" lineHeight="1.2">
              {name.full}
            </Heading>
            <HStack gap={2} justify="center" flexWrap="wrap">
              <Text fontSize="10px" fontFamily="mono" fontWeight="700" color="app.text.muted" bg={sectionBg} px={1.5} py={0.2} borderRadius="md">
                {data?.member_id}
              </Text>
              <Badge
                fontSize="9px"
                fontWeight="900"
                px={2.5}
                py={0.5}
                borderRadius="full"
                bg={`${statusTheme.accent}15`}
                color={statusTheme.accent}
                border={`1px solid ${statusTheme.accent}30`}
              >
                {statusTheme.label.toUpperCase()}
              </Badge>
              {sub?.plan_name && (
                <Badge
                  fontSize="9px"
                  fontWeight="900"
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  bg={`${BRAND_HEX}15`}
                  color={useColorModeValue(BRAND_HEX, "#9c8cff")}
                  border={`1px solid ${BRAND_HEX}30`}
                >
                  {sub.plan_name.toUpperCase()}
                </Badge>
              )}
            </HStack>
          </VStack>

          {/* Quick Action buttons (Renew, Upgrade, Freeze) */}
          <HStack gap={2} mt={1} w="full" justify="center">
            <Button
              size="xs"
              h="26px"
              borderRadius="full"
              fontWeight="900"
              fontSize="9px"
              style={{ background: BRAND_GRADIENT, color: "white" }}
              boxShadow={`0 3px 8px ${BRAND_HEX}30`}
              onClick={handleRenew}
            >
              Renew
            </Button>
            <Button
              size="xs"
              h="26px"
              borderRadius="full"
              fontWeight="900"
              fontSize="9px"
              variant="outline"
              borderColor={outlineBorder}
              color="app.text.primary"
              onClick={handleUpgrade}
              _hover={{ borderColor: BRAND_HEX }}
            >
              Upgrade
            </Button>
            <Button
              size="xs"
              h="26px"
              borderRadius="full"
              fontWeight="900"
              fontSize="9px"
              variant="outline"
              borderColor={outlineBorder}
              color="app.text.primary"
              onClick={handleFreeze}
              _hover={{ borderColor: "#3965FF" }}
            >
              Freeze
            </Button>
          </HStack>

          {/* ════ INFORMATION SECTIONS ════ */}
          <VStack w="full" gap={2} mt={2} align="stretch">

            {/* Section 1: Personal Information & Membership Details */}
            <Box p={3} borderRadius="xl" border="1px solid" borderColor={outlineBorder} bg={sectionBg}>
              <Text fontSize="9px" fontWeight="900" color={muted} letterSpacing="wider" textTransform="uppercase" mb={1.5}>
                Info & Membership
              </Text>
              <VStack align="stretch" gap={1}>
                <Flex justify="space-between">
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted">EMAIL</Text>
                  <Text fontSize="10px" fontWeight="600" color="app.text.primary" truncate maxW="130px">{contact.email}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted">PHONE</Text>
                  <Text fontSize="10px" fontWeight="600" color="app.text.primary">{contact.phone}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="10px" fontWeight="800" color="app.text.muted">EXPIRATION</Text>
                  <Text fontSize="10px" fontWeight="600" color="app.text.primary">{formatDate(sub?.end_date)}</Text>
                </Flex>
              </VStack>
            </Box>

            {/* Section 2: Payment Summary */}
            <Box p={3} borderRadius="xl" border="1px solid" borderColor={outlineBorder} bg={sectionBg}>
              <HStack justify="space-between" align="center">
                <VStack align="start" gap={0.5}>
                  <Text fontSize="8px" fontWeight="800" color="app.text.muted" textTransform="uppercase">PLAN COST</Text>
                  <Text fontSize="10px" fontWeight="900" color="app.text.primary">
                    {fmtCurrency(sub?.price || 1500)}
                    <Text as="span" fontSize="8px" fontWeight="700" color="app.text.muted">
                      / {BILLING_LABEL[sub?.billing_cycle || "monthly"] || "mo"}
                    </Text>
                  </Text>
                </VStack>
                <Badge colorPalette={status === "active" ? "green" : "orange"} variant="subtle" fontSize="8px" fontWeight="900">
                  {status === "active" ? "PAID" : "AWAITING"}
                </Badge>
              </HStack>
            </Box>

          </VStack>
        </VStack>
      </Box>
    </motion.div>
  );
});
MemberProfile.displayName = "MemberProfile";

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
  // console.log(filteredMembers);




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

  const filterBarBg = useColorModeValue(
    "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 244, 255, 0.88) 100%)",
    "linear-gradient(135deg, rgba(26, 22, 55, 0.45) 0%, rgba(14, 18, 36, 0.75) 100%)"
  );
  const filterBarShadow = useColorModeValue("0 10px 30px rgba(0, 0, 0, 0.04)", "0 8px 32px rgba(0, 0, 0, 0.22)");
  const cardBorder = useColorModeValue("rgba(226, 232, 240, 0.78)", "rgba(255, 255, 255, 0.08)");

  const membersRequiringAttention = useMemo(
    () => members.filter((member) => member.data.status === "attention").slice(0, 5),
    [members]
  );

  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(240,249,255,0.96), rgba(255,255,255,0.92) 48%, rgba(240,253,244,0.9))",
    "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,41,59,0.88) 52%, rgba(6,78,59,0.42))"
  );
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");
  const tableHeaderBg = useColorModeValue("rgba(241,245,249,0.9)", "rgba(30,41,59,0.7)");

  return (
    <Box mt={4} animation="fade-in 0.5s ease-out" w="full">
      {/* <Box
        p={{ base: 5, lg: 7 }}
        mb="3"
        borderRadius="2xl"
        bg={heroBg}
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        position="relative"
        boxShadow="0 1px 3px rgba(0,0,0,0.04)"
      >
        <Grid templateColumns={{ base: "1fr", xl: "1.1fr 1.6fr" }} gap={6} alignItems="stretch">
          <VStack align="start" gap={3}>
            <VStack align="start" gap={3}>
              <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={3} py={1} fontWeight="900">
                Live Member Ops
              </Badge>
              <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight" color="app.text.primary">
                Manage members with a cleaner operating cockpit.
              </Heading>
              <Text color={muted} fontSize="sm" maxW="560px" fontWeight="600">
                Track active members, renewal attention, frozen accounts, and member contact records from one modern SaaS view.
              </Text>
            </VStack>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
            <StatTile label="Total members" value={total || members.length} caption="Registered profiles" icon={Users} accent="blue.500" />
            <StatTile label="Active" value={metrics.active} caption={`${metrics.retention}% retention`} icon={UserCheck} accent="green.500" />
            <StatTile label="Attention" value={metrics.attention} caption="Renewal follow-up" icon={Activity} accent="orange.500" />
            <StatTile label="Frozen" value={metrics.frozen} caption="Paused accounts" icon={Sparkles} accent="cyan.500" />
          </SimpleGrid>
        </Grid>
      </Box> */}
      <PageHeader
        title="Member Directory"
        subtitle={`${total} registered members across plans, renewals, and attendance workflows.`}
        onSearchChange={setSearchQuery}
        searchValue={searchQuery}
        searchPlaceholder="Search members, email, phone or ID..."
        icon={Users}
        badge="Member Ops"
        accentColor="blue"
      />
      <VStack align="stretch" gap={6} pb={8}>


        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 360px" }} gap={{ base: 6, xl: 8 }}>
          <GridItem minW={0}>
            <VStack align="stretch" gap={5}>
              <Flex
                align={{ base: "start", md: "center" }}
                justify="space-between"
                direction={{ base: "column", md: "row" }}
                gap={4}
                p={4}
                borderRadius="24px"
                bg={filterBarBg}
                border="1px solid"
                borderColor={cardBorder}
                boxShadow={filterBarShadow}
                backdropFilter="blur(20px) saturate(180%)"
              >
                <HStack gap={3}>
                  <Circle size="10" bg={BRAND_GRADIENT} color="white" style={{ boxShadow: `0 4px 12px ${BRAND_HEX}45` }}>
                    <Filter size={16} />
                  </Circle>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="950" color="app.text.primary" fontSize="sm" letterSpacing="tight">
                      Member Directory
                    </Text>
                    <Text fontSize="11px" color={muted} fontWeight="700">
                      Showing {filteredMembers.length} matching records
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={2.5} flexWrap="wrap" w={{ base: "full", md: "auto" }} justify={{ base: "space-between", md: "end" }}>
                  {/* Segmented Filter Buttons */}
                  <HStack
                    gap={1}
                    p={1}
                    borderRadius="xl"
                    bg={useColorModeValue("rgba(0,0,0,0.025)", "rgba(255,255,255,0.02)")}
                    border="1px solid"
                    borderColor={useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.04)")}
                  >
                    <FilterButton label="All" active={activeFilter === "all"} onClick={handleFilterAll} />
                    <FilterButton label="Active" active={activeFilter === "active"} onClick={handleFilterActive} />
                    <FilterButton label="Attention" active={activeFilter === "attention"} onClick={handleFilterAttention} />
                    <FilterButton label="Frozen" active={activeFilter === "frozen"} onClick={handleFilterFrozen} />
                  </HStack>

                  <Separator orientation="vertical" h="20px" opacity={0.3} display={{ base: "none", sm: "block" }} />

                  {/* Segmented View Mode Toggle */}
                  <HStack
                    gap={0.5}
                    p={1}
                    borderRadius="xl"
                    bg={useColorModeValue("rgba(0,0,0,0.025)", "rgba(255,255,255,0.02)")}
                    border="1px solid"
                    borderColor={useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.04)")}
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
                      _hover={viewMode === "card" ? {} : { bg: useColorModeValue("rgba(0,0,0,0.03)", "rgba(255,255,255,0.04)") }}
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
                      _hover={viewMode === "table" ? {} : { bg: useColorModeValue("rgba(0,0,0,0.03)", "rgba(255,255,255,0.04)") }}
                      onClick={handleViewTable}
                    >
                      <List size={14} />
                    </IconButton>
                  </HStack>
                </HStack>
              </Flex>

              {/* ── Content: Card or Table ── */}
              {loading ? (
                <SimpleGrid columns={{ base: 1, sm: 2, "2xl": 3 }} gap={{ base: 3, md: 4 }}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Skeleton key={item} height={viewMode === "card" ? "238px" : "56px"} borderRadius="2xl" />
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
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor={borderColor}
                      overflow="hidden"
                    >
                      {/* Table header */}
                      <HStack
                        px={4}
                        py={3}
                        bg={tableHeaderBg}
                        borderBottom="1px solid"
                        borderColor={borderColor}
                        gap={4}
                      >
                        <Text fontSize="xs" fontWeight="900" color={muted} textTransform="uppercase" minW="200px" flex={1.4}>Member</Text>
                        <Text fontSize="xs" fontWeight="900" color={muted} textTransform="uppercase" minW="90px">Status</Text>
                        <Text fontSize="xs" fontWeight="900" color={muted} textTransform="uppercase" minW="160px" flex={1} display={{ base: "none", lg: "block" }}>Email</Text>
                        <Text fontSize="xs" fontWeight="900" color={muted} textTransform="uppercase" minW="120px" display={{ base: "none", xl: "block" }}>Phone</Text>
                        <Text fontSize="xs" fontWeight="900" color={muted} textTransform="uppercase" minW="110px" display={{ base: "none", xl: "block" }}>Joined</Text>
                        <Text fontSize="xs" fontWeight="900" color={muted} textTransform="uppercase" minW="120px" flex={0.8} display={{ base: "none", lg: "block" }}>Plan</Text>
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

                  {/* Pagination — shown for card view, or as info bar for table */}
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
                  borderRadius="2xl"
                  bg={panelBg}
                  border="1px solid"
                  borderColor={borderColor}
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

          <GridItem>
            <VStack align="stretch" gap={5} position={{ xl: "sticky" }} top={{ xl: "7rem" }}>
              <Box p={5} borderRadius="2xl" bg={"app.card.bg"} border="1px solid" borderColor={borderColor}>
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
                          borderRadius="xl"
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
                      <Box p={4} borderRadius="xl" bg="green.500/10" border="1px solid" borderColor="green.500/20">
                        <Text fontSize="sm" color="green.600" fontWeight="800" textAlign="center">
                          All member accounts are current.
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </VStack>
              </Box>

              <Box p={5} borderRadius="2xl" bg={"app.card.bg"} border="1px solid" borderColor={borderColor}>
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
                      <Box h="full" w={`${metrics.retention}%`} bg="green.500" borderRadius="full" />
                    </Box>
                    <Separator opacity={0.35} />
                    <SimpleGrid columns={2} gap={3}>
                      <Box p={3} borderRadius="xl" bg="blue.500/10">
                        <Text fontSize="xs" color={muted} fontWeight="800">
                          Search result
                        </Text>
                        <Text fontSize="lg" fontWeight="900">
                          {filteredMembers.length}
                        </Text>
                      </Box>
                      <Box p={3} borderRadius="xl" bg="purple.500/10">
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
