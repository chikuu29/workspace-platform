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
  Separator,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import {
  LuArrowRight,
  LuAward,
  LuCalendarDays,
  LuDumbbell,
  LuFilter,
  LuMail,
  LuPhone,
  LuPlus,
  LuStar,
  LuTrendingUp,
  LuUserCheck,
  LuUsers,
} from "react-icons/lu";
import { PageHeader } from "@/core/components/PageHeader";

// ─── Types ──────────────────────────────────────────────────────────────────

type StaffRole = "trainer" | "manager" | "staff";
type StaffFilter = "all" | StaffRole;

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  specialty: string[];
  email: string;
  phone: string;
  rating: number;
  clients: number;
  sessionsThisWeek: number;
  isOnline: boolean;
  joinDate: string;
  accent: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_STAFF: StaffMember[] = [
  { id: "TRN-001", firstName: "Marcus", lastName: "Rivera", role: "trainer", specialty: ["Strength", "HIIT"], email: "marcus@gym.io", phone: "+1 555-0101", rating: 4.9, clients: 24, sessionsThisWeek: 18, isOnline: true, joinDate: "2024-03-15", accent: "blue" },
  { id: "TRN-002", firstName: "Sarah", lastName: "Chen", role: "trainer", specialty: ["Yoga", "Pilates"], email: "sarah@gym.io", phone: "+1 555-0102", rating: 4.8, clients: 31, sessionsThisWeek: 22, isOnline: true, joinDate: "2023-11-01", accent: "purple" },
  { id: "MGR-001", firstName: "David", lastName: "Okonkwo", role: "manager", specialty: ["Operations"], email: "david@gym.io", phone: "+1 555-0103", rating: 4.7, clients: 0, sessionsThisWeek: 0, isOnline: true, joinDate: "2022-06-10", accent: "green" },
  { id: "TRN-003", firstName: "Elena", lastName: "Vasquez", role: "trainer", specialty: ["CrossFit", "Boxing"], email: "elena@gym.io", phone: "+1 555-0104", rating: 4.6, clients: 19, sessionsThisWeek: 15, isOnline: false, joinDate: "2024-01-20", accent: "orange" },
  { id: "STF-001", firstName: "James", lastName: "Park", role: "staff", specialty: ["Front Desk"], email: "james@gym.io", phone: "+1 555-0105", rating: 4.5, clients: 0, sessionsThisWeek: 0, isOnline: true, joinDate: "2024-06-01", accent: "teal" },
  { id: "TRN-004", firstName: "Aisha", lastName: "Mohammed", role: "trainer", specialty: ["Cardio", "Dance"], email: "aisha@gym.io", phone: "+1 555-0106", rating: 4.9, clients: 28, sessionsThisWeek: 20, isOnline: false, joinDate: "2023-08-12", accent: "pink" },
  { id: "STF-002", firstName: "Tom", lastName: "Wilson", role: "staff", specialty: ["Maintenance"], email: "tom@gym.io", phone: "+1 555-0107", rating: 4.3, clients: 0, sessionsThisWeek: 0, isOnline: true, joinDate: "2024-09-15", accent: "cyan" },
  { id: "TRN-005", firstName: "Liam", lastName: "Nguyen", role: "trainer", specialty: ["Powerlifting", "Nutrition"], email: "liam@gym.io", phone: "+1 555-0108", rating: 4.7, clients: 22, sessionsThisWeek: 16, isOnline: true, joinDate: "2024-04-01", accent: "blue" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<StaffRole, { label: string; colorPalette: string }> = {
  trainer: { label: "Trainer", colorPalette: "blue" },
  manager: { label: "Manager", colorPalette: "green" },
  staff: { label: "Staff", colorPalette: "orange" },
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`;

// ─── Sub-Components ─────────────────────────────────────────────────────────

const StatTile = memo(({ label, value, caption, icon, accent }: {
  label: string; value: string | number; caption: string; icon: React.ElementType; accent: string;
}) => {
  const tileBg = useColorModeValue("rgba(255,255,255,0.78)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("whiteAlpha.900", "whiteAlpha.200");

  return (
    <Box p={{ base: 4, md: 5 }} borderRadius="2xl" bg={tileBg} border="1px solid" borderColor={borderColor}
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

const StaffCard = memo(({ staff }: { staff: StaffMember }) => {
  const cardBg = useColorModeValue("rgba(255,255,255,0.86)", "rgba(15,23,42,0.7)");
  const cardBorder = useColorModeValue("rgba(226,232,240,0.78)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");
  const roleStyle = ROLE_STYLES[staff.role];

  return (
    <Box role="group" p={5} borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={cardBorder}
      boxShadow="0 18px 44px -34px rgba(15, 23, 42, 0.72)" backdropFilter="blur(18px) saturate(150%)"
      position="relative" overflow="hidden" cursor="pointer"
      transition="all 0.24s cubic-bezier(0.4, 0, 0.2, 1)"
      _before={{
        content: '""', position: "absolute", top: 0, left: 0, right: 0, h: "3px",
        bg: `${staff.accent}.400`,
      }}
      _hover={{
        transform: "translateY(-5px)", borderColor: `${staff.accent}.400`,
        boxShadow: "0 26px 56px -34px rgba(37, 99, 235, 0.72)",
      }}>
      <VStack align="stretch" gap={4}>
        {/* Header */}
        <Flex justify="space-between" align="start" gap={3}>
          <HStack gap={3} minW={0}>
            <Box position="relative">
              <Avatar.Root size="lg" shape="rounded" border="1px solid" borderColor={cardBorder}>
                <Avatar.Fallback bg={`${staff.accent}.500/10`} color={`${staff.accent}.500`} fontWeight="900">
                  {getInitials(staff.firstName, staff.lastName)}
                </Avatar.Fallback>
              </Avatar.Root>
              {/* Online indicator */}
              <Circle size="3" bg={staff.isOnline ? "green.400" : "gray.400"}
                position="absolute" bottom="0" right="0" border="2px solid" borderColor={cardBg} />
            </Box>
            <VStack align="start" gap={0.5} minW={0}>
              <Text fontSize="md" fontWeight="900" color="app.text.primary" truncate>
                {staff.firstName} {staff.lastName}
              </Text>
              <Text fontSize="xs" color={muted} fontWeight="700" fontFamily="mono" truncate>
                {staff.id}
              </Text>
            </VStack>
          </HStack>
          <Badge colorPalette={roleStyle.colorPalette} variant="subtle" borderRadius="full"
            px={3} py={1} fontSize="10px" fontWeight="900">
            {roleStyle.label}
          </Badge>
        </Flex>

        {/* Specialties */}
        <HStack gap={2} flexWrap="wrap">
          {staff.specialty.map((s) => (
            <Badge key={s} variant="outline" borderRadius="full" px={2} py={0.5}
              fontSize="2xs" fontWeight="800" colorPalette={staff.accent}>
              {s}
            </Badge>
          ))}
        </HStack>

        {/* Contact */}
        <SimpleGrid columns={1} gap={2}>
          <HStack gap={2.5} color={muted} minW={0}>
            <Icon as={LuMail} boxSize={3.5} />
            <Text fontSize="sm" fontWeight="700" truncate>{staff.email}</Text>
          </HStack>
          <HStack gap={2.5} color={muted}>
            <Icon as={LuPhone} boxSize={3.5} />
            <Text fontSize="sm" fontWeight="700">{staff.phone}</Text>
          </HStack>
          <HStack gap={2.5} color={muted}>
            <Icon as={LuCalendarDays} boxSize={3.5} />
            <Text fontSize="sm" fontWeight="700">Joined {formatDate(staff.joinDate)}</Text>
          </HStack>
        </SimpleGrid>

        <Separator opacity={0.35} />

        {/* Stats footer */}
        <HStack justify="space-between" gap={4}>
          {staff.role === "trainer" ? (
            <HStack gap={4}>
              <VStack align="start" gap={0}>
                <Text fontSize="10px" color={muted} fontWeight="900" textTransform="uppercase">Clients</Text>
                <Text fontSize="sm" fontWeight="900" color="app.text.primary">{staff.clients}</Text>
              </VStack>
              <VStack align="start" gap={0}>
                <Text fontSize="10px" color={muted} fontWeight="900" textTransform="uppercase">Sessions</Text>
                <Text fontSize="sm" fontWeight="900" color="app.text.primary">{staff.sessionsThisWeek}/wk</Text>
              </VStack>
              <VStack align="start" gap={0}>
                <Text fontSize="10px" color={muted} fontWeight="900" textTransform="uppercase">Rating</Text>
                <HStack gap={1}>
                  <LuStar size={12} color="var(--chakra-colors-yellow-400)" fill="var(--chakra-colors-yellow-400)" />
                  <Text fontSize="sm" fontWeight="900" color="app.text.primary">{staff.rating}</Text>
                </HStack>
              </VStack>
            </HStack>
          ) : (
            <VStack align="start" gap={0.5} minW={0}>
              <Text fontSize="10px" color={muted} fontWeight="900" textTransform="uppercase">Department</Text>
              <Text fontSize="sm" fontWeight="900" color="app.text.primary" truncate>{staff.specialty[0]}</Text>
            </VStack>
          )}
          <Circle size="9" bg={`${staff.accent}.500/10`} color={`${staff.accent}.500`}
            transition="all 0.2s" _groupHover={{ transform: "translateX(2px)" }}>
            <LuArrowRight size={16} />
          </Circle>
        </HStack>
      </VStack>
    </Box>
  );
});
StaffCard.displayName = "StaffCard";

// ─── Main Component ─────────────────────────────────────────────────────────

const TrainersStaff = memo(() => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { appCode } = useParams();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<StaffFilter>("all");

  const appParam = searchParams.get("app");
  const appName = useMemo(() => appCode || appParam || "myGym", [appCode, appParam]);
  const prefix = useMemo(
    () => (pathname.includes("/workspace") ? `${pathname.split("/workspace")[0]}/workspace` : ""),
    [pathname]
  );

  const navigateTo = useCallback((view: string) => {
    const path = appCode ? `${prefix}/app/${appCode}/${view}` : `${prefix}/${view}?app=${appName}`;
    navigate(path);
  }, [appCode, appName, navigate, prefix]);

  // ── Metrics ──
  const metrics = useMemo(() => {
    const trainers = MOCK_STAFF.filter((s) => s.role === "trainer");
    return {
      total: MOCK_STAFF.length,
      trainers: trainers.length,
      online: MOCK_STAFF.filter((s) => s.isOnline).length,
      avgRating: trainers.length > 0
        ? (trainers.reduce((acc, t) => acc + t.rating, 0) / trainers.length).toFixed(1)
        : "0",
      totalSessions: trainers.reduce((acc, t) => acc + t.sessionsThisWeek, 0),
    };
  }, []);

  // ── Filtered list ──
  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MOCK_STAFF.filter((s) => {
      const matchesFilter = activeFilter === "all" || s.role === activeFilter;
      const matchesSearch = !q ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.specialty.some((sp) => sp.toLowerCase().includes(q)) ||
        s.id.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  // ── Top performers ──
  const topPerformers = useMemo(
    () => MOCK_STAFF.filter((s) => s.role === "trainer").sort((a, b) => b.rating - a.rating).slice(0, 4),
    []
  );

  // ── Theme ──
  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(240,249,255,0.96), rgba(255,255,255,0.92) 48%, rgba(245,243,255,0.9))",
    "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,41,59,0.88) 52%, rgba(49,10,101,0.42))"
  );
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box mt={4} animation="fade-in 0.5s ease-out" w="full">
      <PageHeader
        title="Trainers & Staff"
        subtitle={`${metrics.total} team members — ${metrics.online} currently online`}
        actions={
          <HStack gap={3}>
            <Button colorPalette="blue" borderRadius="xl" px={5} fontWeight="900"
              onClick={() => navigateTo("trainerSchedules")}>
              <LuCalendarDays size={16} style={{ marginRight: "6px" }} /> Schedules
            </Button>
            <Button colorPalette="blue" variant="solid" borderRadius="xl" px={5} fontWeight="900">
              <LuPlus size={18} style={{ marginRight: "6px" }} /> Add Staff
            </Button>
          </HStack>
        }
        onSearchChange={setSearchQuery}
        searchValue={searchQuery}
        searchPlaceholder="Search by name, specialty, or ID..."
      />

      <VStack align="stretch" gap={6} pb={8}>
        {/* ── Hero Stats ──────────────────────────────────── */}
        <Box p={{ base: 5, lg: 7 }} borderRadius="2xl" bg={heroBg} border="1px solid"
          borderColor={borderColor} overflow="hidden" position="relative"
          boxShadow="0 28px 64px -42px rgba(15, 23, 42, 0.7)">
          <Grid templateColumns={{ base: "1fr", xl: "1.1fr 1.6fr" }} gap={6} alignItems="stretch">
            <VStack align="start" justify="space-between" gap={6}>
              <VStack align="start" gap={3}>
                <Badge colorPalette="purple" variant="subtle" borderRadius="full" px={3} py={1} fontWeight="900">
                  Team Management
                </Badge>
                <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight" color="app.text.primary">
                  Your gym team at a glance.
                </Heading>
                <Text color={muted} fontSize="sm" maxW="560px" fontWeight="600">
                  Monitor trainer performance, manage schedules, and keep your staff operations running smoothly.
                </Text>
              </VStack>
              <HStack gap={3} flexWrap="wrap">
                <Button colorPalette="purple" borderRadius="xl" fontWeight="900">
                  <LuPlus size={18} style={{ marginRight: "6px" }} /> Add Trainer
                </Button>
                <Button variant="outline" borderRadius="xl" fontWeight="800"
                  onClick={() => navigateTo("trainerSchedules")}>
                  <LuCalendarDays size={16} style={{ marginRight: "6px" }} /> View Schedules
                </Button>
              </HStack>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
              <StatTile label="Total Staff" value={metrics.total} caption="Across all roles" icon={LuUsers} accent="blue.500" />
              <StatTile label="Trainers" value={metrics.trainers} caption={`${metrics.online} online now`} icon={LuDumbbell} accent="purple.500" />
              <StatTile label="Avg Rating" value={metrics.avgRating} caption="Trainer average" icon={LuStar} accent="yellow.500" />
              <StatTile label="Sessions" value={metrics.totalSessions} caption="This week total" icon={LuTrendingUp} accent="green.500" />
            </SimpleGrid>
          </Grid>
        </Box>

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
                    <LuFilter size={16} />
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
              {filteredStaff.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, "2xl": 3 }} gap={4}>
                  {filteredStaff.map((s) => <StaffCard key={s.id} staff={s} />)}
                </SimpleGrid>
              ) : (
                <Flex direction="column" align="center" justify="center" py={20} gap={4}
                  borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                  <Circle size="16" bg="purple.500/10" color="purple.500">
                    <LuUsers size={30} />
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
                      <LuAward size={12} />
                    </Badge>
                  </HStack>

                  <VStack align="stretch" gap={3}>
                    {topPerformers.map((t, i) => (
                      <HStack key={t.id} p={3} borderRadius="xl" bg={`${t.accent}.500/8`}
                        border="1px solid" borderColor={`${t.accent}.500/15`} gap={3}
                        transition="all 0.2s" _hover={{ transform: "translateX(2px)", bg: `${t.accent}.500/12` }}>
                        <Circle size="8" bg={`${t.accent}.500/15`} color={`${t.accent}.500`} fontWeight="900" fontSize="xs">
                          #{i + 1}
                        </Circle>
                        <VStack align="start" gap={0} flex={1} minW={0}>
                          <Text fontSize="sm" fontWeight="900" truncate>
                            {t.firstName} {t.lastName}
                          </Text>
                          <HStack gap={1}>
                            <LuStar size={10} color="var(--chakra-colors-yellow-400)" fill="var(--chakra-colors-yellow-400)" />
                            <Text fontSize="xs" color={muted} fontWeight="800">{t.rating} · {t.clients} clients</Text>
                          </HStack>
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </Box>

              {/* Role Distribution */}
              <Box p={5} borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm" fontWeight="900">Role Breakdown</Heading>
                  <VStack align="stretch" gap={3}>
                    {(["trainer", "manager", "staff"] as StaffRole[]).map((role) => {
                      const count = MOCK_STAFF.filter((s) => s.role === role).length;
                      const pct = Math.round((count / MOCK_STAFF.length) * 100);
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
                        {MOCK_STAFF.filter((s) => s.role === "trainer").reduce((a, t) => a + t.clients, 0)}
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
