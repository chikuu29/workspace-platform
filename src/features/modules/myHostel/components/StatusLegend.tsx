import { memo } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";

import { ROOM_STATUS_META } from "../utils/hostel.utils";
import type { RoomStatus } from "../types/Hostel.types";

/**
 * StatusLegend — pure display strip listing all room statuses.
 * Wrapped in memo because it contains no props; it literally never re-renders
 * after the initial mount — it's effectively a static element.
 */
const StatusLegend = memo(() => (
  <HStack flexWrap="wrap" gap={3} p={3} bg="bg.subtle" borderRadius="xl">
    {(Object.keys(ROOM_STATUS_META) as RoomStatus[]).map((status) => (
      <HStack key={status} gap={1.5}>
        <Box w="8px" h="8px" borderRadius="full" bg={ROOM_STATUS_META[status].dot} />
        <Text fontSize="xs" color="app.text.muted" fontWeight="800">
          {ROOM_STATUS_META[status].label}
        </Text>
      </HStack>
    ))}
  </HStack>
));

StatusLegend.displayName = "StatusLegend";
export default StatusLegend;
