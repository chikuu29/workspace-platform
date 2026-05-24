import { memo, useCallback, useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Circle,
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
  TrendingUp,
  Users,
} from "lucide-react";

import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import { BUILDINGS, calcStats } from "./utils/hostel.utils";
import BuildingCard from "./components/BuildingCard";
import type { BuildingStats } from "./types/Hostel.types";

// ─── PortfolioHeroSection ──────────────────────────────────────────────────────

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

/**
 * PortfolioHeroSection — A state-of-the-art dashboard overview banner.
 * Uses rich brand gradients, micro-badges, and visual stat blocks to give
 * owners an instant top-level executive snapshot.
 */
const PortfolioHeroSection = memo(({ stats, onAddBuilding, onAllReports }: PortfolioHeroSectionProps) => (
  <Box
    position="relative"
    bgGradient="linear(to-br, #312E81, #1E1B4B)" // deep indigo/navy brand gradient
    borderRadius="2xl"
    p={{ base: 6, md: 8 }}
    color="white"
    overflow="hidden"
    shadow="lg"
  >
    {/* Decorative light aura */}
    <Box
      position="absolute"
      top="-50%"
      right="-10%"
      w="300px"
      h="300px"
      borderRadius="full"
      bg="#818CF8"
      opacity={0.15}
      filter="blur(80px)"
      pointerEvents="none"
    />

    <Flex
      direction={{ base: "column", lg: "row" }}
      justify="space-between"
      align={{ base: "stretch", lg: "center" }}
      gap={6}
      position="relative"
      zIndex={1}
    >
      {/* Title & primary portfolio occupancy circle/stats */}
      <VStack align="start" gap={3} maxW="lg">
        <HStack gap={2}>
          <Badge bg="rgba(255,255,255,0.15)" color="indigo.200" borderRadius="full" px={2.5} py={0.5} fontSize="2xs" fontWeight="800">
            Active Portfolio
          </Badge>
          <HStack gap={1} fontSize="xs" color="indigo.300" fontWeight="700">
            <Icon as={MapPin} boxSize={3} />
            <Text>Bhubaneswar Hub</Text>
          </HStack>
        </HStack>

        <VStack align="start" gap={1}>
          <Heading size={{ base: "lg", md: "xl" }} fontWeight="900" letterSpacing="-0.02em">
            Surya Dev's Estates
          </Heading>
          <Text color="indigo.200" fontSize="sm" fontWeight="600">
            Manage, allocate beds, and track live occupancy metrics across 4 premier properties.
          </Text>
        </VStack>

        <HStack gap={3} mt={2}>
          <Button size="sm" bg="white" color="indigo.900" _hover={{ bg: "indigo.50" }} borderRadius="xl" fontWeight="800" onClick={onAddBuilding}>
            <Plus size={14} />
            Add Building
          </Button>
          <Button size="sm" variant="ghost" color="white" _hover={{ bg: "rgba(255,255,255,0.1)" }} border="1px solid" borderColor="rgba(255,255,255,0.3)" borderRadius="xl" fontWeight="800" onClick={onAllReports}>
            <BarChart3 size={14} />
            All Reports
          </Button>
        </HStack>
      </VStack>

      {/* Main Aggregated Stats Widgets */}
      <SimpleGrid columns={{ base: 2, sm: 4 }} gap={4} flex={1} maxW={{ lg: "xl" }} w="full">
        {(
          [
            ["Occupancy", `${stats.pct}%`, `${stats.occ} / ${stats.total} beds`, Activity, "#34D399"],
            ["Vacant Rooms", stats.vac, "Available now", Home, "#60A5FA"],
            ["In Maintenance", stats.maint, "Under service", DoorOpen, "#F59E0B"],
            ["Reservations", stats.reserved, "Upcoming arrivals", Users, "#A78BFA"],
          ] as Array<[string, string | number, string, React.ElementType, string]>
        ).map(([label, val, sub, icon, color]) => (
          <Box
            key={label}
            bg="rgba(255,255,255,0.06)"
            backdropFilter="blur(8px)"
            borderRadius="xl"
            border="1px solid"
            borderColor="rgba(255,255,255,0.1)"
            p={4}
            transition="all 0.2s ease"
            _hover={{ bg: "rgba(255,255,255,0.1)", transform: "translateY(-2px)" }}
          >
            <VStack align="start" gap={1}>
              <Circle size="6" bg="rgba(255,255,255,0.1)" color={color}>
                <Icon as={icon} boxSize={3.5} />
              </Circle>
              <Text fontSize="2xs" color="indigo.300" fontWeight="800" textTransform="uppercase" letterSpacing="0.04em">
                {label}
              </Text>
              <Heading size="md" fontWeight="900" color="white" lineHeight="1.1">
                {val}
              </Heading>
              <Text fontSize="3xs" color="indigo.200" fontWeight="600">
                {sub}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  </Box>
));
PortfolioHeroSection.displayName = "PortfolioHeroSection";

// ─── PortfolioGrid ────────────────────────────────────────────────────────────

interface PortfolioGridProps {
  buildingStats: Map<string, BuildingStats>;
  onOpen:        (buildingId: string) => void;
}

const PortfolioGrid = memo(({ buildingStats, onOpen }: PortfolioGridProps) => (
  <VStack align="stretch" gap={4}>
    <HStack gap={2.5} align="center">
      <Box w="3px" h="16px" borderRadius="full" bg="#4F46E5" />
      <Text
        fontSize="xs"
        fontWeight="900"
        color="app.text.muted"
        textTransform="uppercase"
        letterSpacing="0.1em"
      >
        Property Portfolio Map
      </Text>
    </HStack>

    <SimpleGrid columns={{ base: 1, lg: 3 }} gap={5}>
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
));
PortfolioGrid.displayName = "PortfolioGrid";

// ─── MultiBuildingHostelPortfolio (Page Root) ─────────────────────────────────

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

  // Pre-compute all building stats once
  const buildingStats = useMemo(
    () => new Map(BUILDINGS.map((b) => [b.id, calcStats(b)])),
    [],
  );

  const openBuilding = useCallback(
    (buildingId: string) => navigateTo("building", buildingId),
    [navigateTo],
  );
  const addBuilding = useCallback(() => navigateTo("addBuilding"), [navigateTo]);
  const allReports  = useCallback(() => navigateTo("reports"), [navigateTo]);

  return (
    <Box w="full" pb={8}>
      <VStack align="stretch" gap={6}>
        <PortfolioHeroSection stats={overallStats} onAddBuilding={addBuilding} onAllReports={allReports} />
        <PortfolioGrid buildingStats={buildingStats} onOpen={openBuilding} />
      </VStack>
    </Box>
  );
});

MultiBuildingHostelPortfolio.displayName = "MultiBuildingHostelPortfolio";
export default MultiBuildingHostelPortfolio;
