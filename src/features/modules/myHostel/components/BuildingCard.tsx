import { memo, useCallback, useMemo } from "react";
import {
  Badge,
  Box,
  Circle,
  Flex,
  HStack,
  Icon,
  Separator,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowRight, MapPin } from "lucide-react";

import type { BuildingStats, HostelBuilding } from "../types/Hostel.types";
import { getFloors, getOccupancyPalette, ROOM_STATUS_META } from "../utils/hostel.utils";
import FloorProgressRow from "./FloorProgressRow";

interface BuildingCardProps {
  building: HostelBuilding;
  stats:    BuildingStats;
  onOpen:   (buildingId: string) => void;
}

/**
 * BuildingCard — memoised portfolio grid card.
 *
 * Upgraded with:
 * 1. A Live Room Heatmap Strip showing status blocks for all rooms in a contributing graph style.
 * 2. Premium drop-shadow hover triggers and interactive transitions.
 */
const BuildingCard = memo(({ building, stats, onOpen }: BuildingCardProps) => {
  const handleOpen = useCallback(() => onOpen(building.id), [building.id, onOpen]);

  const floorGroups = useMemo(
    () =>
      getFloors(building).map((f) => ({
        floor: f,
        rooms: building.rooms.filter((r) => r.f === f),
      })),
    [building],
  );

  // Compute a beautiful micro contribution-style heatmap of rooms
  const heatmapCells = useMemo(
    () =>
      building.rooms.map((room) => {
        const meta = ROOM_STATUS_META[room.s];
        return (
          <Box
            key={room.n}
            w="6px"
            h="6px"
            borderRadius="1px"
            bg={meta.dot}
            opacity={0.9}
            transition="all 0.15s ease"
            _hover={{ transform: "scale(1.3)", opacity: 1, shadow: "sm" }}
          />
        );
      }),
    [building.rooms],
  );

  return (
    <Box
      as="button"
      textAlign="left"
      border="1px solid"
      borderColor="app.card.border"
      borderRadius="2xl"
      bg="app.card.bg"
      cursor="pointer"
      overflow="hidden"
      transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
      onClick={handleOpen}
      _hover={{ borderColor: building.color.icon, transform: "translateY(-5px)", shadow: "xl" }}
      _focusVisible={{ outline: "2px solid", outlineColor: building.color.icon, outlineOffset: "2px" }}
    >
      {/* Brand gradient strip */}
      <Box h="5px" bgGradient={`linear(to-r, ${building.color.gradStart}, ${building.color.gradEnd})`} />

      <VStack align="stretch" gap={4} p={{ base: 4, md: 5 }}>
        {/* Icon + occupancy badge */}
        <HStack justify="space-between" align="center" gap={3}>
          <Circle size="12" bg={building.color.bg} color={building.color.icon} shadow="xs">
            <Icon as={building.icon} boxSize={5} />
          </Circle>
          <Badge
            colorPalette={getOccupancyPalette(stats.pct)}
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            fontWeight="850"
          >
            {stats.pct}% full
          </Badge>
        </HStack>

        {/* Name & meta */}
        <VStack align="start" gap={1}>
          <Text fontSize="md" fontWeight="900" color="app.text.primary" lineHeight="1.2">
            {building.name}
          </Text>
          <HStack gap={1.5} color="app.text.muted" fontSize="xs" fontWeight="700" flexWrap="wrap">
            <Icon as={MapPin} boxSize={3} />
            <Text>{building.location}</Text>
            <Text opacity={0.4}>·</Text>
            <Text>{building.floors} floors</Text>
            <Text opacity={0.4}>·</Text>
            <Text>{stats.total} rooms</Text>
          </HStack>
        </VStack>

        {/* Per-floor occupancy bars */}
        <VStack align="stretch" gap={2.5}>
          {floorGroups.map(({ floor, rooms }) => (
            <FloorProgressRow
              key={floor}
              floor={floor}
              rooms={rooms}
              barColor={building.color.bar}
            />
          ))}
        </VStack>

        {/* Live Heatmap Strip */}
        <VStack align="start" gap={1.5} pt={1}>
          <Text fontSize="3xs" fontWeight="900" color="app.text.muted" textTransform="uppercase" letterSpacing="0.08em">
            Live Occupancy Grid
          </Text>
          <Flex gap={1} flexWrap="wrap" p={2} bg="bg.subtle" borderRadius="xl" w="full" minH="22px" align="center">
            {heatmapCells}
          </Flex>
        </VStack>

        {/* Amenity chips */}
        <HStack gap={1.5} flexWrap="wrap">
          {building.amenities.map((amenity) => (
            <Badge
              key={amenity}
              variant="subtle"
              colorPalette="gray"
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="2xs"
              fontWeight="700"
            >
              {amenity}
            </Badge>
          ))}
        </HStack>

        <Separator />

        {/* Stats footer */}
        <SimpleGrid columns={4} gap={2} alignItems="center">
          <VStack align="start" gap={0.5}>
            <Text fontSize="sm" color="#1D4ED8" fontWeight="900" lineHeight="1">{stats.occ}</Text>
            <Text fontSize="2xs" color="app.text.muted" fontWeight="700">Occupied</Text>
          </VStack>
          <VStack align="start" gap={0.5}>
            <Text fontSize="sm" color="#15803D" fontWeight="900" lineHeight="1">{stats.vac}</Text>
            <Text fontSize="2xs" color="app.text.muted" fontWeight="700">Vacant</Text>
          </VStack>
          <VStack align="start" gap={0.5}>
            <Text fontSize="sm" color="#C2410C" fontWeight="900" lineHeight="1">{stats.maint}</Text>
            <Text fontSize="2xs" color="app.text.muted" fontWeight="700">Maint.</Text>
          </VStack>
          <HStack justify="end" color={building.color.icon} fontWeight="800" fontSize="xs" gap={1}>
            <Text>View</Text>
            <ArrowRight size={13} />
          </HStack>
        </SimpleGrid>
      </VStack>
    </Box>
  );
});

BuildingCard.displayName = "BuildingCard";
export default BuildingCard;
