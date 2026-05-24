import { memo } from "react";
import { Badge, Box, Circle, HStack, Text } from "@chakra-ui/react";

import type { Guest } from "../types/Hostel.types";
import { GUEST_STATUS_META } from "../utils/hostel.utils";

interface GuestRowProps {
  guest: Guest;
}

/**
 * GuestRow — finest-grained memo boundary inside GuestsTable.
 *
 * Fine-grained isolation means updating a single guest's status (e.g. after
 * check-in) only re-renders that one row, not the entire table.
 */
const GuestRow = memo(({ guest }: GuestRowProps) => {
  const status = GUEST_STATUS_META[guest.status];

  return (
    <Box as="tr" transition="background 0.15s" _hover={{ bg: "bg.subtle" }}>
      {/* Guest name with avatar initial */}
      <Box as="td" p={3.5} borderBottom="1px solid" borderColor="app.card.border">
        <HStack gap={2.5}>
          <Circle size="7" bg="bg.subtle" color="app.text.muted" fontSize="xs" fontWeight="900">
            {guest.name.charAt(0)}
          </Circle>
          <Text fontSize="sm" color="app.text.primary" fontWeight="800">
            {guest.name}
          </Text>
        </HStack>
      </Box>

      {/* Room number */}
      <Box as="td" p={3.5} borderBottom="1px solid" borderColor="app.card.border">
        <Badge variant="outline" borderRadius="md" fontFamily="mono" fontWeight="800">
          {guest.room}
        </Badge>
      </Box>

      {/* Check-in */}
      <Box as="td" p={3.5} borderBottom="1px solid" borderColor="app.card.border">
        <Text fontSize="sm" color="app.text.muted" fontWeight="700">{guest.cin}</Text>
      </Box>

      {/* Check-out */}
      <Box as="td" p={3.5} borderBottom="1px solid" borderColor="app.card.border">
        <Text fontSize="sm" color="app.text.muted" fontWeight="700">{guest.cout}</Text>
      </Box>

      {/* Status badge */}
      <Box as="td" p={3.5} borderBottom="1px solid" borderColor="app.card.border">
        <Badge colorPalette={status.palette} borderRadius="full" px={2.5}>
          {status.label}
        </Badge>
      </Box>
    </Box>
  );
});

GuestRow.displayName = "GuestRow";
export default GuestRow;
