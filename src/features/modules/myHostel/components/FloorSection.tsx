import { memo } from "react";
import {
  Badge,
  Box,
  Circle,
  Flex,
  HStack,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { Building } from "lucide-react";

import type { HostelBuilding, Room } from "../types/Hostel.types";
import { getOccupancyPalette } from "../utils/hostel.utils";
import RoomCell from "./RoomCell";

interface FloorSectionProps {
  floor:               number;
  rooms:               Room[];
  building:            HostelBuilding;
  selectedRoomNumber:  string | null;
  onRoomSelect:        (n: string) => void;
}

/**
 * FloorSection — memoised single-floor container inside RoomGrid.
 *
 * Isolating each floor means selecting room "302" only re-renders the
 * FloorSection for floor 3 (and the specific RoomCells that changed state),
 * leaving floor 1 and floor 2 completely untouched.
 */
const FloorSection = memo(({ floor, rooms, building, selectedRoomNumber, onRoomSelect }: FloorSectionProps) => {
  const occupied = rooms.filter((r) => r.s === "occupied").length;
  const pct      = Math.round((occupied / rooms.length) * 100);

  return (
    <Box
      border="1px solid"
      borderColor="app.card.border"
      borderRadius="xl"
      overflow="visible"
      bg="app.card.bg"
      shadow="xs"
      transition="all 0.2s ease"
      _hover={{ shadow: "sm" }}
    >
      {/* Floor header row */}
      <Flex
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        gap={3}
        direction={{ base: "column", sm: "row" }}
        px={4}
        py={3}
        // bg="bg.subtle"
        borderBottom="1px solid"
        borderColor="app.card.border"
        borderTopLeftRadius="xl"
        borderTopRightRadius="xl"
      >
        <HStack gap={2}>
          <Circle size="6" bg={building.color.bg} color={building.color.icon}>
            <Building size={12} />
          </Circle>
          <Text fontSize="sm" fontWeight="900" color="app.text.primary">
            Floor {floor}
          </Text>
        </HStack>

        <HStack gap={2}>
          <Text fontSize="xs" color="app.text.muted" fontWeight="800">
            {occupied}/{rooms.length} occupied
          </Text>
          <Badge colorPalette={getOccupancyPalette(pct)} borderRadius="full" px={2.5} py={0.5} fontSize="2xs">
            {pct}%
          </Badge>
        </HStack>
      </Flex>

      {/* Room cell grid */}
      <SimpleGrid columns={{ base: 3, sm: 4, md: 6, xl: 8 }} rowGap={5.5} columnGap={3.5} pt={5} pb={3.5} px={3.5}>
        {rooms.map((room) => (
          <RoomCell
            key={room.n}
            room={room}
            isActive={selectedRoomNumber === room.n}
            accentColor={building.color.icon}
            onSelect={onRoomSelect}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
});

FloorSection.displayName = "FloorSection";
export default FloorSection;
