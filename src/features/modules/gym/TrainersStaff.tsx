/**
 * TrainersStaff.tsx
 *
 * Premium Trainers & Staff directory with glassmorphic design.
 * Uses mock data — pre-wired for future useGymStaff hook integration.
 */

import { memo, useCallback, useMemo, useState } from "react";
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
import { useColorModeValue } from "@/components/ui/color-mode";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import {
  ArrowRight,
  Award,
  CalendarDays,
  Dumbbell,
  Filter,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { PageHeader } from "@/core/components/PageHeader";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { useGymTrainers } from "./hooks/useGymTrainers";
import type { TrainerDocument } from "./types/Gym.types";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ──────────────────────────────────────────────────────────────────

type StaffRole = "trainer" | "manager" | "staff";
type StaffFilter = "all" | StaffRole;

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, { label: string; colorPalette: string }> = {
  trainer: { label: "Trainer", colorPalette: "blue" },
  manager: { label: "Manager", colorPalette: "green" },
  staff: { label: "Staff", colorPalette: "orange" },
};

const getTrainerName = (data: TrainerDocument["data"]) => ({
  full: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown",
  initials: `${data.firstName?.[0] || ""}${data.lastName?.[0] || ""}` || "TR",
});

const formatDate = (date?: string) => {
  if (!date) return "N/A";
  const p = new Date(date);
  return Number.isNaN(p.getTime()) ? "N/A" : p.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

// ─── Sub-Components ─────────────────────────────────────────────────────────

const StatTile = memo(({ label, value, caption, icon, accent }: {
  label: string; value: string | number; caption: string; icon: React.ElementType; accent: string;
}) => {
  const borderColor = useColorModeValue("whiteAlpha.900", "whiteAlpha.200");

  return (
    <Box p={{ base: 4, md: 5 }} borderRadius="2xl" bg="app.card.bg" border="1px solid" borderColor={borderColor}
      backdropFilter="blur(18px) saturate(160%)" boxShadow="0 18px 42px -30px rgba(15, 23, 42, 0.55)">
      <HStack justify="space-between" align="start" gap={4}>
        <VStack align="start" gap={1}>
          <Text fontSize="xs" color="app.text.muted" fontWeight="800" textTransform="uppercase">{label}</Text>
          <Heading size="xl" color="app.text.primary" letterSpacing="tight">{value}</Heading>
          <Text fontSize="xs" color="app.text.muted" fontWeight="600">{caption}</Text>
        </VStack>
        <Circle size="11" bg={`${accent}/12`} color={accent}>
          <Icon as={icon} boxSize={5} />
        </Circle>
      </HStack>
    </Box>
  );
});
StatTile.displayName = "StatTile";

const FilterButton = memo(({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <Button size="sm" variant={active ? "solid" : "ghost"} colorPalette={active ? "blue" : "gray"}
    borderRadius="xl" px={4} fontWeight="800" onClick={onClick}>
    {label}
  </Button>
));
FilterButton.displayName = "FilterButton";

const StaffCard = memo(({ trainer, onClick }: { trainer: TrainerDocument; onClick: (id: string) => void }) => {
  const cardBorder = useColorModeValue("rgba(226, 232, 240, 0.7)", "rgba(255, 255, 255, 0.08)");
  const hoverBorder = useColorModeValue("rgba(99, 102, 241, 0.3)", "rgba(99, 102, 241, 0.4)");
  const muted = useColorModeValue("gray.500", "gray.400");
  const sectionBg = useColorModeValue("rgba(248, 250, 252, 0.8)", "rgba(255, 255, 255, 0.03)");
  const outlineBorder = useColorModeValue("rgba(0,0,0,0.06)", "rgba(255,255,255,0.06)");

  const { data } = trainer;
  const name = getTrainerName(data);
  const status = data.status || "active";
  const accent = data._meta?.entity_type === "manager" ? "green" : (data._meta?.entity_type === "staff" ? "orange" : "blue");

  const specLabel = useMemo(() => {
    const s = data.specialization;
    if (Array.isArray(s)) {
      return s.map((item: string) => item.charAt(0).toUpperCase() + item.slice(1)).join(", ");
    }
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Expert";
  }, [data.specialization]);

  const slotLabel = useMemo(() => {
    const s = data.availableSlot;
    if (Array.isArray(s)) {
      return s.map((item: string) => {
        if (item === "morning") return "Morning";
        if (item === "afternoon") return "Afternoon";
        if (item === "evening") return "Evening";
        if (item === "full_day") return "Full Day";
        return item;
      }).join(", ");
    }
    if (typeof s === "string") {
      if (s === "morning") return "Morning Shift";
      if (s === "afternoon") return "Afternoon Shift";
      if (s === "evening") return "Evening Shift";
      if (s === "full_day") return "Full Day Shift";
      return s;
    }
    return "Flex";
  }, [data.availableSlot]);

  return (
    <Box
      role="group"
      p={5}
      borderRadius="20px"
      bg="app.card.bg"
      border="1px solid"
      borderColor={cardBorder}
      boxShadow="0 4px 20px -8px rgba(0,0,0,0.05)"
      backdropFilter="blur(24px) saturate(180%)"
      position="relative"
      overflow="hidden"
      cursor="pointer"
      transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      onClick={() => onClick(trainer._meta.id)}
      _hover={{
        transform: "translateY(-4px)",
        borderColor: hoverBorder,
        boxShadow: "0 12px 30px -10px rgba(66, 42, 251, 0.15)",
      }}
    >
      <VStack align="stretch" gap={4.5}>
        {/* Header */}
        <Flex justify="space-between" align="start" gap={3}>
          <HStack gap={3} minW={0}>
            <Box position="relative">
              <Avatar.Root size="lg" shape="rounded" border="1.5px solid" borderColor={cardBorder} p={0.5} bg="transparent">
                {data.profilePic && <Avatar.Image src={data.profilePic} borderRadius="lg" />}
                <Avatar.Fallback bg={`${accent}.500/10`} color={`${accent}.500`} fontWeight="900" borderRadius="lg">
                  {name.initials}
                </Avatar.Fallback>
              </Avatar.Root>
              {/* Online status dot */}
              <Circle
                size="12px"
                bg={status === "active" ? "green.400" : "gray.400"}
                position="absolute"
                bottom="-2px"
                right="-2px"
                border="2.5px solid"
                borderColor={useColorModeValue("white", "#0f172a")}
                boxShadow={status === "active" ? "0 0 8px rgba(34, 197, 94, 0.4)" : "none"}
              />
            </Box>
            <VStack align="start" gap={0.5} minW={0}>
              <Text fontSize="md" fontWeight="900" color="app.text.primary" truncate>
                {name.full}
              </Text>
              <Text fontSize="10px" color={muted} fontWeight="700" fontFamily="mono" bg={sectionBg} px={1.5} py={0.5} borderRadius="md" truncate>
                {trainer._meta.id}
              </Text>
            </VStack>
          </HStack>
          <Badge colorPalette={accent} variant="subtle" borderRadius="full"
            px={2.5} py={0.5} fontSize="9px" fontWeight="900">
            {specLabel}
          </Badge>
        </Flex>

        {/* Contact info box */}
        <Box p={3} borderRadius="14px" bg={sectionBg} border="1px solid" borderColor={outlineBorder}>
          <SimpleGrid columns={1} gap={2}>
            <HStack gap={2.5} color={muted} minW={0}>
              <Icon as={Mail} boxSize={3.5} />
              <Text fontSize="xs" fontWeight="700" truncate>{data.email}</Text>
            </HStack>
            <HStack gap={2.5} color={muted}>
              <Icon as={Phone} boxSize={3.5} />
              <Text fontSize="xs" fontWeight="700">{data.phone}</Text>
            </HStack>
            <HStack gap={2.5} color={muted}>
              <Icon as={CalendarDays} boxSize={3.5} />
              <Text fontSize="xs" fontWeight="700">Joined {formatDate(data.joiningDate)}</Text>
            </HStack>
          </SimpleGrid>
        </Box>

        <Separator opacity={0.3} />

        {/* Stats footer */}
        <HStack justify="space-between" gap={4}>
          <HStack gap={4}>
            <VStack align="start" gap={0}>
              <Text fontSize="9px" color={muted} fontWeight="900" textTransform="uppercase" letterSpacing="0.04em">Exp</Text>
              <Text fontSize="sm" fontWeight="800" color="app.text.primary">{data.experienceYears}y</Text>
            </VStack>
            <VStack align="start" gap={0}>
              <Text fontSize="9px" color={muted} fontWeight="900" textTransform="uppercase" letterSpacing="0.04em">Slot</Text>
              <Text fontSize="sm" fontWeight="800" color="app.text.primary">{slotLabel}</Text>
            </VStack>
            <VStack align="start" gap={0}>
              <Text fontSize="9px" color={muted} fontWeight="900" textTransform="uppercase" letterSpacing="0.04em">Rating</Text>
              <HStack gap={1} align="center">
                <Star size={11} color="var(--chakra-colors-yellow-400)" fill="var(--chakra-colors-yellow-400)" />
                <Text fontSize="sm" fontWeight="800" color="app.text.primary">4.9</Text>
              </HStack>
            </VStack>
          </HStack>
          <Circle size="9" bg={`${accent}.500/10`} color={`${accent}.500`}
            transition="all 0.2s" _groupHover={{ transform: "translateX(3px)", bg: `${accent}.500/20` }}>
            <ArrowRight size={14} />
          </Circle>
        </HStack>
      </VStack>
    </Box>
  );
});
StaffCard.displayName = "StaffCard";

// ─── Main Component ─────────────────────────────────────────────────────────

const TrainersStaff = memo(() => {
  const { navigateTo } = useWorkspaceRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<StaffFilter>("all");

  // ── Real API Integration ──
  const { trainers, total, loading, refresh } = useGymTrainers();

  // ── Metrics ──
  const metrics = useMemo(() => {
    const activeTrainers = trainers.filter((t) => t.data.status === "active");
    return {
      total: total,
      trainers: trainers.length,
      online: activeTrainers.length, // Using active status as online proxy
      avgRating: "4.9", // Placeholder until real ratings API
      totalSessions: trainers.reduce((acc, t) => acc + (Number(t.data.experienceYears) || 0), 0),
    };
  }, [trainers, total]);

  // ── Filtered list ──
  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return trainers.filter((t) => {
      const data = t.data;
      const role = t._meta?.entity_type === "manager" ? "manager" : (t._meta?.entity_type === "staff" ? "staff" : "trainer");
      const matchesFilter = activeFilter === "all" || role === activeFilter;
      const matchesSearch = !q ||
        `${data.firstName} ${data.lastName}`.toLowerCase().includes(q) ||
        data.email.toLowerCase().includes(q) ||
        data.specialization.toLowerCase().includes(q) ||
        t._meta.id.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, trainers]);

  // ── Top performers ──
  const topPerformers = useMemo(
    () => trainers.slice(0, 4),
    [trainers]
  );

  const panelBg = "app.card.bg";
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  const setNavActionConfig = useNavActionStore((state) => state.setNavActionConfig);
  const clearActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    setNavActionConfig([
      {
        id: "refresh",
        icon: RefreshCw,
        bg: "gradient_cyan_purple",
        color: "white",
        ariaLabel: "Refresh list",
        onClick: refresh,
        loading: loading,
        flexShrink: 0,
      },
      {
        id: "enroll",
        label: "New Trainer",
        icon: Plus,
        bg: "gradient_purple",
        color: "white",
        onClick: () => navigateTo("AddTrainer"),
      },
    ]);
    return () => clearActions();
  }, [setNavActionConfig, clearActions, refresh, loading, navigateTo]);

  return (
    <Box mt={4} animation="fade-in 0.5s ease-out" w="full">
      <PageHeader
        title="Trainers & Staff"
        subtitle={`${metrics.total} team members — ${metrics.online} currently online`}
        actions={
          <Button colorPalette="blue" borderRadius="xl" px={5} fontWeight="900"
            onClick={() => navigateTo("trainerSchedules")}>
            <CalendarDays size={16} style={{ marginRight: "6px" }} /> Schedules
          </Button>
        }
        onSearchChange={setSearchQuery}
        searchValue={searchQuery}
        searchPlaceholder="Search by name, specialty, or ID..."
        icon={Dumbbell}
        badge="Team Management"
        accentColor="purple"
      />

      <VStack align="stretch" gap={6} pb={8}>


        {/* ── Directory Grid + Sidebar ────────────────────── */}
        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 340px" }} gap={{ base: 6, xl: 8 }}>
          <GridItem minW={0}>
            <VStack align="stretch" gap={5}>
              {/* Filter bar */}
              <Flex align={{ base: "start", md: "center" }} justify="space-between"
                direction={{ base: "column", md: "row" }} gap={4} p={4} borderRadius="2xl"
                bg={panelBg} border="1px solid" borderColor={borderColor}>
                <HStack gap={2}>
                  <Circle size="9" bg="purple.500/10" color="purple.500">
                    <Filter size={16} />
                  </Circle>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="900" color="app.text.primary">Directory</Text>
                    <Text fontSize="xs" color={muted} fontWeight="700">
                      Showing {filteredStaff.length} team members
                    </Text>
                  </VStack>
                </HStack>
                <HStack gap={2} flexWrap="wrap">
                  <FilterButton label="All" active={activeFilter === "all"} onClick={() => setActiveFilter("all")} />
                  <FilterButton label="Trainers" active={activeFilter === "trainer"} onClick={() => setActiveFilter("trainer")} />
                  <FilterButton label="Managers" active={activeFilter === "manager"} onClick={() => setActiveFilter("manager")} />
                  <FilterButton label="Staff" active={activeFilter === "staff"} onClick={() => setActiveFilter("staff")} />
                </HStack>
              </Flex>

              {/* Card grid */}
              {loading ? (
                <SimpleGrid columns={{ base: 1, md: 2, "2xl": 3 }} gap={4}>
                  {[1, 2, 3].map((i) => <Skeleton key={i} height="240px" borderRadius="2xl" />)}
                </SimpleGrid>
              ) : filteredStaff.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, "2xl": 3 }} gap={4}>
                  {filteredStaff.map((s) => (
                    <StaffCard
                      key={s._id}
                      trainer={s}
                      onClick={(id) => navigateTo(`TrainerProfile?trainer_id=${id}`)}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Flex direction="column" align="center" justify="center" py={20} gap={4}
                  borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                  <Circle size="16" bg="purple.500/10" color="purple.500">
                    <Users size={30} />
                  </Circle>
                  <VStack gap={1}>
                    <Heading size="sm" fontWeight="900">No staff found</Heading>
                    <Text fontSize="sm" color={muted} fontWeight="600">
                      Try a different search or clear the filter.
                    </Text>
                  </VStack>
                </Flex>
              )}
            </VStack>
          </GridItem>

          {/* ── Sidebar ───────────────────────────────────── */}
          <GridItem>
            <VStack align="stretch" gap={5} position={{ xl: "sticky" }} top={{ xl: "7rem" }}>
              {/* Top Performers */}
              <Box p={5} borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="sm" fontWeight="900">Top Performers</Heading>
                      <Text fontSize="xs" color={muted} fontWeight="700">Highest rated trainers</Text>
                    </VStack>
                    <Badge colorPalette="yellow" borderRadius="full" variant="solid">
                      <Award size={12} />
                    </Badge>
                  </HStack>

                  <VStack align="stretch" gap={3}>
                    {topPerformers.map((t, i) => {
                      const name = getTrainerName(t.data);
                      const accent = t._meta?.entity_type === "manager" ? "green" : (t._meta?.entity_type === "staff" ? "orange" : "blue");
                      return (
                        <HStack key={t._id} p={3} borderRadius="xl" bg={`${accent}.500/8`}
                          border="1px solid" borderColor={`${accent}.500/15`} gap={3}
                          transition="all 0.2s" _hover={{ transform: "translateX(2px)", bg: `${accent}.500/12` }}
                          onClick={() => navigateTo(`TrainerProfile?trainer_id=${t._meta.id}`)} cursor="pointer">
                          <Circle size="8" bg={`${accent}.500/15`} color={`${accent}.500`} fontWeight="900" fontSize="xs">
                            #{i + 1}
                          </Circle>
                          <VStack align="start" gap={0} flex={1} minW={0}>
                            <Text fontSize="sm" fontWeight="900" truncate>
                              {name.full}
                            </Text>
                            <HStack gap={1}>
                              <Star size={10} color="var(--chakra-colors-yellow-400)" fill="var(--chakra-colors-yellow-400)" />
                              <Text fontSize="xs" color={muted} fontWeight="800">4.9 · {t.data.experienceYears}y exp</Text>
                            </HStack>
                          </VStack>
                        </HStack>
                      );
                    })}
                  </VStack>
                </VStack>
              </Box>

              {/* Role Distribution */}
              <Box p={5} borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm" fontWeight="900">Role Breakdown</Heading>
                  <VStack align="stretch" gap={3}>
                    {(["trainer", "manager", "staff"] as StaffRole[]).map((role) => {
                      const count = trainers.filter((t) => {
                        const r = t._meta?.entity_type === "manager" ? "manager" : (t._meta?.entity_type === "staff" ? "staff" : "trainer");
                        return r === role;
                      }).length;
                      const pct = trainers.length ? Math.round((count / trainers.length) * 100) : 0;
                      const rs = ROLE_STYLES[role];
                      return (
                        <VStack key={role} align="stretch" gap={1}>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color={muted} fontWeight="800">{rs.label}s</Text>
                            <Text fontSize="sm" fontWeight="900">{count} ({pct}%)</Text>
                          </HStack>
                          <Box h="8px" bg="blackAlpha.100" borderRadius="full" overflow="hidden">
                            <Box h="full" w={`${pct}%`} bg={`${rs.colorPalette}.500`} borderRadius="full"
                              transition="width 0.5s ease" />
                          </Box>
                        </VStack>
                      );
                    })}
                  </VStack>
                  <Separator opacity={0.35} />
                  <SimpleGrid columns={2} gap={3}>
                    <Box p={3} borderRadius="xl" bg="purple.500/10">
                      <Text fontSize="xs" color={muted} fontWeight="800">Online Now</Text>
                      <Text fontSize="lg" fontWeight="900">{metrics.online}</Text>
                    </Box>
                    <Box p={3} borderRadius="xl" bg="blue.500/10">
                      <Text fontSize="xs" color={muted} fontWeight="800">Total Clients</Text>
                      <Text fontSize="lg" fontWeight="900">
                        {/* Placeholder until real clients API is ready */}
                        {trainers.length * 12}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
});

TrainersStaff.displayName = "TrainersStaff";
export default TrainersStaff;
