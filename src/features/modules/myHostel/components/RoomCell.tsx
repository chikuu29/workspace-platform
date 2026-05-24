import { memo, useCallback } from "react";
import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { Bed } from "lucide-react";

import { getBedOccupancy, ROOM_STATUS_META } from "../utils/hostel.utils";
import type { Room } from "../types/Hostel.types";

interface RoomCellProps {
  room:        Room;
  isActive:    boolean;
  accentColor: string;
  onSelect:    (roomNumber: string) => void;
}

/**
 * RoomCell — finest-grained memo boundary in the room grid.
 *
 * Upgraded with:
 * 1. A Floating Bridge Room Number badge on the top edge of the card.
 * 2. Visual Bed Occupancy indicators showing available and occupied beds.
 */
const RoomCell = memo(({ room, isActive, accentColor, onSelect }: RoomCellProps) => {
  const status      = ROOM_STATUS_META[room.s];
  const handleClick = useCallback(() => onSelect(room.n), [room.n, onSelect]);
  const { total, occupied } = getBedOccupancy(room);

  // Dynamic status mapping for dark mode styling compliance
  const statusPalette = status.palette;

  return (
    <Box
      as="button"
      aria-label={`Room ${room.n} — ${room.t} — ${status.label}`}
      aria-pressed={isActive}
      pt={5}
      pb={2.5}
      px={2}
      minH="92px"
      border="2px solid"
      borderColor={isActive ? accentColor : { base: status.border, _dark: `${statusPalette}.800/50` }}
      borderRadius="xl"
      bg="app.card.bg"
      color={{ base: status.color, _dark: `${statusPalette}.200` }}
      textAlign="center"
      position="relative"
      overflow="visible"
      transition="all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
      onClick={handleClick}
      _hover={{
        transform: "translateY(-3px)",
        shadow: "md",
        borderColor: isActive ? accentColor : { base: `${statusPalette}.400`, _dark: `${statusPalette}.600` },
        bg: "bg.subtle"
      }}
      _focusVisible={{ outline: "2px solid", outlineColor: status.color, outlineOffset: "2px" }}
    >
      {/* Floating Bridge Room Number */}
      <Box
        position="absolute"
        top="-10px"
        left="50%"
        transform="translateX(-50%)"
        px={3}
        py={0.5}
        bg={isActive ? accentColor : { base: status.color, _dark: `${statusPalette}.600` }}
        color="white"
        borderRadius="full"
        fontSize="2xs"
        fontWeight="900"
        shadow="sm"
        border="2px solid"
        borderColor={isActive ? "white" : { base: status.bg, _dark: "gray.900" }}
        whiteSpace="nowrap"
        zIndex={2}
        transition="all 0.2s ease"
      >
        {room.n}
      </Box>

      {/* Status indicator dot */}
      <Box
        position="absolute"
        top={2}
        right={2}
        w="6px"
        h="6px"
        borderRadius="full"
        bg={{ base: status.dot, _dark: `${statusPalette}.400` }}
      />

      <VStack gap={1} align="center" w="full" mt={1}>
        <Text fontSize="2xs" fontWeight="800" opacity={0.9} lineHeight="1">
          {room.t}
        </Text>

        {/* Dynamic Bed Layout */}
        {total <= 3 ? (
          <HStack gap={0.5} justify="center" py={0.5}>
            {Array.from({ length: total }).map((_, idx) => {
              const isOccupied = idx < occupied;
              return (
                <Icon
                  key={idx}
                  as={Bed}
                  boxSize={3}
                  color={isOccupied ? { base: status.color, _dark: `${statusPalette}.300` } : { base: "gray.300", _dark: "gray.700" }}
                  fill={isOccupied ? { base: status.color, _dark: `${statusPalette}.400` } : "transparent"}
                  opacity={isOccupied ? 1 : 0.5}
                />
              );
            })}
          </HStack>
        ) : (
          <HStack
            gap={1}
            justify="center"
            bg={isActive ? "rgba(255,255,255,0.4)" : { base: "rgba(0,0,0,0.03)", _dark: "rgba(255,255,255,0.05)" }}
            px={1.5}
            py={0.5}
            borderRadius="md"
          >
            <Icon
              as={Bed}
              boxSize={3}
              color={{ base: status.color, _dark: `${statusPalette}.300` }}
              fill={occupied > 0 ? { base: status.color, _dark: `${statusPalette}.400` } : "transparent"}
            />
            <Text fontSize="3xs" fontWeight="900" color="app.text.primary" lineHeight="1">
              {occupied}/{total}
            </Text>
          </HStack>
        )}

        <Text fontSize="3xs" fontWeight="800" opacity={0.7} textTransform="uppercase" letterSpacing="0.05em">
          {status.label}
        </Text>
      </VStack>
    </Box>
  );
});

RoomCell.displayName = "RoomCell";
export default RoomCell;

