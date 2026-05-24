import { memo } from "react";
import { Box } from "@chakra-ui/react";

import type { Guest } from "../types/Hostel.types";
import GuestRow from "./GuestRow";

const HEADERS = ["Guest", "Room", "Check-in", "Check-out", "Status"] as const;

interface GuestsTableProps {
  guests: Guest[];
}

/**
 * GuestsTable — memoised table shell that delegates row rendering to GuestRow.
 *
 * The shell only re-renders when the guests array reference changes.
 * Individual rows are further isolated by GuestRow memos.
 */
const GuestsTable = memo(({ guests }: GuestsTableProps) => (
  <Box
    border="1px solid"
    borderColor="app.card.border"
    borderRadius="xl"
    overflowX="auto"
    bg="app.card.bg"
  >
    <Box as="table" w="full" minW="680px" style={{ borderCollapse: "collapse" }}>
      <Box as="thead" bg="bg.subtle">
        <Box as="tr">
          {HEADERS.map((header) => (
            <Box
              key={header}
              as="th"
              textAlign="left"
              fontSize="2xs"
              fontWeight="900"
              color="app.text.muted"
              textTransform="uppercase"
              letterSpacing="0.08em"
              p={3.5}
              borderBottom="1px solid"
              borderColor="app.card.border"
            >
              {header}
            </Box>
          ))}
        </Box>
      </Box>

      <Box as="tbody">
        {guests.map((guest) => (
          <GuestRow key={`${guest.name}-${guest.room}`} guest={guest} />
        ))}
      </Box>
    </Box>
  </Box>
));

GuestsTable.displayName = "GuestsTable";
export default GuestsTable;
