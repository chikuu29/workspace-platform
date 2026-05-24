import { memo, useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";
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
  ArrowLeft,
  Building,
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

// ─── BuildingDetailHeader ─────────────────────────────────────────────────────

interface BuildingDetailHeaderProps {
  building: HostelBuilding;
  stats:    BuildingStats;
  onBack:   () => void;
}

/**
 * BuildingDetailHeader — Upgraded with a rich brand-matched gradient banner card
 * and dynamic metrics dashboard tiles.
 */
const BuildingDetailHeader = memo(({ building, stats, onBack }: BuildingDetailHeaderProps) => (
  <VStack align="stretch" gap={5}>
    {/* Gradient Brand Hero Card */}
    <Box
      position="relative"
      bgGradient={`linear(to-br, ${building.color.gradStart}, ${building.color.gradEnd})`}
      borderRadius="2xl"
      p={{ base: 5, md: 6 }}
      color="white"
      overflow="hidden"
      shadow="md"
    >
      {/* Soft light halo inside the brand card */}
      <Box
        position="absolute"
        top="-40%"
        right="-5%"
        w="220px"
        h="220px"
        borderRadius="full"
        bg="white"
        opacity={0.12}
        filter="blur(50px)"
        pointerEvents="none"
      />

      <VStack align="stretch" gap={4} position="relative" zIndex={1}>
        {/* Breadcrumb Back row */}
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <HStack gap={1.5} fontSize="xs" fontWeight="800">
            <Button
              size="xs"
              variant="ghost"
              onClick={onBack}
              borderRadius="lg"
              fontWeight="900"
              color="white"
              bg="rgba(255,255,255,0.15)"
              _hover={{ bg: "rgba(255,255,255,0.25)" }}
              px={3}
            >
              <ArrowLeft size={13} />
              Portfolio
            </Button>
            <Text opacity={0.6}>/</Text>
            <HStack gap={1}>
              <Icon as={building.icon} boxSize={3.5} />
              <Text>{building.name}</Text>
            </HStack>
          </HStack>

          <Badge bg="rgba(255,255,255,0.2)" color="white" borderRadius="full" px={2.5} py={0.5} fontSize="2xs" fontWeight="900">
            ID: {building.id}
          </Badge>
        </HStack>

        {/* Title row */}
        <VStack align="start" gap={1}>
          <Heading size={{ base: "lg", md: "xl" }} fontWeight="900" letterSpacing="-0.02em">
            {building.name}
          </Heading>
          <HStack gap={2.5} opacity={0.9} fontSize="xs" fontWeight="600">
            <Icon as={MapPin} boxSize={3.5} />
            <Text>{building.location} · Bhubaneswar hub</Text>
            <Text opacity={0.5}>·</Text>
            <Text>{building.floors} floors total</Text>
          </HStack>
        </VStack>
      </VStack>
    </Box>

    {/* KPI tiles row */}
    <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={3.5}>
      <StatTile
        label="Location Address"
        value={building.location}
        subtitle={`${building.floors} levels built`}
        icon={MapPin}
        accent="app.text.primary"
      />
      <StatTile
        label="Beds Occupied"
        value={stats.occ}
        subtitle={`out of ${stats.total} total rooms`}
        icon={Users}
        accent="#1D4ED8"
        gradStart="#3B82F6"
        gradEnd="#1D4ED8"
      />
      <StatTile
        label="Beds Vacant"
        value={stats.vac}
        subtitle="Instantly allocatable"
        icon={Home}
        accent="#15803D"
        gradStart="#22C55E"
        gradEnd="#15803D"
      />
      <StatTile
        label="Fill Percentage"
        value={`${stats.pct}%`}
        subtitle="Current occupancy rate"
        icon={Activity}
        accent={building.color.icon}
        gradStart={building.color.gradStart}
        gradEnd={building.color.gradEnd}
      />
    </SimpleGrid>
  </VStack>
));
BuildingDetailHeader.displayName = "BuildingDetailHeader";

// ─── BuildingTabs ─────────────────────────────────────────────────────────────

interface BuildingTabsProps {
  activeTab:   BuildingTab;
  building:    HostelBuilding;
  onTabChange: (tab: BuildingTab) => void;
}

/**
 * BuildingTabs — Restyled as floating glass pills for responsive controls.
 */
const BuildingTabs = memo(({ activeTab, building, onTabChange }: BuildingTabsProps) => (
  <Box
    bg="bg.subtle"
    p={1}
    borderRadius="2xl"
    border="1px solid"
    borderColor="app.card.border"
    w="fit-content"
    overflowX="auto"
  >
    <HStack gap={1} flexWrap="nowrap">
      {TAB_ITEMS.map((tab) => {
        const active = activeTab === tab.value;
        const activeBg = { base: building.color.icon, _dark: building.color.bar };
        const hoverColor = { base: building.color.icon, _dark: building.color.bar };
        const hoverBg = active ? activeBg : { base: "rgba(0,0,0,0.03)", _dark: "rgba(255,255,255,0.05)" };

        return (
          <Button
            key={tab.value}
            variant="ghost"
            size="sm"
            borderRadius="xl"
            bg={active ? activeBg : "transparent"}
            color={active ? "white" : "app.text.muted"}
            fontWeight="800"
            px={5}
            py={2.5}
            h="auto"
            transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
            onClick={() => onTabChange(tab.value)}
            _hover={{
              color: active ? "white" : hoverColor,
              bg: hoverBg,
            }}
          >
            <Icon as={tab.icon} boxSize={3.5} />
            {tab.label}
          </Button>
        );
      })}
    </HStack>
  </Box>
));
BuildingTabs.displayName = "BuildingTabs";

// ─── NotFoundState ────────────────────────────────────────────────────────────

interface NotFoundStateProps {
  onBack: () => void;
}

const NotFoundState = memo(({ onBack }: NotFoundStateProps) => (
  <VStack align="center" justify="center" gap={4} py={20}>
    <Text fontSize="3xl">🏚️</Text>
    <VStack gap={1}>
      <Text fontSize="md" fontWeight="900" color="app.text.primary">Building not found</Text>
      <Text fontSize="sm" color="app.text.muted" fontWeight="600">
        The building you're looking for doesn't exist in this portfolio.
      </Text>
    </VStack>
    <Button size="sm" variant="outline" borderRadius="lg" onClick={onBack}>
      <LayoutGrid size={14} />
      Back to portfolio
    </Button>
  </VStack>
));
NotFoundState.displayName = "NotFoundState";

// ─── BuildingDetailPage (Page Root) ───────────────────────────────────────────

const BuildingDetailPage = memo(() => {
  const { navigateTo } = useWorkspaceRouter();
  const { params }     = useParams();

  const [activeTab,          setActiveTab]          = useState<BuildingTab>("rooms");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(null);

  const buildingId = useMemo(() => params?.split("/")[0] ?? null, [params]);
  const building   = useMemo(
    () => BUILDINGS.find((b) => b.id === buildingId) ?? null,
    [buildingId],
  );
  const stats = useMemo(
    () => (building ? calcStats(building) : null),
    [building],
  );

  const selectedRoom = useMemo(
    () => (activeTab === "rooms" ? building?.rooms.find((r) => r.n === selectedRoomNumber) ?? null : null),
    [building, selectedRoomNumber, activeTab],
  );

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
    <Box w="full" pb={8}>
      <VStack align="stretch" gap={5.5}>
        {/* Breadcrumb + name + KPI tiles */}
        <BuildingDetailHeader building={building} stats={stats} onBack={goPortfolio} />

        {/* Tab strip (Rooms / Guests / Info) */}
        <BuildingTabs activeTab={activeTab} building={building} onTabChange={handleTabChange} />

        {/* Rooms tab */}
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

        {/* Guests tab */}
        {activeTab === "guests" && (
          <GuestsTable guests={building.guests} />
        )}

        {/* Info tab */}
        {activeTab === "info" && (
          <BuildingInfo
            building={building}
            stats={stats}
            onEdit={editBuilding}
            onRevenue={buildingRevenue}
          />
        )}
      </VStack>
    </Box>
  );
});

BuildingDetailPage.displayName = "BuildingDetailPage";
export default BuildingDetailPage;
