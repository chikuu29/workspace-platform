import { memo, useCallback, useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Circle,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Activity,
  BarChart3,
  Building,
  DoorOpen,
  Home,
  MapPin,
  Plus,
  Users,
  Calendar,
} from "lucide-react";

import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import { BUILDINGS, calcStats } from "./utils/hostel.utils";
import BuildingCard from "./components/BuildingCard";
import type { BuildingStats } from "./types/Hostel.types";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface PortfolioHeroSectionProps {
  stats: {
    total:    number;
    occ:      number;
    vac:      number;
    maint:    number;
    reserved: number;
    pct:      number;
  };
  onAddBuilding: () => void;
  onAllReports:  () => void;
}

interface StatItem {
  key:   string;
  label: string;
  value: string | number;
  sub:   string;
  icon:  React.ElementType;
  color: "emerald" | "blue" | "orange" | "purple";
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

/**
 * PortfolioHeroSection — A clean, minimal dashboard overview header.
 * Designed with a high-end minimalist SaaS aesthetic. Uses crisp layout,
 * clean typography, flat structural containers, and subtle semantic tokens
 * for outstanding light and dark mode presentation without heavy neon accents.
 */
const PortfolioHeroSection = memo(({ stats, onAddBuilding, onAllReports }: PortfolioHeroSectionProps) => {
  // Memoized date to avoid re-computations on unrelated renders
  const liveDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Memoized grid stats definition to prevent object-creation inline in JSX
  const statsData = useMemo<StatItem[]>(() => [
    {
      key: "occupancy",
      label: "Occupancy",
      value: `${stats.pct}%`,
      sub: `${stats.occ} / ${stats.total} beds`,
      icon: Activity,
      color: "emerald",
    },
    {
      key: "vacant",
      label: "Vacant Rooms",
      value: stats.vac,
      sub: "Available now",
      icon: Home,
      color: "blue",
    },
    {
      key: "maintenance",
      label: "In Maintenance",
      value: stats.maint,
      sub: "Under service",
      icon: DoorOpen,
      color: "orange",
    },
    {
      key: "reserved",
      label: "Reservations",
      value: stats.reserved,
      sub: "Upcoming arrivals",
      icon: Users,
      color: "purple",
    },
  ], [stats.pct, stats.occ, stats.total, stats.vac, stats.maint, stats.reserved]);

  return (
    <Box
      // bg="app.card.bg"
      // border="1px solid"
      // borderColor="border.muted"
      // borderRadius="xl"
      p={{ base: 6, md: 8 }}
      // shadow="sm"
      position="relative"
      overflow="hidden"
      transition="all 200ms ease"
    >
      <Flex
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        align={{ base: "stretch", lg: "center" }}
        gap={8}
      >
        {/* Title, portfolio overview status, and primary actions */}
        <VStack align="start" gap={5} maxW="lg" w="full">
          <VStack align="start" gap={2}>
            <HStack gap={2} flexWrap="wrap">
              <Badge
                variant="subtle"
                colorPalette="indigo"
                borderRadius="md"
                px={2.5}
                py={0.5}
                fontSize="2xs"
                fontWeight="semibold"
                letterSpacing="0.02em"
              >
                Active Portfolio
              </Badge>
              <HStack gap={1.5} fontSize="xs" fontWeight="medium" color="fg.muted">
                <Icon as={MapPin} boxSize={3.5} color="emerald.500" />
                <Text>Bhubaneswar Hub</Text>
              </HStack>
            </HStack>

            <Heading size={{ base: "xl", md: "2xl" }} fontWeight="semibold" letterSpacing="-0.02em" color="fg">
              Surya Dev's Estates
            </Heading>
            
            <Text fontSize="sm" color="fg.muted" lineHeight="relaxed">
              Track live occupancy, allocate resources, and manage property assets in one place across 4 active buildings.
            </Text>

            <HStack gap={1.5} fontSize="xs" color="fg.subtle" mt={1}>
              <Icon as={Calendar} boxSize={3.5} />
              <Text>Snapshot updated · {liveDate}</Text>
            </HStack>
          </VStack>

          {/* Occupancy Fill Meter Panel */}
          <VStack
            align="stretch"
            gap={2.5}
            w="full"
            maxW="sm"
            bg="bg.muted"
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor="border.subtle"
          >
            <HStack justify="space-between" fontSize="xs" fontWeight="medium">
              <Text color="fg.muted" textTransform="uppercase" letterSpacing="0.05em">Total Occupancy Rate</Text>
              <Text color="emerald.500" fontWeight="semibold">{stats.pct}% Fill</Text>
            </HStack>
            <Box w="full" h="2" bg="border.muted" borderRadius="full" overflow="hidden">
              <Box
                w={`${stats.pct}%`}
                h="full"
                bg="emerald.500"
                borderRadius="full"
                transition="width 600ms cubic-bezier(0.16, 1, 0.3, 1)"
              />
            </Box>
            <Text fontSize="2xs" color="fg.muted">
              {stats.occ} of {stats.total} total beds occupied currently
            </Text>
          </VStack>

          <HStack gap={3} mt={1}>
            <Button
              size="md"
              colorPalette="indigo"
              variant="solid"
              borderRadius="lg"
              fontWeight="medium"
              px={4}
              onClick={onAddBuilding}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Building
            </Button>
            <Button
              size="md"
              variant="outline"
              colorPalette="gray"
              borderRadius="lg"
              fontWeight="medium"
              px={4}
              onClick={onAllReports}
            >
              <BarChart3 size={16} />
              All Reports
            </Button>
          </HStack>
        </VStack>

        {/* Aggregated Stats Metrics Grid */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} flex={1} maxW={{ lg: "xl" }} w="full">
          {statsData.map((item) => {
            const IconComponent = item.icon;
            return (
              <Box
                key={item.key}
                bg="app.card.bg"
                borderRadius="lg"
                border="1px solid"
                borderColor="border.muted"
                p={5}
                shadow="2xs"
                transition="all 200ms ease"
                _hover={{
                  borderColor: "border.emphasized",
                  shadow: "xs",
                }}
              >
                <VStack align="start" gap={3}>
                  <Circle
                    size="9"
                    // bg={`${item.color}.50`}
                    // _dark={{ bg: `${item.color}.950/20` }}
                    // color={`${item.color}.500`}
                    border="1px solid"
                    borderColor={`${item.color}.100`}
                    // _dark={{ borderColor: `${item.color}.900/30` }}
                  >
                    <Icon as={IconComponent} boxSize={4} />
                  </Circle>
                  <VStack align="start" gap={0.5}>
                    <Text fontSize="2xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="0.05em">
                      {item.label}
                    </Text>
                    <Heading size="md" fontWeight="semibold" color="fg">
                      {item.value}
                    </Heading>
                    <Text fontSize="2xs" color="fg.subtle">
                      {item.sub}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </Flex>
    </Box>
  );
});
PortfolioHeroSection.displayName = "PortfolioHeroSection";

// ─── PORTFOLIO GRID ──────────────────────────────────────────────────────────

interface PortfolioGridProps {
  buildingStats: Map<string, BuildingStats>;
  onOpen:        (buildingId: string) => void;
}

const PortfolioGrid = memo(({ buildingStats, onOpen }: PortfolioGridProps) => {
  return (
    <VStack align="stretch" gap={5}>
      <HStack gap={2.5} align="center">
        <Box w="3px" h="16px" borderRadius="full" bg="indigo.500" />
        <VStack align="start" gap={0.5}>
          <Text
            fontSize="xs"
            fontWeight="bold"
            color="fg"
            textTransform="uppercase"
            letterSpacing="0.05em"
          >
            Property Portfolio Map
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Live status and occupancy overview of all active properties
          </Text>
        </VStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
        {BUILDINGS.map((building) => (
          <BuildingCard
            key={building.id}
            building={building}
            stats={buildingStats.get(building.id) ?? calcStats(building)}
            onOpen={onOpen}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
});
PortfolioGrid.displayName = "PortfolioGrid";

// ─── PORTFOLIO PAGE ROOT ──────────────────────────────────────────────────────

const MultiBuildingHostelPortfolio = memo(() => {
  const { navigateTo } = useWorkspaceRouter();

  // Compute overall portfolio-wide stats in one pass
  const overallStats = useMemo(() => {
    let total = 0, occ = 0, vac = 0, maint = 0, reserved = 0;
    BUILDINGS.forEach((b) => {
      const s = calcStats(b);
      total += s.total;
      occ += s.occ;
      vac += s.vac;
      maint += s.maint;
      reserved += s.reserved;
    });
    const pct = total ? Math.round((occ / total) * 100) : 0;
    return { total, occ, vac, maint, reserved, pct };
  }, []);

  // Pre-compute all building stats once to stabilize reference
  const buildingStats = useMemo(
    () => new Map(BUILDINGS.map((b) => [b.id, calcStats(b)])),
    [],
  );

  // Stable navigation callbacks to avoid children re-renders
  const openBuilding = useCallback(
    (buildingId: string) => navigateTo("building", buildingId),
    [navigateTo],
  );
  const addBuilding = useCallback(() => navigateTo("addBuilding"), [navigateTo]);
  const allReports  = useCallback(() => navigateTo("reports"), [navigateTo]);

  return (
      <Container maxW="7xl" px={{ base: 4, md: 6 }} py={6}>
   
      <VStack align="stretch" gap={6}>
        <PortfolioHeroSection stats={overallStats} onAddBuilding={addBuilding} onAllReports={allReports} />
        <PortfolioGrid buildingStats={buildingStats} onOpen={openBuilding} />
      </VStack>
    
    </Container>
  );
});

MultiBuildingHostelPortfolio.displayName = "MultiBuildingHostelPortfolio";
export default MultiBuildingHostelPortfolio;
