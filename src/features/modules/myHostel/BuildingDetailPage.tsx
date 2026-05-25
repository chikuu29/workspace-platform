import { memo, useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";
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
  ArrowLeft,
  Home,
  LayoutGrid,
  MapPin,
  Users,
} from "lucide-react";

import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import { BUILDINGS, calcStats, TAB_ITEMS } from "./utils/hostel.utils";
import RoomGrid     from "./components/RoomGrid";
import RoomDetail   from "./components/RoomDetail";
import GuestsTable  from "./components/GuestsTable";
import BuildingInfo from "./components/BuildingInfo";
import StatTile     from "./components/StatTile";
import type { BuildingStats, BuildingTab, HostelBuilding } from "./types/Hostel.types";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface BuildingDetailHeaderProps {
  building: HostelBuilding;
  stats:    BuildingStats;
  onBack:   () => void;
}

interface BuildingTabsProps {
  activeTab:   BuildingTab;
  onTabChange: (tab: BuildingTab) => void;
}

interface NotFoundStateProps {
  onBack: () => void;
}

// ─── BUILDING DETAIL HEADER ───────────────────────────────────────────────────

/**
 * BuildingDetailHeader — Redesigned with a beautiful, clean minimalist SaaS header.
 * Replaces the heavy brand-gradient colored panel with a sleek panel, structured typography,
 * consistent spacing, and crisp modern badges.
 */
const BuildingDetailHeader = memo(({ building, stats, onBack }: BuildingDetailHeaderProps) => (
  <VStack align="stretch" gap={5}>
    {/* Clean Minimal Page Header Block */}
    <Box
      // bg="bg.panel"
      // border="1px solid"
      // borderColor="border.muted"
      // borderRadius="xl"
      p={{ base: 5, md: 6 }}
      // shadow="sm"
      position="relative"
      overflow="hidden"
      transition="all 200ms ease"
    >
      <VStack align="stretch" gap={4}>
        {/* Navigation & Breadcrumb Row */}
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <HStack gap={2} fontSize="xs" fontWeight="medium">
           
           
            <HStack gap={1.5} color="fg.muted">
              <Icon as={building.icon} boxSize={3.5} />
              <Text fontWeight="semibold">{building.name}</Text>
            </HStack>
          </HStack>

          <Badge
            variant="outline"
            colorPalette="gray"
            borderRadius="md"
            px={2.5}
            py={0.5}
            fontSize="2xs"
            fontWeight="semibold"
          >
            ID: {building.id}
          </Badge>
        </HStack>

        {/* Title, location, and structural information */}
        <VStack align="start" gap={2}>
          <Heading size={{ base: "xl", md: "2xl" }} fontWeight="semibold" letterSpacing="-0.02em" color="fg">
            {building.name}
          </Heading>
          <HStack gap={3} flexWrap="wrap" fontSize="xs" color="fg.muted" fontWeight="medium">
            <HStack gap={1}>
              <Icon as={MapPin} boxSize={3.5} color="emerald.500" />
              <Text>{building.location} · Bhubaneswar Hub</Text>
            </HStack>
            <Text color="border.muted">|</Text>
            <Text>{building.floors} floors total</Text>
          </HStack>
        </VStack>
      </VStack>
    </Box>

    {/* Metric / KPI tiles row using unified, sleek colors */}
    <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={4}>
      <StatTile
        label="Location Address"
        value={building.location}
        subtitle={`${building.floors} levels built`}
        icon={MapPin}
        accent="fg"
      />
      <StatTile
        label="Beds Occupied"
        value={stats.occ}
        subtitle={`out of ${stats.total} total rooms`}
        icon={Users}
        accent="blue.500"
        gradStart="blue.500"
        gradEnd="blue.600"
      />
      <StatTile
        label="Beds Vacant"
        value={stats.vac}
        subtitle="Instantly allocatable"
        icon={Home}
        accent="emerald.500"
        gradStart="emerald.500"
        gradEnd="emerald.600"
      />
      <StatTile
        label="Fill Percentage"
        value={`${stats.pct}%`}
        subtitle="Current occupancy rate"
        icon={Activity}
        accent="indigo.500"
        gradStart="indigo.500"
        gradEnd="indigo.600"
      />
    </SimpleGrid>
  </VStack>
));
BuildingDetailHeader.displayName = "BuildingDetailHeader";

// ─── BUILDING TABS ────────────────────────────────────────────────────────────

/**
 * BuildingTabs — Completely redesigned from flashy colorful pills to a clean,
 * consistent, high-end professional SaaS tab switcher with stable layout structures.
 */
