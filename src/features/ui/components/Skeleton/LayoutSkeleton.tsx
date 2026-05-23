import React, { memo, useCallback } from "react";
import { Box, Flex, VStack, HStack, Grid } from "@chakra-ui/react";
import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton";
import { useColorModeValue } from "@/components/ui/color-mode";

// Static arrays declared outside component rendering to avoid reallocation and re-renders
const SIDEBAR_NAV_ITEMS_1 = [1, 2, 3, 4];
const SIDEBAR_NAV_ITEMS_2 = [1, 2, 3];
const KPI_ITEMS = [1, 2, 3, 4];
const CHART_COLS = [1, 2, 3, 4, 5, 6, 7, 8];
const ACTIVITY_ITEMS = [1, 2, 3, 4];
const TABLE_ROWS = [1, 2, 3, 4, 5];
const CHART_BAR_HEIGHTS = ["40%", "70%", "55%", "90%", "60%", "85%", "45%", "75%"];

/**
 * SidebarNavItemSkeleton
 * Renders an individual navigation item. Identifies the active item
 * for a visual boost in layout fidelity.
 */
interface SidebarNavItemProps {
  index: number;
}

const SidebarNavItemSkeleton = memo(({ index }: SidebarNavItemProps) => {
  const isActive = index === 1;
  const activeBg = useColorModeValue(
    "rgba(99, 102, 241, 0.08)",
    "rgba(99, 102, 241, 0.15)"
  );
    const bg = useColorModeValue("", "navy.700");
  return (
    <HStack
      gap={3}
      p={2.5}
      borderRadius="xl"
      bg={isActive ? activeBg : "transparent"}
      borderLeft={isActive ? "3px solid" : "3px solid transparent"}
      borderLeftColor={isActive ? "indigo.500" : "transparent"}
      w="100%"
      transition="all 0.2s ease"
    >
      <SkeletonCircle size="20px" bg={bg}/>
      <Skeleton w={isActive ? "75%" : "60%"} h="12px" borderRadius="md" bg={bg}/>
    </HStack>
  );
});

SidebarNavItemSkeleton.displayName = "SidebarNavItemSkeleton";

/**
 * KpiCardSkeleton
 * Premium metric card with trend placeholders and soft shadows.
 */
interface KpiCardProps {
  index: number;
  panelBg: string;
  borderColor: string;
}

