/**
 * AttendanceReport.tsx
 *
 * Premium attendance analytics — peak hours, engagement trends, and slipping members.
 * Uses custom high-fidelity CSS visualizations for a modern SaaS look.
 */

import { memo, useMemo } from "react";
import {
  Badge, Box, Circle, Grid, GridItem, Heading, HStack, Icon,
  Separator, SimpleGrid, Text, VStack, IconButton,
} from "@chakra-ui/react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressRoot, ProgressBar } from "@/components/ui/progress";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  Activity, ArrowUpRight, Clock,
  TrendingUp, Users, UserX, Zap, RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/core/components/PageHeader";
import { useAttendanceStats } from "./hooks/useAttendanceStats";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { useEffect } from "react";

// ─── Helpers ────────────────────────────────────────────────────────

const getHourLabel = (hour: number) => {
  const h = hour % 12 || 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${h}${ampm}`;
};

// ─── Sub-Components ─────────────────────────────────────────────────

const StatTile = memo(({ label, value, caption, icon, accent }: {
  label: string; value: string | number; caption: string; icon: React.ElementType; accent: string;
}) => {
  const tileBg = useColorModeValue("rgba(255,255,255,0.78)", "rgba(15,23,42,0.58)");
  const border = useColorModeValue("whiteAlpha.900", "whiteAlpha.200");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box p={{ base: 4, md: 5 }} borderRadius="2xl" bg={tileBg} border="1px solid" borderColor={border}
      backdropFilter="blur(18px) saturate(160%)" boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}>
      <HStack justify="space-between" align="start" gap={4}>
        <VStack align="start" gap={1}>
          <Text fontSize="2xs" color={muted} fontWeight="800" textTransform="uppercase" letterSpacing="wider">{label}</Text>
          <Heading size="xl" color="app.text.primary" letterSpacing="tight">{value}</Heading>
          <Text fontSize="xs" color={muted} fontWeight="600">{caption}</Text>
        </VStack>
        <Circle size="10" bg={`${accent}/12`} color={accent}><Icon as={icon} boxSize={5} /></Circle>
      </HStack>
    </Box>
  );
});

const HourlyBar = memo(({ hour, count, maxCount, active }: { hour: number; count: number; maxCount: number; active?: boolean }) => {
  const height = maxCount > 0 ? (count / maxCount) * 100 : 2;
  const accent = active ? "blue.500" : "gray.400";
  const labelColor = useColorModeValue("gray.500", "gray.400");

  return (
    <VStack gap={2} flex="1" h="full" justify="end" minW="14px">
      <Box position="relative" w="full" h="full" flex="1">
        <Box
          position="absolute" bottom="0" left="0" right="0"
          h={`${Math.max(height, 4)}%`} bg={active ? "blue.500" : "gray.300/40"}
          borderRadius="t-md" transition="all 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
          _hover={{ bg: "blue.400", h: `${Math.min(height + 10, 100)}%` }}
        />
      </Box>
      <Text fontSize="10px" fontWeight="800" color={labelColor} writingMode="vertical-rl" transform="rotate(180deg)">
        {getHourLabel(hour)}
      </Text>
    </VStack>
  );
});

// ─── Main Component ─────────────────────────────────────────────────

const AttendanceReport = memo(() => {
  const { stats, loading, refetch } = useAttendanceStats();

  const setNavActionConfig = useNavActionStore((state) => state.setNavActionConfig);
  const clearActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    setNavActionConfig([
      {
        id: "refresh",
        icon: RefreshCw,
        bg: "gradient_cyan_purple",
        color: "white",
        ariaLabel: "Refresh stats",
        onClick: refetch,
        loading: loading,
        flexShrink: 0,
      },
    ]);
    return () => clearActions();
  }, [setNavActionConfig, clearActions, refetch, loading]);

  const muted = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(243,244,246,0.96), rgba(255,255,255,0.92) 48%, rgba(240,249,255,0.9))",
    "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,41,59,0.88) 52%, rgba(15,23,42,0.42))"
  );

  const derived = useMemo(() => {
    if (!stats) return { maxHourly: 0, engagementRate: 0, peakHour: 0 };
    const heatmap = stats.hourly_heatmap || [];
    const maxHourly = Math.max(...heatmap.map(h => h.count), 1);
    const engagementRate = stats.total_members > 0
      ? Math.round((stats.active_last_7_days / stats.total_members) * 100) : 0;
    const peakHour = [...heatmap].sort((a, b) => b.count - a.count)[0]?.hour ?? 0;

    return { maxHourly, engagementRate, peakHour };
  }, [stats]);

  return (
    <Box mt={4} animation="fade-in 0.5s ease-out" w="full">
      <PageHeader
        title="Attendance Report"
        subtitle="Tracking visit frequency and member engagement levels."
        icon={Activity}
        badge="Attendance Intel"
        accentColor="blue"
      />

      <VStack align="stretch" gap={6} pb={8}>
        {/* ── Hero Stats ──────────────────────────────── */}
        <Box p={{ base: 5, lg: 7 }} borderRadius="2xl" bg={heroBg} border="1px solid"
          borderColor={borderColor} boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}>
          <Grid templateColumns={{ base: "1fr", xl: "1.1fr 1.6fr" }} gap={6} alignItems="stretch">
            <VStack align="start" justify="space-between" gap={6}>
              <VStack align="start" gap={3}>
                <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={3} py={1} fontWeight="900">
                  Attendance Intel
                </Badge>
                <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight" color="app.text.primary">
                  Know your peak pulse.
                </Heading>
                <Text color={muted} fontSize="sm" maxW="560px" fontWeight="600">
                  Analyze check-in distributions to optimize staffing and class schedules.
                </Text>
              </VStack>
              <HStack px={4} py={2} borderRadius="xl" bg="blue.500/10" border="1px solid" borderColor="blue.500/15">
                <Zap size={16} color="var(--chakra-colors-blue-500)" />
                <Text fontSize="sm" fontWeight="900" color="blue.500">
                  Peak hour: {getHourLabel(derived.peakHour)} — Staffing recommended.
                </Text>
              </HStack>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
              <Skeleton loading={loading} borderRadius="2xl">
                <StatTile label="Weekly Active" value={stats?.active_last_7_days ?? 0} caption="Visited in 7d" icon={Users} accent="blue.500" />
              </Skeleton>
              <Skeleton loading={loading} borderRadius="2xl">
                <StatTile label="Engagement" value={`${derived.engagementRate}%`} caption="Member pulse" icon={TrendingUp} accent="green.500" />
              </Skeleton>
              <Skeleton loading={loading} borderRadius="2xl">
                <StatTile label="Slipping" value={stats?.slipping_members ?? 0} caption="7+ days idle" icon={UserX} accent="orange.500" />
              </Skeleton>
              <Skeleton loading={loading} borderRadius="2xl">
                <StatTile label="Total Members" value={stats?.total_members ?? 0} caption="System total" icon={Activity} accent="purple.500" />
              </Skeleton>
            </SimpleGrid>
          </Grid>
        </Box>

        {/* ── Main Analytics ───────────────────────────── */}
        <Grid templateColumns={{ base: "1fr", lg: "1.5fr 1fr" }} gap={6}>
          {/* Peak Hours Heatmap */}
          <GridItem>
            <Box p={6} borderRadius="3xl" bg={panelBg} border="1px solid" borderColor={borderColor} h="full">
              <VStack align="stretch" gap={8} h="full">
                <HStack justify="space-between">
                  <VStack align="start" gap={0}>
                    <Heading size="md" fontWeight="900">Hourly Density</Heading>
                    <Text fontSize="sm" color={muted} fontWeight="700">Check-in distribution across 24 hours</Text>
                  </VStack>
                  <Circle size="10" bg="blue.500/10" color="blue.500"><Clock size={18} /></Circle>
                </HStack>

                <Skeleton loading={loading} flex="1">
                  <HStack gap={1} h="220px" align="end" px={2} pb={2}>
                    {(stats?.hourly_heatmap || []).map((h) => (
                      <HourlyBar key={h.hour} hour={h.hour} count={h.count} maxCount={derived.maxHourly} active={h.hour === derived.peakHour} />
                    ))}
                  </HStack>
                </Skeleton>

                <HStack gap={6} pt={4} borderTop="1px solid" borderColor={borderColor}>
                  <HStack gap={2}>
                    <Box w="10px" h="10px" borderRadius="sm" bg="blue.500" />
                    <Text fontSize="xs" fontWeight="800" color={muted}>Peak Period</Text>
                  </HStack>
                  <HStack gap={2}>
                    <Box w="10px" h="10px" borderRadius="sm" bg="gray.300/40" />
                    <Text fontSize="xs" fontWeight="800" color={muted}>Low Traffic</Text>
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          </GridItem>

          {/* Engagement Matrix */}
          <GridItem>
            <VStack align="stretch" gap={6} h="full">
              <Box p={6} borderRadius="3xl" bg="blue.600" color="white" boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")} flex="1">
                <VStack align="stretch" gap={6} h="full" justify="center">
                  <HStack justify="space-between">
                    <Heading size="xs" fontWeight="800" opacity={0.8} textTransform="uppercase" letterSpacing="widest">Engagement Index</Heading>
                    <Zap size={18} />
                  </HStack>
                  <VStack align="center" gap={1}>
                    <Text fontSize="5xl" fontWeight="900">{derived.engagementRate}%</Text>
                    <Text fontSize="sm" fontWeight="700" opacity={0.9}>Members Active This Week</Text>
                  </VStack>
                  <Box py={2}>
                    <ProgressRoot value={derived.engagementRate} colorPalette="whiteAlpha" size="sm">
                       <ProgressBar borderRadius="full" bg="whiteAlpha.200" />
                    </ProgressRoot>
                  </Box>
                  <SimpleGrid columns={2} gap={4} pt={2}>
                    <Box>
                      <Text fontSize="xs" opacity={0.7} fontWeight="bold">ACTIVE</Text>
                      <Text fontSize="lg" fontWeight="900">{stats?.active_last_7_days}</Text>
                    </Box>
                    <Box borderLeft="1px solid" borderColor="whiteAlpha.300" pl={4}>
                      <Text fontSize="xs" opacity={0.7} fontWeight="bold">TOTAL</Text>
                      <Text fontSize="lg" fontWeight="900">{stats?.total_members}</Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </Box>

              {/* Quick Actions / Insights */}
              <Box p={5} borderRadius="3xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm" fontWeight="900">Slipping Members</Heading>
                  <Text fontSize="xs" color={muted} fontWeight="600">
                    {stats?.slipping_members} members haven't visited in over 7 days.
                  </Text>
                  <Separator opacity={0.1} />
                  <HStack justify="space-between" p={3} borderRadius="xl" bg="orange.500/10" color="orange.600">
                    <HStack gap={3}>
                      <UserX size={16} />
                      <Text fontSize="sm" fontWeight="900">Re-engagement needed</Text>
                    </HStack>
                    <ArrowUpRight size={16} />
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>

        {/* ── Last 7 Days Distribution ─────────────────── */}
        <Box p={6} borderRadius="3xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
          <VStack align="stretch" gap={6}>
            <HStack justify="space-between">
              <VStack align="start" gap={0}>
                <Heading size="md" fontWeight="900">Last 7 Days Visits</Heading>
                <Text fontSize="sm" color={muted} fontWeight="700">Daily check-in volume trend</Text>
              </VStack>
              <Badge colorPalette="green" variant="outline" px={3} py={1} borderRadius="full" fontWeight="900">
                Live Pulse
              </Badge>
            </HStack>

            <Skeleton loading={loading}>
              <HStack gap={4} h="120px" align="end" px={2}>
                {(stats?.daily_visits || []).map((v, i, arr) => {
                  const maxVal = Math.max(...arr.map(d => d.count), 1);
                  const h = (v.count / maxVal) * 100;
                  return (
                    <VStack key={v.date} flex="1" gap={2} h="full" justify="end">
                      <Box w="full" h={`${Math.max(h, 6)}%`} bg="green.500" borderRadius="t-lg" opacity={0.8 + (i * 0.03)} />
                      <Text fontSize="xs" fontWeight="800" color={muted}>
                        {new Date(v.date).toLocaleDateString(undefined, { weekday: 'short' })}
                      </Text>
                    </VStack>
                  );
                })}
              </HStack>
            </Skeleton>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
});

AttendanceReport.displayName = "AttendanceReport";
export default AttendanceReport;