const BuildingTabs = memo(({ activeTab, onTabChange }: BuildingTabsProps) => {
  return (
    <Box
      // bg="app.card.bg"
      p={1}
      borderRadius="lg"
      border="1px solid"
      borderColor="border.subtle"
      w="fit-content"
      overflowX="auto"
    >
      <HStack gap={1} flexWrap="nowrap">
        {TAB_ITEMS.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <Button
              key={tab.value}
              variant={isActive ? "solid" : "ghost"}
              colorPalette={isActive ? "indigo" : "gray"}
              size="sm"
              borderRadius="md"
              fontWeight="medium"
              px={4}
              py={1.5}
              h="auto"
              transition="all 150ms ease"
              onClick={() => onTabChange(tab.value)}
              _hover={isActive ? undefined : {
                bg: "bg.panel",
                color: "fg",
              }}
            >
              <Icon as={tab.icon} boxSize={3.5} />
              {tab.label}
            </Button>
          );
        })}
      </HStack>
    </Box>
  );
});
BuildingTabs.displayName = "BuildingTabs";

// ─── NOT FOUND STATE ──────────────────────────────────────────────────────────

const NotFoundState = memo(({ onBack }: NotFoundStateProps) => (
  <VStack align="center" justify="center" gap={4} py={20}>
    <Text fontSize="3xl">🏚️</Text>
    <VStack gap={1} align="center">
      <Text fontSize="md" fontWeight="semibold" color="fg">Building not found</Text>
      <Text fontSize="sm" color="fg.muted">
        The building you're looking for doesn't exist in this portfolio.
      </Text>
    </VStack>
    <Button size="sm" variant="outline" borderRadius="md" onClick={onBack}>
      <LayoutGrid size={14} />
      Back to portfolio
    </Button>
  </VStack>
));
NotFoundState.displayName = "NotFoundState";

// ─── BUILDING DETAIL PAGE ROOT ────────────────────────────────────────────────

const BuildingDetailPage = memo(() => {
  const { navigateTo } = useWorkspaceRouter();
  const { params }     = useParams();

  const [activeTab,          setActiveTab]          = useState<BuildingTab>("rooms");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(null);

  // Safely extract buildingId from route params
  const buildingId = useMemo(() => params?.split("/")[0] ?? null, [params]);
  
  // Find building config in stable memory
  const building = useMemo(
    () => BUILDINGS.find((b) => b.id === buildingId) ?? null,
    [buildingId],
  );

  // Compute building-specific stats on-demand
  const stats = useMemo(
    () => (building ? calcStats(building) : null),
    [building],
  );

  // Find active room selection details
  const selectedRoom = useMemo(
    () => (activeTab === "rooms" ? building?.rooms.find((r) => r.n === selectedRoomNumber) ?? null : null),
    [building, selectedRoomNumber, activeTab],
  );

  // Stable navigation and interaction callbacks
  const goPortfolio = useCallback(() => navigateTo("portfolio"), [navigateTo]);

  const handleTabChange = useCallback((tab: BuildingTab) => {
    setActiveTab(tab);
    setSelectedRoomNumber(null);
  }, []);

  const handleRoomSelect = useCallback((n: string) => setSelectedRoomNumber(n), []);
  const closeRoomDetail  = useCallback(() => setSelectedRoomNumber(null), []);

  const editBuilding = useCallback(
    () => navigateTo("buildingInfo", buildingId ?? undefined),
    [navigateTo, buildingId],
  );
  
  const buildingRevenue = useCallback(
    () => navigateTo("revenueReport", buildingId ?? undefined),
    [navigateTo, buildingId],
  );

  if (!building || !stats) {
    return <NotFoundState onBack={goPortfolio} />;
  }

  return (
    // <Box  pb={8}>
      <Container maxW="7xl" px={{ base: 4, md: 6 }} py={6}>
      <VStack align="stretch" gap={6}>
        {/* Crisp Header section with Navigation, Title, and unified KPIs */}
        <BuildingDetailHeader building={building} stats={stats} onBack={goPortfolio} />

        {/* Flat Professional Switcher Tabs */}
        <BuildingTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Render Tab Contents */}
        {activeTab === "rooms" && (
          <Box>
            <RoomGrid
              building={building}
              selectedRoomNumber={selectedRoomNumber}
              onRoomSelect={handleRoomSelect}
            />
            <RoomDetail building={building} room={selectedRoom} onClose={closeRoomDetail} />
          </Box>
        )}

        {activeTab === "guests" && (
          <GuestsTable guests={building.guests} />
        )}

        {activeTab === "info" && (
          <BuildingInfo
            building={building}
            stats={stats}
            onEdit={editBuilding}
            onRevenue={buildingRevenue}
          />
        )}
      </VStack>
      </Container>
    // </Box>
  );
});

BuildingDetailPage.displayName = "BuildingDetailPage";
export default BuildingDetailPage;