const KpiCardSkeleton = memo(({ index, panelBg, borderColor }: KpiCardProps) => {
  const bg = useColorModeValue("", "navy.700");
  return (
    <Box
      p={5}
      bg={panelBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={borderColor}
      // backdropFilter="blur(8px)"
      // boxShadow="md"
      transition="transform 0.2s ease"
    >
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between" align="center">
          <SkeletonCircle size="36px" bg={bg} />
          <Skeleton w="45px" h="18px" borderRadius="full" bg={bg} />
        </HStack>
        <Skeleton w="70px" h="10px" borderRadius="md" opacity={0.7} bg={bg} />
        <Skeleton w="110px" h="24px" borderRadius="md" bg={bg} />
      </VStack>
    </Box>
  );
});

KpiCardSkeleton.displayName = "KpiCardSkeleton";

/**
 * ChartBarItem
 * Simple component representing an individual bar of the analytics chart.
 */
const ChartBarItem = memo(({ height, bg }: { height: string; bg: string }) => (
  
  <Skeleton flex="1" h={height} borderRadius="lg" opacity={0.8} bg={bg} />
));

ChartBarItem.displayName = "ChartBarItem";

/**
 * ChartSkeleton
 * Full analytics dashboard widget loader simulating dynamic multi-bar data.
 */
interface ChartProps {
  panelBg: string;
  borderColor: string;
}

const ChartSkeleton = memo(({ panelBg, borderColor }: ChartProps) => {
    const bg = useColorModeValue("", "navy.700");
  const renderChartBar = useCallback((col: number) => {
    const height = CHART_BAR_HEIGHTS[(col - 1) % CHART_BAR_HEIGHTS.length];
    return <ChartBarItem key={col} height={height} bg={bg} />;
  }, []);

  return (
    <Box
      flex="2"
      h="350px"
      p={6}
      bg={panelBg}
      borderRadius="3xl"
      border="1px solid"
      borderColor={borderColor}
      // backdropFilter="blur(8px)"
      // boxShadow="md"
    >
      <VStack align="stretch" gap={5} h="100%">
        <HStack justify="space-between" align="center">
          <VStack align="stretch" gap={1}>
            <Skeleton w="150px" h="18px" borderRadius="md" bg={bg} />
            <Skeleton w="90px" h="10px" borderRadius="md" opacity={0.6} bg={bg} />
          </VStack>
          <HStack gap={1.5}>
            <Skeleton w="32px" h="20px" borderRadius="md" bg={bg} />
            <Skeleton w="32px" h="20px" borderRadius="md" bg={bg}  />
            <Skeleton w="32px" h="20px" borderRadius="md" bg={bg} />
          </HStack>
        </HStack>
        
        <HStack gap={4} h="180px" align="end" px={2} mt={3} flex="1">
          {CHART_COLS.map(renderChartBar)}
        </HStack>
        
        <HStack gap={4} justify="center">
          <HStack gap={2}>
            <SkeletonCircle size="8px" bg={bg} />
            <Skeleton w="50px" h="10px" borderRadius="md" bg={bg} />
          </HStack>
          <HStack gap={2}>
            <SkeletonCircle size="8px" bg={bg} />
            <Skeleton w="50px" h="10px" borderRadius="md" bg={bg} />
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
});

ChartSkeleton.displayName = "ChartSkeleton";

/**
 * ActivityRowSkeleton
 * Renders a row of a list skeleton representing a single log or message.
 */
const ActivityRowSkeleton = memo(({ index, bg }: { index: number; bg: string }) => {
  return (
    <HStack gap={3} w="100%">
      <SkeletonCircle size="32px" bg={bg} />
      <VStack align="stretch" gap={1.5} flex="1">
        <Skeleton w="100%" h="10px" borderRadius="md" bg={bg} />
        <Skeleton w="45%" h="8px" borderRadius="md" opacity={0.6} bg={bg} />
      </VStack>
    </HStack>
  );
});

ActivityRowSkeleton.displayName = "ActivityRowSkeleton";

/**
 * ActivityListSkeleton
 * Dynamic side section to showcase activity timelines or notifications.
 */
interface ActivityListProps {
  panelBg: string;
  borderColor: string;
}

const ActivityListSkeleton = memo(({ panelBg, borderColor }: ActivityListProps) => {
  const bg = useColorModeValue("", "navy.700");
  const renderActivityRow = useCallback((item: number) => (
    <ActivityRowSkeleton key={item} index={item} bg={bg} />
  ), []);

  return (
    <Box
      flex="1"
      h="350px"
      p={6}
      bg={panelBg}
      borderRadius="3xl"
      border="1px solid"
      borderColor={borderColor}
      // backdropFilter="blur(8px)"
      // boxShadow="md"
    >
      <VStack align="stretch" gap={4.5} h="100%">
        <Skeleton w="130px" h="18px" borderRadius="md" mb={2} bg={bg} />
        <VStack align="stretch" gap={4} flex="1" justify="space-between">
          {ACTIVITY_ITEMS.map(renderActivityRow)}
        </VStack>
      </VStack>
    </Box>
  );
});

ActivityListSkeleton.displayName = "ActivityListSkeleton";

/**
 * Table Components Skeletons
 * Detailed layout cells and pagination elements mimicking standard workspace database tables.
 */
const TableHeaderSkeleton = memo(({ bg }: { bg: string }) => (
  <HStack gap={4} py={3} px={4} borderBottom="1px solid" borderColor="rgba(255,255,255,0.06)" bg={bg}>
    <Skeleton w="20%" h="12px" borderRadius="md" bg={bg} />
    <Skeleton w="25%" h="12px" borderRadius="md" bg={bg} />
    <Skeleton w="20%" h="12px" borderRadius="md" bg={bg} />
    <Skeleton w="20%" h="12px" borderRadius="md" bg={bg} />
    <Skeleton w="15%" h="12px" borderRadius="md" bg={bg} />
  </HStack>
));

TableHeaderSkeleton.displayName = "TableHeaderSkeleton";

const TableRowSkeleton = memo(({ index }: { index: number }) => {
  const w1 = index % 2 === 0 ? "50%" : "70%";
  const bg = useColorModeValue("", "navy.700");
  return (
    <HStack gap={4} py={3.5} px={4} borderBottom="1px solid" borderColor="rgba(255,255,255,0.04)">
      <HStack w="20%" gap={2}>
        <SkeletonCircle size="20px" bg={bg} />
        <Skeleton w={w1} h="10px" borderRadius="md" bg={bg} />
      </HStack>
      <Skeleton w="25%" h="10px" borderRadius="md" bg={bg} />
      <Skeleton w="20%" h="10px" borderRadius="md" bg={bg} />
      <Box w="20%">
        <Skeleton w="55px" h="16px" borderRadius="full" bg={bg} />
      </Box>
      <Skeleton w="15%" h="10px" borderRadius="md" bg={bg} />
    </HStack>
  );
});

TableRowSkeleton.displayName = "TableRowSkeleton";

interface TableProps {
  panelBg: string;
  borderColor: string;
}

const TableSkeleton = memo(({ panelBg, borderColor }: TableProps) => {
  const renderTableRow = useCallback((item: number) => (
    <TableRowSkeleton key={item} index={item} />
  ), []);
  const bg = useColorModeValue("", "navy.700");
  return (
    <Box
      p={6}
      bg={panelBg}
      borderRadius="3xl"
      border="1px solid"
      borderColor={borderColor}
      // backdropFilter="blur(8px)"
      // boxShadow="md"
    >
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="center" mb={1}>
          <VStack align="stretch" gap={1}>
            <Skeleton w="160px" h="18px" borderRadius="md" bg={bg} />
            <Skeleton w="220px" h="10px" borderRadius="md" opacity={0.6} bg={bg} />
          </VStack>
          <HStack gap={2}>
            <Skeleton w="70px" h="32px" borderRadius="xl" bg={bg} />
            <Skeleton w="80px" h="32px" borderRadius="xl" bg={bg} />
          </HStack>
        </HStack>

        <Box borderRadius="2xl" border="1px solid" borderColor="rgba(255,255,255,0.05)" overflow="hidden">
          <TableHeaderSkeleton bg={bg} />
          <VStack align="stretch" gap={0}>
            {TABLE_ROWS.map(renderTableRow)}
          </VStack>
        </Box>

        <HStack justify="space-between" align="center" pt={2}>
          <Skeleton w="120px" h="10px" borderRadius="md" opacity={0.6} bg={bg} />
          <HStack gap={2}>
            <Skeleton w="60px" h="28px" borderRadius="lg" bg={bg} />
            <Skeleton w="60px" h="28px" borderRadius="lg" bg={bg} />
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
});

TableSkeleton.displayName = "TableSkeleton";

/**
 * LayoutSkeleton
 * Main Dashboard layout template loader reflecting highly modularized sub-components.
 */
const LayoutSkeleton = memo(() => {
  const bg = useColorModeValue("", "navy.700");
  
  const panelBg = useColorModeValue(
    "rgba(255, 255, 255, 0.4)",
    "rgba(27, 37, 75, 0.4)"
  );
  const borderColor = useColorModeValue(
    "rgba(99, 102, 241, 0.08)",
    "rgba(255, 255, 255, 0.05)"
  );
  const sidebarBg = useColorModeValue(
    "rgba(255, 255, 255, 0.65)",
    "rgba(17, 28, 68, 0.6)"
  );
  
  const renderSidebarNavItem1 = useCallback((i: number) => (
    <SidebarNavItemSkeleton key={`nav1-${i}`} index={i} />
  ), []);

  const renderSidebarNavItem2 = useCallback((i: number) => (
    <SidebarNavItemSkeleton key={`nav2-${i}`} index={i + 10} />
  ), []);

  const renderKpiCard = useCallback((i: number) => (
    <KpiCardSkeleton key={`kpi-${i}`} index={i} panelBg={panelBg} borderColor={borderColor} />
  ), [panelBg, borderColor]);

  return (
    <Flex h="100vh" direction="column" bg={bg} overflow="hidden">
      {/* Navbar skeleton - Glassmorphic high fidelity */}
      <Flex
        h="70px"
        w="100%"
        px={6}
        align="center"
        justify="space-between"
        borderBottom="1px solid"
        borderColor={borderColor}
        // bg={panelBg}
        bg="app.card.bg"
        // backdropFilter="blur(16px)"
        zIndex="999"
      >
        <HStack gap={4}>
          <SkeletonCircle size="38px" bg={bg} />
          <Skeleton w="130px" h="20px" borderRadius="lg" bg={bg}/>
        </HStack>
        <HStack gap={4}>
          <HStack gap={3} display={{ base: "none", md: "flex" }} mr={4}>
            <Skeleton w="75px" h="12px" borderRadius="md" bg={bg}/>
            <Skeleton w="75px" h="12px" borderRadius="md" bg={bg} />
            <Skeleton w="75px" h="12px" borderRadius="md" bg={bg} />
          </HStack>
          <SkeletonCircle size="32px" bg={bg} />
          <SkeletonCircle size="32px" bg={bg} />
          <SkeletonCircle size="32px" bg={bg} />
        </HStack>
      </Flex>

      <Flex flex="1" overflow="hidden">
        {/* Sidebar skeleton (desktop only) */}
        <Box
          display={{ base: "none", xl: "block" }}
          w="280px"
          borderRight="1px solid"
          borderColor={borderColor}
          bg={sidebarBg}
          backdropFilter="blur(12px)"
          p={5}
          flexShrink={0}
        >
          <Flex direction="column" h="100%" justify="space-between">
            <VStack gap={6} align="stretch">
              {/* Nav Group 1 */}
              <VStack gap={2} align="stretch">
                <Skeleton w="60px" h="9px" borderRadius="md" mb={2} opacity={0.5} ml={2} bg={bg} />
                {SIDEBAR_NAV_ITEMS_1.map(renderSidebarNavItem1)}
              </VStack>

              {/* Nav Group 2 */}
              <VStack gap={2} align="stretch">
                <Skeleton w="70px" h="9px" borderRadius="md" mb={2} opacity={0.5} ml={2} bg={bg} />
                {SIDEBAR_NAV_ITEMS_2.map(renderSidebarNavItem2)}
              </VStack>
            </VStack>

            {/* User Profile Area */}
            <Box pt={4} borderTop="1px solid" borderColor={borderColor}>
              <HStack gap={3}>
                <SkeletonCircle size="36px" bg={bg} />
                <VStack align="stretch" gap={1.5} flex="1">
                  <Skeleton w="80px" h="12px" borderRadius="md" bg={bg} />
                  <Skeleton w="50px" h="9px" borderRadius="md" opacity={0.6} bg={bg} />
                </VStack>
              </HStack>
            </Box>
          </Flex>
        </Box>

        {/* Main content area - Bento style grids */}
        <Box flex="1" p={6} overflowY="auto" bg={"app.card.bg"}>
          {/* Breadcrumb & Title */}
          <VStack align="stretch" gap={2} mb={6} px={1}>
            <HStack gap={2}>
              <Skeleton w="45px" h="9px" borderRadius="md" bg={bg} />
              <Box w="3px" h="3px" borderRadius="full" bg="gray.400" />
              <Skeleton w="75px" h="9px" borderRadius="md" bg={bg} />
            </HStack>
            <Skeleton w="220px" h="28px" borderRadius="xl" bg={bg} />
          </VStack>

          {/* Grid Layout (Bento Style) */}
          <VStack gap={6} align="stretch">
            {/* Stats Cards Row */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
              {KPI_ITEMS.map(renderKpiCard)}
            </Grid>

            {/* Main Content Row - Analytics & Activity */}
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} alignItems="stretch">
              <ChartSkeleton panelBg={panelBg} borderColor={borderColor} />
              <ActivityListSkeleton panelBg={panelBg} borderColor={borderColor} />
            </Grid>

            {/* Bottom Row - Dynamic Data Table */}
            <TableSkeleton panelBg={panelBg} borderColor={borderColor} />
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
});

LayoutSkeleton.displayName = "LayoutSkeleton";

export default LayoutSkeleton;
