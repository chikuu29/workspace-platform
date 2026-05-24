import { memo } from "react";
import {
  Badge,
  Box,
  Circle,
  HStack,
  IconButton,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { DoorOpen, X } from "lucide-react";

import type { HostelBuilding, Room, RoomStatus } from "../types/Hostel.types";
import { formatRate, ROOM_STATUS_META } from "../utils/hostel.utils";

interface RoomDetailProps {
  building: HostelBuilding;
  room:     Room | null;
  onClose:  () => void;
}

/**
 * RoomDetail — memoised room detail slide-in panel.
 *
 * Returns null when no room is selected, avoiding unnecessary DOM nodes.
 * Uses a 2-column SimpleGrid of info boxes instead of a plain key/value list
 * for a more premium, scannable layout.
 */
const RoomDetail = memo(({ building, room, onClose }: RoomDetailProps) => {
  if (!room) return null;

  const status = ROOM_STATUS_META[room.s];

  return (
    <Box
      border="2px solid"
      borderColor={building.color.bar}
      borderRadius="xl"
      overflow="hidden"
      bg="app.card.bg"
      mt={3}
    >
      {/* Gradient accent bar */}
      <Box
        h="3px"
        bgGradient={`linear(to-r, ${building.color.gradStart}, ${building.color.gradEnd})`}
      />

      <Box p={5}>
        {/* Panel header */}
        <HStack justify="space-between" mb={4} gap={3}>
          <HStack gap={2.5}>
            <Circle size="8" bg={building.color.bg} color={building.color.icon}>
              <DoorOpen size={14} />
            </Circle>
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="900" color="app.text.primary">
                Room {room.n} — {room.t}
              </Text>
              <Text fontSize="xs" color="app.text.muted" fontWeight="600">
                {building.name}
              </Text>
            </VStack>
          </HStack>
          <IconButton
            aria-label="Close room details"
            variant="ghost"
            size="xs"
            borderRadius="lg"
            onClick={onClose}
          >
            <X size={14} />
          </IconButton>
        </HStack>

        {/* Info grid */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
          {(
            [
              ["Floor",  `Floor ${room.f}`, null],
              ["Status", status.label,       room.s as RoomStatus],
              ["Guest",  room.g,             null],
              ["Rate",   formatRate(room.p), null],
            ] as Array<[string, string, RoomStatus | null]>
          ).map(([key, value, statusKey]) => (
            <Box key={key} bg="bg.subtle" borderRadius="lg" px={3} py={2.5}>
              <Text
                fontSize="2xs"
                color="app.text.muted"
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing="0.06em"
                mb={1}
              >
                {key}
              </Text>
              {statusKey ? (
                <Badge
                  colorPalette={
                    statusKey === "vacant"
                      ? "green"
                      : statusKey === "maintenance"
                        ? "orange"
                        : statusKey === "reserved"
                          ? "purple"
                          : "blue"
                  }
                  borderRadius="full"
                >
                  {value}
                </Badge>
              ) : (
                <Text fontSize="sm" color="app.text.primary" fontWeight="900">
                  {value}
                </Text>
              )}
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
});

RoomDetail.displayName = "RoomDetail";
export default RoomDetail;
