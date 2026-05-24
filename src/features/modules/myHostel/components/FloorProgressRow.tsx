import { memo } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import type { Room } from "../types/Hostel.types";

interface FloorProgressRowProps {
  floor:    number;
  rooms:    Room[];
  barColor: string;
}

/**
 * FloorProgressRow — memoised single floor occupancy bar.
 * Isolated at the floor level so selecting a room on a different floor
 * never triggers a re-render here.
 *
 * Uses a spring-eased width transition (cubic-bezier) for a polished feel.
 */
const FloorProgressRow = memo(({ floor, rooms, barColor }: FloorProgressRowProps) => {
  const occupied = rooms.filter((r) => r.s === "occupied").length;
  const pct      = Math.round((occupied / rooms.length) * 100);

  return (
    <HStack gap={2.5} w="full">
      <Text
        fontSize="2xs"
        color="app.text.muted"
        fontWeight="800"
        w="28px"
        flexShrink={0}
        letterSpacing="0.04em"
      >
        F{floor}
      </Text>

      <Box flex={1} h="6px" bg="bg.subtle" borderRadius="full" overflow="hidden">
        <Box
          h="full"
          w={`${pct}%`}
          bg={barColor}
          borderRadius="full"
          transition="width 0.5s cubic-bezier(0.34,1.56,0.64,1)"
        />
      </Box>

      <Text
        fontSize="2xs"
        color="app.text.muted"
        fontWeight="800"
        w="32px"
        textAlign="right"
        flexShrink={0}
      >
        {pct}%
      </Text>
    </HStack>
  );
});

FloorProgressRow.displayName = "FloorProgressRow";
export default FloorProgressRow;
