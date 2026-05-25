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
import { useColorModeValue } from "@/components/ui/color-mode";

interface BuildingCardProps {
  building: HostelBuilding;
  stats:    BuildingStats;
  onOpen:   (buildingId: string) => void;
}

/**
 * BuildingCard — memoised portfolio grid card.
 *
 * Fully redesigned for ultra-premium dark & light modes. Features:
 * 1. Adaptive shadows and borders for maximum web aesthetics.
 * 2. Visual card components with subtle status blocks and modern progress lines.
 * 3. A Live Room Heatmap Grid styled like a high-tech activity map.
 * 4. Micro-layouts and hover scaling animations.
 */
const BuildingCard = memo(({ building, stats, onOpen }: BuildingCardProps) => {
  const handleOpen = useCallback(() => onOpen(building.id), [building.id, onOpen]);

  const cardBg = useColorModeValue("white", "app.card.bg");
  const cardBorder = useColorModeValue("rgba(226, 232, 240, 0.8)", "app.card.border");
  const cardShadow = useColorModeValue(
    "0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
    "app.shadow.glass-glow"
  );
  const cardHoverShadow = useColorModeValue(
    "0 20px 40px -12px rgba(49, 46, 129, 0.08)",
    "0 20px 40px -12px rgba(99, 102, 241, 0.22)"
  );
  
  const iconBg = useColorModeValue(building.color.bg, "whiteAlpha.100");
  const metaColor = useColorModeValue("gray.600", "gray.400");
  const titleColor = useColorModeValue("gray.800", "white");
  const dividerColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const heatmapBg = useColorModeValue("rgba(249, 250, 251, 0.8)", "whiteAlpha.50");

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
            w="7px"
            h="7px"
            borderRadius="1.5px"
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
      borderColor={cardBorder}
      borderRadius="2xl"
      bg={cardBg}
      cursor="pointer"
      overflow="hidden"
      boxShadow={cardShadow}
      transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      onClick={handleOpen}
      w="full"
      _hover={{ 
        borderColor: building.color.icon, 
        transform: "translateY(-5px)", 
        shadow: cardHoverShadow 
      }}
      _focusVisible={{ outline: "2px solid", outlineColor: building.color.icon, outlineOffset: "2px" }}
    >
      {/* Brand gradient strip */}
      <Box h="5px" bgGradient={`linear(to-r, ${building.color.gradStart}, ${building.color.gradEnd})`} />

      <VStack align="stretch" gap={4.5} p={{ base: 5, md: 6 }}>
        {/* Icon + occupancy badge */}
        <HStack justify="space-between" align="center" gap={3}>
          <Circle size="12" bg={iconBg} color={building.color.icon} border="1px solid" borderColor="whiteAlpha.100" shadow="xs">
            <Icon as={building.icon} boxSize={5} />
          </Circle>
          <Badge
            colorPalette={getOccupancyPalette(stats.pct)}
            variant="subtle"
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
        <VStack align="start" gap={1.5}>
          <Text fontSize="md" fontWeight="950" color={titleColor} lineHeight="1.2" letterSpacing="-0.01em">
            {building.name}
          </Text>
          <HStack gap={1.5} color={metaColor} fontSize="xs" fontWeight="700" flexWrap="wrap">
            <Icon as={MapPin} boxSize={3.5} color="red.400" />
            <Text>{building.location}</Text>
            <Text opacity={0.3}>·</Text>
            <Text>{building.floors} floors</Text>
            <Text opacity={0.3}>·</Text>
            <Text>{stats.total} rooms</Text>
          </HStack>
        </VStack>

        {/* Per-floor occupancy bars */}
        <VStack align="stretch" gap={3} pt={1}>
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
        <VStack align="start" gap={2} pt={1.5}>
          <Text fontSize="3xs" fontWeight="900" color={metaColor} textTransform="uppercase" letterSpacing="0.08em">
            Live Occupancy Grid
          </Text>
          <Flex gap={1} flexWrap="wrap" p={2.5} bg={heatmapBg} borderRadius="xl" w="full" minH="24px" align="center">
            {heatmapCells}
          </Flex>
        </VStack>

        {/* Amenity chips */}
        <HStack gap={1.5} flexWrap="wrap" pt={0.5}>
          {building.amenities.map((amenity) => (
            <Badge
              key={amenity}
              variant="subtle"
              colorPalette="gray"
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="2xs"
              fontWeight="800"
            >
              {amenity}
            </Badge>
          ))}
        </HStack>

        <Separator borderColor={dividerColor} />

        {/* Stats footer in premium blocks */}
        <SimpleGrid columns={4} gap={2} alignItems="center">
          <VStack align="center" gap={0.5} py={2} borderRadius="xl" bg={useColorModeValue("blue.50/40", "whiteAlpha.50")}>
            <Text fontSize="sm" color="#1D4ED8" fontWeight="950" lineHeight="1">{stats.occ}</Text>
            <Text fontSize="3xs" color={metaColor} fontWeight="800" textTransform="uppercase">Occupied</Text>
          </VStack>
          <VStack align="center" gap={0.5} py={2} borderRadius="xl" bg={useColorModeValue("green.50/40", "whiteAlpha.50")}>
            <Text fontSize="sm" color="#15803D" fontWeight="950" lineHeight="1">{stats.vac}</Text>
            <Text fontSize="3xs" color={metaColor} fontWeight="800" textTransform="uppercase">Vacant</Text>
          </VStack>
          <VStack align="center" gap={0.5} py={2} borderRadius="xl" bg={useColorModeValue("orange.50/40", "whiteAlpha.50")}>
            <Text fontSize="sm" color="#C2410C" fontWeight="950" lineHeight="1">{stats.maint}</Text>
            <Text fontSize="3xs" color={metaColor} fontWeight="800" textTransform="uppercase">Maint.</Text>
          </VStack>
          <HStack justify="center" color={building.color.icon} fontWeight="900" fontSize="xs" gap={0.5}>
            <Text>View</Text>
            <ArrowRight size={13} strokeWidth={2.5} />
          </HStack>
        </SimpleGrid>
      </VStack>
    </Box>
  );
});

BuildingCard.displayName = "BuildingCard";
export default BuildingCard;
